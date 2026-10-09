import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    // Optional so imported/seeded reviews can be anonymous. Real reviews always set it.
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    customerName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    comment: { type: String, required: true, trim: true, maxlength: 2000 },
    // True only when the customer actually has a delivered order for this product.
    verifiedPurchase: { type: Boolean, default: false },
    helpful: { type: Number, default: 0 },
    helpfulBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    status: { type: String, enum: ['Published', 'Hidden'], default: 'Published' },
  },
  { timestamps: true }
)

// One review per customer per product. Partial so anonymous/imported reviews
// (customer: null) are exempt and can all share a product.
reviewSchema.index(
  { product: 1, customer: 1 },
  { unique: true, partialFilterExpression: { customer: { $type: 'objectId' } } }
)

reviewSchema.virtual('id').get(function () {
  return this._id?.toString()
})
reviewSchema.set('toJSON', { virtuals: true })
reviewSchema.set('toObject', { virtuals: true })

export default mongoose.model('Review', reviewSchema)
