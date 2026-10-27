// =============================================================
// models/Admin.js — shape of an admin user in MongoDB ("admins" collection).
// Passwords are never stored as plain text: they are hashed with bcrypt
// before saving. Created with `npm run create-admin`.
// =============================================================

import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: 'Admin' },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Email is invalid'],
    },
    password: { type: String, required: true, minlength: [6, 'Password must be at least 6 characters'], select: false },
  },
  { timestamps: true }
)

// Runs before every save: turn a new/changed password into a bcrypt hash
// (10 = how much work the hashing does; higher is slower but safer)
adminSchema.pre('save', async function () {
  if (this.isModified('password')) this.password = await bcrypt.hash(this.password, 10)
})

// Compares a typed password with the stored hash (used at login)
adminSchema.methods.checkPassword = function (password) {
  return bcrypt.compare(password, this.password)
}

export default mongoose.model('Admin', adminSchema)
