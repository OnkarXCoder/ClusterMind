import 'dotenv/config'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import connectDB from './db.js'
import Admin from './models/Admin.js'
import MarketingTeam from './models/MarketingTeam.js'
import User from './models/User.js'
import Product from './models/Product.js'
import Campaign from './models/Campaign.js'
import Coupon from './models/Coupon.js'
import Loyalty from './models/Loyalty.js'
import CustomerSegment from './models/CustomerSegment.js'
import CustomerBehavior from './models/CustomerBehavior.js'
import Recommendation from './models/Recommendation.js'
import Order from './models/Order.js'
import { products } from './data/products.js'
import { seedAdminData } from './seedAdminData.js'

const seedImageFor = (product) => {
  const text = `${product.name || ''} ${product.category || ''}`.toLowerCase()
  const exact = {
    'wireless noise-cancelling headphones': '/products/sony-headphone.jpg',
    'smart watch series 5 with gps': '/products/samsung-watch.jpg',
    'bluetooth earbuds pro': '/products/electronics/oneplus-earbuds.svg',
    '4k ultra hd smart tv 55 inch': '/products/electronics/galaxy-tab.svg',
    'classic denim jacket': '/products/fashion/jacket.svg',
    'running sneakers - comfort plus': '/products/sports/running-shoes.svg',
    'leather travel backpack': '/products/fashion/handbag.svg',
    'cotton casual t-shirt (pack of 3)': '/products/fashion/cotton-shirt.svg',
    'smart coffee maker': '/products/home-kitchen/coffee-maker.svg',
    'modern led desk lamp': '/products/home-kitchen/kettle.svg',
    'hepa air purifier': '/products/home-kitchen/water-purifier.svg',
    'organic skincare kit': '/products/beauty/skincare-combo.svg',
    'pro ionic hair dryer': '/products/beauty/hair-dryer.svg',
    'premium yoga mat pro': '/products/sports/yoga-mat.svg',
    'adjustable dumbbell set': '/products/sports/dumbbells.svg',
    'the art of ai marketing (hardcover)': '/products/books/clean-code.svg',
    'elegant gift hamper box': '/products/beauty/beauty-combo.svg',
    'personalized photo frame': '/products/sofa.jpg',
    'stainless steel cookware set': '/products/home-kitchen/cookware.svg',
    'classic leather wallet': '/products/fashion/fashion-watch.svg',
    'educational building blocks set': '/products/toys-games/puzzle.svg',
    'travel board game - strategy': '/products/toys-games/board-game.svg',
    'aroma diffuser with essential oils': '/products/beauty/perfume.svg',
    'insulated water bottle 1 litre': '/products/sports/sports-bag.svg',
    'wireless mouse with usb receiver': '/products/electronics/jbl-speaker.svg',
    'executive leather notebook set': '/products/books/clean-code.svg',
  }
  if (exact[product.name?.toLowerCase()]) return exact[product.name.toLowerCase()]
  if (text.includes('headphone') || text.includes('earbud')) return '/products/sony-headphone.jpg'
  if (text.includes('watch')) return '/products/samsung-watch.jpg'
  if (text.includes('phone') || text.includes('mobile')) return '/products/iphone15.jpg'
  if (text.includes('tv') || text.includes('tablet')) return '/products/electronics/galaxy-tab.svg'
  if (text.includes('mouse') || text.includes('speaker')) return '/products/electronics/jbl-speaker.svg'
  if (text.includes('laptop') || text.includes('macbook')) return '/products/macbook.jpg'
  if (text.includes('shoe') || text.includes('sneaker')) return '/products/nike-shoes.jpg'
  if (text.includes('jacket') || text.includes('denim')) return '/products/fashion/jacket.svg'
  if (text.includes('shirt')) return '/products/fashion/cotton-shirt.svg'
  if (text.includes('wallet')) return '/products/fashion/fashion-watch.svg'
  if (text.includes('backpack') || text.includes('bag')) return '/products/fashion/handbag.svg'
  if (text.includes('coffee')) return '/products/home-kitchen/coffee-maker.svg'
  if (text.includes('cookware') || text.includes('pan') || text.includes('casserole')) return '/products/home-kitchen/cookware.svg'
  if (text.includes('lamp') || text.includes('kettle')) return '/products/home-kitchen/kettle.svg'
  if (text.includes('purifier')) return '/products/home-kitchen/water-purifier.svg'
  if (text.includes('skin')) return '/products/beauty/skincare-combo.svg'
  if (text.includes('dryer')) return '/products/beauty/hair-dryer.svg'
  if (text.includes('diffuser') || text.includes('essential oil')) return '/products/beauty/perfume.svg'
  if (text.includes('yoga')) return '/products/sports/yoga-mat.svg'
  if (text.includes('dumbbell')) return '/products/sports/dumbbells.svg'
  if (text.includes('bottle')) return '/products/sports/sports-bag.svg'
  if (text.includes('book') || text.includes('marketing') || text.includes('notebook')) return '/products/books/clean-code.svg'
  if (text.includes('gift') || text.includes('hamper')) return '/products/beauty/beauty-combo.svg'
  if (text.includes('block') || text.includes('puzzle')) return '/products/toys-games/puzzle.svg'
  if (text.includes('toy') || text.includes('game')) return '/products/toys-games/board-game.svg'
  const categoryImages = {
    Electronics: '/products/samsung-s24.jpg',
    Fashion: '/products/fashion/jacket.svg',
    'Home & Kitchen': '/products/sofa.jpg',
    Beauty: '/products/beauty/skincare-combo.svg',
    Sports: '/products/sports/cricket-bat.svg',
    Books: '/products/books/clean-code.svg',
    Grocery: '/products/grocery.jpg',
    Automotive: '/products/automotive.jpg',
    'Toys & Games': '/products/toys-games/board-game.svg',
  }
  return categoryImages[product.category] || '/products/electronics/galaxy-tab.svg'
}

