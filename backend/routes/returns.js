import { Router } from 'express'
import mongoose from 'mongoose'
import Order from '../models/Order.js'
import RefundRequest from '../models/RefundRequest.js'
import { verifyToken } from '../middleware/auth.js'

const router = Router()

router.use(verifyToken)

const RETURN_WINDOW_DAYS = 7
const OPEN_STATUSES = ['Pending', 'Approved', 'Pickup Scheduled']

const isStaff = (user) => ['admin', 'marketing'].includes(user?.role)

const REASONS = new Set([
  'Damaged on arrival',
  'Defective product',
  'Wrong item delivered',
  'Item not as described',
  'Changed my mind',
  'Arrived too late',
])

/* ── GET /api/returns — the caller's own requests ── */
router.get('/', async (req, res) => {
  try {
    const filter = isStaff(req.user) && req.query.all === 'true'
      ? {}
      : { customerId: req.user.id }
    const requests = await RefundRequest.find(filter).sort({ createdAt: -1 }).lean()
    res.json({ requests })
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message })
  }
})

/* ── GET /api/returns/:id ── */
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid request id.' })
    }
    const request = await RefundRequest.findById(req.params.id).lean()
    if (!request) return res.status(404).json({ message: 'Return request not found.' })
    if (!isStaff(req.user) && String(request.customerId) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Access denied.' })
    }
    res.json({ request })
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message })
  }
})

/* ── POST /api/returns — request a return/refund for an order ──
   The amount is always derived from the stored order, never from the
   request body, so a client cannot claim an arbitrary refund. */
router.post('/', async (req, res) => {
  try {
    const { orderId, reason, type = 'Refund', items: requestedItems, note } = req.body || {}

    if (!orderId || !mongoose.isValidObjectId(orderId)) {
      return res.status(400).json({ message: 'A valid orderId is required.' })
    }
    if (!REASONS.has(reason)) {
      return res.status(400).json({ message: 'Please choose a valid reason.' })
    }
    if (!['Refund', 'Return'].includes(type)) {
      return res.status(400).json({ message: 'type must be Refund or Return.' })
    }

    const order = await Order.findById(orderId).lean()
    if (!order) return res.status(404).json({ message: 'Order not found.' })
    if (String(order.customerId) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Access denied.' })
    }
    if (['Cancelled', 'Refunded'].includes(order.status)) {
      return res.status(400).json({ message: `This order is already ${order.status.toLowerCase()}.` })
    }

    const placedAt = order.createdAt ? new Date(order.createdAt) : null
    if (placedAt) {
      const ageDays = (Date.now() - placedAt.getTime()) / 86400000
      if (ageDays > RETURN_WINDOW_DAYS) {
        return res.status(400).json({
          message: `Returns can be requested within ${RETURN_WINDOW_DAYS} days of delivery. This order is ${Math.floor(ageDays)} days old.`,
        })
      }
    }

    const existing = await RefundRequest.findOne({
      order: order._id,
      status: { $in: OPEN_STATUSES },
    }).lean()
    if (existing) {
      return res.status(409).json({
        message: `A ${existing.status.toLowerCase()} request already exists for this order.`,
        requestId: existing._id,
      })
    }

    // Only items actually on the order may be returned, at the order's price
    const orderItems = (order.items || []).map((i) => ({
      productId: i.productId,
      name: i.name,
      quantity: i.quantity,
      price: i.price,
    }))

    let selected = orderItems
    if (Array.isArray(requestedItems) && requestedItems.length > 0) {
      const wanted = new Map(requestedItems.map((i) => [String(i.productId), Number(i.quantity) || 1]))
      selected = orderItems.filter((i) => wanted.has(String(i.productId)))

      if (selected.length === 0) {
        return res.status(400).json({ message: 'None of those items belong to this order.' })
      }
      for (const item of selected) {
        const qty = wanted.get(String(item.productId))
        if (qty > item.quantity) {
          return res.status(400).json({
            message: `You can return up to ${item.quantity} × ${item.name} on this order.`,
          })
        }
        item.quantity = qty
      }
    }

    const subtotal = selected.reduce((sum, i) => sum + i.quantity * i.price, 0)
    const amount = Math.round(subtotal * 100) / 100

    const request = await RefundRequest.create({
      order: order._id,
      orderId: String(order._id),
      customerId: req.user.id,
      type,
      items: selected,
      amount,
      reason,
      note: note ? String(note).slice(0, 500) : undefined,
      status: 'Pending',
    })

    // Returning stock only once staff approve, so don't touch inventory here
    res.status(201).json({ message: 'Return request submitted.', request })
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message })
  }
})

/* ── PATCH /api/returns/:id/cancel — customer withdraws a pending request ── */
router.patch('/:id/cancel', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid request id.' })
    }
    const request = await RefundRequest.findById(req.params.id)
    if (!request) return res.status(404).json({ message: 'Return request not found.' })
    if (!isStaff(req.user) && String(request.customerId) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Access denied.' })
    }
    if (request.status !== 'Pending') {
      return res.status(400).json({ message: `A ${request.status.toLowerCase()} request can't be cancelled.` })
    }

    request.status = 'Cancelled'
    request.resolvedAt = new Date()
    await request.save()

    // No stock to restore: reserving inventory is the approve step's job
    // (see routes/admin.js), so a pending request never held stock back.
    res.json({ message: 'Return request cancelled.', request })
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message })
  }
})

export default router