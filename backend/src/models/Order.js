// =============================================================
// models/Order.js — a food order for home delivery ("orders" collection).
// Stores a copy of the items and prices at order time, the customer and
// address, the bill, how it was paid, and every status change.
// Status flow: (awaiting_payment ->) placed -> preparing -> out_for_delivery
//              -> delivered, or cancelled at an early step.
// =============================================================

import mongoose from 'mongoose'

// 'awaiting_payment' = online order whose payment isn't confirmed yet; the
// restaurant only sees it once it moves to 'placed'
export const ORDER_STATUSES = ['awaiting_payment', 'placed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled']

const orderItemSchema = new mongoose.Schema(
  {
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
    // Copied at order time so later menu edits don't change old orders
    name: { type: String, required: true },
    price: { type: Number, required: true },
    isVeg: { type: Boolean, default: true },
    quantity: { type: Number, required: true, min: 1, max: 50 },
  },
  { _id: false }
)

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    // The logged-in customer account that placed it (empty for guest orders)
    account: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null, index: true },
    items: {
      type: [orderItemSchema],
      validate: [(items) => items.length > 0, 'Order must have at least one item'],
    },
    customer: {
      name: { type: String, required: [true, 'Name is required'], trim: true },
      email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Email is invalid'],
      },
      phone: { type: String, required: [true, 'Phone is required'], trim: true },
    },
    address: {
      line: { type: String, required: [true, 'Delivery address is required'], trim: true },
      landmark: { type: String, trim: true, default: '' },
    },
    // Customer's map position, when they shared it
    location: { lat: Number, lng: Number },
    distanceKm: { type: Number, default: null },
    note: { type: String, trim: true, default: '' },
    paymentMethod: { type: String, enum: ['cod', 'online'], default: 'cod' },
    // cod orders stay 'unpaid' (cash is collected on delivery)
    paymentStatus: { type: String, enum: ['unpaid', 'paid', 'refund_needed', 'refunded'], default: 'unpaid' },
    razorpayOrderId: { type: String, default: null },
    razorpayPaymentId: { type: String, default: null },
    paidAt: { type: Date, default: null },
    subtotal: { type: Number, required: true },
    // Coupon used (e.g. FIRST50) and the rupees it took off the item total
    couponCode: { type: String, default: null },
    discount: { type: Number, default: 0 },
    deliveryFee: { type: Number, required: true },
    tax: { type: Number, required: true },
    total: { type: Number, required: true },
    status: { type: String, enum: ORDER_STATUSES, default: 'placed' },
    statusHistory: [{ status: String, at: { type: Date, default: Date.now }, _id: false }],
  },
  { timestamps: true }
)

export default mongoose.model('Order', orderSchema)
