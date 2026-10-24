import mongoose from 'mongoose'

const customerBehaviorSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', index: true },
    action: {
      type: String,
      enum: ['view', 'click', 'add_to_cart', 'purchase', 'search'],
      required: true,
    },
    searchTerm: { type: String, trim: true, default: '' },
    category: { type: String, trim: true, default: '' },
    productName: { type: String, trim: true, default: '' },
    source: { type: String, trim: true, default: '' },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

export default mongoose.model('CustomerBehavior', customerBehaviorSchema)
