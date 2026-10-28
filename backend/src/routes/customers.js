// =============================================================
// routes/customers.js — customer accounts (Sign up / Log in on the website).
// Mounted at /api/customers in server.js.
//   POST /api/customers/signup       -> create an account, returns a login token
//   POST /api/customers/login        -> log in, returns a login token
//   GET  /api/customers/me           -> my profile            (logged in)
//   GET  /api/customers/me/orders    -> my food orders        (logged in)
//   GET  /api/customers/me/bookings  -> my table bookings     (logged in)
// The token is sent back in the "X-Customer-Token" header (see middleware/auth.js).
// Wrong passwords are limited the same way as admin login (5 tries, then 15 min wait).
// =============================================================

import { Router } from 'express'
import jwt from 'jsonwebtoken'
import Customer from '../models/Customer.js'
import Order from '../models/Order.js'
import Reservation from '../models/Reservation.js'
import { requireCustomer } from '../middleware/auth.js'
import { createLoginLimiter, TOO_MANY_ATTEMPTS } from '../middleware/loginLimiter.js'
import { phoneDigits } from '../utils.js'

const router = Router()
const limiter = createLoginLimiter()

// role: 'customer' so this token can never open the admin panel
const tokenFor = (customer) =>
  jwt.sign({ id: customer._id, email: customer.email, role: 'customer' }, process.env.JWT_SECRET, { expiresIn: '30d' })

router.post('/signup', async (req, res) => {
  const { name, email, phone, password } = req.body
  if (!password || password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' })
  const exists = await Customer.findOne({ email: email?.trim().toLowerCase() })
  if (exists) return res.status(409).json({ message: 'An account with this email already exists, please log in' })

  const customer = await Customer.create({ name, email, phone, password })
  res.status(201).json({ token: tokenFor(customer), customer: customer.toPublic() })
})

router.post('/login', async (req, res) => {
  const ip = req.ip
  if (limiter.isBlocked(ip)) return res.status(429).json({ message: TOO_MANY_ATTEMPTS })

  const email = req.body.email?.trim().toLowerCase()
  const { password } = req.body
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required' })

  const customer = await Customer.findOne({ email }).select('+password')
  if (!customer || !(await customer.checkPassword(password))) {
    limiter.recordFailure(ip)
    return res.status(401).json({ message: 'Wrong email or password' })
  }
  limiter.reset(ip)
  res.json({ token: tokenFor(customer), customer: customer.toPublic() })
})

router.get('/me', requireCustomer, async (req, res) => {
  const customer = await Customer.findById(req.customer.id)
  if (!customer) return res.status(401).json({ message: 'Account not found, please log in again' })
  res.json(customer.toPublic())
})

// Orders/bookings made while logged in (account = me), plus older guest ones
// made with my email AND phone — the same proof the guest "My Orders" page asks for.
const isMine = (customer, doc, phone) =>
  String(doc.account) === String(customer._id) || phoneDigits(phone) === phoneDigits(customer.phone)

router.get('/me/orders', requireCustomer, async (req, res) => {
  const customer = await Customer.findById(req.customer.id)
  if (!customer) return res.status(401).json({ message: 'Account not found, please log in again' })
  const orders = await Order.find({ $or: [{ account: customer._id }, { 'customer.email': customer.email }] })
    .populate('restaurant', 'name address')
    .sort({ createdAt: -1 })
  res.json(orders.filter((o) => isMine(customer, o, o.customer.phone)))
})

router.get('/me/bookings', requireCustomer, async (req, res) => {
  const customer = await Customer.findById(req.customer.id)
  if (!customer) return res.status(401).json({ message: 'Account not found, please log in again' })
  const bookings = await Reservation.find({ $or: [{ account: customer._id }, { email: customer.email }] })
    .populate('restaurant', 'name address')
    .sort({ date: -1, time: -1 })
  res.json(bookings.filter((b) => isMine(customer, b, b.phone)))
})

export default router
