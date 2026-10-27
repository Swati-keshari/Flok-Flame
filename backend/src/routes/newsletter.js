// =============================================================
// routes/newsletter.js — newsletter sign-up box in the footer.
// Mounted at /api/newsletter in server.js.
//   POST   /api/newsletter      -> subscribe an email (public)
//   GET    /api/newsletter      -> list subscribers (admin only)
//   DELETE /api/newsletter/:id  -> remove a subscriber (admin only)
// =============================================================

import { Router } from 'express'
import Subscriber from '../models/Subscriber.js'
import { requireAdmin } from '../middleware/auth.js'

const router = Router()

router.post('/', async (req, res) => {
  const email = req.body.email?.trim().toLowerCase()
  const existing = await Subscriber.findOne({ email })
  if (existing) return res.status(409).json({ message: 'You are already subscribed' })

  await Subscriber.create({ email })
  res.status(201).json({ message: 'Subscribed successfully' })
})

router.get('/', requireAdmin, async (req, res) => {
  const subscribers = await Subscriber.find().sort({ createdAt: -1 })
  res.json(subscribers)
})

router.delete('/:id', requireAdmin, async (req, res) => {
  const subscriber = await Subscriber.findByIdAndDelete(req.params.id)
  if (!subscriber) return res.status(404).json({ message: 'Subscriber not found' })
  res.json({ message: 'Subscriber removed' })
})

export default router
