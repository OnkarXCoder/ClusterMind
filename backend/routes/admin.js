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
import CustomerBehavior from '../models/CustomerBehavior.js'
import User from '../models/User.js'
import Order from '../models/Order.js'
import Cart from '../models/Cart.js'
import Wishlist from '../models/Wishlist.js'
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

const SEGMENT_COLORS = ['#7c3aed', '#2563eb', '#06b6d4', '#10b981', '#f97316', '#ec4899']

function currency(value) {
  return `₹${Math.round(value || 0).toLocaleString('en-IN')}`
}

function percent(part, total) {
  return total ? Math.round((part / total) * 100) : 0
}

function buildSegmentation(customers) {
  const groups = customers.reduce((map, customer) => {
    const key = customer.segment || 'Unassigned'
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(customer)
    return map
  }, new Map())

  const total = customers.length || 1
  const segments = [...groups.entries()].map(([name, members], index) => {
    const spend = members.reduce((sum, customer) => sum + Number(customer.totalSpent || 0), 0)
    const orders = members.reduce((sum, customer) => sum + Number(customer.totalOrders || 0), 0)
    return {
      name,
      customers: members.length,
      percentage: percent(members.length, total),
      avgSpending: currency(spend / Math.max(1, members.length)),
      frequency: (orders / Math.max(1, members.length)) >= 10 ? 'High' : (orders / Math.max(1, members.length)) >= 4 ? 'Medium' : 'Low',
      type: name,
      color: SEGMENT_COLORS[index % SEGMENT_COLORS.length],
    }
  })

  return {
    segments,
    clusters: segments.flatMap((segment, index) =>
      Array.from({ length: Math.max(1, Math.min(8, segment.customers)) }, (_, point) => ({
        x: index * 2 + (point % 3) + 1,
        y: Math.max(1, segment.percentage / 10) + Math.floor(point / 3),
        name: segment.name,
        color: segment.color,
      })),
    ),
  }
}

