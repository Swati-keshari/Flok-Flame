// =============================================================
// routes/coupons.js — discount codes, managed from the admin Coupons tab.
// Mounted at /api/coupons in server.js. Every route is admin only.
//   GET    /api/coupons      -> all coupons, with how many orders used each
//   POST   /api/coupons      -> create a coupon
//   PUT    /api/coupons/:id  -> edit (e.g. switch it on / off)
//   DELETE /api/coupons/:id  -> delete
// Customers don't call these: they type a code at checkout and
// routes/orders.js checks it while building the bill.
// =============================================================

import { Router } from 'express'
import Coupon from '../models/Coupon.js'
import Order from '../models/Order.js'
import { requireAdmin } from '../middleware/auth.js'

const router = Router()
router.use(requireAdmin)

const fields = ['code', 'description', 'type', 'value', 'minOrder', 'maxDiscount', 'firstOrderOnly', 'active']
const pick = (body) => Object.fromEntries(fields.filter((f) => body[f] !== undefined).map((f) => [f, body[f]]))

router.get('/', async (req, res) => {
  const [coupons, usage] = await Promise.all([
    Coupon.find().sort({ createdAt: -1 }),
    Order.aggregate([
      { $match: { couponCode: { $ne: null }, status: { $nin: ['cancelled', 'awaiting_payment'] } } },
      { $group: { _id: '$couponCode', uses: { $sum: 1 }, discount: { $sum: '$discount' } } },
    ]),
  ])
  const byCode = Object.fromEntries(usage.map((u) => [u._id, u]))
  res.json(coupons.map((c) => ({ ...c.toJSON(), uses: byCode[c.code]?.uses || 0, totalDiscount: byCode[c.code]?.discount || 0 })))
})

router.post('/', async (req, res) => {
  const data = pick(req.body)
  if (await Coupon.exists({ code: String(data.code || '').trim().toUpperCase() })) {
    return res.status(409).json({ message: 'A coupon with this code already exists' })
  }
  res.status(201).json(await Coupon.create(data))
})

router.put('/:id', async (req, res) => {
  const coupon = await Coupon.findById(req.params.id)
  if (!coupon) return res.status(404).json({ message: 'Coupon not found' })
  coupon.set(pick(req.body))
  await coupon.save()
  res.json(coupon)
})

router.delete('/:id', async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id)
  if (!coupon) return res.status(404).json({ message: 'Coupon not found' })
  res.json({ message: 'Coupon deleted' })
})

export default router
