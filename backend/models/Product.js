import mongoose from 'mongoose'

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    category: { type: String, required: true, index: true },
    brand: { type: String, default: 'Generic', index: true },
    price: { type: Number, required: true },
    oldPrice: Number,
    discount: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    badge: String,
    image: { type: String, required: true },
    stock: { type: Number, default: 100 },
    aiRecommended: { type: Boolean, default: false },
    freeDelivery: { type: Boolean, default: true },
    giftTags: [{ type: String, index: true }],
  },
  { timestamps: true }
)

export default mongoose.model('Product', productSchema)
