// =============================================================
// routes/stats.js — numbers for the admin Dashboard tab.
// Mounted at /api/stats in server.js. Admin only.
//   GET /api/stats -> today's sales, all-time sales, last 7 days, top dishes,
//                     top restaurants, and counts of things that need attention.
//   GET /api/stats/orders.csv?from=YYYY-MM-DD&to=YYYY-MM-DD -> orders as a CSV file (opens in Excel)
// "Sales" only count real orders: cancelled orders and unpaid online orders
// (status awaiting_payment) are left out. Days are in Indian time (TIMEZONE).
// =============================================================

import { Router } from 'express'
import Order from '../models/Order.js'
import Reservation from '../models/Reservation.js'
import Customer from '../models/Customer.js'
import Message from '../models/Message.js'
import { requireAdmin } from '../middleware/auth.js'
import { TIMEZONE, todayISO } from '../utils.js'

const router = Router()

const SOLD = { status: { $nin: ['cancelled', 'awaiting_payment'] } }
const DAY_MS = 24 * 60 * 60 * 1000

// "YYYY-MM-DD" for a moment, in Indian time
const dateIn = (date) => new Intl.DateTimeFormat('en-CA', { timeZone: TIMEZONE }).format(date)
// MongoDB expression: the order's day ("YYYY-MM-DD") in Indian time
const orderDay = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: TIMEZONE } }

router.get('/', requireAdmin, async (req, res) => {
  const today = todayISO()
  const last7 = Array.from({ length: 7 }, (_, i) => dateIn(new Date(Date.now() - (6 - i) * DAY_MS)))

  const [totals, daily, topDishes, topRestaurants, statusCounts, bookingsToday, pendingBookings, customers, messages] =
    await Promise.all([
      Order.aggregate([{ $match: SOLD }, { $group: { _id: null, orders: { $sum: 1 }, revenue: { $sum: '$total' } } }]),
      Order.aggregate([
        { $match: { ...SOLD, createdAt: { $gte: new Date(Date.now() - 8 * DAY_MS) } } },
        { $group: { _id: orderDay, orders: { $sum: 1 }, revenue: { $sum: '$total' } } },
      ]),
      Order.aggregate([
        { $match: SOLD },
        { $unwind: '$items' },
        { $group: { _id: '$items.name', quantity: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
        { $sort: { quantity: -1, revenue: -1 } },
        { $limit: 5 },
      ]),
      Order.aggregate([
        { $match: SOLD },
        { $group: { _id: '$restaurant', orders: { $sum: 1 }, revenue: { $sum: '$total' } } },
        { $sort: { revenue: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'restaurants', localField: '_id', foreignField: '_id', as: 'restaurant' } },
      ]),
      Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Reservation.countDocuments({ date: today, status: { $ne: 'cancelled' } }),
      Reservation.countDocuments({ status: 'pending', date: { $gte: today } }),
      Customer.countDocuments(),
      Message.countDocuments(),
    ])

  const byDay = Object.fromEntries(daily.map((d) => [d._id, d]))
  const days = last7.map((date) => ({ date, orders: byDay[date]?.orders || 0, revenue: byDay[date]?.revenue || 0 }))
  const todayStats = days[days.length - 1]
  const counts = Object.fromEntries(statusCounts.map((s) => [s._id, s.count]))

  res.json({
    today: {
      orders: todayStats.orders,
      revenue: todayStats.revenue,
      averageOrder: todayStats.orders ? Math.round(todayStats.revenue / todayStats.orders) : 0,
      bookings: bookingsToday,
    },
    allTime: { orders: totals[0]?.orders || 0, revenue: totals[0]?.revenue || 0, customers, messages },
    needsAttention: {
      newOrders: counts.placed || 0,
      inKitchen: counts.preparing || 0,
      outForDelivery: counts.out_for_delivery || 0,
      pendingBookings,
    },
    last7Days: days,
    topDishes: topDishes.map((d) => ({ name: d._id, quantity: d.quantity, revenue: d.revenue })),
    topRestaurants: topRestaurants.map((r) => ({ name: r.restaurant[0]?.name || 'Deleted restaurant', orders: r.orders, revenue: r.revenue })),
  })
})

// CSV cell: wrap in quotes, double any quotes, and stop Excel from running
// text that starts with = + - @ as a formula
const csvCell = (value) => {
  let text = value === null || value === undefined ? '' : String(value)
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`
  return `"${text.replace(/"/g, '""')}"`
}

router.get('/orders.csv', requireAdmin, async (req, res) => {
  const isDate = (d) => /^\d{4}-\d{2}-\d{2}$/.test(d || '')
  const to = isDate(req.query.to) ? req.query.to : todayISO()
  const from = isDate(req.query.from) ? req.query.from : dateIn(new Date(Date.now() - 29 * DAY_MS))
  const orders = await Order.aggregate([
    { $addFields: { day: orderDay } },
    { $match: { day: { $gte: from, $lte: to } } },
    { $sort: { createdAt: 1 } },
    { $lookup: { from: 'restaurants', localField: 'restaurant', foreignField: '_id', as: 'r' } },
  ])
  const header = ['Order number', 'Date', 'Time', 'Restaurant', 'Customer', 'Phone', 'Items', 'Item total', 'Coupon', 'Discount', 'Delivery fee', 'GST', 'Total', 'Payment', 'Payment status', 'Status']
  const time = (d) => new Intl.DateTimeFormat('en-IN', { timeZone: TIMEZONE, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(d)
  const rows = orders.map((o) => [
    o.orderNumber, o.day, time(o.createdAt), o.r[0]?.name || '', o.customer.name, o.customer.phone,
    o.items.map((i) => `${i.name} x${i.quantity}`).join('; '), o.subtotal, o.couponCode || '', o.discount || 0,
    o.deliveryFee, o.tax, o.total, o.paymentMethod === 'online' ? 'Online' : 'Cash on Delivery', o.paymentStatus, o.status,
  ])
  // \uFEFF at the start makes Excel read the ₹ and Hindi text correctly
  const csv = '\uFEFF' + [header, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n')
  res.setHeader('Content-Type', 'text/csv; charset=utf-8')
  res.setHeader('Content-Disposition', `attachment; filename="orders-${from}-to-${to}.csv"`)
  res.send(csv)
})

export default router
