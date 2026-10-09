import { Router } from 'express'
import Recommendation from '../models/Recommendation.js'
import Product from '../models/Product.js'
import { verifyToken } from '../middleware/auth.js'

const router = Router()

router.get('/', async (req, res) => {
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

    let recommendations = []
    if (customerId) {
      const recs = await Recommendation.find({ customerId }).sort({ score: -1 }).limit(12).lean()
      if (recs.length > 0) {
        const productIds = recs.map((r) => r.productId)
        const products = await Product.find({ _id: { $in: productIds } }).lean()
        const productMap = new Map(products.map((p) => [String(p._id), p]))
        recommendations = recs
          .map((r) => ({
            ...r,
            product: productMap.get(String(r.productId)) || null,
          }))
          .filter((r) => r.product)
      }
    }

    // Always ensure real DB products are returned if user has no custom recs
    if (recommendations.length === 0) {
      const topProducts = await Product.find({ inStock: { $ne: false } })
        .sort({ rating: -1, reviews: -1 })
        .limit(8)
        .lean()

      const reasons = [
        'Top AI match based on current trending preferences',
        'Highly rated 4.9★ by customers in your region',
        'Trending bestseller with rapid checkout velocity',
        'Frequently bought with top categories',
        'Recommended based on seasonal shopping trends',
        'Exclusive premium pick with high satisfaction rating',
        'Popular community favorite',
        'AI curated match for your profile',
      ]

      recommendations = topProducts.map((p, idx) => ({
        id: p._id,
        productId: p._id,
        name: p.name,
        price: p.price,
        rating: p.rating || 4.8,
        image: p.image || '',
        category: p.category,
        score: Number((0.98 - idx * 0.04).toFixed(2)),
        reason: reasons[idx % reasons.length],
        product: p,
      }))
    }

    res.json({ recommendations })
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message })
  }
})

router.get('/all', verifyToken, async (req, res) => {
  try {
    const recs = await Recommendation.find().sort({ score: -1 }).limit(50).lean()
    res.json({ recommendations: recs })
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message })
  }
})

router.post('/', verifyToken, async (req, res) => {
  try {
    const { productId, score = 0, reason = '' } = req.body
    if (!productId) {
      return res.status(400).json({ message: 'productId is required.' })
    }
    const recommendation = await Recommendation.findOneAndUpdate(
      { customerId: req.user.id, productId },
      { score: Number(score), reason },
      { upsert: true, new: true }
    )
    res.status(201).json({ message: 'Recommendation saved.', recommendation })
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message })
  }
})

export default router
