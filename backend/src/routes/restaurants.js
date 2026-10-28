// =============================================================
// routes/restaurants.js — restaurants list, details, menu and free tables.
// Mounted at /api/restaurants in server.js.
// Public:
//   GET  /api/restaurants?lat=&lng=&maxKm=&search=  -> list (nearest first if lat/lng given)
//   GET  /api/restaurants/:id                       -> one restaurant
//   GET  /api/restaurants/:id/menu                  -> its menu
//   GET  /api/restaurants/:id/reviews               -> latest customer reviews
//   GET  /api/restaurants/:id/availability?date=&time= -> free tables for a slot
// Admin only:
//   POST   /api/restaurants          -> add a restaurant
//   PUT    /api/restaurants/:id      -> edit a restaurant
//   DELETE /api/restaurants/:id      -> delete it (and its menu)
//   POST   /api/restaurants/samples  -> replace demo restaurants around a point
// =============================================================

import { Router } from 'express'
import mongoose from 'mongoose'
import Restaurant from '../models/Restaurant.js'
import Reservation from '../models/Reservation.js'
import { requireAdmin } from '../middleware/auth.js'
import MenuItem from '../models/MenuItem.js'
import Review from '../models/Review.js'
import { sampleRestaurantsAround } from '../sampleRestaurants.js'
import { sampleMenuFor } from '../sampleMenus.js'

const router = Router()

const editableFields = [
  'name', 'description', 'cuisines', 'address', 'city', 'phone', 'image',
  'rating', 'priceForTwo', 'openTime', 'closeTime', 'totalTables', 'deliveryRadiusKm',
]

// Picks allowed fields from the body and turns lat/lng into a GeoJSON point
const restaurantFromBody = (body) => {
  const data = {}
  for (const field of editableFields) {
    if (body[field] !== undefined) data[field] = body[field]
  }
  if (typeof data.cuisines === 'string') {
    data.cuisines = data.cuisines.split(',').map((c) => c.trim()).filter(Boolean)
  }
  if (body.lat !== undefined && body.lng !== undefined) {
    const lat = parseFloat(body.lat)
    const lng = parseFloat(body.lng)
    if (Number.isNaN(lat) || Number.isNaN(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
      return { error: 'Latitude / longitude are invalid' }
    }
    data.location = { type: 'Point', coordinates: [lng, lat] }
  }
  return { data }
}

// GET /api/restaurants?lat=..&lng=..&maxKm=..&search=..
// With lat/lng, results are sorted by distance and include `distanceKm`.
router.get('/', async (req, res) => {
  const lat = parseFloat(req.query.lat)
  const lng = parseFloat(req.query.lng)
  const maxKm = parseFloat(req.query.maxKm)
  const search = req.query.search?.trim()

  const match = {}
  if (search) {
    // Escape special characters so a search like "c++" can't break the regex,
    // then match it (case-insensitive) in name, cuisine, city or address
    const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    match.$or = [{ name: regex }, { cuisines: regex }, { city: regex }, { address: regex }]
  }

  // No location shared: just list by rating
  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    const restaurants = await Restaurant.find(match).sort({ rating: -1 })
    return res.json(restaurants)
  }

  // $geoNear (needs the 2dsphere index on `location`) returns restaurants
  // nearest first and adds each one's distance in metres.
  // GeoJSON order is [longitude, latitude], not the other way round.
  const geoNear = {
    near: { type: 'Point', coordinates: [lng, lat] },
    distanceField: 'distance',
    spherical: true,
    query: match,
  }
  if (!Number.isNaN(maxKm)) geoNear.maxDistance = maxKm * 1000

  const restaurants = await Restaurant.aggregate([
    { $geoNear: geoNear },
    // metres -> km with 1 decimal, e.g. 1432 -> 1.4
    { $addFields: { distanceKm: { $round: [{ $divide: ['$distance', 1000] }, 1] } } },
    { $project: { distance: 0 } },
  ])
  res.json(restaurants)
})

router.get('/:id', async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id)
  if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' })
  res.json(restaurant)
})

// Full menu (unavailable items included, so the page can show them as "sold out")
router.get('/:id/menu', async (req, res) => {
  const items = await MenuItem.find({ restaurant: req.params.id }).sort({ category: 1, name: 1 })
  res.json(items)
})

// Latest 20 reviews, newest first
router.get('/:id/reviews', async (req, res) => {
  const reviews = await Review.find({ restaurant: req.params.id }).sort({ createdAt: -1 }).limit(20)
  res.json(reviews)
})

// How many tables are already booked for a given date+time slot
router.get('/:id/availability', async (req, res) => {
  const { date, time } = req.query
  if (!date || !time) return res.status(400).json({ message: 'date and time are required' })

  const restaurant = await Restaurant.findById(req.params.id)
  if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' })

  const booked = await Reservation.countDocuments({
    restaurant: new mongoose.Types.ObjectId(req.params.id),
    date,
    time,
    status: { $ne: 'cancelled' },
  })
  res.json({ totalTables: restaurant.totalTables, booked, available: Math.max(restaurant.totalTables - booked, 0) })
})

// ---------- Admin only ----------

// Replaces the old sample restaurants with new ones around { lat, lng }.
// Restaurants added by hand in the admin panel are kept.
router.post('/samples', requireAdmin, async (req, res) => {
  const lat = parseFloat(req.body.lat)
  const lng = parseFloat(req.body.lng)
  if (Number.isNaN(lat) || Number.isNaN(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return res.status(400).json({ message: 'Latitude / longitude are invalid' })
  }
  const oldSampleIds = await Restaurant.find({ isSample: true }).distinct('_id')
  await MenuItem.deleteMany({ restaurant: { $in: oldSampleIds } })
  await Restaurant.deleteMany({ _id: { $in: oldSampleIds } })
  const created = await Restaurant.insertMany(sampleRestaurantsAround(lat, lng))
  await MenuItem.insertMany(created.flatMap(sampleMenuFor))
  res.status(201).json({ message: `Added ${created.length} sample restaurants near you` })
})

router.post('/', requireAdmin, async (req, res) => {
  const { data, error } = restaurantFromBody(req.body)
  if (error) return res.status(400).json({ message: error })
  if (!data.location) return res.status(400).json({ message: 'Location (lat, lng) is required' })
  const restaurant = await Restaurant.create(data)
  res.status(201).json(restaurant)
})

router.put('/:id', requireAdmin, async (req, res) => {
  const { data, error } = restaurantFromBody(req.body)
  if (error) return res.status(400).json({ message: error })
  const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true })
  if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' })
  res.json(restaurant)
})

router.delete('/:id', requireAdmin, async (req, res) => {
  const restaurant = await Restaurant.findByIdAndDelete(req.params.id)
  if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' })
  await MenuItem.deleteMany({ restaurant: restaurant._id })
  res.json({ message: 'Restaurant deleted' })
})

export default router
