// =============================================================
// routes/auth.js — admin login.
// Mounted at /api/auth in server.js.
//   POST /api/auth/login  -> check email + password, return a login token (JWT)
//   GET  /api/auth/me     -> who is logged in (admin only)
// Also blocks password guessing: 5 wrong tries = wait 15 minutes.
// =============================================================

import { Router } from 'express'
import jwt from 'jsonwebtoken'
import Admin from '../models/Admin.js'
import { requireAdmin } from '../middleware/auth.js'

const router = Router()

// Blocks password guessing: 5 wrong attempts per IP, then wait 15 minutes
const MAX_FAILED = 5
const BLOCK_MS = 15 * 60 * 1000
const failedLogins = new Map() // ip -> { count, firstAt }

const isBlocked = (ip) => {
  const entry = failedLogins.get(ip)
  if (!entry) return false
  if (Date.now() - entry.firstAt > BLOCK_MS) {
    failedLogins.delete(ip)
    return false
  }
  return entry.count >= MAX_FAILED
}

const recordFailure = (ip) => {
  const entry = failedLogins.get(ip)
  if (!entry || Date.now() - entry.firstAt > BLOCK_MS) failedLogins.set(ip, { count: 1, firstAt: Date.now() })
  else entry.count += 1
}

router.post('/login', async (req, res) => {
  const ip = req.ip
  if (isBlocked(ip)) {
    return res.status(429).json({ message: 'Too many wrong attempts. Please try again after 15 minutes.' })
  }

  const email = req.body.email?.trim().toLowerCase()
  const { password } = req.body
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required' })

  const admin = await Admin.findOne({ email }).select('+password')
  if (!admin || !(await admin.checkPassword(password))) {
    recordFailure(ip)
    return res.status(401).json({ message: 'Wrong email or password' })
  }
  failedLogins.delete(ip)

  const token = jwt.sign({ id: admin._id, email: admin.email }, process.env.JWT_SECRET, { expiresIn: '7d' })
  res.json({ token, admin: { name: admin.name, email: admin.email } })
})

router.get('/me', requireAdmin, async (req, res) => {
  const admin = await Admin.findById(req.admin.id)
  if (!admin) return res.status(401).json({ message: 'Admin not found' })
  res.json({ name: admin.name, email: admin.email })
})

export default router
