# Backend (API server)

Node.js + Express server that stores everything in MongoDB and sends JSON to the React website.
All URLs start with `/api`.

## Folder structure

```
backend/
├── .env                  → secret settings (database URL, keys). Never share or upload this file.
├── .env.example          → same keys without real values, as a template
├── package.json          → dependencies and npm scripts
├── src/
│   ├── server.js         → starts Express, connects all routes, connects to MongoDB (retries if it is down)
│   ├── utils.js          → small helpers: phone check, Indian time, open/closed check, distance in km
│   ├── payments.js       → everything Razorpay: create payment, verify signature, check if already paid
│   ├── middleware/
│   │   └── auth.js       → checks the admin login token on admin-only routes
│   ├── models/           → MongoDB collections (what each saved document looks like)
│   │   ├── Restaurant.js   restaurants with map location, hours, tables, delivery range
│   │   ├── MenuItem.js     dishes of a restaurant
│   │   ├── Order.js        food orders, bill, payment and status history
│   │   ├── Reservation.js  table bookings
│   │   ├── Message.js      contact form messages
│   │   ├── Subscriber.js   newsletter emails
│   │   └── Admin.js        admin users (password stored as a hash)
│   ├── routes/           → the API endpoints, one file per topic
│   │   ├── restaurants.js  /api/restaurants   nearby search, menu, table availability, admin edit
│   │   ├── menu.js         /api/menu          admin: add / edit / delete dishes
│   │   ├── orders.js       /api/orders        bill, place order, pay, track, cancel, admin status
│   │   ├── reservations.js /api/reservations  book a table, my bookings, admin list
│   │   ├── contact.js      /api/contact       contact messages
│   │   ├── newsletter.js   /api/newsletter    newsletter subscribe
│   │   └── auth.js         /api/auth          admin login (blocks after 5 wrong tries)
│   ├── sampleRestaurants.js → 12 demo restaurants placed around a given location
│   ├── sampleMenus.js    → demo menus, picked by cuisine
│   ├── seed.js           → `npm run seed`: replace all restaurants with the demo ones
│   ├── seedMenus.js      → `npm run seed-menus`: add demo menus to restaurants without one
│   └── createAdmin.js    → `npm run create-admin`: create an admin or reset its password
└── tests/
    └── api.test.mjs      → `npm test`: end-to-end API checks on a separate test database
```

## Settings in `.env`

| Key | What it is |
|---|---|
| `PORT` | Port of this server (5000) |
| `MONGO_URI` | MongoDB connection string. Local: `mongodb://127.0.0.1:27017/fork-flame` |
| `MONGO_URI_ATLAS` | Atlas connection string kept aside (not used until it is copied to `MONGO_URI`) |
| `CLIENT_URL` | Website address allowed to call this API (CORS) |
| `JWT_SECRET` | Secret used to sign admin login tokens |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Razorpay keys. Without the secret only Cash on Delivery is offered |
| `TIMEZONE` | Optional. Restaurant hours timezone, default `Asia/Kolkata` |

## npm scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the server, restart on code or `.env` changes (starts MongoDB first if needed) |
| `npm start` | Start the server without auto-restart |
| `npm run db` | Start the local MongoDB (data folder `~/mongodb-data`) |
| `npm test` | Run the API tests |
| `npm run seed -- <lat> <lng>` | Replace restaurants with 12 demo ones around a location |
| `npm run seed-menus` | Give a demo menu to restaurants that have none |
| `npm run create-admin -- <email> <password>` | Create an admin / change its password |

## Important rules the server enforces

- The bill is always calculated from database prices. Prices sent by the browser are ignored.
- Orders are refused when the restaurant is closed or the customer is outside the delivery range.
- Opening hours use Indian time and can go past midnight (e.g. 11:00–03:00). Same open and close time = open 24 hours.
- Online payments are confirmed only after the Razorpay signature is checked with the secret key.
- Customers prove an order or booking is theirs with the phone number (and email) used.
- Admin routes need a login token. Login is blocked for 15 minutes after 5 wrong passwords.
