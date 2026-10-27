// =============================================================
// models/Message.js — a message sent from the "Contact / Send a Message"
// form on the home page ("messages" collection). Admin reads them in the
// admin panel's Messages tab.
// =============================================================

import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: [true, 'Name is required'], trim: true },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Email is invalid'],
    },
    subject: { type: String, required: [true, 'Subject is required'], trim: true },
    message: { type: String, required: [true, 'Message is required'], trim: true },
  },
  { timestamps: true }
)

export default mongoose.model('Message', messageSchema)
