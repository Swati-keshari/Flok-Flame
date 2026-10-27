// createAdmin.js — command-line script (not part of the running server).
// Creates an admin, or resets the password if the email already exists.
// Usage: npm run create-admin -- <email> <password> [name]
import 'dotenv/config'
import mongoose from 'mongoose'
import Admin from './models/Admin.js'

const [email, password, name = 'Admin'] = process.argv.slice(2)
if (!email || !password) {
  console.log('Usage: npm run create-admin -- <email> <password> [name]')
  process.exit(1)
}

await mongoose.connect(process.env.MONGO_URI)
let admin = await Admin.findOne({ email: email.toLowerCase() })
if (admin) {
  admin.password = password
  await admin.save()
  console.log(`Password updated for ${admin.email}`)
} else {
  admin = await Admin.create({ email, password, name })
  console.log(`Admin created: ${admin.email}`)
}
await mongoose.disconnect()
