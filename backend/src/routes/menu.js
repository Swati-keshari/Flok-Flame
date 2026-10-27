// =============================================================
// routes/menu.js — add / edit / delete dishes (admin panel -> Restaurants -> Menu).
// Mounted at /api/menu in server.js. Every route here is admin only.
//   POST   /api/menu      -> add a dish to a restaurant
//   PUT    /api/menu/:id  -> edit a dish (price, sold out, ...)
//   DELETE /api/menu/:id  -> remove a dish
// Customers read menus from GET /api/restaurants/:id/menu instead.
// =============================================================

import { Router } from 'express'
import MenuItem from '../models/MenuItem.js'
import Restaurant from '../models/Restaurant.js'
import { requireAdmin } from '../middleware/auth.js'

const router = Router()
// Every route below needs an admin login
router.use(requireAdmin)

const editableFields = ['name', 'description', 'price', 'category', 'isVeg', 'image', 'isAvailable']
const pick = (body) => Object.fromEntries(editableFields.filter((f) => body[f] !== undefined).map((f) => [f, body[f]]))

router.post('/', async (req, res) => {
  const restaurant = await Restaurant.findById(req.body.restaurant)
  if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' })
  const item = await MenuItem.create({ ...pick(req.body), restaurant: restaurant._id })
  res.status(201).json(item)
})

router.put('/:id', async (req, res) => {
  const item = await MenuItem.findByIdAndUpdate(req.params.id, pick(req.body), { new: true, runValidators: true })
  if (!item) return res.status(404).json({ message: 'Menu item not found' })
  res.json(item)
})

router.delete('/:id', async (req, res) => {
  const item = await MenuItem.findByIdAndDelete(req.params.id)
  if (!item) return res.status(404).json({ message: 'Menu item not found' })
  res.json({ message: 'Menu item deleted' })
})

export default router
