import mongoose from 'mongoose'

const addressSchema = new mongoose.Schema(
  {
    fullName: { type: String, trim: true, default: '' },
    phone: { type: String, trim: true, default: '' },
    houseFlat: { type: String, trim: true, default: '' },
    street: { type: String, trim: true, default: '' },
    area: { type: String, trim: true, default: '' },
    city: { type: String, trim: true, default: '' },
    state: { type: String, trim: true, default: '' },
    pinCode: { type: String, trim: true, default: '' },
    addressType: { type: String, enum: ['Home', 'Office'], default: 'Home' },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
)

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    contact: { type: String, required: true, unique: true },
    address: { type: String, trim: true, default: '' },
    addresses: [addressSchema],
    dob: { type: Date },
    age: { type: Number },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, default: 'customer' },
  },
  { timestamps: true }
)

export default mongoose.model('User', userSchema)
