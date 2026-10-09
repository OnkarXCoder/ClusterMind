import mongoose from 'mongoose'

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    discount: { type: Number, required: true },
    validFrom: Date,
    validTill: Date,
    segment: String,
    status: { type: String, default: 'Active' },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    used: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'MarketingTeam' },
  },
  { timestamps: true }
)

export default mongoose.model('Coupon', couponSchema)
