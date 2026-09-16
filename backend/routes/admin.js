import { Router } from 'express'
import { verifyToken, requireRole } from '../middleware/auth.js'
import AdminCustomer from '../models/AdminCustomer.js'
import AdminOrder from '../models/AdminOrder.js'
import AdminCampaign from '../models/AdminCampaign.js'
import RefundRequest from '../models/RefundRequest.js'
import FeedbackEntry from '../models/FeedbackEntry.js'
import AppNotification from '../models/AppNotification.js'
import TeamUser from '../models/TeamUser.js'
import ActivityLog from '../models/ActivityLog.js'
import MlModel from '../models/MlModel.js'
import PredictionLog from '../models/PredictionLog.js'
import Product from '../models/Product.js'
import {
  BEHAVIOUR_ANALYSIS,
  SEGMENTATION,
  AI_RECOMMENDATIONS,
  ADMIN_REPORTS_BASE,
  USER_ROLES,
} from '../data/adminData.js'

const router = Router()

router.use(verifyToken, requireRole('admin'))

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next)

router.get(
  '/overview',
  asyncHandler(async (req, res) => {
    const [customers, products, orders, campaigns] = await Promise.all([
      AdminCustomer.find().lean(),
      Product.countDocuments(),
      AdminOrder.find().lean(),
      AdminCampaign.countDocuments({ status: 'Active' }),
    ])

    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0)
    const totalOrders = orders.length
    const totalCustomers = customers.length
    const averageOrderValue = totalOrders ? Math.round(totalRevenue / totalOrders) : 0

    const recentActivities = await ActivityLog.find()
      .sort({ createdAt: -1 })
      .limit(8)
      .lean()

    const kpi = {
      totalCustomers,
      totalProducts: products,
      totalOrders,
      totalRevenue,
      customerSegments: SEGMENTATION.segments.length,
      activeCampaigns: campaigns,
      recommendationAccuracy: 92.45,
    }

    const businessSummary = {
      monthlyGrowth: '+12.4%',
      customerRetention: '78.5%',
      averageOrderValue: `₹${averageOrderValue.toLocaleString('en-IN')}`,
      topCategory: 'Electronics',
      topCity: 'Mumbai',
      conversionRate: '6.8%',
    }

    res.json({
      kpi,
      businessSummary,
      recentActivities: recentActivities.map((a) => ({
        id: a._id,
        action: a.action,
        time: a.timestamp,
        type: 'activity',
      })),
      segmentation: SEGMENTATION,
    })
  })
)

router.get(
  '/customers',
  asyncHandler(async (req, res) => {
    const { search = '', segment = '', status = '' } = req.query
    const filter = {}
    if (search) {
      const rx = new RegExp(search, 'i')
      filter.$or = [{ name: rx }, { email: rx }, { customerId: rx }]
    }
    if (segment) filter.segment = segment
    if (status) filter.status = status
    const customers = await AdminCustomer.find(filter).sort({ customerId: 1 }).lean()
    res.json(customers)
  })
)

router.get(
  '/customers/:customerId',
  asyncHandler(async (req, res) => {
    const customer = await AdminCustomer.findOne({
      customerId: req.params.customerId,
    }).lean()
    if (!customer) return res.status(404).json({ message: 'Customer not found' })

    const [orders, feedback] = await Promise.all([
      AdminOrder.find({ customer: customer.name }).sort({ orderId: -1 }).lean(),
      FeedbackEntry.find({ customer: customer.name }).lean(),
    ])

    res.json({
      customer,
      purchaseHistory: orders.map((o) => ({
        orderId: o.orderId,
        date: o.date,
        items: `${o.items} item(s)`,
        total: o.total,
        status: o.status,
      })),
      feedback: feedback.map((f) => ({
        id: f._id,
        type: f.type,
        content: f.content,
        rating: f.rating,
        date: f.date,
        product: f.product,
      })),
    })
  })
)

router.patch(
  '/customers/:customerId/status',
  asyncHandler(async (req, res) => {
    const { status } = req.body
    if (!status) return res.status(400).json({ message: 'status is required' })
    const customer = await AdminCustomer.findOneAndUpdate(
      { customerId: req.params.customerId },
      { status },
      { new: true }
    ).lean()
    if (!customer) return res.status(404).json({ message: 'Customer not found' })
    await ActivityLog.create({
      user: 'Admin',
      action: `Changed status of ${customer.name} to ${status}`,
      timestamp: new Date().toLocaleString('en-IN'),
    })
    res.json(customer)
  })
)