function buildRecommendations(segments, products, campaigns) {
  const productRows = segments.map((segment, index) => {
    const product = products[index % Math.max(1, products.length)]
    return {
      segment: segment.name,
      item: product?.name || 'Top catalog pick',
      reason: `${segment.customers} customers in this segment with ${segment.frequency.toLowerCase()} purchase frequency`,
      type: 'Product',
      status: 'Active',
    }
  })

  const campaignRows = segments.map((segment, index) => {
    const campaign = campaigns[index % Math.max(1, campaigns.length)]
    return {
      segment: segment.name,
      item: campaign?.name || `${segment.name} campaign`,
      reason: `Matches ${segment.percentage}% of current customers`,
      type: 'Campaign',
      status: campaign?.status || 'Draft',
    }
  })

  const total = productRows.length + campaignRows.length
  const accepted = Math.round(total * 0.42)

  return {
    stats: [
      { label: 'Total Recommendations', value: String(total) },
      { label: 'Accepted Recommendations', value: String(accepted) },
      { label: 'Conversion Rate', value: `${percent(accepted, total)}%` },
      { label: 'Average Recommendation Value', value: currency(products.reduce((sum, p) => sum + Number(p.price || 0), 0) / Math.max(1, products.length)) },
    ],
    product: productRows,
    offer: segments.map((segment) => ({
      segment: segment.name,
      item: segment.frequency === 'High' ? 'Loyalty bonus' : 'Personalized discount',
      reason: `${segment.frequency} engagement segment`,
      type: 'Offer',
      status: 'Active',
    })),
    crossSelling: products.slice(0, 5).map((product, index, list) => ({
      primary: product.name,
      cross: list[(index + 1) % list.length]?.name || 'Related product',
      affinity: `${Math.max(35, 85 - index * 7)}%`,
      reason: product.category ? `Same ${product.category} catalog interest` : 'Related catalog interest',
    })),
    upSelling: products.slice(0, 5).map((product) => ({
      product: product.name,
      upsell: `${product.name} premium option`,
      priceDiff: currency(Number(product.price || 0) * 0.2),
      conversion: `${Math.max(8, Math.round(Number(product.rating || 3) * 6))}%`,
    })),
    frequentlyBoughtTogether: products.slice(0, 4).map((product, index, list) => ({
      items: [product.name, list[(index + 1) % list.length]?.name || 'Related product'].filter(Boolean),
      frequency: Math.max(1, Number(product.reviews || 0)),
    })),
    history: campaigns.slice(0, 7).map((campaign) => ({
      date: campaign.startDate || campaign.createdAt?.toLocaleDateString?.('en-IN') || 'Recent',
      recommendations: Math.max(1, Math.round(Number(campaign.budget || 0) / 1000)),
      accepted: Math.max(1, Math.round(Number(campaign.spent || 0) / 1000)),
      rate: `${campaign.performance || 0}%`,
    })),
    campaign: campaignRows,
  }
}

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
      customerSegments: new Set(customers.map((customer) => customer.segment || 'Unassigned')).size,
      activeCampaigns: campaigns,
      recommendationAccuracy: totalCustomers ? percent(customers.filter((customer) => Number(customer.totalOrders || 0) > 1).length, totalCustomers) : 0,
    }

    const topCity = Object.entries(
      customers.reduce((map, customer) => {
        const key = customer.city || 'Unknown'
        map[key] = (map[key] || 0) + 1
        return map
      }, {})
    ).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown'

    const businessSummary = {
      monthlyGrowth: totalOrders ? `${percent(orders.filter((order) => ['Delivered', 'Shipped', 'Processing'].includes(order.status)).length, totalOrders)}% fulfilled` : '0%',
      customerRetention: `${percent(customers.filter((customer) => Number(customer.totalOrders || 0) > 1).length, totalCustomers)}%`,
      averageOrderValue: `₹${averageOrderValue.toLocaleString('en-IN')}`,
      topCategory: 'Live catalog',
      topCity,
      conversionRate: `${percent(orders.filter((order) => order.status === 'Delivered').length, totalOrders)}%`,
    }

    const allProducts = await Product.find().lean()
    const catRevenueMap = {}
    allProducts.forEach((p) => {
      const cat = p.category || 'Other'
      if (!catRevenueMap[cat]) catRevenueMap[cat] = { name: cat, count: 0, catalogValue: 0 }
      catRevenueMap[cat].count += 1
      catRevenueMap[cat].catalogValue += Number(p.price) || 0
    })

    const totalCatalogValue = Object.values(catRevenueMap).reduce((s, c) => s + c.catalogValue, 0) || 1
    const revenueByCategory = Object.values(catRevenueMap)
      .map((c) => ({
        name: c.name,
        value: totalRevenue > 0
          ? Math.round(totalRevenue * (c.catalogValue / totalCatalogValue))
          : Math.round(c.catalogValue * 15),
        count: c.count,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6)

    res.json({
      kpi,
      businessSummary,
      revenueByCategory,
      recentActivities: recentActivities.map((a) => ({
        id: a._id,
        action: a.action,
        time: a.timestamp,
        type: 'activity',
      })),
      segmentation: buildSegmentation(customers),
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

    const userLookup = [
      { _id: /^[a-f\d]{24}$/i.test(String(customer.customerId)) ? customer.customerId : undefined },
      ...(customer.email ? [{ email: String(customer.email).toLowerCase() }] : []),
      ...(customer.phone ? [{ contact: customer.phone }] : []),
    ].filter((condition) => !Object.values(condition).includes(undefined))
    const user = userLookup.length ? await User.findOne({ $or: userLookup }).lean() : null
    const behaviorCustomerIds = [
      /^[a-f\d]{24}$/i.test(String(customer.customerId)) ? customer.customerId : null,
      user?._id,
    ].filter(Boolean)

    const [orders, liveOrders, feedback, behaviors, cart, wishlist] = await Promise.all([
      AdminOrder.find({ customer: customer.name }).sort({ orderId: -1 }).lean(),
      behaviorCustomerIds.length
        ? Order.find({ customerId: { $in: behaviorCustomerIds } }).sort({ createdAt: -1 }).lean()
        : [],
      FeedbackEntry.find({ customer: customer.name }).lean(),
      behaviorCustomerIds.length
        ? CustomerBehavior.find({ customerId: { $in: behaviorCustomerIds } })
          .sort({ timestamp: -1 })
          .limit(100)
          .populate('productId', 'name category price image')
          .lean()
        : [],
      behaviorCustomerIds.length
        ? Cart.findOne({ customerId: { $in: behaviorCustomerIds } }).populate('items.productId', 'name category price image').lean()
        : null,
      behaviorCustomerIds.length
        ? Wishlist.findOne({ customerId: { $in: behaviorCustomerIds } }).populate('productIds', 'name category price image').lean()
        : null,
    ])

    const formatBehavior = (behavior) => ({
      id: behavior._id,
      action: behavior.action,
      productId: behavior.productId?._id || behavior.productId || null,
      productName: behavior.productName || behavior.productId?.name || '',
      category: behavior.category || behavior.productId?.category || '',
      searchTerm: behavior.searchTerm || '',
      source: behavior.source || '',
      metadata: behavior.metadata || {},
      date: behavior.timestamp || behavior.createdAt,
    })

    res.json({
      customer,
      purchaseHistory: [
        ...liveOrders.map((order) => ({
          orderId: order.orderId || String(order._id),
          date: order.createdAt,
          items: `${order.items?.length || 0} item(s)`,
          total: order.totals?.total || 0,
          status: order.status,
        })),
        ...orders.map((o) => ({
          orderId: o.orderId,
          date: o.date,
          items: `${o.items} item(s)`,
          total: o.total,
          status: o.status,
        })),
      ],
      feedback: feedback.map((f) => ({
        id: f._id,
        type: f.type,
        content: f.content,
        rating: f.rating,
        date: f.date,
        product: f.product,
      })),
      browsingHistory: behaviors.filter((b) => ['view', 'click'].includes(b.action)).map(formatBehavior),
      searchHistory: behaviors.filter((b) => b.action === 'search').map(formatBehavior),
      cartActivity: [
        ...(cart?.items || []).map((item) => ({
          id: `${item.productId?._id || item.productId}-${item.addedAt}`,
          action: 'cart_item',
          productId: item.productId?._id || item.productId,
          productName: item.productId?.name || 'Product',
          category: item.productId?.category || '',
          source: 'current-cart',
          metadata: { quantity: item.quantity },
          date: item.addedAt,
        })),
        ...behaviors.filter((b) => b.action === 'add_to_cart').map(formatBehavior),
      ],
      wishlist: (wishlist?.productIds || []).map((product) => ({
        id: product._id,
        productName: product.name,
        category: product.category,
        date: wishlist.updatedAt,
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
      badge = '',
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
      badge,
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
      description: product.description,
      badge: product.badge,
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
    const { status, resolution, adminNote } = req.body
    if (!status) return res.status(400).json({ message: 'status is required' })

    const allowed = ['Pending', 'Approved', 'Pickup Scheduled', 'Refunded', 'Rejected', 'Cancelled']
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: `status must be one of: ${allowed.join(', ')}` })
    }

    const existing = await RefundRequest.findById(req.params.id)
    if (!existing) return res.status(404).json({ message: 'Refund request not found' })

    const wasResolved = ['Refunded', 'Rejected', 'Cancelled'].includes(existing.status)
    const isResolved = ['Refunded', 'Rejected', 'Cancelled'].includes(status)

    const refund = await RefundRequest.findByIdAndUpdate(
      req.params.id,
      {
        status,
        resolution: resolution ?? existing.resolution ?? null,
        adminNote: adminNote ?? existing.adminNote ?? undefined,
        resolvedAt: isResolved ? new Date() : null,
      },
      { new: true }
    ).lean()

    // Returned stock comes back exactly once, when staff close the request
    // as Refunded. Stock was never held back when the request was created.
    if (status === 'Refunded' && !wasResolved && Array.isArray(existing.items)) {
      for (const item of existing.items) {
        if (item.productId) {
          await Product.updateOne({ _id: item.productId }, { $inc: { stock: item.quantity } })
        }
      }
    }

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

router.post(
  '/team-users',
  asyncHandler(async (req, res) => {
    const { name, email, role = 'Viewer', status = 'Active' } = req.body
    if (!name?.trim() || !email?.trim()) {
      return res.status(400).json({ message: 'Name and email are required' })
    }

    const count = await TeamUser.countDocuments()
    const user = await TeamUser.create({
      userId: `U${String(count + 1).padStart(3, '0')}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      status,
      lastLogin: 'Never',
    })

    await ActivityLog.create({
      user: 'Admin',
      action: `Created team user ${user.name}`,
      timestamp: new Date().toLocaleString('en-IN'),
    })

    res.status(201).json(user.toObject())
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

router.patch(
  '/team-users/:userId',
  asyncHandler(async (req, res) => {
    const { name, email, role, status, lastLogin } = req.body
    if (!name?.trim() || !email?.trim() || !role?.trim()) {
      return res.status(400).json({ message: 'Name, email and role are required' })
    }
    const user = await TeamUser.findOneAndUpdate(
      { userId: req.params.userId },
      {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: role.trim(),
        ...(status ? { status } : {}),
        ...(lastLogin ? { lastLogin } : {}),
      },
      { new: true, runValidators: true }
    ).lean()
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json(user)
  })
)

router.delete(
  '/team-users/:userId',
  asyncHandler(async (req, res) => {
    const user = await TeamUser.findOneAndDelete({ userId: req.params.userId }).lean()
    if (!user) return res.status(404).json({ message: 'User not found' })

    await ActivityLog.create({
      user: 'Admin',
      action: `Deleted team user ${user.name}`,
      timestamp: new Date().toLocaleString('en-IN'),
    })

    res.json({ message: 'User deleted', userId: req.params.userId })
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
    const customers = await AdminCustomer.find().lean()
    res.json(buildSegmentation(customers))
  })
)

router.get(
  '/analytics/recommendations',
  asyncHandler(async (req, res) => {
    const [customers, products, campaigns] = await Promise.all([
      AdminCustomer.find().lean(),
      Product.find().sort({ reviews: -1, rating: -1 }).limit(20).lean(),
      AdminCampaign.find().sort({ createdAt: -1 }).limit(20).lean(),
    ])
    const { segments } = buildSegmentation(customers)
    res.json(buildRecommendations(segments, products, campaigns))
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
