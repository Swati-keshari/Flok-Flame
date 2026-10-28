// =============================================================
// server.js — the starting point of the backend.
// `npm run dev` / `npm start` runs this file. It:
//   1. reads settings from .env (port, database address, secrets)
//   2. creates the Express app and turns on CORS + JSON body parsing
//   3. plugs in every route file under /api/... (see routes/ folder)
//   4. turns errors into clean JSON replies
//   5. connects to MongoDB (retrying if it is down) and then starts listening
// =============================================================
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import reservationRoutes from './routes/reservations.js'
import contactRoutes from './routes/contact.js'
import newsletterRoutes from './routes/newsletter.js'
import restaurantRoutes from './routes/restaurants.js'
import authRoutes from './routes/auth.js'
import menuRoutes from './routes/menu.js'
import orderRoutes from './routes/orders.js'
import customerRoutes from './routes/customers.js'
import statsRoutes from './routes/stats.js'

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is missing in .env')
  process.exit(1)
}

const app = express()
const PORT = process.env.PORT || 5000

// CORS: only our own frontend (CLIENT_URL) may call this API from a browser
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }))
// Lets route handlers read JSON bodies as req.body
app.use(express.json())

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

app.use('/api/reservations', reservationRoutes)
app.use('/api/contact', contactRoutes)
app.use('/api/newsletter', newsletterRoutes)
app.use('/api/restaurants', restaurantRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/menu', menuRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/customers', customerRoutes)
app.use('/api/stats', statsRoutes)

// Mongoose validation errors -> 400, everything else -> 500
app.use((err, req, res, next) => {
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message)
    return res.status(400).json({ message: errors.join(', ') })
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid id' })
  }
  console.error(err)
  res.status(500).json({ message: 'Something went wrong' })
})

// Keep retrying instead of crashing, so starting MongoDB later is enough
const RETRY_MS = 5000
const connectWithRetry = () => {
  mongoose
    .connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 })
    .then(() => {
      console.log('MongoDB connected')
      app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
    })
    .catch((err) => {
      console.error(`MongoDB connection failed: ${err.message.replace(/\/\/[^@]*@/, '//***@')}`)
      console.error(`Retrying in ${RETRY_MS / 1000} seconds... (is MongoDB running? try: npm run db)`)
      setTimeout(connectWithRetry, RETRY_MS)
    })
}
connectWithRetry()
