import mongoose from 'mongoose'

const loyaltySchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    points: { type: Number, default: 0 },
    tier: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum'],
      default: 'bronze',
    },
    rewards: [{ type: String }],
    pointsEarned: { type: Number, default: 0 },
    pointsRedeemed: { type: Number, default: 0 },
    lastActivity: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'MarketingTeam' },
  },
  { timestamps: true }
)

export default mongoose.model('Loyalty', loyaltySchema)
