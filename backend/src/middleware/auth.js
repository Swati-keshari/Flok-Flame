// =============================================================
// middleware/auth.js — login checks for API routes.
// Two kinds of users log in, and each token says which one it is (role):
//   - admin    → token from POST /api/auth/login, sent as "Authorization: Bearer <token>"
//   - customer → token from POST /api/customers/login or /signup,
//                sent as "X-Customer-Token: <token>"
// The role check matters: both tokens are signed with the same JWT_SECRET,
// so without it a customer token would also open the admin panel.
// =============================================================

import jwt from 'jsonwebtoken'

const verify = (token, role) => {
  const payload = jwt.verify(token, process.env.JWT_SECRET)
  if (payload.role !== role) throw new Error('wrong role')
  return payload
}

// Allows the request only with a valid admin "Authorization: Bearer <token>" header
export const requireAdmin = (req, res, next) => {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ message: 'Please log in as admin' })

  try {
    req.admin = verify(token, 'admin')
    next()
  } catch {
    res.status(401).json({ message: 'Session expired, please log in again' })
  }
}

// Customer must be logged in (used by /api/customers/me...)
export const requireCustomer = (req, res, next) => {
  const token = req.headers['x-customer-token']
  if (!token) return res.status(401).json({ message: 'Please log in' })
  try {
    req.customer = verify(token, 'customer')
    next()
  } catch {
    res.status(401).json({ message: 'Session expired, please log in again' })
  }
}

// Customer login is optional: if a valid token is sent, req.customer is set,
// otherwise the request continues as a guest (used when ordering / booking)
export const optionalCustomer = (req, res, next) => {
  const token = req.headers['x-customer-token']
  if (token) {
    try { req.customer = verify(token, 'customer') } catch { /* treat as guest */ }
  }
  next()
}
