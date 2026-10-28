// =============================================================
// routes/auth.js — admin login.
// Mounted at /api/auth in server.js.
//   POST /api/auth/login  -> check email + password, return a login token (JWT)
//   GET  /api/auth/me     -> who is logged in (admin only)
// Also blocks password guessing: 5 wrong tries = wait 15 minutes.
// (Customer accounts are in routes/customers.js.)
// =============================================================

import { Router } from 'express'
import jwt from 'jsonwebtoken'
import Admin from '../models/Admin.js'
import { requireAdmin } from '../middleware/auth.js'
import { createLoginLimiter, TOO_MANY_ATTEMPTS } from '../middleware/loginLimiter.js'

const router = Router()
const limiter = createLoginLimiter()

router.post('/login', async (req, res) => {
  const ip = req.ip
  if (limiter.isBlocked(ip)) return res.status(429).json({ message: TOO_MANY_ATTEMPTS })

  const email = req.body.email?.trim().toLowerCase()
  const { password } = req.body
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required' })

  const admin = await Admin.findOne({ email }).select('+password')
  if (!admin || !(await admin.checkPassword(password))) {
    limiter.recordFailure(ip)
    return res.status(401).json({ message: 'Wrong email or password' })
  }
  limiter.reset(ip)

  // role: 'admin' so this token can never be used as a customer token (and the other way round)
  const token = jwt.sign({ id: admin._id, email: admin.email, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '7d' })
  res.json({ token, admin: { name: admin.name, email: admin.email } })
})

router.get('/me', requireAdmin, async (req, res) => {
  const admin = await Admin.findById(req.admin.id)
  if (!admin) return res.status(401).json({ message: 'Admin not found' })
  res.json({ name: admin.name, email: admin.email })
})

export default router
