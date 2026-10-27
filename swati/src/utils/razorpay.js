// Online payment with Razorpay (used by pages/Cart.jsx and pages/OrderTracking.jsx).
// Flow:
//   1. Our backend creates a Razorpay order and gives us its id (checkout options).
//   2. payForOrder() loads Razorpay's checkout.js script and opens the payment popup.
//   3. When the customer pays, Razorpay gives us a payment id + signature.
//   4. We send them to our backend (/verify-payment), which checks the signature with the
//      secret key. Only then is the order marked "paid". The secret never comes to the browser.
// retryPayment(): opens the popup again for an order that is still "Payment pending".

import { postJSON } from '../api'

const SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js'
let scriptPromise = null

const loadScript = () => {
  if (window.Razorpay) return Promise.resolve()
  scriptPromise ??= new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = SCRIPT_URL
    script.onload = resolve
    script.onerror = () => {
      scriptPromise = null
      reject(new Error('Could not load Razorpay. Check your internet connection and try again.'))
    }
    document.body.appendChild(script)
  })
  return scriptPromise
}

// Opens Razorpay Checkout for an order and, if the customer pays, asks our
// server to verify the payment. Resolves with the updated order.
// Rejects with error.dismissed = true if the customer closes the popup.
export const payForOrder = async ({ order, checkout, phone }) => {
  await loadScript()

  const response = await new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      key: checkout.keyId,
      order_id: checkout.razorpayOrderId,
      amount: checkout.amount,
      currency: checkout.currency,
      name: 'Fork & Flame',
      description: `Order #${order.orderNumber}${order.restaurant?.name ? ` · ${order.restaurant.name}` : ''}`,
      // Razorpay only prefills the mobile number when it has the country code
      prefill: {
        name: order.customer.name,
        email: order.customer.email,
        contact: `+91${String(order.customer.phone).replace(/\D/g, '').slice(-10)}`,
      },
      theme: { color: '#c41e3a' },
      handler: resolve,
      modal: {
        ondismiss: () => {
          const error = new Error('Payment was not completed')
          error.dismissed = true
          reject(error)
        },
      },
    })
    rzp.on('payment.failed', (res) => {
      // Razorpay lets the customer retry inside the popup, so only log here
      console.warn('Razorpay payment failed:', res.error?.description)
    })
    rzp.open()
  })

  return postJSON(`/api/orders/${order._id}/verify-payment`, { phone, ...response })
}

// Re-open checkout for an order that is still waiting for payment
export const retryPayment = async ({ order, phone }) => {
  const { checkout } = await postJSON(`/api/orders/${order._id}/pay`, { phone })
  return payForOrder({ order, checkout, phone })
}
