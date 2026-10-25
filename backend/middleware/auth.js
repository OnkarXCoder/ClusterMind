import jwt from 'jsonwebtoken'

const getSecret = () => {
  const secret = process.env.JWT_SECRET
  if (secret) return secret
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET environment variable is required.')
  }
  return 'shopsmart-dev-secret'
}

export function signToken(payload) {
  return jwt.sign(payload, getSecret(), { expiresIn: '7d' })
}

export function verifyToken(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) {
    return res.status(401).json({ message: 'Authentication required.' })
  }
  try {
    req.user = jwt.verify(token, getSecret())
    next()
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token.' })
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied.' })
    }
    next()
  }
}
