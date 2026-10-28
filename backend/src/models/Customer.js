// =============================================================
// models/Customer.js — a customer account ("customers" collection).
// Made from the website's Sign up page. Lets a customer log in and see
// all their orders and bookings without typing email + phone every time.
// Passwords are hashed with bcrypt, never stored as plain text.
// =============================================================

import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { isValidPhone } from '../utils.js'

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Email is invalid'],
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      trim: true,
      validate: [isValidPhone, 'Please enter a valid 10-digit phone number'],
    },
    password: { type: String, required: true, minlength: [6, 'Password must be at least 6 characters'], select: false },
  },
  { timestamps: true }
)

// Hash a new/changed password before saving
customerSchema.pre('save', async function () {
  if (this.isModified('password')) this.password = await bcrypt.hash(this.password, 10)
})

customerSchema.methods.checkPassword = function (password) {
  return bcrypt.compare(password, this.password)
}

// What is safe to send to the browser (no password)
customerSchema.methods.toPublic = function () {
  return { id: this._id, name: this.name, email: this.email, phone: this.phone }
}

export default mongoose.model('Customer', customerSchema)
