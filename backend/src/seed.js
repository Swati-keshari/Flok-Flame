// seed.js — command-line script that fills the database with demo data.
// Replaces all restaurants (and their menus) with sample ones around a centre point.
// Usage: npm run seed                 -> around Connaught Place, New Delhi
//        npm run seed -- 19.07 72.87  -> around any lat/lng (e.g. Mumbai)
import 'dotenv/config'
import mongoose from 'mongoose'
import Restaurant from './models/Restaurant.js'
import MenuItem from './models/MenuItem.js'
import { sampleRestaurantsAround } from './sampleRestaurants.js'
import { sampleMenuFor } from './sampleMenus.js'

const centerLat = parseFloat(process.argv[2]) || 28.6315
const centerLng = parseFloat(process.argv[3]) || 77.2167

await mongoose.connect(process.env.MONGO_URI)
await Restaurant.deleteMany({})
await MenuItem.deleteMany({})
const restaurants = await Restaurant.insertMany(sampleRestaurantsAround(centerLat, centerLng))
await MenuItem.insertMany(restaurants.flatMap(sampleMenuFor))
await Restaurant.syncIndexes()
console.log(`Added ${restaurants.length} restaurants with menus around ${centerLat}, ${centerLng}`)
await mongoose.disconnect()
