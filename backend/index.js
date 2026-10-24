import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import mongoose from 'mongoose'
import connectDB from './db.js'
import authRoutes from './routes/auth.js'
import productRoutes from './routes/products.js'
import orderRoutes from './routes/orders.js'
import returnRoutes from './routes/returns.js'
import reviewRoutes from './routes/reviews.js'
import paymentRoutes from './routes/payments.js'
import cartRoutes from './routes/cart.js'
import wishlistRoutes from './routes/wishlist.js'
import campaignRoutes from './routes/campaigns.js'
import couponRoutes from './routes/coupons.js'
import loyaltyRoutes from './routes/loyalty.js'
import segmentRoutes from './routes/segments.js'
import behaviorRoutes from './routes/behavior.js'
import recommendationRoutes from './routes/recommendations.js'
import userRoutes from './routes/users.js'
import adminRoutes from './routes/admin.js'
import marketingRoutes from './routes/marketing.js'
import mlRoutes from './routes/ml.js'
import aiSalesRoutes from './routes/aiSales.js'

const app = express()
const port = process.env.PORT || 4000

app.use(cors())
// Keep the raw bytes so payment webhooks can verify their HMAC signature —
// re-serialising the parsed JSON would not reproduce the original payload.
app.use(express.json({
  verify: (req, _res, buf) => { req.rawBody = buf },
}))

// On serverless hosts a request can arrive before the MongoDB connection is
// ready. Await it (cached) so the first request after a cold start does not
// 500.
app.use(async (_req, _res, next) => {
  try {
    await ensureDB()
    next()
  } catch (err) {
    next(err)
  }
})

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'backend' })
})

app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/returns', returnRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/wishlist', wishlistRoutes)
app.use('/api/campaigns', campaignRoutes)
app.use('/api/coupons', couponRoutes)
app.use('/api/loyalty', loyaltyRoutes)
app.use('/api/segments', segmentRoutes)
app.use('/api/behavior', behaviorRoutes)
app.use('/api/recommendations', recommendationRoutes)
app.use('/api/users', userRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/marketing', marketingRoutes)
app.use('/api/ml', mlRoutes)
app.use('/api/ai-sales', aiSalesRoutes)

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' })
})

export async function ensureDB() {
  if (!dbReady) {
    await connectDB()
    dbReady = true
  }
}

let dbReady = false

connectDB().catch((err) => {
  console.error('MongoDB connection failed:', err.message)
})

export default app

// Serverless platforms (Vercel) invoke the exported app directly and must not
// hold a long-lived listener. Everywhere else (npm start, VPS, Docker) we bind
// the port ourselves so `NODE_ENV=production` no longer stops the server.
if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Backend running on port ${port}`)
  })
}
