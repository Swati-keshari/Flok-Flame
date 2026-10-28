// =============================================================
// routes/orders.js — online food ordering, payment and tracking.
// Mounted at /api/orders in server.js.
// Public (customer):
//   GET   /api/orders/payment-options     -> is online payment switched on?
//   POST  /api/orders/quote               -> price the cart (bill preview)
//   POST  /api/orders                     -> place an order (COD or online)
//   POST  /api/orders/:id/pay             -> reopen payment for an unpaid order
//   POST  /api/orders/:id/verify-payment  -> confirm a Razorpay payment
//   POST  /api/orders/lookup              -> "My Orders" (email + phone)
//   GET   /api/orders/track/:id?phone=    -> order tracking page
//   PATCH /api/orders/:id/cancel          -> customer cancels (early only)
// Admin only:
//   GET   /api/orders                     -> list orders (filters)
//   PATCH /api/orders/:id                 -> change order status
//   PATCH /api/orders/:id/refunded        -> mark a refund as done
// Customers prove an order is theirs with the phone number used to order.
// =============================================================

import { Router } from 'express'
import Order, { ORDER_STATUSES } from '../models/Order.js'
import Restaurant from '../models/Restaurant.js'
import MenuItem from '../models/MenuItem.js'
import { optionalCustomer, requireAdmin } from '../middleware/auth.js'
import { distanceKm, isOpenNow, isValidPhone, phoneDigits } from '../utils.js'
import {
  checkoutOptions, createRazorpayOrder, findCapturedPayment, isValidPaymentSignature, paymentsEnabled,
} from '../payments.js'

const router = Router()

const DELIVERY_FEE = 40
const FREE_DELIVERY_ABOVE = 499
const TAX_RATE = 0.05

class OrderError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

// Prices the cart from the database (never trusts prices sent by the browser).
// items: [{ menuItem: id, quantity }]
const buildBill = async ({ restaurant: restaurantId, items, location }) => {
  const restaurant = await Restaurant.findById(restaurantId)
  if (!restaurant) throw new OrderError(404, 'Restaurant not found')
  if (!Array.isArray(items) || items.length === 0) throw new OrderError(400, 'Your cart is empty')

  const quantities = new Map()
  for (const { menuItem, quantity } of items) {
    const qty = Number(quantity)
    if (!Number.isInteger(qty) || qty < 1 || qty > 50) throw new OrderError(400, 'Quantity must be between 1 and 50')
    quantities.set(String(menuItem), (quantities.get(String(menuItem)) || 0) + qty)
  }

  const menuItems = await MenuItem.find({ _id: { $in: [...quantities.keys()] }, restaurant: restaurant._id })
  if (menuItems.length !== quantities.size) throw new OrderError(400, 'Some items are no longer on the menu, please refresh your cart')
  const soldOut = menuItems.filter((m) => !m.isAvailable).map((m) => m.name)
  if (soldOut.length) throw new OrderError(400, `Sold out: ${soldOut.join(', ')}. Please remove from cart`)

  const lines = menuItems.map((m) => ({
    menuItem: m._id, name: m.name, price: m.price, isVeg: m.isVeg, quantity: quantities.get(String(m._id)),
  }))
  const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0)
  const deliveryFee = subtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE
  const tax = Math.round(subtotal * TAX_RATE)

  let distance = null
  const lat = parseFloat(location?.lat)
  const lng = parseFloat(location?.lng)
  if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
    const [rLng, rLat] = restaurant.location.coordinates
    distance = Math.round(distanceKm({ lat, lng }, { lat: rLat, lng: rLng }) * 10) / 10
  }

  return {
    restaurant,
    items: lines,
    subtotal,
    deliveryFee,
    tax,
    total: subtotal + deliveryFee + tax,
    distanceKm: distance,
    location: distance === null ? undefined : { lat, lng },
    isOpen: isOpenNow(restaurant),
    deliverable: distance === null || distance <= restaurant.deliveryRadiusKm,
    freeDeliveryAbove: FREE_DELIVERY_ABOVE,
  }
}

const sendError = (res, err) => {
  if (err instanceof OrderError) return res.status(err.status).json({ message: err.message })
  throw err
}

const findCustomerOrder = async (id, phone) => {
  const order = await Order.findById(id).populate('restaurant', 'name address phone location')
  if (!order || phoneDigits(order.customer.phone) !== phoneDigits(phone)) return null
  return order
}

