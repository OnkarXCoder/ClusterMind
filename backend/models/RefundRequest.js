import mongoose from 'mongoose'

/* Kept for the seeded admin fixtures (ORD-4813 / "Rohan Joshi").
   Real customer requests populate the ObjectId fields below instead. */
const legacyField = { type: String }

const returnItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false }
)

const refundRequestSchema = new mongoose.Schema(
  {
    orderId: legacyField,
    customer: legacyField,
    amount: { type: Number, default: 0 },
    reason: String,
    date: String,
    status: { type: String, default: 'Pending' },

    // ── Customer-initiated requests (added for the returns feature) ──
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', index: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    type: { type: String, enum: ['Refund', 'Return'], default: 'Refund' },
    items: { type: [returnItemSchema], default: [] },
    // Set once staff resolve the request, so the customer can see where it stands
    resolution: { type: String, default: null },
    resolvedAt: Date,
    adminNote: String,
  },
  { timestamps: true }
)

export default mongoose.model('RefundRequest', refundRequestSchema)