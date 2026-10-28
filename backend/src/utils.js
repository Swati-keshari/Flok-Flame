// =============================================================
// utils.js — small helper functions shared by the route files.
// Phone number matching, Indian-time date/clock helpers, opening-hours
// checks and distance between two map points.
// =============================================================

// Last 10 digits, so "+91 98765-43210" and "9876543210" match
export const phoneDigits = (value = '') => String(value).replace(/\D/g, '').slice(-10)

export const isValidPhone = (value) => phoneDigits(value).length === 10

// Restaurant hours and booking dates are in Indian time, whatever timezone the server runs in
export const TIMEZONE = process.env.TIMEZONE || 'Asia/Kolkata'

const nowParts = () => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date())
  return Object.fromEntries(parts.map((p) => [p.type, p.value]))
}

// "YYYY-MM-DD" in restaurant time
export const todayISO = () => {
  const p = nowParts()
  return `${p.year}-${p.month}-${p.day}`
}

// "HH:MM" in restaurant time
export const nowHHMM = () => {
  const p = nowParts()
  return `${p.hour}:${p.minute}`
}

// Is "HH:MM" inside the restaurant's hours? Handles places open past midnight
// (e.g. 18:00–02:00). Same open and close time means open 24 hours.
export const isWithinHours = (restaurant, time) => {
  const { openTime, closeTime } = restaurant
  if (openTime === closeTime) return true
  if (openTime < closeTime) return time >= openTime && time <= closeTime
  return time >= openTime || time <= closeTime
}

export const isOpenNow = (restaurant) => isWithinHours(restaurant, nowHHMM())

// Great-circle distance between two { lat, lng } points in km
export const distanceKm = (a, b) => {
  const toRad = (deg) => (deg * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 6371 * 2 * Math.asin(Math.sqrt(h))
}