const markPaid = async (order, razorpayPaymentId) => {
  order.paymentStatus = 'paid'
  order.razorpayPaymentId = razorpayPaymentId
  order.paidAt = new Date()
  order.status = 'placed'
  order.statusHistory.push({ status: 'placed' })
  await order.save()
}

// For an online order still waiting for payment, check with Razorpay in case
// it was paid but never verified (browser closed, network dropped...)
const syncPayment = async (order) => {
  if (order.status !== 'awaiting_payment' || !order.razorpayOrderId || !paymentsEnabled()) return
  const payment = await findCapturedPayment(order.razorpayOrderId)
  if (payment) await markPaid(order, payment.id)
}

const cancelOrder = async (order) => {
  if (order.paymentStatus === 'paid') order.paymentStatus = 'refund_needed'
  order.status = 'cancelled'
  order.statusHistory.push({ status: 'cancelled' })
  await order.save()
}

// ---------- Public ----------

// Tells the checkout page which payment options to show
router.get('/payment-options', (req, res) => {
  res.json({ cod: true, online: paymentsEnabled() })
})

// Price preview for the cart page
router.post('/quote', async (req, res) => {
  try {
    const { restaurant, ...bill } = await buildBill(req.body)
    res.json({ ...bill, restaurant: { _id: restaurant._id, name: restaurant.name, deliveryRadiusKm: restaurant.deliveryRadiusKm } })
  } catch (err) {
    sendError(res, err)
  }
})

router.post('/', optionalCustomer, async (req, res) => {
  let bill
  try {
    bill = await buildBill(req.body)
  } catch (err) {
    return sendError(res, err)
  }
  const { restaurant } = bill
  if (!bill.isOpen) {
    return res.status(400).json({ message: `${restaurant.name} is closed now. Orders are accepted ${restaurant.openTime} – ${restaurant.closeTime}` })
  }
  if (!bill.deliverable) {
    return res.status(400).json({ message: `Sorry, ${restaurant.name} delivers only within ${restaurant.deliveryRadiusKm} km (you are ${bill.distanceKm} km away)` })
  }

  const { customer = {}, address = {}, note, paymentMethod = 'cod' } = req.body
  if (!['cod', 'online'].includes(paymentMethod)) return res.status(400).json({ message: 'Invalid payment method' })
  if (customer.phone && !isValidPhone(customer.phone)) {
    return res.status(400).json({ message: 'Please enter a valid 10-digit phone number' })
  }
  if (paymentMethod === 'online' && !paymentsEnabled()) {
    return res.status(400).json({ message: 'Online payment is not available right now, please choose Cash on Delivery' })
  }
  const isOnline = paymentMethod === 'online'

  const order = await Order.create({
    // Short readable order number: "FF" + time in base-36 + 2 random digits
    orderNumber: `FF${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 90 + 10)}`,
    restaurant: restaurant._id,
    account: req.customer?.id ?? null,
    items: bill.items,
    customer: { name: customer.name, email: customer.email, phone: customer.phone },
    address: { line: address.line, landmark: address.landmark },
    location: bill.location,
    distanceKm: bill.distanceKm,
    note,
    subtotal: bill.subtotal,
    deliveryFee: bill.deliveryFee,
    tax: bill.tax,
    total: bill.total,
    paymentMethod,
    status: isOnline ? 'awaiting_payment' : 'placed',
    statusHistory: [{ status: isOnline ? 'awaiting_payment' : 'placed' }],
  })

  if (isOnline) {
    try {
      const rzpOrder = await createRazorpayOrder(order)
      order.razorpayOrderId = rzpOrder.id
      await order.save()
    } catch (err) {
      await order.deleteOne()
      return res.status(502).json({ message: err.message })
    }
  }

  await order.populate('restaurant', 'name address phone location')
  res.status(201).json({ ...order.toJSON(), checkout: isOnline ? checkoutOptions(order) : null })
})

// Re-open Razorpay Checkout for an online order that isn't paid yet
router.post('/:id/pay', async (req, res) => {
  const order = await findCustomerOrder(req.params.id, req.body.phone)
  if (!order) return res.status(404).json({ message: 'Order not found' })
  await syncPayment(order)
  if (order.status !== 'awaiting_payment') {
    return res.status(400).json({ message: order.paymentStatus === 'paid' ? 'This order is already paid' : 'This order can no longer be paid' })
  }
  if (!paymentsEnabled()) return res.status(400).json({ message: 'Online payment is not available right now' })
  res.json({ checkout: checkoutOptions(order) })
})

