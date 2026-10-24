import mongoose from 'mongoose'

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    image: String,
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
  },
  { _id: false }
)

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, index: true, sparse: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: { type: [orderItemSchema], default: [] },
    address: {
      fullName: String,
      phone: String,
      addressLine: String,
      city: String,
      state: String,
      pincode: String,
    },
    shipping: {
      label: String,
      eta: String,
      price: { type: Number, default: 0 },
    },
    payment: {
      label: String,
      // Razorpay identifiers, populated once the gateway is involved
      provider: { type: String, default: null },
      gatewayOrderId: { type: String, default: null, index: true },
      paymentId: { type: String, default: null },
      signature: { type: String, default: null },
      // 'Pending' | 'Paid' | 'Failed' | 'Refunded'
      status: { type: String, default: 'Pending' },
      paidAt: Date,
    },
    totals: {
      subtotal: { type: Number, default: 0 },
      shipping: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    status: { type: String, default: 'Processing' },
  },
  { timestamps: true }
)

export default mongoose.model('Order', orderSchema)
