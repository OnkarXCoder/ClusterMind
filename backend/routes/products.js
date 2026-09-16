import { Router } from 'express'
import Product from '../models/Product.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const { search, category, brand, minPrice, maxPrice, minRating, inStock, sort, limit, giftRecipient } = req.query
    const filter = {}

    if (category && category !== 'All') filter.category = category
    if (search) {
      const q = String(search).trim()
      if (q) {
        filter.$or = [
          { name: { $regex: q, $options: 'i' } },
          { category: { $regex: q, $options: 'i' } },
        ]
      }
    }
    if (brand) filter.brand = brand
    if (giftRecipient) {
      const recipient = String(giftRecipient).trim().toLowerCase()
      if (recipient) {
        filter.$or = [
          ...(filter.$or || []),
          { giftTags: recipient },
          { category: { $regex: recipient, $options: 'i' } },
          { name: { $regex: recipient, $options: 'i' } },
        ]
      }
    }
    if (minPrice || maxPrice) {
      filter.price = {}
      if (minPrice) filter.price.$gte = Number(minPrice)
      if (maxPrice) filter.price.$lte = Number(maxPrice)
    }
    if (minRating) filter.rating = { $gte: Number(minRating) }
    if (inStock === 'true' || inStock === 'instock') filter.stock = { $gt: 0 }

    let query = Product.find(filter)
    const sortMap = {
      'price-asc': { price: 1 },
      'price-desc': { price: -1 },
      rating: { rating: -1 },
      reviews: { reviews: -1 },
      featured: { createdAt: -1 },
    }
    if (sortMap[sort]) query = query.sort(sortMap[sort])
    if (limit) query = query.limit(Number(limit))

    const products = await query.lean()
    res.json({ products, count: products.length })
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message })
  }
})

router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category')
    res.json({ categories: categories.sort() })
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean()
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' })
    }
    res.json({ product })
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message })
  }
})

export default router
