// Admin → Food Orders tab.
// - Lists orders (default: active ones), refreshes every 20 seconds so new orders appear.
// - Filters by status / restaurant, including "Awaiting payment" and "Refunds due".
// - One button moves each order to its next step (Accept → Out for delivery → Delivered).
// - Cancel, and "Mark refunded" after refunding a paid order from the Razorpay dashboard.
// - "Bill" opens a printable bill for the order in a new tab.
// Prop: onUnauthorized (called when the admin session has expired).

import { useEffect, useState } from 'react'
import { patchJSON } from '../../api'
import useFetch, { useAdminFetch } from '../../hooks/useFetch'
import OrderStatusBadge from '../OrderStatusBadge'
import VegIcon from '../VegIcon'
import { isActiveOrder, paymentLabel } from '../../utils/orderStatus'

const REFRESH_MS = 20000

// The single "next step" button shown for each active order
const nextStep = {
  placed: { status: 'preparing', label: 'Accept & start preparing' },
  preparing: { status: 'out_for_delivery', label: 'Send out for delivery' },
  out_for_delivery: { status: 'delivered', label: 'Mark delivered' },
}

const filters = [
  { value: 'active', label: 'Active' },
  { value: '', label: 'All' },
  { value: 'placed', label: 'New' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'out_for_delivery', label: 'Out for delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'awaiting_payment', label: 'Awaiting payment' },
  { value: 'refunds', label: 'Refunds due' },
]

const formatTime = (iso) => new Date(iso).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })

