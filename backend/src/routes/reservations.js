// =============================================================
// routes/reservations.js — table bookings.
// Mounted at /api/reservations in server.js.
// Public (customer):
//   POST  /api/reservations             -> book a table
//   POST  /api/reservations/lookup      -> "My Bookings" (email + phone)
//   PATCH /api/reservations/:id/cancel  -> customer cancels a future booking
// Admin only:
//   GET    /api/reservations            -> list bookings (filters)
//   GET    /api/reservations/:id        -> one booking
//   PATCH  /api/reservations/:id        -> change status (confirm / cancel)
//   DELETE /api/reservations/:id        -> delete a booking
// =============================================================

import { Router } from 'express'
import Reservation from '../models/Reservation.js'
import Restaurant from '../models/Restaurant.js'
import { requireAdmin } from '../middleware/auth.js'
import { isValidPhone, isWithinHours, nowHHMM, phoneDigits, todayISO } from '../utils.js'

const router = Router()

const today = todayISO
const digits = phoneDigits

// Bookings belonging to the customer with this email + phone
const findCustomerBookings = async (email, phone) => {
  const bookings = await Reservation.find({ email: email?.trim().toLowerCase() })
    .populate('restaurant', 'name address')
    .sort({ date: -1, time: -1 })
  return bookings.filter((b) => digits(b.phone) === digits(phone))
}

// ---------- Public ----------

// Create a new reservation (optionally for a specific restaurant)
router.post('/', async (req, res) => {
  const { restaurant: restaurantId, fullname, email, phone, date, time, partySize, tableRef, specialRequest } = req.body

  if (date && date < today()) {
    return res.status(400).json({ message: 'Date cannot be in the past' })
  }
  if (date === today() && time && time <= nowHHMM()) {
    return res.status(400).json({ message: 'This time has already passed, please pick a later time' })
  }
  if (phone && !isValidPhone(phone)) {
    return res.status(400).json({ message: 'Please enter a valid 10-digit phone number' })
  }

  let restaurant = null
  if (restaurantId) {
    restaurant = await Restaurant.findById(restaurantId)
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' })

    if (time && !isWithinHours(restaurant, time)) {
      return res.status(400).json({
        message: `${restaurant.name} is open from ${restaurant.openTime} to ${restaurant.closeTime}`,
      })
    }

    // One booking = one table. If every table is taken for this exact
    // date + time, refuse (cancelled bookings free their table)
    const booked = await Reservation.countDocuments({
      restaurant: restaurant._id, date, time, status: { $ne: 'cancelled' },
    })
    if (booked >= restaurant.totalTables) {
      return res.status(409).json({ message: 'No tables available for this slot, please choose another time' })
    }
  }

  const reservation = await Reservation.create({
    restaurant: restaurant?._id ?? null,
    fullname, email, phone, date, time, partySize, tableRef, specialRequest,
  })
  await reservation.populate('restaurant', 'name address')
  res.status(201).json(reservation)
})

// "My bookings": customer proves ownership with the email + phone used while booking
router.post('/lookup', async (req, res) => {
  const { email, phone } = req.body
  if (!email || !phone) return res.status(400).json({ message: 'Email and phone are required' })
  res.json(await findCustomerBookings(email, phone))
})

router.patch('/:id/cancel', async (req, res) => {
  const { email, phone } = req.body
  if (!email || !phone) return res.status(400).json({ message: 'Email and phone are required' })

  const reservation = (await findCustomerBookings(email, phone)).find((b) => b._id.equals(req.params.id))
  if (!reservation) return res.status(404).json({ message: 'Booking not found' })
  if (reservation.status === 'cancelled') return res.status(400).json({ message: 'Booking is already cancelled' })
  if (reservation.date < today()) return res.status(400).json({ message: 'Past bookings cannot be cancelled' })

  reservation.status = 'cancelled'
  await reservation.save()
  res.json(reservation)
})

// ---------- Admin only ----------

// List reservations, filter with ?status=&restaurant=&date=&email=
router.get('/', requireAdmin, async (req, res) => {
  const { status, restaurant, date, email } = req.query
  const filter = {}
  if (status) filter.status = status
  if (restaurant === 'none') filter.restaurant = null
  else if (restaurant) filter.restaurant = restaurant
  if (date) filter.date = date
  if (email) filter.email = email.trim().toLowerCase()

  const reservations = await Reservation.find(filter)
    .populate('restaurant', 'name address')
    .sort({ createdAt: -1 })
  res.json(reservations)
})

router.get('/:id', requireAdmin, async (req, res) => {
  const reservation = await Reservation.findById(req.params.id).populate('restaurant', 'name address')
  if (!reservation) return res.status(404).json({ message: 'Reservation not found' })
  res.json(reservation)
})

// Update reservation status (pending / confirmed / cancelled)
router.patch('/:id', requireAdmin, async (req, res) => {
  const reservation = await Reservation.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true, runValidators: true }
  ).populate('restaurant', 'name address')
  if (!reservation) return res.status(404).json({ message: 'Reservation not found' })
  res.json(reservation)
})

router.delete('/:id', requireAdmin, async (req, res) => {
  const reservation = await Reservation.findByIdAndDelete(req.params.id)
  if (!reservation) return res.status(404).json({ message: 'Reservation not found' })
  res.json({ message: 'Reservation deleted' })
})

export default router
