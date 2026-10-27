// =============================================================
// models/MenuItem.js — one dish on a restaurant's menu ("menuitems" collection).
// Each item points to its restaurant. Orders read prices from here, so
// the price a customer pays always comes from the database.
// =============================================================

import mongoose from 'mongoose'

const menuItemSchema = new mongoose.Schema(
  {
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    name: { type: String, required: [true, 'Name is required'], trim: true },
    description: { type: String, trim: true, default: '' },
    price: { type: Number, required: [true, 'Price is required'], min: [1, 'Price must be at least ₹1'] },
    category: { type: String, trim: true, default: 'Main Course' },
    isVeg: { type: Boolean, default: true },
    image: { type: String, default: '' },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
)

export default mongoose.model('MenuItem', menuItemSchema)
