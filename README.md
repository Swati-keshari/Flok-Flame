# Fork & Flame

A restaurant website with a backend. Customers can:

- see restaurants near their current location on a map,
- **order food online** (cart, coupon codes like FIRST50, saved addresses, Cash on Delivery or online payment with Razorpay),
- **book a table**,
- create an account (sign up / log in) so all their orders and bookings are in one place,
- track their order, download a printable bill, reorder in one click, and rate delivered orders,
- get emails when an order or booking changes,
- send a contact message and subscribe to the newsletter.

An **admin panel** (`/admin` or `/owner`) shows a sales dashboard (with a new-order bell and CSV export) and lets the owner manage orders, coupons, dish photos, bookings, restaurants, menus, messages and subscribers.

## Folders

```
Flok&Flame/
├── backend/   → Node.js + Express API server, talks to MongoDB   (see backend/README.md)
└── swati/     → React website (Vite + Tailwind CSS)               (see swati/README.md)
```

How they work together:

```
Browser (React site, port 5173)
   │  fetch('/api/...')
   ▼
Vite dev server ── proxies /api ──► Express backend (port 5000) ──► MongoDB (port 27017)
                                          │
                                          └──► Razorpay (online payments)
```

## How to run (every time)

Open two terminals.

```bash
# Terminal 1 – backend (also starts MongoDB if it is not running)
cd backend
npm run dev

# Terminal 2 – website
cd swati
npm run dev
```

Then open http://localhost:5173

## First-time setup

```bash
cd backend
npm install
cp .env.example .env          # then fill in the values (see backend/README.md)
npm run seed                  # adds 12 sample restaurants with menus
npm run create-admin -- admin@example.com YourPassword

cd ../swati
npm install
```

## Main pages

| URL | Page |
|---|---|
| `/` | Home page (hero, about, menu, table booking form, testimonials, contact) |
| `/restaurants` | Restaurants near you (map + list) |
| `/restaurants/:id` | One restaurant: order online, book a table, location |
| `/cart` | Checkout |
| `/orders/:id` | Order tracking |
| `/login` | Customer log in / sign up |
| `/my-bookings` | My orders & bookings (automatic when logged in, otherwise find with email + phone) |
| `/admin` (or `/owner`) | Admin panel with sales dashboard (login needed) |

## Putting it online

See **[DEPLOY.md](DEPLOY.md)** (MongoDB Atlas + Render + Vercel, all free).

## Tests

```bash
cd backend
npm test        # 74 API checks on a separate test database
```
