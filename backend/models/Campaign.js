import mongoose from 'mongoose'

const campaignSchema = new mongoose.Schema(
  {
    campaignId: { type: String },
    name: { type: String, required: true },
    segment: { type: String },
    channel: { type: String },
    type: { type: String },
    startDate: { type: String },
    endDate: { type: String },
    segmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'CustomerSegment' },
    audience: { type: Number, default: 0 },
    performance: { type: Number, default: 0 },
    budget: { type: Number, default: 0 },
    spent: { type: Number, default: 0 },
    status: { type: String, default: 'draft' },
    schedule: Date,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'MarketingTeam' },
  },
  { timestamps: true }
)

export default mongoose.model('Campaign', campaignSchema)
