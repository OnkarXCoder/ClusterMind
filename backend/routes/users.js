import { Router } from 'express'
import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import { verifyToken, requireRole } from '../middleware/auth.js'

const router = Router()

router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password').lean()
    if (!user) return res.status(404).json({ message: 'User not found.' })
    res.json({ user })
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message })
  }
})

router.patch('/me', verifyToken, async (req, res) => {
  try {
    const { name, email, contact, address, dob } = req.body
    const update = {}
    if (name !== undefined) update.name = name
    if (email !== undefined) update.email = String(email).toLowerCase()
    if (contact !== undefined) update.contact = contact
    if (address !== undefined) update.address = address
    if (dob !== undefined) {
      update.dob = dob
      const birth = new Date(dob)
      const now = new Date()
      let age = now.getFullYear() - birth.getFullYear()
      const monthDiff = now.getMonth() - birth.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) age -= 1
      update.age = age
    }
    const user = await User.findByIdAndUpdate(req.user.id, update, { new: true }).select('-password')
    if (!user) return res.status(404).json({ message: 'User not found.' })
    res.json({ message: 'Profile updated.', user })
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message })
  }
})

router.put('/me/password', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Current and new password are required.' })
    if (String(newPassword).length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters.' })
    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ message: 'User not found.' })
    const ok = await bcrypt.compare(currentPassword, user.password)
    if (!ok) return res.status(401).json({ message: 'Current password is incorrect.' })
    user.password = await bcrypt.hash(newPassword, 10)
    await user.save()
    res.json({ message: 'Password updated successfully.' })
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message })
  }
})

async function handleAddresses(req, res) {
  try {
    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ message: 'User not found.' })
    if (!user.addresses) user.addresses = []
    const { action, addressId, address, makeDefault } = req.body
    if (action === 'add') {
      if (!address.fullName?.trim() || !address.phone?.trim() || !address.houseFlat?.trim() || !address.street?.trim() || !address.area?.trim() || !address.city?.trim() || !address.state?.trim() || !address.pinCode?.trim() || !address.addressType) {
        return res.status(400).json({ message: 'All required fields must be filled.' })
      }
      if (!/^\d{10}$/.test(String(address.phone).trim())) return res.status(400).json({ message: 'Phone number must be 10 digits.' })
      if (!/^\d{6}$/.test(String(address.pinCode).trim())) return res.status(400).json({ message: 'PIN code must be 6 digits.' })
      const newAddr = { ...address, phone: String(address.phone).trim(), pinCode: String(address.pinCode).trim(), isDefault: Boolean(makeDefault || user.addresses.length === 0) }
      if (newAddr.isDefault) user.addresses.forEach(a => { a.isDefault = false })
      user.addresses.push(newAddr)
    } else if (action === 'edit') {
      const idx = user.addresses.findIndex(a => a._id.toString() === String(addressId))
      if (idx === -1) return res.status(404).json({ message: 'Address not found.' })
      if (address.fullName !== undefined) user.addresses[idx].fullName = address.fullName
      if (address.phone !== undefined) user.addresses[idx].phone = String(address.phone).trim()
      if (address.houseFlat !== undefined) user.addresses[idx].houseFlat = address.houseFlat
      if (address.street !== undefined) user.addresses[idx].street = address.street
      if (address.area !== undefined) user.addresses[idx].area = address.area
      if (address.city !== undefined) user.addresses[idx].city = address.city
      if (address.state !== undefined) user.addresses[idx].state = address.state
      if (address.pinCode !== undefined) user.addresses[idx].pinCode = String(address.pinCode).trim()
      if (address.addressType !== undefined) user.addresses[idx].addressType = address.addressType
      if (makeDefault) { user.addresses.forEach(a => { a.isDefault = false }); user.addresses[idx].isDefault = true }
      if (address.phone && !/^\d{10}$/.test(user.addresses[idx].phone)) return res.status(400).json({ message: 'Phone number must be 10 digits.' })
      if (address.pinCode && !/^\d{6}$/.test(user.addresses[idx].pinCode)) return res.status(400).json({ message: 'PIN code must be 6 digits.' })
    } else if (action === 'delete') {
      const idx = user.addresses.findIndex(a => a._id.toString() === String(addressId))
      if (idx === -1) return res.status(404).json({ message: 'Address not found.' })
      const wasDefault = user.addresses[idx].isDefault
      user.addresses.splice(idx, 1)
      if (wasDefault && user.addresses.length > 0) user.addresses[0].isDefault = true
    } else if (action === 'setDefault') {
      user.addresses.forEach(a => { a.isDefault = (a._id.toString() === String(addressId)) })
    } else {
      return res.status(400).json({ message: 'Invalid action.' })
    }
    await user.save()
    const updated = await User.findById(req.user.id).select('-password').lean()
    res.json({ message: 'Address saved successfully.', user: updated })
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message })
  }
}

router.post('/me/addresses', verifyToken, handleAddresses)
router.patch('/me/addresses', verifyToken, handleAddresses)
router.delete('/me/addresses', verifyToken, handleAddresses)

router.get('/', verifyToken, requireRole('admin', 'marketing'), async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 }).lean()
    res.json({ users })
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message })
  }
})

router.get('/:id', verifyToken, requireRole('admin', 'marketing'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password').lean()
    if (!user) return res.status(404).json({ message: 'User not found.' })
    res.json({ user })
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message })
  }
})

export default router
