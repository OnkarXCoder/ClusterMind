import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import mongoose from 'mongoose'
import connectDB from './db.js'
import authRoutes from './routes/auth.js'
import productRoutes from './routes/products.js'
import orderRoutes from './routes/orders.js'
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

const app = express()
const port = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'backend' })
})

app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
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

if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Backend running on http://localhost:${port}`)
  })
}
