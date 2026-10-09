import { Router } from 'express'
import Coupon from '../models/Coupon.js'
import { verifyToken, requireRole } from '../middleware/auth.js'

const router = Router()

router.get('/', verifyToken, requireRole('admin', 'marketing'), async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 }).lean()
    res.json({ coupons })
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message })
  }
})

router.get('/available', async (req, res) => {
  try {
    let customerId = null
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : null
    if (token) {
      try {
        const decoded = (await import('jsonwebtoken')).default.verify(
          token,
          process.env.JWT_SECRET || 'shopsmart-dev-secret'
        )
        customerId = decoded?.id || null
      } catch {}
    }
    const filter = {
      used: false,
      $or: [{ customerId: null }, ...(customerId ? [{ customerId }] : [])],
    }
    const coupons = await Coupon.find(filter).sort({ createdAt: -1 }).lean()
    res.json({ coupons })
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message })
  }
})

router.post('/validate', verifyToken, async (req, res) => {
  try {
    const { code } = req.body
    const coupon = await Coupon.findOne({ code: String(code || '').trim().toUpperCase() })
    if (!coupon) {
      return res.status(404).json({ message: 'Invalid coupon code.', ok: false })
    }
    if (coupon.used) {
      return res.status(400).json({ message: 'This coupon has already been used.', ok: false })
    }
    if (coupon.validTill && new Date(coupon.validTill) < new Date()) {
      return res.status(400).json({ message: 'This coupon has expired.', ok: false })
    }
    res.json({ ok: true, discount: coupon.discount, coupon })
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message })
  }
})

router.post('/', verifyToken, requireRole('admin', 'marketing'), async (req, res) => {
  try {
    const { code, discount, validTill, customerId } = req.body
    if (!code || discount === undefined) {
      return res.status(400).json({ message: 'Code and discount are required.' })
    }
    const coupon = await Coupon.create({
      code: String(code).trim().toUpperCase(),
      discount: Number(discount),
      validTill: validTill || undefined,
      customerId: customerId || undefined,
    })
    res.status(201).json({ message: 'Coupon created.', coupon })
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message })
  }
})

router.patch('/:id', verifyToken, requireRole('admin', 'marketing'), async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found.' })
    }
    res.json({ message: 'Coupon updated.', coupon })
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message })
  }
})

router.delete('/:id', verifyToken, requireRole('admin', 'marketing'), async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id)
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found.' })
    }
    res.json({ message: 'Coupon deleted.' })
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message })
  }
})

export default router
