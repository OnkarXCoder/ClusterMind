import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'node:crypto'
import User from '../models/User.js'
import Admin from '../models/Admin.js'
import MarketingTeam from '../models/MarketingTeam.js'
import AdminCustomer from '../models/AdminCustomer.js'
import CustomerSegment from '../models/CustomerSegment.js'
import Loyalty from '../models/Loyalty.js'
import ActivityLog from '../models/ActivityLog.js'

const router = Router()
const RESET_TOKEN_TTL = '10m'

const getSecret = () => {
  const secret = process.env.JWT_SECRET
  if (secret) return secret
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET environment variable is required.')
  }
  return 'shopsmart-dev-secret'
}

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

function inferCity(address = '') {
  if (!address) return 'Unknown'
  const parts = String(address).split(',').map((part) => part.trim()).filter(Boolean)
  return parts[0] || 'Unknown'
}

async function registerCustomerForAnalytics(user, req) {
  const customerId = String(user._id)
  const joined = new Date(user.createdAt || Date.now()).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  await Promise.all([
    AdminCustomer.findOneAndUpdate(
      { customerId },
      {
        customerId,
        name: user.name,
        email: user.email || '',
        phone: user.contact,
        city: inferCity(user.address),
        segment: 'New Customers',
        totalOrders: 0,
        totalSpent: 0,
        joined,
        status: 'Active',
        lastActive: 'Today',
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ),
    CustomerSegment.findOneAndUpdate(
      { segmentName: 'New Customers' },
      {
        $setOnInsert: { segmentName: 'New Customers', criteria: 'Registered customers with no purchase history yet' },
        $addToSet: { customerIds: user._id },
        $inc: { size: 1 },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ),
    Loyalty.findOneAndUpdate(
      { customerId: user._id },
      {
        customerId: user._id,
        points: 0,
        tier: 'bronze',
        rewards: ['Welcome Reward'],
        pointsEarned: 0,
        pointsRedeemed: 0,
        lastActivity: 'Account created',
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ),
    ActivityLog.create({
      user: user.name,
      action: `New customer registered: ${user.name}`,
      timestamp: new Date().toISOString(),
      ip: req.ip,
    }),
  ])
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

    try {
      await registerCustomerForAnalytics(user, req)
    } catch (analyticsErr) {
      console.error('Customer analytics registration failed:', analyticsErr.message)
    }

    const token = jwt.sign({ id: user._id, role: 'customer' }, getSecret(), { expiresIn: '7d' })

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
      return res.status(401).json({ message: 'Invalid credentials. Please try again.' })
    }

    const ok = await bcrypt.compare(password, account.password)
    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials. Please try again.' })
    }

    const role = user ? 'customer' : admin ? 'admin' : 'marketing'
    const token = jwt.sign({ id: account._id, role }, getSecret(), { expiresIn: '7d' })

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
  res.status(410).json({
    message: 'This endpoint has been replaced. Use /forgot-password/send-otp, /forgot-password/verify-otp and /forgot-password/reset.',
  })
})

// ── Password reset: OTP-verified, three steps ──
// A reset now requires proving control of the account via a one-time code,
// so knowing a phone number alone is no longer enough to take over an account.
const OTP_TTL_MS = 10 * 60 * 1000
const MAX_OTP_ATTEMPTS = 5
const resetOtpStore = new Map() // key: normalised email/contact → { hash, expires, attempts, userId }

const normalizeId = (value) => String(value || '').trim().toLowerCase()
const hashOtp = (otp) => crypto.createHash('sha256').update(String(otp)).digest('hex')

async function findCustomer(id) {
  const raw = String(id || '').trim()
  if (!raw) return null
  return User.findOne({ $or: [{ contact: raw }, { email: raw.toLowerCase() }] })
}

router.post('/forgot-password/send-otp', async (req, res) => {
  try {
    const { email, contact } = req.body
    const id = contact || email
    if (!id) return res.status(400).json({ message: 'Email/mobile number is required.' })

    // Always answer identically so the endpoint can't be used to enumerate accounts.
    const generic = { message: 'If an account exists, an OTP has been sent.' }

    const user = await findCustomer(id)
    if (!user) return res.json(generic)

    const otp = String(crypto.randomInt(0, 1000000)).padStart(6, '0')
    resetOtpStore.set(normalizeId(id), {
      hash: hashOtp(otp),
      expires: Date.now() + OTP_TTL_MS,
      attempts: 0,
      userId: String(user._id),
    })

    // No email/SMS provider is wired up yet: surface the OTP server-side and,
    // outside production, in the response so the flow stays usable.
    console.log(`[password-reset] OTP for ${id}: ${otp}`)

    res.json(process.env.NODE_ENV === 'production' ? generic : { ...generic, devOtp: otp })
  } catch (err) {
    console.error('send-otp failed:', err.message)
    res.status(500).json({ message: 'Server error.' })
  }
})

router.post('/forgot-password/verify-otp', async (req, res) => {
  try {
    const { email, contact, otp } = req.body
    const id = contact || email
    if (!id || !otp) {
      return res.status(400).json({ message: 'Email/mobile number and OTP are required.' })
    }

    const key = normalizeId(id)
    const entry = resetOtpStore.get(key)
    if (!entry || entry.expires < Date.now()) {
      resetOtpStore.delete(key)
      return res.status(400).json({ message: 'OTP is invalid or has expired.' })
    }
    if (entry.attempts >= MAX_OTP_ATTEMPTS) {
      resetOtpStore.delete(key)
      return res.status(429).json({ message: 'Too many attempts. Request a new OTP.' })
    }

    entry.attempts += 1
    if (hashOtp(otp) !== entry.hash) {
      return res.status(400).json({ message: 'Incorrect OTP.' })
    }

    const resetToken = jwt.sign(
      { id: entry.userId, purpose: 'password-reset' },
      getSecret(),
      { expiresIn: RESET_TOKEN_TTL }
    )
    resetOtpStore.delete(key)
    res.json({ message: 'OTP verified.', resetToken })
  } catch (err) {
    console.error('verify-otp failed:', err.message)
    res.status(500).json({ message: 'Server error.' })
  }
})

router.post('/forgot-password/reset', async (req, res) => {
  try {
    const { resetToken, password } = req.body
    if (!resetToken || !password) {
      return res.status(400).json({ message: 'Reset token and new password are required.' })
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' })
    }

    let payload
    try {
      payload = jwt.verify(resetToken, getSecret())
    } catch {
      return res.status(400).json({ message: 'Reset session is invalid or has expired.' })
    }
    if (payload.purpose !== 'password-reset') {
      return res.status(400).json({ message: 'Reset session is invalid or has expired.' })
    }

    const user = await User.findById(payload.id)
    if (!user) return res.status(404).json({ message: 'Account not found.' })

    user.password = await bcrypt.hash(password, 10)
    await user.save()

    res.json({ message: 'Password updated successfully. You can login now.' })
  } catch (err) {
    console.error('reset-password failed:', err.message)
    res.status(500).json({ message: 'Server error.' })
  }
})

export default router
