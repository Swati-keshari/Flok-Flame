// =============================================================
// models/Reservation.js — a table booking ("reservations" collection).
// Made from the home page form (restaurant = null, i.e. Fork & Flame)
// or from a restaurant page's "Book a Table" tab.
// =============================================================

import mongoose from 'mongoose'

const reservationSchema = new mongoose.Schema(
  {
    // Empty for bookings made from the Fork & Flame home page form
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', default: null },
    // The logged-in customer account that booked it (empty for guest bookings)
    account: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null, index: true },
    fullname: { type: String, required: [true, 'Name is required'], trim: true },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Email is invalid'],
    },
    phone: { type: String, required: [true, 'Phone is required'], trim: true },
    date: { type: String, required: [true, 'Date is required'] },
    time: { type: String, required: [true, 'Time is required'] },
    partySize: {
      type: Number,
      required: [true, 'Party size is required'],
      min: [1, 'Party size must be at least 1'],
      max: [20, 'Party size cannot be more than 20'],
    },
    tableRef: {
      type: String,
      enum: ['', 'indoor', 'outdoor', 'window'],
      default: '',
    },
    specialRequest: { type: String, trim: true, default: '' },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
)

export default mongoose.model('Reservation', reservationSchema)
