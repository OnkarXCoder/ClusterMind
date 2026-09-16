import crypto from 'node:crypto'
import mongoose from 'mongoose'

const marketingTeamSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, default: 'marketing' },
    department: { type: String, default: 'Marketing' },
    apiKey: { type: String },
    apiKeyCreatedAt: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

marketingTeamSchema.methods.generateApiKey = function generateApiKey() {
  this.apiKey = crypto.randomBytes(32).toString('hex')
  this.apiKeyCreatedAt = new Date()
  this.isActive = true
  return this.apiKey
}

marketingTeamSchema.pre('save', function ensureApiKey(next) {
  if (!this.apiKey) {
    this.generateApiKey()
  }
  next()
})

export default mongoose.model('MarketingTeam', marketingTeamSchema)