// Called by the browser after Razorpay Checkout succeeds
router.post('/:id/verify-payment', async (req, res) => {
  const { phone, razorpay_order_id: razorpayOrderId, razorpay_payment_id: razorpayPaymentId, razorpay_signature: signature } = req.body
  const order = await findCustomerOrder(req.params.id, phone)
  if (!order) return res.status(404).json({ message: 'Order not found' })
  if (order.paymentStatus === 'paid') return res.json(order)
  if (!paymentsEnabled()) return res.status(400).json({ message: 'Online payment is not available right now' })

  if (razorpayOrderId !== order.razorpayOrderId || !isValidPaymentSignature({ razorpayOrderId, razorpayPaymentId, signature })) {
    return res.status(400).json({ message: 'Payment could not be verified. If money was deducted, it will be confirmed or refunded automatically.' })
  }
  if (order.status === 'cancelled') {
    // Paid after cancelling: keep the record so the admin can refund it
    order.paymentStatus = 'refund_needed'
    order.razorpayPaymentId = razorpayPaymentId
    await order.save()
    return res.json(order)
  }
  await markPaid(order, razorpayPaymentId)
  res.json(order)
})

// "My orders": customer proves ownership with email + phone
router.post('/lookup', async (req, res) => {
  const { email, phone } = req.body
  if (!email || !phone) return res.status(400).json({ message: 'Email and phone are required' })
  const orders = await Order.find({ 'customer.email': email.trim().toLowerCase() })
    .populate('restaurant', 'name address')
    .sort({ createdAt: -1 })
  res.json(orders.filter((o) => phoneDigits(o.customer.phone) === phoneDigits(phone)))
})

// Order tracking page: GET /api/orders/track/:id?phone=...
router.get('/track/:id', async (req, res) => {
  const order = await findCustomerOrder(req.params.id, req.query.phone)
  if (!order) return res.status(404).json({ message: 'Order not found' })
  await syncPayment(order)
  res.json(order)
})

router.patch('/:id/cancel', async (req, res) => {
  const order = await findCustomerOrder(req.params.id, req.body.phone)
  if (!order) return res.status(404).json({ message: 'Order not found' })
  await syncPayment(order)
  if (!['awaiting_payment', 'placed'].includes(order.status)) {
    return res.status(400).json({ message: 'The restaurant has already started preparing your order, it can no longer be cancelled' })
  }
  await cancelOrder(order)
  res.json(order)
})

// ---------- Admin only ----------

router.get('/', requireAdmin, async (req, res) => {
  const { status, restaurant } = req.query
  const filter = {}
  if (status === 'active') filter.status = { $in: ['placed', 'preparing', 'out_for_delivery'] }
  else if (status === 'refunds') filter.paymentStatus = 'refund_needed'
  else if (status) filter.status = status
  if (restaurant) filter.restaurant = restaurant

  const orders = await Order.find(filter).populate('restaurant', 'name').sort({ createdAt: -1 }).limit(200)
  res.json(orders)
})

router.patch('/:id', requireAdmin, async (req, res) => {
  const { status } = req.body
  if (!ORDER_STATUSES.includes(status)) return res.status(400).json({ message: 'Invalid status' })
  const order = await Order.findById(req.params.id)
  if (!order) return res.status(404).json({ message: 'Order not found' })
  await syncPayment(order)

  if (status === 'awaiting_payment' || (order.status === 'awaiting_payment' && status !== 'cancelled')) {
    return res.status(400).json({ message: 'This order is waiting for online payment, it can only be cancelled' })
  }
  if (order.status !== status) {
    if (status === 'cancelled') {
      await cancelOrder(order)
    } else {
      order.status = status
      order.statusHistory.push({ status })
      await order.save()
    }
  }
  await order.populate('restaurant', 'name')
  res.json(order)
})

// After refunding from the Razorpay dashboard, the admin marks it done here
router.patch('/:id/refunded', requireAdmin, async (req, res) => {
  const order = await Order.findById(req.params.id)
  if (!order) return res.status(404).json({ message: 'Order not found' })
  if (order.paymentStatus !== 'refund_needed') return res.status(400).json({ message: 'This order has no pending refund' })
  order.paymentStatus = 'refunded'
  await order.save()
  await order.populate('restaurant', 'name')
  res.json(order)
})

export default router
