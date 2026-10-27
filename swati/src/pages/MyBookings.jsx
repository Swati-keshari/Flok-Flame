// My Orders & Bookings page (routes "/my-bookings" and "/my-orders").
// The customer enters the email + phone they used; we then show two tabs:
//   - Food Orders (click one to track it)
//   - Table Bookings (upcoming ones can be cancelled)
// There is no customer login: email + phone together prove the bookings are theirs.

import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { patchJSON, postJSON } from '../api'
import InputField from '../components/InputField'
import StatusBadge from '../components/StatusBadge'
import OrderStatusBadge from '../components/OrderStatusBadge'
import { paymentLabel } from '../utils/orderStatus'
import { loadDeliveryDetails, rememberOrder } from '../utils/recentOrders'

const today = new Date().toISOString().split('T')[0]
const formatDateTime = (iso) => new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })

const MyBookings = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('tab') === 'bookings' ? 'bookings' : 'orders'
  const saved = loadDeliveryDetails()
  const [form, setForm] = useState({ email: saved?.email || '', phone: saved?.phone || '' })
  const [results, setResults] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [cancellingId, setCancellingId] = useState(null)

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
      const updated = await patchJSON(`/api/reservations/${booking._id}/cancel`, form)
      setResults((prev) => ({ ...prev, bookings: prev.bookings.map((b) => (b._id === updated._id ? updated : b)) }))
    } catch (err) {
      setError(err.message)
    } finally {
      setCancellingId(null)
    }
  }

  return (
    <div className='min-h-screen bg-secondary py-12'>
      <div className='container mx-auto max-w-3xl px-6'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl sm:text-4xl text-dark font-bold mb-4'>My Orders & Bookings</h1>
          <div className='w-20 h-1 bg-primary mx-auto mb-4'></div>
          <p className='text-gray-700'>Enter the email and phone number you used while ordering or booking</p>
        </div>

        <form onSubmit={handleSubmit} className='mb-8 rounded bg-gray-50 p-6 shadow'>
          <div className='grid grid-cols-1 gap-x-6 md:grid-cols-2'>
            <InputField label='Email' name='email' type='email' value={form.email} onChange={handleChange} placeholder='you@example.com' required />
            <InputField label='Phone' name='phone' type='tel' value={form.phone} onChange={handleChange} placeholder='Your phone number' required />
          </div>
          <button type='submit' disabled={isLoading} className='w-full bg-primary px-8 py-3 rounded text-white font-semibold cursor-pointer disabled:opacity-60'>
            {isLoading ? 'Searching...' : 'Show My Orders & Bookings'}
          </button>
        </form>

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
                    <li key={o._id}>
                      <Link to={`/orders/${o._id}`} className='flex flex-col gap-2 rounded-lg bg-white p-5 shadow transition hover:shadow-md sm:flex-row sm:items-center sm:justify-between'>
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
