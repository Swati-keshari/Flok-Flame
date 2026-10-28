// =============================================================
// models/Review.js — a customer's star rating + comment ("reviews" collection).
// Only a DELIVERED order can be reviewed, and only once (order is unique).
// Each new review updates the restaurant's average rating and review count.
// =============================================================

import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema(
  {
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
    name: { type: String, required: true, trim: true },
    rating: {
      type: Number,
      required: [true, 'Please choose 1 to 5 stars'],
      min: [1, 'Please choose 1 to 5 stars'],
      max: [5, 'Please choose 1 to 5 stars'],
      validate: [Number.isInteger, 'Please choose 1 to 5 stars'],
    },
    comment: { type: String, trim: true, maxlength: [500, 'Review can be at most 500 characters'], default: '' },
  },
  { timestamps: true }
)

export default mongoose.model('Review', reviewSchema)
