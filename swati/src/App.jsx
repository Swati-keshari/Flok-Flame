// App: the top-level component. Decides which page to show for each URL (routes).
// - Navbar and Footer are shown on every page.
// - CartProvider wraps everything so any page can read/change the food cart.
// - CartBar is the green "View Cart" bar at the bottom of the screen.
// Routes: / (home), /restaurants, /restaurants/:id, /cart, /orders/:id,
// /my-bookings (and /my-orders), /admin/login, /admin, and * (404 page).

import { lazy, Suspense } from 'react'
import {Routes, Route, Navigate} from 'react-router-dom'
import Home from './pages/Home'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import CartBar from './components/CartBar'
import CartProvider from './context/CartProvider'

// Loaded only when visited, so the home page downloads less (maps + admin are heavy)
const Restaurants = lazy(() => import('./pages/Restaurants'))
const RestaurantDetail = lazy(() => import('./pages/RestaurantDetail'))
const MyBookings = lazy(() => import('./pages/MyBookings'))
const Cart = lazy(() => import('./pages/Cart'))
const OrderTracking = lazy(() => import('./pages/OrderTracking'))
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const NotFound = lazy(() => import('./pages/NotFound'))

const App = () => {
  return (
    <CartProvider>
      <Navbar />
      <Suspense fallback={<p className='min-h-[60vh] py-20 text-center text-gray-700'>Loading...</p>}>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/restaurants' element={<Restaurants />} />
          <Route path='/restaurants/:id' element={<RestaurantDetail />} />
          <Route path='/cart' element={<Cart />} />
          <Route path='/orders/:id' element={<OrderTracking />} />
          <Route path='/my-bookings' element={<MyBookings />} />
          <Route path='/my-orders' element={<MyBookings />} />
          <Route path='/admin/login' element={<AdminLogin />} />
          <Route path='/admin' element={<AdminDashboard />} />
          {/* /owner is a friendly alias for the admin panel */}
          <Route path='/owner' element={<Navigate to='/admin' replace />} />
          <Route path='*' element={<NotFound />} />
        </Routes>
      </Suspense>
      <Footer/>
      <CartBar />
    </CartProvider>
  )
}

export default App
