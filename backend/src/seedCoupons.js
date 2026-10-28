// seedCoupons.js — command-line script that adds two starter coupons
// (only if a coupon with that code doesn't exist yet). Usage: npm run seed-coupons
//   FIRST50 → Rs 50 off a customer's first order of Rs 199 or more
//   FEAST20 → 20% off orders of Rs 499 or more, at most Rs 150
import 'dotenv/config'
import mongoose from 'mongoose'
import Coupon from './models/Coupon.js'

const starters = [
  { code: 'FIRST50', description: 'Rs 50 off your first order', type: 'flat', value: 50, minOrder: 199, firstOrderOnly: true },
  { code: 'FEAST20', description: '20% off orders above Rs 499 (up to Rs 150)', type: 'percent', value: 20, minOrder: 499, maxDiscount: 150 },
]

await mongoose.connect(process.env.MONGO_URI)
for (const c of starters) {
  const exists = await Coupon.exists({ code: c.code })
  if (!exists) await Coupon.create(c)
  console.log(`${c.code}: ${exists ? 'already there' : 'added'}`)
}
await mongoose.disconnect()
