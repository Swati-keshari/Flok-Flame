# Frontend (React website)

The Fork & Flame website, built with React, Vite, Tailwind CSS, React Router and Leaflet (maps).
It gets all its data from the backend API (`/api/...`).

## Folder structure

```
swati/
├── index.html            → the single HTML page React runs inside
├── vite.config.js        → Vite settings; sends /api requests to the backend (port 5000)
├── eslint.config.js      → code style / mistake checker settings (`npm run lint`)
├── public/               → files served as-is (logo, icons)
└── src/
    ├── main.jsx          → entry point: puts <App /> on the page inside the router
    ├── App.jsx           → list of all pages (routes), navbar, footer, cart bar
    ├── index.css         → Tailwind import and theme colours (primary, secondary, accent, dark)
    ├── api.js            → helpers to call the backend (getJSON, postJSON, ...) + admin token storage
    ├── pages/            → one file per page (URL)
    │   ├── Home.jsx              /                 home page sections
    │   ├── Restaurants.jsx       /restaurants      nearby restaurants: map, list, search, distance filter
    │   ├── RestaurantDetail.jsx  /restaurants/:id  tabs: Order Online, Book a Table, Info & Location
    │   ├── Cart.jsx              /cart             checkout: address, bill, payment choice
    │   ├── OrderTracking.jsx     /orders/:id       live order status, pay now, cancel
    │   ├── MyBookings.jsx        /my-bookings      a customer's orders and bookings
    │   ├── CustomerLogin.jsx     /login            customer log in / sign up
    │   ├── NotFound.jsx          *                 "page not found"
    │   └── admin/
    │       ├── AdminLogin.jsx     /admin/login
    │       └── AdminDashboard.jsx /admin (/owner)  tabs for the admin panel
    ├── components/       → reusable pieces of the pages
    │   ├── Navbar, Footer, Hero, About, Menu, Reservation, Testimonial, Contact → home page sections
    │   ├── RestaurantCard, RestaurantMap, RestaurantMenu, BookTableForm      → restaurant pages
    │   ├── CartBar, QuantityControl, VegIcon                                 → ordering
    │   ├── StatusBadge, OrderStatusBadge                                     → coloured status labels
    │   ├── InputField, ItemModel (dish popup)                                → small UI helpers
    │   └── admin/        → admin panel tabs: Dashboard (sales chart), Orders, Bookings, Restaurants (+ form, map picker, menu editor), Messages, Subscribers
    ├── context/          → shared state for every page: the shopping cart and the logged-in customer
    ├── hooks/            → reusable logic: useFetch (load data), useCurrentLocation (GPS)
    ├── utils/            → helpers: opening hours, order status text, Razorpay checkout, saved orders, images
    └── assets/           → images and the static home-page menu / testimonials data
```

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Start the website at http://localhost:5173 (backend must be running) |
| `npm run build` | Make the production build in `dist/` |
| `npm run lint` | Check the code for mistakes |

## Good to know

- The cart and "last used delivery details" are saved in the browser (localStorage).
- Map tiles come from OpenStreetMap; the Razorpay checkout script loads from checkout.razorpay.com.
- Pages other than Home load only when opened (lazy loading), so the home page opens faster.
