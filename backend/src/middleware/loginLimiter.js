// =============================================================
// middleware/loginLimiter.js — stops password guessing.
// createLoginLimiter() gives one counter per login form (admin, customer).
// After 5 wrong passwords from the same IP, that IP must wait 15 minutes.
// Counts live in memory, so restarting the server clears them.
// =============================================================

const MAX_FAILED = 5
const BLOCK_MS = 15 * 60 * 1000

export const createLoginLimiter = () => {
  const failed = new Map() // ip -> { count, firstAt }

  const isBlocked = (ip) => {
    const entry = failed.get(ip)
    if (!entry) return false
    if (Date.now() - entry.firstAt > BLOCK_MS) {
      failed.delete(ip)
      return false
    }
    return entry.count >= MAX_FAILED
  }

  const recordFailure = (ip) => {
    const entry = failed.get(ip)
    if (!entry || Date.now() - entry.firstAt > BLOCK_MS) failed.set(ip, { count: 1, firstAt: Date.now() })
    else entry.count += 1
  }

  const reset = (ip) => failed.delete(ip)

  return { isBlocked, recordFailure, reset }
}

export const TOO_MANY_ATTEMPTS = 'Too many wrong attempts. Please try again after 15 minutes.'
