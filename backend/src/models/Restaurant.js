// =============================================================
// models/Restaurant.js — a restaurant ("restaurants" collection).
// Holds its details, opening hours, number of tables, delivery range and
// its map position. The 2dsphere index lets MongoDB find "restaurants
// near me" sorted by distance.
// =============================================================

import mongoose from 'mongoose'

const restaurantSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    description: { type: String, trim: true, default: '' },
    cuisines: [{ type: String, trim: true }],
    address: { type: String, required: [true, 'Address is required'], trim: true },
    city: { type: String, trim: true, default: '' },
    phone: { type: String, trim: true, default: '' },
    image: { type: String, default: '' },
    rating: { type: Number, min: 0, max: 5, default: 4 },
    // How many customer reviews the rating is based on (0 = sample rating)
    reviewCount: { type: Number, default: 0 },
    priceForTwo: { type: Number, min: 0, default: 500 },
    openTime: { type: String, default: '11:00' },
    closeTime: { type: String, default: '23:00' },
    totalTables: { type: Number, min: 1, default: 10 },
    deliveryRadiusKm: { type: Number, min: 0, default: 10 },
    // Demo data created by the seed script / admin sample button
    isSample: { type: Boolean, default: false },
    // GeoJSON point: coordinates are [longitude, latitude]
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: {
        type: [Number],
        required: [true, 'Location is required'],
      },
    },
  },
  { timestamps: true }
)

restaurantSchema.index({ location: '2dsphere' })

export default mongoose.model('Restaurant', restaurantSchema)
