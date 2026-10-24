import { Router } from 'express'
import Order from '../models/Order.js'
import Product from '../models/Product.js'
import { verifyToken, requireRole } from '../middleware/auth.js'

const router = Router()

router.use(verifyToken)

function generateOrderId() {
  return `CM-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
}

router.get('/', async (req, res) => {
  try {
    const isStaff = ['admin', 'marketing'].includes(req.user.role)
    const filter = isStaff && req.query.all === 'true' ? {} : { customerId: req.user.id }
    const orders = await Order.find(filter).sort({ createdAt: -1 }).lean()
    res.json({ orders })
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).lean()
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' })
    }
    const isStaff = ['admin', 'marketing'].includes(req.user.role)
    if (!isStaff && String(order.customerId) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Access denied.' })
    }
    res.json({ order })
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const { items, address, shipping, payment, totals } = req.body

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item.' })
    }

    const productIds = items.map((i) => i.productId).filter(Boolean)
    const products = await Product.find({ _id: { $in: productIds } }).lean()
    const productMap = new Map(products.map((p) => [String(p._id), p]))

    const normalized = items.map((i) => {
      const product = productMap.get(String(i.productId))
      return {
        productId: i.productId,
        name: product ? product.name : i.name || 'Unknown product',
        image: product ? product.image : i.image,
        quantity: Math.max(1, Number(i.quantity) || 1),
        price: product ? product.price : Number(i.price) || 0,
      }
    })

    const subtotal = normalized.reduce((s, i) => s + i.quantity * i.price, 0)
    const shippingPrice = Number(shipping?.price) || 0
    const discount = Number(totals?.discount) || 0

    const order = await Order.create({
      orderId: generateOrderId(),
      customerId: req.user.id,
      items: normalized,
      address: address || {},
      shipping: shipping || { label: 'Standard Delivery', eta: '2-3 Days', price: 0 },
      payment: payment || { label: 'Cash on Delivery' },
      totals: {
        subtotal,
        shipping: shippingPrice,
        discount,
        total: Number.isFinite(Number(totals?.total))
          ? Number(totals.total)
          : Math.max(0, subtotal + shippingPrice - discount),
      },
    })

    for (const item of normalized) {
      await Product.updateOne(
        { _id: item.productId },
        { $inc: { stock: -item.quantity } }
      )
    }

    res.status(201).json({ message: 'Order placed successfully.', order })
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message })
  }
})

router.patch('/:id/status', requireRole('admin', 'marketing'), async (req, res) => {
  try {
    const { status } = req.body
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' })
    }
    res.json({ message: 'Order updated.', order })
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message })
  }
})

export default router
