// seedMenus.js — command-line script for restaurants that have no menu.
// Adds a sample menu to every restaurant that has no menu items yet.
// Usage: npm run seed-menus
import 'dotenv/config'
import mongoose from 'mongoose'
import Restaurant from './models/Restaurant.js'
import MenuItem from './models/MenuItem.js'
import { sampleMenuFor } from './sampleMenus.js'

await mongoose.connect(process.env.MONGO_URI)
const withMenu = new Set((await MenuItem.distinct('restaurant')).map(String))
const restaurants = (await Restaurant.find()).filter((r) => !withMenu.has(String(r._id)))
if (restaurants.length) await MenuItem.insertMany(restaurants.flatMap(sampleMenuFor))
console.log(`Added menus to ${restaurants.length} restaurants`)
await mongoose.disconnect()