router.get(
  '/products',
  asyncHandler(async (req, res) => {
    const { search = '', category = '' } = req.query
    const filter = {}
    if (search) {
      const rx = new RegExp(search, 'i')
      filter.$or = [{ name: rx }, { brand: rx }]
    }
    if (category) filter.category = category
    const products = await Product.find(filter).lean()
    res.json(
      products.map((p, i) => ({
        id: p._id,
        name: p.name,
        category: p.category,
        brand: p.brand || '—',
        price: p.price,
        stock: p.stock ?? 0,
        rating: p.rating ?? 0,
        reviews: p.reviews ?? 0,
        discount: p.discount ?? 0,
        oldPrice: p.oldPrice,
        status:
          (p.stock ?? 0) === 0
            ? 'Out of Stock'
            : (p.stock ?? 0) < 15
              ? 'Low Stock'
              : 'Active',
        image: p.image,
        giftTags: p.giftTags || [],
        sku: `P${String(i + 1).padStart(4, '0')}`,
      }))
    )
  })
)

router.post(
  '/products',
  asyncHandler(async (req, res) => {
    const {
      name,
      description = '',
      category,
      brand = 'Generic',
      price,
      oldPrice,
      discount = 0,
      rating = 0,
      reviews = 0,
      stock = 0,
      image = '/products/books.jpg',
      giftTags = [],
      aiRecommended = false,
      freeDelivery = true,
    } = req.body

    if (!name || !category || price === undefined || price === '') {
      return res.status(400).json({ message: 'name, category and price are required' })
    }

    const product = await Product.create({
      name,
      description,
      category,
      brand,
      price: Number(price),
      oldPrice: oldPrice === '' || oldPrice === undefined ? undefined : Number(oldPrice),
      discount: Number(discount) || 0,
      rating: Number(rating) || 0,
      reviews: Number(reviews) || 0,
      stock: Number(stock) || 0,
      image,
      giftTags: Array.isArray(giftTags)
        ? giftTags.map((tag) => String(tag).trim().toLowerCase()).filter(Boolean)
        : String(giftTags).split(',').map((tag) => tag.trim().toLowerCase()).filter(Boolean),
      aiRecommended: Boolean(aiRecommended),
      freeDelivery: Boolean(freeDelivery),
    })

    await ActivityLog.create({
      user: 'Admin',
      action: `Added product ${product.name}`,
      timestamp: new Date().toLocaleString('en-IN'),
    })

    res.status(201).json({
      id: product._id,
      name: product.name,
      category: product.category,
      brand: product.brand,
      price: product.price,
      stock: product.stock,
      rating: product.rating,
      reviews: product.reviews,
      status: product.stock === 0 ? 'Out of Stock' : product.stock < 15 ? 'Low Stock' : 'Active',
      image: product.image,
      giftTags: product.giftTags,
    })
  })
)

router.patch(
  '/products/:id',
  asyncHandler(async (req, res) => {
    const update = { ...req.body }
    for (const key of ['price', 'oldPrice', 'discount', 'rating', 'reviews', 'stock']) {
      if (update[key] !== undefined && update[key] !== '') update[key] = Number(update[key])
      if (update[key] === '') delete update[key]
    }
    if (update.giftTags && !Array.isArray(update.giftTags)) {
      update.giftTags = String(update.giftTags).split(',').map((tag) => tag.trim().toLowerCase()).filter(Boolean)
    }
    const product = await Product.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    }).lean()
    if (!product) return res.status(404).json({ message: 'Product not found' })
    res.json(product)
  })
)

router.delete(
  '/products/:id',
  asyncHandler(async (req, res) => {
    const product = await Product.findByIdAndDelete(req.params.id).lean()
    if (!product) return res.status(404).json({ message: 'Product not found' })
    await ActivityLog.create({
      user: 'Admin',
      action: `Deleted product ${product.name}`,
      timestamp: new Date().toLocaleString('en-IN'),
    })
    res.json({ message: 'Product deleted', id: req.params.id })
  })
)

router.get(
  '/orders',
  asyncHandler(async (req, res) => {
    const { search = '', status = '' } = req.query
    const filter = {}
    if (search) {
      const rx = new RegExp(search, 'i')
      filter.$or = [{ orderId: rx }, { customer: rx }]
    }
    if (status) filter.status = status
    const orders = await AdminOrder.find(filter).sort({ orderId: -1 }).lean()
    res.json(orders)
  })
)

router.patch(
  '/orders/:orderId/status',
  asyncHandler(async (req, res) => {
    const { status } = req.body
    if (!status) return res.status(400).json({ message: 'status is required' })
    const order = await AdminOrder.findOneAndUpdate(
      { orderId: req.params.orderId },
      { status },
      { new: true }
    ).lean()
    if (!order) return res.status(404).json({ message: 'Order not found' })
    await ActivityLog.create({
      user: 'Admin',
      action: `Updated order ${order.orderId} status to ${status}`,
      timestamp: new Date().toLocaleString('en-IN'),
    })
    res.json(order)
  })
)

router.get(
  '/refunds',
  asyncHandler(async (req, res) => {
    const refunds = await RefundRequest.find().sort({ createdAt: -1 }).lean()
    res.json(refunds)
  })
)

