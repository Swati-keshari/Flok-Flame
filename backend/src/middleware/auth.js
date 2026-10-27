// =============================================================
// middleware/auth.js — protects admin-only API routes.
// Route files put `requireAdmin` in front of a handler. It checks the
// login token (JWT) that the admin got from POST /api/auth/login.
// No token or a bad/expired token -> 401 and the handler never runs.
// =============================================================

import jwt from 'jsonwebtoken'

// Allows the request only with a valid "Authorization: Bearer <token>" header
export const requireAdmin = (req, res, next) => {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ message: 'Please log in as admin' })

  try {
    req.admin = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ message: 'Session expired, please log in again' })
  }
}
