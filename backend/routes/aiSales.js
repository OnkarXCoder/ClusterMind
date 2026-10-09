import { Router } from 'express'
import Product from '../models/Product.js'
import {
  createSession,
  getSession,
  getAllSessions,
  getWelcomeMessage,
  processMessage,
  searchProducts,
} from '../services/aiSalesService.js'

const router = Router()

router.post('/chat', async (req, res) => {
  try {
    const { sessionId, message, currentProduct } = req.body

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ message: 'Message is required.' })
    }

    const response = await processMessage(sessionId, message.trim(), {
      customerId: req.user?.id || null,
      currentProduct: currentProduct || null,
    })

    res.json(response)
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message })
  }
})

router.post('/session', (req, res) => {
  try {
    const { customerId } = req.body
    const session = createSession(customerId || null)
    const welcome = getWelcomeMessage()

    res.json({
      session,
      welcome,
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message })
  }
})

router.get('/session/:id', (req, res) => {
  try {
    const session = getSession(req.params.id)
    if (!session) {
      return res.status(404).json({ message: 'Session not found.' })
    }
    res.json({ session })
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message })
  }
})

router.post('/recommend', async (req, res) => {
  try {
    const { category, budget, useCase, features } = req.body

    const criteria = {}
    if (category) criteria.categories = Array.isArray(category) ? category : [category]
    if (budget) {
      criteria.budget = typeof budget === 'number'
        ? { min: 0, max: budget }
        : { min: budget.min || 0, max: budget.max || Infinity }
    }
    if (features) criteria.features = Array.isArray(features) ? features : [features]
    criteria.limit = 6

    const products = await searchProducts(criteria)

    res.json({
      products,
      count: products.length,
      criteria: { category, budget, useCase, features },
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message })
  }
})

router.post('/compare', async (req, res) => {
  try {
    const { productIds } = req.body

    if (!productIds || !Array.isArray(productIds) || productIds.length < 2) {
      return res.status(400).json({ message: 'At least 2 product IDs are required for comparison.' })
    }

    const ids = productIds.slice(0, 4)
    const products = await Product.find({ _id: { $in: ids } }).lean()

    if (products.length < 2) {
      return res.status(404).json({ message: 'Not enough products found for comparison.' })
    }

    const formatted = products.map((p) => ({
      id: p._id,
      name: p.name,
      price: p.price,
      oldPrice: p.oldPrice,
      discount: p.discount,
      rating: p.rating,
      reviews: p.reviews,
      image: p.image,
      category: p.category,
      brand: p.brand,
      stock: p.stock,
      freeDelivery: p.freeDelivery,
      description: p.description,
      badge: p.badge,
    }))

    const headers = ['Feature', ...formatted.map((p) => p.name)]
    const rows = [
      ['Price', ...formatted.map((p) => `\u20b9${p.price.toLocaleString()}`)],
      ['Brand', ...formatted.map((p) => p.brand)],
      ['Category', ...formatted.map((p) => p.category)],
      ['Rating', ...formatted.map((p) => `${p.rating} (${p.reviews} reviews)`)],
      ['Discount', ...formatted.map((p) => (p.discount ? `${p.discount}% off` : 'N/A'))],
      ['Stock', ...formatted.map((p) => (p.stock > 0 ? 'In Stock' : 'Out of Stock'))],
      ['Free Delivery', ...formatted.map((p) => (p.freeDelivery ? 'Yes' : 'No'))],
    ]

    res.json({
      products: formatted,
      comparison: { headers, rows },
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message })
  }
})

router.post('/handoff', (req, res) => {
  try {
    const { sessionId, reason } = req.body

    if (!sessionId) {
      return res.status(400).json({ message: 'Session ID is required.' })
    }

    const session = getSession(sessionId)
    if (!session) {
      return res.status(404).json({ message: 'Session not found.' })
    }

    const handoff = {
      sessionId,
      customerId: session.customerId,
      reason: reason || 'Customer requested human agent',
      conversationHistory: session.messages,
      context: session.context,
      createdAt: new Date().toISOString(),
      status: 'pending',
    }

    res.json({
      message: 'Human handoff request created successfully. A representative will be with you shortly.',
      handoff,
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message })
  }
})

router.get('/analytics', (req, res) => {
  try {
    const allSessions = getAllSessions()

    const totalSessions = allSessions.length
    const totalMessages = allSessions.reduce((sum, s) => sum + s.messages.length, 0)
    const averageMessagesPerSession = totalSessions > 0 ? Math.round(totalMessages / totalSessions) : 0

    const completedPurchases = allSessions.filter(
      (s) => s.stage === 'PURCHASE_INTENT' || s.messages.some((m) => m.content?.includes('add_to_cart'))
    ).length
    const conversionRate = totalSessions > 0 ? Math.round((completedPurchases / totalSessions) * 100) : 0

    const categoryCounts = {}
    const objectionCounts = {}
    for (const s of allSessions) {
      for (const cat of s.context.categories) {
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1
      }
      for (const m of s.messages) {
        if (m.content && m.content.toLowerCase().includes('expensive')) {
          objectionCounts['expensive'] = (objectionCounts['expensive'] || 0) + 1
        }
        if (m.content && m.content.toLowerCase().includes('think about')) {
          objectionCounts['think_about'] = (objectionCounts['think_about'] || 0) + 1
        }
      }
    }

    const topCategories = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }))

    const commonObjections = Object.entries(objectionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([type, count]) => ({ type, count }))

    res.json({
      stats: {
        totalSessions,
        averageMessagesPerSession,
        conversionRate,
        topCategories,
        commonObjections,
      },
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message })
  }
})

export default router
