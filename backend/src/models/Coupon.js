// =============================================================
// models/Coupon.js — discount codes like FIRST50 ("coupons" collection).
// Made by the admin (Coupons tab). Checked by routes/orders.js when billing.
//   type 'flat'    → value is rupees off (e.g. 50 = Rs 50 off)
//   type 'percent' → value is % off, limited by maxDiscount (0 = no limit)
//   minOrder       → item total must be at least this much
//   firstOrderOnly → only for a customer's first order (checked by phone/email)
// =============================================================

import mongoose from 'mongoose'

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Code is required'],
      unique: true,
      trim: true,
      uppercase: true,
      match: [/^[A-Z0-9]{3,20}$/, 'Code must be 3-20 letters or numbers'],
    },
    description: { type: String, trim: true, default: '' },
    type: { type: String, enum: ['flat', 'percent'], default: 'flat' },
    value: { type: Number, required: [true, 'Discount value is required'], min: [1, 'Discount must be at least 1'] },
    minOrder: { type: Number, min: 0, default: 0 },
    maxDiscount: { type: Number, min: 0, default: 0 },
    firstOrderOnly: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
)

couponSchema.pre('validate', function () {
  if (this.type === 'percent' && this.value > 90) this.invalidate('value', 'Percent discount can be at most 90')
})

export default mongoose.model('Coupon', couponSchema)
