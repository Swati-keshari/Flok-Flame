// My Orders & Bookings page (routes "/my-bookings" and "/my-orders").
// The customer enters the email + phone they used; we then show two tabs:
//   - Food Orders (click one to track it; "Reorder" puts the same dishes back in the cart)
//   - Table Bookings (upcoming ones can be cancelled)
// Guests: email + phone together prove the orders/bookings are theirs.
// Logged-in customers: everything loads automatically from their account (no form).

import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { getJSON, patchJSON, postJSON } from '../api'
import { useCustomer } from '../context/customerContext'
import { useCart } from '../context/cartContext'
import InputField from '../components/InputField'
import StatusBadge from '../components/StatusBadge'
import OrderStatusBadge from '../components/OrderStatusBadge'
import { paymentLabel } from '../utils/orderStatus'
import { loadDeliveryDetails, rememberOrder } from '../utils/recentOrders'

// Local date as YYYY-MM-DD (toISOString would give the UTC date)
const now = new Date()
const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
const formatDateTime = (iso) => new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })

const MyBookings = () => {
  const navigate = useNavigate()
  const cart = useCart()
  const [reorderingId, setReorderingId] = useState(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('tab') === 'bookings' ? 'bookings' : 'orders'
  const saved = loadDeliveryDetails()
  const [form, setForm] = useState({ email: saved?.email || '', phone: saved?.phone || '' })
  const [results, setResults] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [cancellingId, setCancellingId] = useState(null)
  const { customer } = useCustomer()

  // Logged in: load my orders + bookings straight from the account
  useEffect(() => {
    if (!customer) return
    let ignore = false
    Promise.all([getJSON('/api/customers/me/orders'), getJSON('/api/customers/me/bookings')])
      .then(([orders, bookings]) => {
        if (ignore) return
        orders.forEach((o) => rememberOrder(o._id, o.customer.phone))
        setResults({ orders, bookings })
      })
      .catch((err) => !ignore && setError(err.message))
    return () => { ignore = true }
  }, [customer])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      const [orders, bookings] = await Promise.all([
        postJSON('/api/orders/lookup', form),
        postJSON('/api/reservations/lookup', form),
      ])
      orders.forEach((o) => rememberOrder(o._id, form.phone))
      setResults({ orders, bookings })
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const cancelBooking = async (booking) => {
    if (!window.confirm(`Cancel your booking on ${booking.date} at ${booking.time}?`)) return
    setError('')
    setCancellingId(booking._id)
    try {
      // The booking's own email + phone prove it is ours (works for guests and logged-in customers)
      const updated = await patchJSON(`/api/reservations/${booking._id}/cancel`, { email: booking.email, phone: booking.phone })
      setResults((prev) => ({ ...prev, bookings: prev.bookings.map((b) => (b._id === updated._id ? updated : b)) }))
    } catch (err) {
      setError(err.message)
    } finally {
      setCancellingId(null)
    }
  }

  // Put the dishes of an old order back in the cart, with TODAY's menu prices.
  // Dishes that are sold out or no longer on the menu are skipped.
  const reorder = async (order) => {
    setError('')
    setReorderingId(order._id)
    try {
      const menu = await getJSON(`/api/restaurants/${order.restaurant._id}/menu`)
      const byId = Object.fromEntries(menu.map((m) => [m._id, m]))
      const restaurant = { _id: order.restaurant._id, name: order.restaurant.name }
      const skipped = []
      let added = 0
      for (const line of order.items) {
        const dish = byId[line.menuItem]
        if (!dish || !dish.isAvailable) { skipped.push(line.name); continue }
        for (let i = 0; i < line.quantity; i++) {
          // false = the customer chose to keep their cart from another restaurant
          if (!cart.addItem(restaurant, { menuItem: dish._id, name: dish.name, price: dish.price, isVeg: dish.isVeg })) return
        }
        added++
      }
      if (skipped.length) window.alert(`Not available any more, so not added: ${skipped.join(', ')}`)
      if (added) navigate('/cart')
    } catch (err) {
      setError(err.message)
    } finally {
      setReorderingId(null)
    }
  }

  return (
    <div className='min-h-screen bg-secondary py-12'>
      <div className='container mx-auto max-w-3xl px-6'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl sm:text-4xl text-dark font-bold mb-4'>My Orders & Bookings</h1>
          <div className='w-20 h-1 bg-primary mx-auto mb-4'></div>
          <p className='text-gray-700'>
            {customer ? `Logged in as ${customer.name} (${customer.email})` : 'Enter the email and phone number you used while ordering or booking'}
          </p>
          {!customer && (
            <p className='mt-2 text-sm text-gray-600'>
              <Link to='/login?next=/my-bookings' className='font-semibold text-primary'>Log in</Link> to see your orders without typing these every time.
            </p>
          )}
        </div>

        {customer && !results && !error && <p className='text-center text-gray-700'>Loading your orders...</p>}

        {!customer && (
        <form onSubmit={handleSubmit} className='mb-8 rounded bg-gray-50 p-6 shadow'>
          <div className='grid grid-cols-1 gap-x-6 md:grid-cols-2'>
            <InputField label='Email' name='email' type='email' value={form.email} onChange={handleChange} placeholder='you@example.com' required />
            <InputField label='Phone' name='phone' type='tel' value={form.phone} onChange={handleChange} placeholder='Your phone number' required />
          </div>
          <button type='submit' disabled={isLoading} className='w-full bg-primary px-8 py-3 rounded text-white font-semibold cursor-pointer disabled:opacity-60'>
            {isLoading ? 'Searching...' : 'Show My Orders & Bookings'}
          </button>
        </form>
        )}

        {error && <p className='mb-6 text-center text-red-600'>{error}</p>}

        {results && (
          <>
            <div className='mb-6 flex gap-2 border-b border-gray-300' role='tablist'>
              {[
                { id: 'orders', label: `Food Orders (${results.orders.length})` },
                { id: 'bookings', label: `Table Bookings (${results.bookings.length})` },
              ].map((t) => (
                <button
                  key={t.id}
                  type='button'
                  role='tab'
                  aria-selected={tab === t.id}
                  onClick={() => setSearchParams({ tab: t.id }, { replace: true })}
                  className={`border-b-2 px-4 py-2 font-semibold transition ${
                    tab === t.id ? 'border-primary text-primary' : 'border-transparent text-gray-600 hover:text-dark'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {tab === 'orders' && (
              results.orders.length === 0 ? (
                <p className='text-center text-gray-700'>
                  No orders yet. <Link to='/restaurants' className='font-semibold text-primary'>Order food now</Link>
                </p>
              ) : (
                <ul className='space-y-4'>
                  {results.orders.map((o) => (
                    <li key={o._id} className='rounded-lg bg-white shadow transition hover:shadow-md'>
                      <Link to={`/orders/${o._id}`} className='flex flex-col gap-2 p-5 pb-3 sm:flex-row sm:items-center sm:justify-between'>
                        <div>
                          <div className='mb-1 flex items-center gap-3'>
                            <h2 className='text-lg font-bold text-dark'>{o.restaurant?.name || 'Restaurant'}</h2>
                            <OrderStatusBadge status={o.status} />
                          </div>
                          <p className='text-sm text-gray-700'>{o.items.map((i) => `${i.name} × ${i.quantity}`).join(', ')}</p>
                          <p className='text-xs text-gray-500'>#{o.orderNumber} · {formatDateTime(o.createdAt)}</p>
                        </div>
                        <div className='shrink-0 text-right'>
                          <p className='font-bold text-dark'>₹{o.total}</p>
                          <p className='text-xs text-gray-500'>{paymentLabel(o)}</p>
                          <p className='text-sm font-semibold text-primary'>Track →</p>
                        </div>
                      </Link>
                      {o.restaurant?._id && (
                        <div className='flex justify-end gap-3 border-t px-5 py-2'>
                          <Link to={`/orders/${o._id}/bill`} className='text-sm font-semibold text-gray-600 hover:text-primary'>Bill</Link>
                          <button
                            type='button'
                            onClick={() => reorder(o)}
                            disabled={reorderingId === o._id}
                            className='rounded border border-primary px-3 py-1 text-sm font-semibold text-primary hover:bg-primary hover:text-white transition disabled:opacity-60'
                          >
                            {reorderingId === o._id ? 'Adding...' : 'Reorder'}
                          </button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )
            )}

            {tab === 'bookings' && (
              results.bookings.length === 0 ? (
                <p className='text-center text-gray-700'>
                  No bookings found. <Link to='/restaurants' className='font-semibold text-primary'>Book a table now</Link>
                </p>
              ) : (
                <ul className='space-y-4'>
                  {results.bookings.map((b) => {
                    const canCancel = b.status !== 'cancelled' && b.date >= today
                    return (
                      <li key={b._id} className='flex flex-col gap-4 rounded-lg bg-white p-5 shadow sm:flex-row sm:items-center sm:justify-between'>
                        <div>
                          <div className='mb-1 flex items-center gap-3'>
                            <h2 className='text-lg font-bold text-dark'>{b.restaurant?.name || 'Fork & Flame'}</h2>
                            <StatusBadge status={b.status} />
                          </div>
                          <p className='text-sm text-gray-700'>
                            {b.date} at {b.time} · {b.partySize} {b.partySize > 1 ? 'guests' : 'guest'}
                            {b.tableRef && ` · ${b.tableRef}`}
                          </p>
                          <p className='text-xs text-gray-500 break-all'>Booking ID: {b._id}</p>
                        </div>
                        {canCancel && (
                          <button
                            type='button'
                            onClick={() => cancelBooking(b)}
                            disabled={cancellingId === b._id}
                            className='shrink-0 rounded border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary hover:text-white transition disabled:opacity-60'
                          >
                            {cancellingId === b._id ? 'Cancelling...' : 'Cancel Booking'}
                          </button>
                        )}
                      </li>
                    )
                  })}
                </ul>
              )
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default MyBookings
