// Small localStorage helpers for the customer:
// - rememberOrder / phoneForOrder: remember the phone used for each order, so the tracking
//   page can open it directly (the server needs the phone to show an order).
// - loadDeliveryDetails / saveDeliveryDetails: prefill name, phone, email and address at checkout.

// Remembers orders placed from this browser so the tracking page can open
// them without asking for the phone number again.
const KEY = 'recentOrders'
const DETAILS_KEY = 'deliveryDetails'

const read = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback }
}
const write = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* storage unavailable */ }
}

export const rememberOrder = (orderId, phone) => {
  write(KEY, { ...read(KEY, {}), [orderId]: phone })
}

export const phoneForOrder = (orderId) => read(KEY, {})[orderId] || ''

// Last used delivery details, to prefill the checkout form
export const loadDeliveryDetails = () => read(DETAILS_KEY, null)
export const saveDeliveryDetails = (details) => write(DETAILS_KEY, details)