const collections = [
  'users',
  'admins',
  'marketingteams',
  'products',
  'customerbehaviors',
  'customersegments',
  'recommendations',
  'campaigns',
  'coupons',
  'loyalties',
  'orders',
  'admincustomers',
  'adminorders',
  'admincampaigns',
  'refundrequests',
  'feedbackentries',
  'appnotifications',
  'teamusers',
  'activitylogs',
  'mlmodels',
  'predictionlogs',
]

async function seed() {
  await connectDB()

  for (const name of collections) {
    await mongoose.connection.db.createCollection(name).catch(() => {})
  }
  console.log('Collections ready:', collections.join(', '))

  await Admin.deleteMany({})
  await Admin.create({
    username: 'admin',
    password: await bcrypt.hash('admin123', 10),
    email: 'admin@shopsmart.com',
  })

  await User.deleteMany({})
  const password = await bcrypt.hash('demo123', 10)
  const demoUsers = await User.insertMany([{
    name: 'Rahul Sharma',
    email: 'demo@clustermind.com',
    contact: '9876543210',
    address: 'Pune, Maharashtra',
    password,
    role: 'customer',
  },
  { name: 'Priya Patil', email: 'priya@clustermind.com', contact: '9876543211', address: 'Mumbai, Maharashtra', password, role: 'customer' },
  { name: 'Aarav Mehta', email: 'aarav@clustermind.com', contact: '9876543212', address: 'Bengaluru, Karnataka', password, role: 'customer' },
  { name: 'Sneha Iyer', email: 'sneha@clustermind.com', contact: '9876543213', address: 'Chennai, Tamil Nadu', password, role: 'customer' },
  { name: 'Kabir Khan', email: 'kabir@clustermind.com', contact: '9876543214', address: 'Hyderabad, Telangana', password, role: 'customer' },
  { name: 'Meera Joshi', email: 'meera@clustermind.com', contact: '9876543215', address: 'Nashik, Maharashtra', password, role: 'customer' },
  { name: 'Rohan Desai', email: 'rohan@clustermind.com', contact: '9876543216', address: 'Ahmedabad, Gujarat', password, role: 'customer' },
  { name: 'Ananya Rao', email: 'ananya@clustermind.com', contact: '9876543217', address: 'Delhi, NCR', password, role: 'customer' },
  ])

  await MarketingTeam.deleteMany({})
  const marketingUsers = await MarketingTeam.create([
    {
      username: 'marketing',
      password: await bcrypt.hash('marketing123', 10),
      email: 'marketing@shopsmart.com',
      department: 'Marketing',
    },
    {
      username: 'aiml',
      password: await bcrypt.hash('aiml123', 10),
      email: 'aiml@shopsmart.com',
      department: 'AI/ML',
    },
  ])

  await Product.deleteMany({})
  const productDocs = await Product.insertMany(products.map((product) => ({
    ...product,
    image: seedImageFor(product),
  })))

  const productIds = productDocs.map((p) => p._id)
  const demoUser = await User.findOne({ email: 'demo@clustermind.com' })
  const marketingUser = marketingUsers[0]

  await CustomerSegment.deleteMany({})
  const segmentDocs = await CustomerSegment.insertMany([
    { segmentName: 'Premium Customers', criteria: 'High spend (top 10%)', size: 1200 },
    { segmentName: 'Loyal Customers', criteria: 'Repeat purchases >= 5', size: 3400 },
    { segmentName: 'Price Sensitive', criteria: 'Prefers discounts & deals', size: 2900 },
    { segmentName: 'New Customers', criteria: 'Registered within 30 days', size: 1800 },
    { segmentName: 'Inactive Customers', criteria: 'No purchase in 90 days', size: 3100 },
  ])

  await Campaign.deleteMany({})
  await Campaign.insertMany([
    { name: 'Summer Sale', segmentId: segmentDocs[2]._id, segment: 'Price Sensitive', channel: 'Email', type: 'Discount', audience: 2900, status: 'active', budget: 85000, spent: 61200, performance: 68, createdBy: marketingUser._id },
    { name: 'Electronics Fest', segmentId: segmentDocs[0]._id, segment: 'Premium Customers', channel: 'Push Notification', type: 'Category', audience: 1200, status: 'active', budget: 125000, spent: 98000, performance: 82, createdBy: marketingUser._id },
    { name: 'Loyalty Week', segmentId: segmentDocs[1]._id, segment: 'Loyal Customers', channel: 'WhatsApp', type: 'Retention', audience: 3400, status: 'scheduled', budget: 64000, spent: 28000, performance: 74, createdBy: marketingUser._id },
    { name: 'New User Offer', segmentId: segmentDocs[3]._id, segment: 'New Customers', channel: 'Email', type: 'Welcome', audience: 1800, status: 'completed', budget: 42000, spent: 39000, performance: 71, createdBy: marketingUser._id },
    { name: 'Clearance Sale', segmentId: segmentDocs[4]._id, segment: 'Inactive Customers', channel: 'Push Notification', type: 'Winback', audience: 3100, status: 'draft', budget: 53000, spent: 0, performance: 0, createdBy: marketingUser._id },
  ])

  await Coupon.deleteMany({})
  await Coupon.insertMany([
    { code: 'AI20OFF', kind: 'coupon', discount: 20, segment: 'Premium Customers', validFrom: new Date(), validTill: new Date(Date.now() + 20 * 86400000), used: false, createdBy: marketingUser._id },
    { code: 'WELCOME50', kind: 'coupon', discount: 50, segment: 'New Customers', validFrom: new Date(), validTill: new Date(Date.now() + 30 * 86400000), used: false, createdBy: marketingUser._id },
    { code: 'FIRSTORDER', kind: 'coupon', discount: 15, segment: 'All Customers', validFrom: new Date(), validTill: new Date(Date.now() + 45 * 86400000), used: false, createdBy: marketingUser._id },
    { code: 'FESTIVE100', kind: 'coupon', discount: 25, segment: 'Loyal Customers', validFrom: new Date(), validTill: new Date(Date.now() + 60 * 86400000), used: false, createdBy: marketingUser._id },
    { code: 'OFFER-ELECTRO12', name: 'Weekend Electronics Boost', description: 'Target high-intent shoppers with electronics discounts.', kind: 'offer', offerType: 'Percentage Discount', discount: 12, minimumPurchase: 4999, maxDiscount: 1500, categories: ['Electronics', 'Mobiles & Accessories'], segment: 'Premium Customers', validFrom: new Date(), validTill: new Date(Date.now() + 14 * 86400000), status: 'Active', createdBy: marketingUser._id },
    { code: 'OFFER-BOGO-BEAUTY', name: 'Beauty BOGO Push', description: 'Buy one get one offer for beauty repeat buyers.', kind: 'offer', offerType: 'Buy One Get One (BOGO)', discount: 100, minimumPurchase: 799, maxDiscount: 999, categories: ['Beauty & Personal Care'], segment: 'Loyal Customers', validFrom: new Date(), validTill: new Date(Date.now() + 21 * 86400000), status: 'Active', createdBy: marketingUser._id },
    { code: 'OFFER-FREESHIP', name: 'Free Shipping Essentials', description: 'Free delivery for grocery and daily essentials baskets.', kind: 'offer', offerType: 'Free Shipping', discount: 0, minimumPurchase: 999, maxDiscount: 99, categories: ['Grocery & Daily Essentials', 'Home & Kitchen'], segment: 'All Customers', validFrom: new Date(), validTill: new Date(Date.now() + 30 * 86400000), status: 'Active', createdBy: marketingUser._id },
  ])

  await Loyalty.deleteMany({})
  await Loyalty.insertMany(demoUsers.map((user, index) => ({
    customerId: user._id,
    points: [2450, 8200, 5300, 980, 3120, 1440, 6750, 2600][index] || 500,
    tier: ['silver', 'platinum', 'gold', 'bronze', 'gold', 'silver', 'platinum', 'silver'][index] || 'bronze',
    rewards: index % 2 ? ['Early Access', 'Premium Coupon'] : ['Free Shipping', 'Birthday Voucher'],
    pointsEarned: [3200, 9800, 6400, 1100, 4200, 1850, 7200, 3100][index] || 800,
    pointsRedeemed: [750, 1600, 1100, 120, 1080, 410, 450, 500][index] || 0,
    lastActivity: ['Today', 'Yesterday', '2 days ago', 'Last week'][index % 4],
    createdBy: marketingUser._id,
  })))

  await Order.deleteMany({})
  const orderStatuses = ['Delivered', 'Processing', 'Shipped', 'Delivered', 'Delivered', 'Cancelled']
  const paymentLabels = ['UPI', 'Credit Card', 'Cash on Delivery', 'Wallet']
  const orders = []
  for (let i = 0; i < 36; i++) {
    const user = demoUsers[i % demoUsers.length]
    const first = productDocs[i % productDocs.length]
    const second = productDocs[(i + 5) % productDocs.length]
    const quantity = (i % 3) + 1
    const subtotal = Number(first.price || 0) * quantity + Number(second.price || 0)
    const shipping = subtotal > 2000 ? 0 : 99
    const discount = i % 4 === 0 ? Math.round(subtotal * 0.12) : i % 5 === 0 ? 500 : 0
    orders.push({
      orderId: `CM-SEED-${String(i + 1).padStart(4, '0')}`,
      customerId: user._id,
      items: [
        { productId: first._id, name: first.name, image: first.image, quantity, price: first.price },
        { productId: second._id, name: second.name, image: second.image, quantity: 1, price: second.price },
      ],
      address: { fullName: user.name, phone: user.contact, addressLine: user.address, city: user.address.split(',')[0], state: user.address.split(',')[1]?.trim() || 'Maharashtra', pincode: '413001' },
      shipping: { label: shipping ? 'Standard Delivery' : 'Free Delivery', eta: '2-3 Days', price: shipping },
      payment: { label: paymentLabels[i % paymentLabels.length], status: i % 3 === 0 ? 'Paid' : 'Pending', provider: i % 3 === 0 ? 'Razorpay' : null, paidAt: i % 3 === 0 ? new Date(Date.now() - i * 86400000) : undefined },
      totals: { subtotal, shipping, discount, total: Math.max(0, subtotal + shipping - discount) },
      status: orderStatuses[i % orderStatuses.length],
      createdAt: new Date(Date.now() - i * 5 * 86400000),
      updatedAt: new Date(Date.now() - i * 5 * 86400000),
    })
  }
  await Order.insertMany(orders)

  await CustomerBehavior.deleteMany({})
  if (productIds.length) {
    const now = Date.now()
    const behaviors = []
    for (let i = 0; i < 240; i++) {
      const user = demoUsers[i % demoUsers.length]
      behaviors.push({
        customerId: user._id,
        productId: productIds[i % productIds.length],
        action: ['view', 'view', 'click', 'add_to_cart', 'search', 'purchase'][i % 6],
        timestamp: new Date(now - i * 2 * 3600 * 1000),
      })
    }
    await CustomerBehavior.insertMany(behaviors)
  }

  await Recommendation.deleteMany({})
  if (demoUser && productIds.length) {
    await Recommendation.insertMany(
      productIds.slice(0, 5).map((id, i) => ({
        customerId: demoUser._id,
        productId: id,
        score: 0.95 - i * 0.1,
        reason: 'Matches your purchase history',
      }))
    )
  }

  await seedAdminData()

  console.log('\nDatabase seeded successfully!')
  console.log('Login credentials:')
  console.log('  Customer  -> demo@clustermind.com / demo123')
  console.log('  Admin     -> admin      / admin123')
  console.log('  Marketing -> marketing  / marketing123')
  console.log('  AI/ML     -> aiml       / aiml123')

  await mongoose.disconnect()
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seeding failed:', err.message)
  process.exit(1)
})
