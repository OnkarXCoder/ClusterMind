import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import Admin from '../models/Admin.js'
import MarketingTeam from '../models/MarketingTeam.js'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'shopsmart-dev-secret'

function calcAge(dob) {
  if (!dob) return null
  const birth = new Date(dob)
  if (isNaN(birth.getTime())) return null
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  const monthDiff = now.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age -= 1
  }
  return age
}

router.post('/register', async (req, res) => {
  try {
    const { name, email, contact, address, dob, password } = req.body

    if (!name || !contact || !password) {
      return res.status(400).json({ message: 'Name, mobile number and password are required.' })
    }
    if (!/^\d{10}$/.test(contact.replace(/\D/g, ''))) {
      return res.status(400).json({ message: 'Enter a valid 10-digit contact number.' })
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' })
    }

    const age = calcAge(dob)

    const exists = await User.findOne({
      $or: [{ contact }, ...(email ? [{ email: email.toLowerCase() }] : [])],
    })
    if (exists) {
      return res.status(409).json({ message: 'This mobile number/email is already registered.' })
    }

    const hashed = await bcrypt.hash(password, 10)
    const user = await User.create({
      name,
      email: email ? email.toLowerCase() : undefined,
      contact,
      address: address || '',
      dob: dob || undefined,
      age,
      password: hashed,
    })

    const token = jwt.sign({ id: user._id, role: 'customer' }, JWT_SECRET, { expiresIn: '7d' })

    res.status(201).json({
      message: 'Registration successful.',
      token,
      role: 'customer',
      user: { id: user._id, name: user.name, email: user.email, contact: user.contact, age: user.age },
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { identifier, email, password } = req.body
    const id = identifier || email

    if (!id || !password) {
      return res.status(400).json({ message: 'Email/mobile and password are required.' })
    }

    const emailLower = String(id).toLowerCase()
    const [user, admin, marketing] = await Promise.all([
      User.findOne({ $or: [{ contact: id }, { email: emailLower }] }),
      Admin.findOne({ username: id }),
      MarketingTeam.findOne({ username: id }),
    ])

    const account = user || admin || marketing
    if (!account) {
      return res.status(404).json({ message: 'No account found with this email/mobile number.' })
    }

    const ok = await bcrypt.compare(password, account.password)
    if (!ok) {
      return res.status(401).json({ message: 'Incorrect password. Please try again.' })
    }

    const role = user ? 'customer' : admin ? 'admin' : 'marketing'
    const token = jwt.sign({ id: account._id, role }, JWT_SECRET, { expiresIn: '7d' })

    const response = {
      token,
      role,
      user: {
        id: account._id,
        name: account.name || account.username,
        email: account.email,
        contact: account.contact,
        role,
      },
    }

    if (role === 'marketing' && account.apiKey) {
      response.apiKey = account.apiKey
    }

    res.json(response)
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message })
  }
})

router.post('/forgot-password', async (req, res) => {
  try {
    const { contact, email, password } = req.body
    const id = contact || email

    if (!id || !password) {
      return res.status(400).json({ message: 'Email/mobile number and new password are required.' })
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' })
    }

    const emailLower = String(id).toLowerCase()
    const user = await User.findOne({ $or: [{ contact: id }, { email: emailLower }] })
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email/mobile number.' })
    }

    user.password = await bcrypt.hash(password, 10)
    await user.save()

    res.json({ message: 'Password updated successfully. You can login now.' })
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message })
  }
})

export default router
