// Time helpers for opening hours (same rules as backend/src/utils.js).
// - nowHHMM(): current time as "HH:MM".
// - hoursLabel(): text like "11:00 – 23:00" or "Open 24 hours".
// - isOpenNow(): is the restaurant open right now? Works for places open past midnight.

// "HH:MM" of the browser's local time
export const nowHHMM = () => {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export const hoursLabel = ({ openTime, closeTime }) =>
  openTime === closeTime ? 'Open 24 hours' : `${openTime} – ${closeTime}`

// Same rules as the backend: supports places open past midnight (e.g. 18:00–02:00);
// equal open and close time means open 24 hours
export const isOpenNow = (restaurant) => {
  const { openTime, closeTime } = restaurant
  const now = nowHHMM()
  if (openTime === closeTime) return true
  if (openTime < closeTime) return now >= openTime && now <= closeTime
  return now >= openTime || now <= closeTime
}
