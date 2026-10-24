import { Router } from 'express'
import crypto from 'node:crypto'
import mongoose from 'mongoose'
import Razorpay from 'razorpay'
import Order from '../models/Order.js'
import { verifyToken } from '../middleware/auth.js'

const router = Router()

const KEY_ID = process.env.RAZORPAY_KEY_ID || ''
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || ''
// Must be the secret configured in the Razorpay webhook settings, NOT the key
// secret. Falling back to KEY_SECRET would make every signature check fail.
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || ''

const isConfigured = () => Boolean(KEY_ID && KEY_SECRET)

let razorpay = null
function getClient() {
  if (!isConfigured()) return null
  if (!razorpay) razorpay = new Razorpay({ key_id: KEY_ID, key_secret: KEY_SECRET })
  return razorpay
}

/* ── POST /api/payments/verify-webhook — server-to-server confirmation ──
   Unauthenticated by design: Razorpay calls this directly. Authenticity
   comes from the signature over the raw body, not from a JWT. */
router.post('/verify-webhook', async (req, res) => {
  try {
    if (!isConfigured()) {
      return res.status(503).json({ message: 'Payments are not configured on the server.' })
    }
    if (!WEBHOOK_SECRET) {
      return res.status(503).json({ message: 'Webhook secret is not configured on the server.' })
    }

    // Prefer the captured raw bytes; fall back to re-serialising if absent
    const payload = req.rawBody || Buffer.from(JSON.stringify(req.body || {}))
    const provided = req.get('x-razorpay-signature')
    if (!provided) return res.status(400).json({ message: 'Missing webhook signature.' })

    const expected = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(payload)
      .digest('hex')

    const a = Buffer.from(expected, 'utf8')
    const b = Buffer.from(String(provided), 'utf8')
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return res.status(400).json({ message: 'Invalid webhook signature.' })
    }

    const event = req.body?.event
    const paymentEntity = req.body?.payload?.payment?.entity
    if (!paymentEntity) return res.json({ received: true })

    const ourOrderId =
      paymentEntity.notes?.orderId || paymentEntity.invoice_id || null

    if (ourOrderId && mongoose.isValidObjectId(ourOrderId)) {
      const update = paymentEntity.status === 'captured'
        ? { 'payment.status': 'Paid', 'payment.paidAt': new Date() }
        : paymentEntity.status === 'failed'
          ? { 'payment.status': 'Failed' }
          : null
      if (update) {
        await Order.updateOne({ _id: ourOrderId }, { $set: update })
      }
    }

    res.json({ received: true, event })
  } catch (err) {
    res.status(500).json({ message: 'Webhook processing failed.', error: err.message })
  }
})

router.use(verifyToken)

/* ── GET /api/payments/config — publishable settings for the browser ──
   Only the Key ID is exposed. The Key Secret never leaves the server. */
router.get('/config', (req, res) => {
  res.json({
    configured: isConfigured(),
    keyId: KEY_ID || null,
    testMode: KEY_ID.startsWith('rzp_test_'),
  })
})

/* ── POST /api/payments/create-order ──
   Creates the Razorpay order for one of our orders.
   The amount always comes from the stored order, never from the body. */
router.post('/create-order', async (req, res) => {
  try {
    if (!isConfigured()) {
      return res.status(503).json({ message: 'Payments are not configured on the server.' })
    }

    const { orderId } = req.body || {}
    if (!orderId || !mongoose.isValidObjectId(orderId)) {
      return res.status(400).json({ message: 'A valid orderId is required.' })
    }

    const order = await Order.findById(orderId).lean()
    if (!order) return res.status(404).json({ message: 'Order not found.' })
    if (String(order.customerId) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Access denied.' })
    }
    if (order.payment?.status === 'Paid') {
      return res.status(409).json({ message: 'This order is already paid.' })
    }

    // Amounts are in rupees here; Razorpay works in the smallest unit (paise)
    const amountInRupees = Number(order.totals?.total) || 0
    if (amountInRupees <= 0) {
      return res.status(400).json({ message: 'Order total must be greater than zero.' })
    }
    const amountInPaise = Math.round(amountInRupees * 100)

    // Reuse an existing unpaid gateway order rather than stacking duplicates
    let gatewayOrderId = order.payment?.gatewayOrderId
    if (gatewayOrderId) {
      try {
        const existing = await getClient().orders.fetch(gatewayOrderId)
        if (existing.status === 'paid') {
          return res.status(409).json({ message: 'This order has already been paid.' })
        }
        return res.json({ gatewayOrderId, amount: amountInPaise, currency: 'INR', keyId: KEY_ID, reused: true })
      } catch {
        // Stale or cancelled at the gateway — fall through and make a new one
        gatewayOrderId = null
      }
    }

    const gatewayOrder = await getClient().orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: String(order._id),
      notes: { orderId: String(order._id), customerId: String(order.customerId) },
    })

    order.payment = {
      ...order.payment,
      provider: 'razorpay',
      gatewayOrderId: gatewayOrder.id,
      status: 'Pending',
      label: order.payment?.label || 'Razorpay',
    }
    await Order.updateOne({ _id: order._id }, { $set: { payment: order.payment } })

    res.json({
      gatewayOrderId: gatewayOrder.id,
      amount: amountInPaise,
      currency: 'INR',
      keyId: KEY_ID,
    })
  } catch (err) {
    res.status(500).json({ message: 'Could not start the payment.', error: err.message })
  }
})

/* ── POST /api/payments/verify ──
   The browser's success callback proves nothing on its own. This checks
   Razorpay's HMAC signature with the Key Secret before trusting payment. */
router.post('/verify', async (req, res) => {
  try {
    if (!isConfigured()) {
      return res.status(503).json({ message: 'Payments are not configured on the server.' })
    }

    const {
      orderId,
      gatewayOrderId,
      paymentId,
      signature,
    } = req.body || {}

    if (!orderId || !gatewayOrderId || !paymentId || !signature) {
      return res.status(400).json({ message: 'Missing payment verification details.' })
    }

    const order = await Order.findById(orderId)
    if (!order) return res.status(404).json({ message: 'Order not found.' })
    if (String(order.customerId) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Access denied.' })
    }
    // The signature must be over the gateway order id that WE stored, not a
    // value supplied by the client, otherwise any order could be marked paid.
    if (String(order.payment?.gatewayOrderId) !== String(gatewayOrderId)) {
      return res.status(400).json({ message: 'Payment verification failed.' })
    }

    // Razorpay signs `<razorpay_order_id>|<razorpay_payment_id>`.
    const expected = crypto
      .createHmac('sha256', KEY_SECRET)
      .update(`${gatewayOrderId}|${paymentId}`)
      .digest('hex')

    // Constant-time compare so the signature can't be brute-forced
    const a = Buffer.from(expected, 'utf8')
    const b = Buffer.from(String(signature), 'utf8')
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      await Order.updateOne({ _id: orderId }, { $set: { 'payment.status': 'Failed' } })
      return res.status(400).json({ message: 'Payment verification failed.' })
    }

    // Idempotent: a retry after a flaky network shouldn't error out
    if (order.payment?.status === 'Paid') {
      return res.json({ message: 'Payment already verified.', order })
    }

    order.payment = {
      ...order.payment,
      provider: 'razorpay',
      gatewayOrderId,
      paymentId,
      signature,
      status: 'Paid',
      paidAt: new Date(),
    }
    await order.save()

    res.json({ message: 'Payment verified.', order })
  } catch (err) {
    res.status(500).json({ message: 'Payment verification failed.', error: err.message })
  }
})

export default router
