import mongoose from 'mongoose'
import dns from 'node:dns'

// Some local networks refuse SRV DNS queries issued by Node's resolver, which
// breaks `mongodb+srv://` URIs. Allow overriding the resolver here, e.g.
// DNS_SERVERS=8.8.8.8,1.1.1.1
const dnsServers = (process.env.DNS_SERVERS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean)
if (dnsServers.length) {
  try {
    dns.setServers(dnsServers)
  } catch (err) {
    console.warn('Invalid DNS_SERVERS value:', err.message)
  }
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shopsmart_db'

// Cache the connection promise so concurrent serverless invocations share a
// single connection instead of racing one another on cold start.
let connectionPromise = null

export async function connectDB() {
  if (mongoose.connection.readyState === 1) return mongoose.connection
  if (connectionPromise) return connectionPromise

  connectionPromise = mongoose
    .connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    })
    .then(() => {
      console.log('MongoDB connected:', mongoose.connection.name)
      return mongoose.connection
    })
    .catch((err) => {
      connectionPromise = null
      console.error('MongoDB connection failed:', err.message)
      if (process.env.NODE_ENV === 'production') {
        throw err
      }
      process.exit(1)
    })

  return connectionPromise
}

export default connectDB
