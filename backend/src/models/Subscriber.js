// =============================================================
// models/Subscriber.js — an email that joined the newsletter from the
// footer ("subscribers" collection). Each email can join only once.
// =============================================================

import mongoose from 'mongoose'

const subscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Email is invalid'],
    },
  },
  { timestamps: true }
)

export default mongoose.model('Subscriber', subscriberSchema)