const OrdersTab = ({ onUnauthorized }) => {
  const [status, setStatus] = useState('active')
  const [restaurant, setRestaurant] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [actionError, setActionError] = useState('')
  const { data: orders, error, isLoading, reload, setData } = useAdminFetch('/api/orders', { status, restaurant }, onUnauthorized)
  const { data: restaurants } = useFetch('/api/restaurants')

  useEffect(() => {
    const timer = setInterval(reload, REFRESH_MS)
    return () => clearInterval(timer)
  }, [reload])

  const updateStatus = async (order, newStatus) => {
    if (newStatus === 'cancelled' && !window.confirm(`Cancel order #${order.orderNumber}?`)) return
    setActionError('')
    setBusyId(order._id)
    try {
      const updated = newStatus === 'refunded'
        ? await patchJSON(`/api/orders/${order._id}/refunded`)
        : await patchJSON(`/api/orders/${order._id}`, { status: newStatus })
      setData((prev) => prev.map((o) => (o._id === updated._id ? updated : o)))
    } catch (err) {
      if (err.status === 401) return onUnauthorized()
      setActionError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  const newCount = (orders || []).filter((o) => o.status === 'placed').length

  return (
    <div>
      <div className='mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex flex-wrap gap-2'>
          {filters.map((f) => (
            <button
              key={f.value || 'all'}
              type='button'
              onClick={() => setStatus(f.value)}
              className={`rounded-full border px-3 py-1 text-sm font-semibold transition ${
                status === f.value ? 'border-primary bg-primary text-white' : 'bg-white text-dark hover:border-primary'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <select value={restaurant} onChange={(e) => setRestaurant(e.target.value)} aria-label='Filter by restaurant' className='rounded border bg-white px-3 py-2 text-sm'>
          <option value=''>All restaurants</option>
          {(restaurants || []).map((r) => (
            <option key={r._id} value={r._id}>{r.name}</option>
          ))}
        </select>
      </div>

      {newCount > 0 && (
        <p className='mb-4 rounded bg-blue-50 p-3 font-semibold text-blue-800'>
          🔔 {newCount} new {newCount > 1 ? 'orders are' : 'order is'} waiting to be accepted
        </p>
      )}
      {(error || actionError) && <p className='mb-4 text-red-600'>{actionError || error.message}</p>}
      <p className='mb-4 text-xs text-gray-500'>This list refreshes every {REFRESH_MS / 1000} seconds.</p>

      {isLoading && !orders ? (
        <p className='text-gray-700'>Loading orders...</p>
      ) : orders?.length === 0 ? (
        <p className='text-gray-700'>No orders here.</p>
      ) : (
        <ul className='grid grid-cols-1 gap-4 xl:grid-cols-2'>
          {orders?.map((o) => (
            <li key={o._id} className={`rounded-lg bg-white p-5 shadow ${o.status === 'placed' ? 'ring-2 ring-blue-300' : ''}`}>
              <div className='mb-2 flex items-start justify-between gap-3'>
                <div>
                  <p className='font-bold text-dark'>#{o.orderNumber} · {o.restaurant?.name || 'Deleted restaurant'}</p>
                  <p className='text-xs text-gray-500'>{formatTime(o.createdAt)}</p>
                </div>
                <OrderStatusBadge status={o.status} />
              </div>

              <ul className='mb-3 space-y-1 text-sm'>
                {o.items.map((item) => (
                  <li key={item.name} className='flex items-center gap-2'>
                    <VegIcon isVeg={item.isVeg} /> {item.name} × {item.quantity}
                  </li>
                ))}
              </ul>
              {o.note && <p className='mb-2 text-sm italic text-gray-600'>Note: {o.note}</p>}

              <div className='mb-3 rounded bg-gray-50 p-3 text-sm text-gray-700'>
                <p className='font-semibold text-dark'>{o.customer.name} · <a href={`tel:${o.customer.phone}`} className='text-primary'>{o.customer.phone}</a></p>
                <p>{o.address.line}{o.address.landmark && `, near ${o.address.landmark}`}</p>
                {o.location?.lat !== undefined && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${o.location.lat},${o.location.lng}`}
                    target='_blank'
                    rel='noreferrer'
                    className='text-xs font-semibold text-primary'
                  >
                    Open on map{o.distanceKm !== null && ` (${o.distanceKm} km)`} →
                  </a>
                )}
              </div>

              <div className='flex flex-wrap items-center justify-between gap-3'>
                <p className='font-bold text-dark'>
                  ₹{o.total}{' '}
                  <span className={`text-xs font-semibold ${o.paymentStatus === 'paid' ? 'text-green-700' : o.paymentStatus === 'refund_needed' ? 'text-red-700' : 'text-gray-500'}`}>
                    {paymentLabel(o)}
                  </span>
                  {o.razorpayPaymentId && <span className='block text-xs font-normal text-gray-500'>{o.razorpayPaymentId}</span>}
                </p>
                <div className='flex flex-wrap gap-2'>
                  {/* printable bill (opens in a new tab, Ctrl+P / Save as PDF there) */}
                  <a
                    href={`/orders/${o._id}/bill?admin=1`}
                    target='_blank'
                    rel='noreferrer'
                    className='rounded border border-gray-400 px-3 py-1.5 text-sm font-semibold text-dark hover:border-dark'
                  >
                    Bill
                  </a>
                  {o.paymentStatus === 'refund_needed' && (
                    <button
                      type='button'
                      disabled={busyId === o._id}
                      onClick={() => window.confirm('Refund this payment from the Razorpay dashboard first. Mark it as refunded now?') && updateStatus(o, 'refunded')}
                      className='rounded bg-accent px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60'
                    >
                      Mark refunded
                    </button>
                  )}
                  {nextStep[o.status] && (
                    <button
                      type='button'
                      disabled={busyId === o._id}
                      onClick={() => updateStatus(o, nextStep[o.status].status)}
                      className='rounded bg-green-700 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60'
                    >
                      {nextStep[o.status].label}
                    </button>
                  )}
                  {isActiveOrder(o.status) && (
                    <button
                      type='button'
                      disabled={busyId === o._id}
                      onClick={() => updateStatus(o, 'cancelled')}
                      className='rounded border border-primary px-3 py-1.5 text-sm font-semibold text-primary disabled:opacity-60'
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default OrdersTab
