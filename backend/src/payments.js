// =============================================================
// payments.js — everything that talks to Razorpay (online payments).
// Used by routes/orders.js. The Razorpay key secret only lives here on
// the server; the browser never sees it.
// Flow: create Razorpay order -> customer pays in popup -> browser sends
// back a signature -> we check the signature here -> order is marked paid.
// =============================================================
import crypto from 'crypto'
import Razorpay from 'razorpay'

// Online payments are switched on only when both Razorpay keys are in .env
export const paymentsEnabled = () =>
  Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)

let client = null
const razorpay = () => {
  client ??= new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  })
  return client
}

// Creates a Razorpay order for our order's total (Razorpay works in paise)
export const createRazorpayOrder = async (order) => {
  try {
    return await razorpay().orders.create({
      amount: Math.round(order.total * 100),
      currency: 'INR',
      receipt: order.orderNumber,
      notes: { orderId: String(order._id) },
    })
  } catch (err) {
    // The SDK rejects with { statusCode, error: { description } }
    const reason = err?.error?.description || err?.message || 'unknown error'
    throw new Error(`Could not start online payment: ${reason}`)
  }
}

// Razorpay signs "<razorpay_order_id>|<razorpay_payment_id>" with our key secret.
// If the signature matches, the payment really came from Razorpay.
export const isValidPaymentSignature = ({ razorpayOrderId, razorpayPaymentId, signature }) => {
  if (!razorpayOrderId || !razorpayPaymentId || typeof signature !== 'string') return false
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex')
  const a = Buffer.from(expected)
  const b = Buffer.from(signature)
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

// Asks Razorpay whether this order was already paid, e.g. the customer paid but
// closed the browser before we could verify it. Prevents charging them twice.
export const findCapturedPayment = async (razorpayOrderId) => {
  try {
    const { items = [] } = await razorpay().orders.fetchPayments(razorpayOrderId)
    return items.find((p) => p.status === 'captured') || null
  } catch {
    return null
  }
}

// What the browser needs to open Razorpay Checkout (the key id is public; the secret never leaves the server)
export const checkoutOptions = (order) => ({
  keyId: process.env.RAZORPAY_KEY_ID,
  razorpayOrderId: order.razorpayOrderId,
  amount: Math.round(order.total * 100),
  currency: 'INR',
})