router.patch(
  '/refunds/:id/status',
  asyncHandler(async (req, res) => {
    const { status } = req.body
    if (!status) return res.status(400).json({ message: 'status is required' })
    const refund = await RefundRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).lean()
    if (!refund) return res.status(404).json({ message: 'Refund request not found' })
    res.json(refund)
  })
)

router.get(
  '/feedback',
  asyncHandler(async (req, res) => {
    const feedback = await FeedbackEntry.find().sort({ createdAt: -1 }).lean()
    res.json(feedback)
  })
)

router.patch(
  '/feedback/:id/status',
  asyncHandler(async (req, res) => {
    const { status } = req.body
    if (!status) return res.status(400).json({ message: 'status is required' })
    const entry = await FeedbackEntry.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).lean()
    if (!entry) return res.status(404).json({ message: 'Feedback not found' })
    res.json(entry)
  })
)

router.get(
  '/notifications',
  asyncHandler(async (req, res) => {
    const notifications = await AppNotification.find().sort({ createdAt: -1 }).lean()
    res.json(notifications)
  })
)

router.post(
  '/notifications',
  asyncHandler(async (req, res) => {
    const { type = 'Email', title, audience = 'All Customers', scheduled } = req.body
    if (!title) return res.status(400).json({ message: 'title is required' })
    const notification = await AppNotification.create({
      type,
      title,
      audience,
      scheduled: scheduled || new Date().toLocaleDateString('en-IN'),
      status: 'Scheduled',
      opened: '—',
    })
    res.status(201).json(notification.toObject())
  })
)

router.get(
  '/campaigns',
  asyncHandler(async (req, res) => {
    const campaigns = await AdminCampaign.find().sort({ campaignId: 1 }).lean()
    res.json(campaigns)
  })
)

router.post(
  '/campaigns',
  asyncHandler(async (req, res) => {
    const count = await AdminCampaign.countDocuments()
    const campaign = await AdminCampaign.create({
      ...req.body,
      campaignId: `CMP-${String(count + 1).padStart(3, '0')}`,
    })
    res.status(201).json(campaign.toObject())
  })
)

router.get(
  '/team-users',
  asyncHandler(async (req, res) => {
    const users = await TeamUser.find().sort({ userId: 1 }).lean()
    res.json({ users, roles: USER_ROLES })
  })
)

router.patch(
  '/team-users/:userId/status',
  asyncHandler(async (req, res) => {
    const { status } = req.body
    if (!status) return res.status(400).json({ message: 'status is required' })
    const user = await TeamUser.findOneAndUpdate(
      { userId: req.params.userId },
      { status },
      { new: true }
    ).lean()
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json(user)
  })
)

router.get('/activity-logs', asyncHandler(async (req, res) => {
  const logs = await ActivityLog.find().sort({ createdAt: -1 }).limit(50).lean()
  res.json(logs)
}))

router.get(
  '/ml-models',
  asyncHandler(async (req, res) => {
    const [models, predictionLogs] = await Promise.all([
      MlModel.find().lean(),
      PredictionLog.find().sort({ createdAt: -1 }).limit(20).lean(),
    ])
    res.json({ models, predictionLogs })
  })
)

router.get(
  '/analytics/behaviour',
  asyncHandler(async (req, res) => {
    res.json(BEHAVIOUR_ANALYSIS)
  })
)

router.get(
  '/analytics/segmentation',
  asyncHandler(async (req, res) => {
    res.json(SEGMENTATION)
  })
)

router.get(
  '/analytics/recommendations',
  asyncHandler(async (req, res) => {
    res.json(AI_RECOMMENDATIONS)
  })
)

router.get(
  '/reports',
  asyncHandler(async (req, res) => {
    const [
      totalOrders,
      revenueAgg,
      lowStock,
      outOfStock,
      activeCampaigns,
      feedbackCount,
    ] = await Promise.all([
      AdminOrder.countDocuments(),
      AdminOrder.aggregate([{ $group: { _id: null, total: { $sum: '$total' } } }]),
      Product.countDocuments({ stock: { $gt: 0, $lt: 15 } }),
      Product.countDocuments({ $or: [{ stock: 0 }, { stock: { $exists: false } }] }),
      AdminCampaign.countDocuments(),
      FeedbackEntry.countDocuments(),
    ])

    const reports = {
      ...ADMIN_REPORTS_BASE,
      productReport: {
        ...ADMIN_REPORTS_BASE.productReport,
        lowStock,
        outOfStock,
      },
      marketingReport: {
        ...ADMIN_REPORTS_BASE.marketingReport,
        campaignsRun: activeCampaigns,
      },
      liveStats: {
        ordersInDb: totalOrders,
        revenueFromOrders: revenueAgg[0]?.total || 0,
        feedbackEntries: feedbackCount,
      },
    }

    res.json(reports)
  })
)

export default router
