// api.test.mjs — automatic checks for the whole backend API.
// Each check() line prints ✔ or ✘. If any ✘ appears, something broke.
// End-to-end API tests. Run with: npm test
// Starts its own server on a separate test database (your real data is not touched)
// and uses a fake Razorpay secret, so no real payments are made.
import { spawn, execFileSync } from 'child_process'
import crypto from 'crypto'
import mongoose from 'mongoose'

const PORT = 5079
const B = `http://localhost:${PORT}/api`
const SECRET = 'fake_test_secret_123'
const env = {
  ...process.env,
  MONGO_URI: 'mongodb://127.0.0.1:27017/fork-flame-test',
  PORT: String(PORT),
  JWT_SECRET: 'test-jwt-secret',
  RAZORPAY_KEY_ID: 'rzp_test_dummy',
  RAZORPAY_KEY_SECRET: SECRET,
}

let passed = 0
let failed = 0
const check = (name, ok, detail = '') => {
  if (ok) passed++
  else failed++
  console.log(`${ok ? '✔' : '✘'} ${name}${!ok && detail ? `  → ${detail}` : ''}`)
}

const call = async (method, path, body, token) => {
  const res = await fetch(B + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  })
  return { status: res.status, data: await res.json().catch(() => ({})) }
}
const sign = (o, p, secret = SECRET) => crypto.createHmac('sha256', secret).update(`${o}|${p}`).digest('hex')

// ---------- setup ----------
execFileSync('node', ['src/seed.js'], { env, stdio: 'ignore' })
execFileSync('node', ['src/createAdmin.js', 'admin@test.com', 'secret123'], { env, stdio: 'ignore' })
const server = spawn('node', ['src/server.js'], { env, stdio: 'ignore' })
for (let i = 0; i < 50; i++) {
  try { await fetch(`${B}/health`); break } catch { await new Promise((r) => setTimeout(r, 200)) }
}
await mongoose.connect(env.MONGO_URI)
const orders = mongoose.connection.collection('orders')

