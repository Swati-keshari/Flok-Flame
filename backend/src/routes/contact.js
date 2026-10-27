// =============================================================
// routes/contact.js — "Send a Message" form on the home page.
// Mounted at /api/contact in server.js.
//   POST   /api/contact      -> save a message (public)
//   GET    /api/contact      -> list all messages (admin only)
//   DELETE /api/contact/:id  -> delete a message (admin only)
// =============================================================

import { Router } from 'express'
import Message from '../models/Message.js'
import { requireAdmin } from '../middleware/auth.js'

const router = Router()

router.post('/', async (req, res) => {
  const { fullName, email, subject, message } = req.body
  const saved = await Message.create({ fullName, email, subject, message })
  res.status(201).json({ message: 'Message sent successfully', id: saved._id })
})

router.get('/', requireAdmin, async (req, res) => {
  const messages = await Message.find().sort({ createdAt: -1 })
  res.json(messages)
})

router.delete('/:id', requireAdmin, async (req, res) => {
  const message = await Message.findByIdAndDelete(req.params.id)
  if (!message) return res.status(404).json({ message: 'Message not found' })
  res.json({ message: 'Message deleted' })
})

export default router
