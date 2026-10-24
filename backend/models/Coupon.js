import mongoose from 'mongoose'

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    name: String,
    description: String,
    kind: { type: String, enum: ['coupon', 'offer'], default: 'coupon', index: true },
    offerType: {
      type: String,
      enum: ['Percentage Discount', 'Flat Discount', 'Buy One Get One (BOGO)', 'Free Shipping'],
      default: 'Percentage Discount',
    },
    discount: { type: Number, required: true },
    minimumPurchase: { type: Number, default: 0 },
    maxDiscount: { type: Number, default: 0 },
    categories: [{ type: String }],
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
