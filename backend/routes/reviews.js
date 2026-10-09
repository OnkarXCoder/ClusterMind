import { Router } from 'express'
import mongoose from 'mongoose'
import Review from '../models/Review.js'
import Product from '../models/Product.js'
import Order from '../models/Order.js'
import { verifyToken } from '../middleware/auth.js'

const router = Router()

const NON_VERIFIED_ORDER_STATUSES = ['Canceled', 'Cancelled', 'Refunded']

async function aggregateProduct(productId) {
  const [agg] = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(String(productId)), status: 'Published' } },
    {
      $group: {
        _id: null,
        average: { $avg: '$rating' },
        count: { $sum: 1 },
        distribution: { $push: '$rating' },
      },
    },
  ])
  if (!agg) return { average: 0, count: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } }

  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  for (const r of agg.distribution) {
    const bucket = Math.min(5, Math.max(1, Math.round(r)))
    distribution[bucket] += 1
  }
  return { average: Math.round(agg.average * 10) / 10, count: agg.count, distribution }
}

async function syncProductRating(productId) {
  const summary = await aggregateProduct(productId)
  await Product.findByIdAndUpdate(productId, { rating: summary.average, reviews: summary.count })
  return summary
}

async function hasPurchasedOrder(customerId, productId) {
  const order = await Order.findOne({
    customerId,
    'items.productId': productId,
    status: { $nin: NON_VERIFIED_ORDER_STATUSES },
  }).select('_id')
  return Boolean(order)
}

router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params
    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ message: 'Invalid product id.' })
    }
    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      helpful: { helpful: -1, createdAt: -1 },
      highest: { rating: -1, createdAt: -1 },
      lowest: { rating: 1, createdAt: -1 },
    }
    const limit = Math.min(100, Number(req.query.limit) || 20)
    const sort = sortMap[req.query.sort] || sortMap.newest

    const [reviews, summary] = await Promise.all([
      Review.find({ product: productId, status: 'Published' }).sort(sort).limit(limit).lean(),
      aggregateProduct(productId),
    ])

    const currentUserId = req.user?.id || req.user?._id
    res.json({
      reviews: reviews.map((r) => ({ ...r, id: r._id.toString() })),
      summary,
      viewerHasReviewed: currentUserId
        ? Boolean(await Review.exists({ product: productId, customer: currentUserId }))
        : false,
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message })
  }
})

router.get('/product/:productId/summary', async (req, res) => {
  try {
    const { productId } = req.params
    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ message: 'Invalid product id.' })
    }
    res.json(await aggregateProduct(productId))
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message })
  }
})

router.post('/product/:productId', verifyToken, async (req, res) => {
  try {
    const { productId } = req.params
    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ message: 'Invalid product id.' })
    }

    const product = await Product.findById(productId).select('_id name')
    if (!product) return res.status(404).json({ message: 'Product not found.' })

    const rating = Number(req.body.rating)
    const title = String(req.body.title || '').trim()
    const comment = String(req.body.comment || '').trim()

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be a whole number from 1 to 5.' })
    }
    if (title.length < 3) {
      return res.status(400).json({ message: 'Please add a short title (at least 3 characters).' })
    }
    if (comment.length < 10) {
      return res.status(400).json({ message: 'Please write at least a sentence about it.' })
    }

    const customer = req.user.id || req.user._id
    const existing = await Review.findOne({ product: productId, customer })
    if (existing) {
      return res.status(409).json({ message: 'You have already reviewed this product. Edit your review instead.' })
    }

    const name = req.user.name || req.user.email || 'Customer'
    const verifiedPurchase = await hasPurchasedOrder(customer, productId)

    const review = await Review.create({
      product: productId,
      customer,
      customerName: name.split(' ')[0] || name,
      rating,
      title,
      comment,
      verifiedPurchase,
    })

    const summary = await syncProductRating(productId)
    res.status(201).json({ review: review.toJSON(), summary })
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: 'You have already reviewed this product.' })
    }
    res.status(500).json({ message: 'Server error.', error: err.message })
  }
})

router.post('/:id/helpful', verifyToken, async (req, res) => {
  try {
    const { id } = req.params
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid review id.' })
    }
    const userId = req.user.id || req.user._id

    // Toggle: add the voter once, remove on repeat - one vote per user.
    const review = await Review.findById(id)
    if (!review) return res.status(404).json({ message: 'Review not found.' })

    const alreadyVoted = review.helpfulBy.some((u) => String(u) === String(userId))
    if (alreadyVoted) {
      review.helpfulBy = review.helpfulBy.filter((u) => String(u) !== String(userId))
      review.helpful = Math.max(0, review.helpful - 1)
    } else {
      review.helpfulBy.push(userId)
      review.helpful += 1
    }
    await review.save()

    res.json({ helpful: review.helpful, voted: !alreadyVoted })
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message })
  }
})

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid review id.' })
    }
    const review = await Review.findById(id)
    if (!review) return res.status(404).json({ message: 'Review not found.' })

    const userId = String(req.user.id || req.user._id)
    const isAdmin = Boolean(req.user.isAdmin || req.user.role === 'admin')
    if (String(review.customer) !== userId && !isAdmin) {
      return res.status(403).json({ message: 'You can only delete your own review.' })
    }

    const productId = review.product
    await review.deleteOne()
    const summary = await syncProductRating(productId)

    res.json({ message: 'Review deleted.', summary })
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message })
  }
})

export default router
