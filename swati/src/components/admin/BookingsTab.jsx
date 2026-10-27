// Admin → Table Bookings tab.
// Lists all bookings with filters (status, restaurant, date) and lets the admin
// Confirm, Cancel or Delete each one. Prop: onUnauthorized.

import { useState } from 'react'
import { deleteJSON, patchJSON } from '../../api'
import useFetch, { useAdminFetch } from '../../hooks/useFetch'
import StatusBadge from '../StatusBadge'

const BookingsTab = ({ onUnauthorized }) => {
  const [filters, setFilters] = useState({ status: '', restaurant: '', date: '' })
  const [actionError, setActionError] = useState('')
  const [busyId, setBusyId] = useState(null)
  const { data: bookings, error, isLoading, setData } = useAdminFetch('/api/reservations', filters, onUnauthorized)
  const { data: restaurants } = useFetch('/api/restaurants')

  const handleFilter = (event) => {
    const { name, value } = event.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const runAction = async (booking, action) => {
    if (action === 'delete' && !window.confirm(`Delete booking of ${booking.fullname}? This cannot be undone.`)) return
    setActionError('')
    setBusyId(booking._id)
    try {
      if (action === 'delete') {
        await deleteJSON(`/api/reservations/${booking._id}`)
        setData((prev) => prev.filter((b) => b._id !== booking._id))
      } else {
        const updated = await patchJSON(`/api/reservations/${booking._id}`, { status: action })
        setData((prev) => prev.map((b) => (b._id === updated._id ? updated : b)))
      }
    } catch (err) {
      if (err.status === 401) return onUnauthorized()
      setActionError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  const counts = (bookings || []).reduce((acc, b) => ({ ...acc, [b.status]: (acc[b.status] || 0) + 1 }), {})

  return (
    <div>
      <div className='mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3'>
        <select name='status' value={filters.status} onChange={handleFilter} aria-label='Filter by status' className='rounded border bg-white px-3 py-2'>
          <option value=''>All statuses</option>
          <option value='pending'>Pending</option>
          <option value='confirmed'>Confirmed</option>
          <option value='cancelled'>Cancelled</option>
        </select>
        <select name='restaurant' value={filters.restaurant} onChange={handleFilter} aria-label='Filter by restaurant' className='rounded border bg-white px-3 py-2'>
          <option value=''>All restaurants</option>
          <option value='none'>Fork & Flame (home page form)</option>
          {(restaurants || []).map((r) => (
            <option key={r._id} value={r._id}>{r.name}</option>
          ))}
        </select>
        <input type='date' name='date' value={filters.date} onChange={handleFilter} aria-label='Filter by date' className='rounded border bg-white px-3 py-2' />
      </div>

      {bookings && (
        <p className='mb-4 text-sm text-gray-600'>
          {bookings.length} bookings · {counts.pending || 0} pending · {counts.confirmed || 0} confirmed · {counts.cancelled || 0} cancelled
        </p>
      )}
      {(error || actionError) && <p className='mb-4 text-red-600'>{actionError || error.message}</p>}

      {isLoading ? (
        <p className='text-gray-700'>Loading bookings...</p>
      ) : bookings?.length === 0 ? (
        <p className='text-gray-700'>No bookings found.</p>
      ) : (
        <div className='overflow-x-auto rounded-lg bg-white shadow'>
          <table className='w-full text-left text-sm'>
            <thead className='bg-gray-100 text-dark'>
              <tr>
                <th className='px-4 py-3'>Date & Time</th>
                <th className='px-4 py-3'>Customer</th>
                <th className='px-4 py-3'>Restaurant</th>
                <th className='px-4 py-3'>Guests</th>
                <th className='px-4 py-3'>Status</th>
                <th className='px-4 py-3'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings?.map((b) => (
                <tr key={b._id} className='border-t align-top'>
                  <td className='px-4 py-3 whitespace-nowrap'>{b.date}<br /><span className='text-gray-500'>{b.time}</span></td>
                  <td className='px-4 py-3'>
                    <p className='font-semibold'>{b.fullname}</p>
                    <p className='text-gray-500'>{b.email}</p>
                    <p className='text-gray-500'>{b.phone}</p>
                    {b.specialRequest && <p className='mt-1 text-xs italic text-gray-600'>“{b.specialRequest}”</p>}
                  </td>
                  <td className='px-4 py-3'>{b.restaurant?.name || 'Fork & Flame'}</td>
                  <td className='px-4 py-3'>{b.partySize}{b.tableRef && <span className='block text-gray-500'>{b.tableRef}</span>}</td>
                  <td className='px-4 py-3'><StatusBadge status={b.status} /></td>
                  <td className='px-4 py-3'>
                    <div className='flex flex-wrap gap-2'>
                      {b.status !== 'confirmed' && (
                        <button type='button' disabled={busyId === b._id} onClick={() => runAction(b, 'confirmed')} className='rounded bg-green-700 px-3 py-1 text-white disabled:opacity-60'>Confirm</button>
                      )}
                      {b.status !== 'cancelled' && (
                        <button type='button' disabled={busyId === b._id} onClick={() => runAction(b, 'cancelled')} className='rounded bg-gray-600 px-3 py-1 text-white disabled:opacity-60'>Cancel</button>
                      )}
                      <button type='button' disabled={busyId === b._id} onClick={() => runAction(b, 'delete')} className='rounded border border-primary px-3 py-1 text-primary disabled:opacity-60'>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default BookingsTab