try {
  // ---------- restaurants & menu ----------
  let r = await call('GET', '/restaurants?lat=28.6315&lng=77.2167&maxKm=2')
  check('nearby search returns restaurants sorted by distance', r.data.length >= 3 && r.data[0].distanceKm <= r.data[1].distanceKm)
  const { data: [biryani] } = await call('GET', '/restaurants?search=Biryani')
  const rid = biryani._id
  const { data: menu } = await call('GET', `/restaurants/${rid}/menu`)
  check('restaurant has a menu', menu.length > 3)
  const [i1, i2] = menu

  // ---------- table bookings ----------
  const booking = { restaurant: rid, fullname: 'Ravi', email: 'ravi@test.com', phone: '+91 98765 43210', date: '2030-01-01', time: '20:00', partySize: 2 }
  r = await call('POST', '/reservations', booking)
  check('book a table', r.status === 201, JSON.stringify(r.data))
  r = await call('POST', '/reservations', { ...booking, time: '08:00' })
  check('booking outside opening hours is rejected', r.status === 400)
  r = await call('POST', '/reservations', { ...booking, phone: '12ab' })
  check('booking with invalid phone is rejected', r.status === 400)
  r = await call('POST', '/reservations', { ...booking, date: '2020-01-01' })
  check('booking in the past is rejected', r.status === 400)
  const { data: [lateNight] } = await call('GET', '/restaurants?search=Burger Barn')
  r = await call('POST', '/reservations', { ...booking, restaurant: lateNight._id, time: '01:30' })
  check('late-night place (11:00–03:00) accepts a 1:30 AM booking', r.status === 201, JSON.stringify(r.data))
  r = await call('POST', '/reservations', { ...booking, restaurant: lateNight._id, time: '05:00' })
  check('late-night place rejects a 5 AM booking', r.status === 400)
  const { data: [allDay] } = await call('GET', '/restaurants?search=Punjab Da Dhaba')
  r = await call('POST', '/reservations', { ...booking, restaurant: allDay._id, time: '04:00' })
  check('24-hour place accepts a 4 AM booking', r.status === 201, JSON.stringify(r.data))
  r = await call('POST', '/reservations/lookup', { email: 'RAVI@test.com', phone: '9876543210' })
  check('my bookings lookup (phone written differently)', r.data.length === 3)
  r = await call('GET', '/reservations')
  check('booking list needs admin login', r.status === 401)

  // ---------- food orders ----------
  // Use the 24-hour restaurant so these checks run at any time of day
  const ord = allDay._id
  const { data: ordMenu } = await call('GET', `/restaurants/${ord}/menu`)
  const [o1, o2] = ordMenu
  const near = { lat: 28.6315, lng: 77.2167 }
  const customer = { name: 'Ravi', email: 'ravi@test.com', phone: '+91 98765 43210' }
  const address = { line: 'Flat 4, MG Road' }
  r = await call('POST', '/orders/quote', { restaurant: ord, items: [{ menuItem: o1._id, quantity: 2, price: 1 }, { menuItem: o2._id, quantity: 1 }], location: near })
  check('bill uses database prices, not browser prices', r.data.subtotal === o1.price * 2 + o2.price, JSON.stringify(r.data))
  check('bill adds 5% GST', r.data.tax === Math.round(r.data.subtotal * 0.05))

  const restaurantOpen = r.data.isOpen
  if (!restaurantOpen) console.log('  (restaurant is closed right now, skipping order placement checks)')
  else {
    r = await call('POST', '/orders', { restaurant: ord, items: [{ menuItem: o1._id, quantity: 1 }], location: { lat: 19.07, lng: 72.87 }, customer, address })
    check('order outside delivery range is rejected', r.status === 400)
    r = await call('POST', '/orders', { restaurant: ord, items: [], customer, address })
    check('empty cart is rejected', r.status === 400)
    r = await call('POST', '/orders', { restaurant: ord, items: [{ menuItem: o1._id, quantity: 1 }], customer: { ...customer, phone: 'abc' }, address })
    check('order with invalid phone is rejected', r.status === 400)
    r = await call('POST', '/orders', { restaurant: ord, items: [{ menuItem: o1._id, quantity: 1 }], customer, address, location: near })
    check('place COD order', r.status === 201 && r.data.status === 'placed', JSON.stringify(r.data))
    const oid = r.data._id
    r = await call('GET', `/orders/track/${oid}?phone=111`)
    check('tracking with wrong phone is refused', r.status === 404)
    r = await call('GET', `/orders/track/${oid}?phone=9876543210`)
    check('tracking with right phone works', r.status === 200)

    const { data: { token } } = await call('POST', '/auth/login', { email: 'admin@test.com', password: 'secret123' })
    r = await call('PATCH', `/orders/${oid}`, { status: 'preparing' }, token)
    check('admin moves order to preparing', r.data.status === 'preparing')
    r = await call('PATCH', `/orders/${oid}/cancel`, { phone: '9876543210' })
    check('customer cannot cancel once preparing', r.status === 400)

    // ---------- online payments (signature checks) ----------
    r = await call('POST', '/orders', { restaurant: ord, items: [{ menuItem: o1._id, quantity: 1 }], customer, address })
    const pid = new mongoose.Types.ObjectId(r.data._id)
    await orders.updateOne({ _id: pid }, { $set: { paymentMethod: 'online', status: 'awaiting_payment', razorpayOrderId: 'order_TEST' } })
    r = await call('GET', '/orders?status=active', null, token)
    check('unpaid online order is hidden from restaurant', !r.data.some((o) => o._id === String(pid)))
    const verify = (sig, rzpOrder = 'order_TEST') => call('POST', `/orders/${pid}/verify-payment`, {
      phone: '9876543210', razorpay_order_id: rzpOrder, razorpay_payment_id: 'pay_1', razorpay_signature: sig,
    })
    r = await verify(sign('order_TEST', 'pay_1', 'wrong-secret'))
    check('forged payment signature is rejected', r.status === 400)
    r = await verify(sign('order_OTHER', 'pay_1'), 'order_OTHER')
    check('signature for another order is rejected', r.status === 400)
    r = await verify(sign('order_TEST', 'pay_1'))
    check('valid payment marks order paid and placed', r.data.paymentStatus === 'paid' && r.data.status === 'placed')
    r = await call('POST', `/orders/${pid}/pay`, { phone: '9876543210' })
    check('paid order cannot be paid twice', r.status === 400)
    r = await call('PATCH', `/orders/${pid}/cancel`, { phone: '9876543210' })
    check('cancelling a paid order flags it for refund', r.data.paymentStatus === 'refund_needed')
    r = await call('PATCH', `/orders/${pid}/refunded`, null, token)
    check('admin marks refund done', r.data.paymentStatus === 'refunded')
  }

  // ---------- security ----------
  r = await call('POST', '/menu', { restaurant: rid, name: 'X', price: 1 })
  check('menu edit needs admin login', r.status === 401)
  r = await call('GET', '/auth/me', null, 'not-a-real-token')
  check('fake admin token is rejected', r.status === 401)
  const codes = []
  for (let i = 0; i < 6; i++) codes.push((await call('POST', '/auth/login', { email: 'admin@test.com', password: 'wrong' })).status)
  check('admin login blocks after 5 wrong passwords', codes[5] === 429, codes.join(','))
} catch (err) {
  failed++
  console.log('✘ test crashed:', err.message)
} finally {
  await mongoose.connection.dropDatabase()
  await mongoose.disconnect()
  server.kill()
}

console.log(`\n${passed} passed, ${failed} failed`)
process.exit(failed ? 1 : 0)
