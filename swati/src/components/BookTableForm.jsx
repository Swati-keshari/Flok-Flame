// BookTableForm: the "Book a Table" tab of a restaurant page.
// When a date and time are picked it asks the server how many tables are free.
// On submit it posts to /api/reservations and shows a confirmation popup.
// Prop: restaurant.

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getJSON, postJSON } from '../api'
import { useCustomer } from '../context/customerContext'
import InputField from './InputField'
import { hoursLabel } from '../utils/time'

const emptyBooking = {
  fullname: '',
  email: '',
  phone: '',
  date: '',
  time: '',
  partySize: '2',
  tableRef: '',
  specialRequest: '',
}

const BookTableForm = ({ restaurant }) => {
  const { customer } = useCustomer()
  // Logged-in customers get their name, email and phone filled in
  const startBooking = customer ? { ...emptyBooking, fullname: customer.name, email: customer.email, phone: customer.phone } : emptyBooking
  const [booking, setBooking] = useState(startBooking)
  const [availability, setAvailability] = useState({ key: null, available: null })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [confirmed, setConfirmed] = useState(null)

  // Check free tables whenever date + time are both picked
  const slotKey = booking.date && booking.time ? `${booking.date}|${booking.time}` : null
  useEffect(() => {
    if (!slotKey) return
    let ignore = false
    const [date, time] = slotKey.split('|')
    getJSON(`/api/restaurants/${restaurant._id}/availability`, { date, time })
      .then((res) => !ignore && setAvailability({ key: slotKey, available: res.available }))
      .catch(() => !ignore && setAvailability({ key: slotKey, available: null }))
    return () => { ignore = true }
  }, [restaurant._id, slotKey])

  const handleChange = (event) => {
    const { name, value } = event.target
    setBooking((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitError('')
    setIsSubmitting(true)
    try {
      const saved = await postJSON('/api/reservations', {
        ...booking,
        partySize: Number(booking.partySize),
        restaurant: restaurant._id,
      })
      setConfirmed(saved)
      setBooking(startBooking)
    } catch (err) {
      setSubmitError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const slotAvailable = slotKey && availability.key === slotKey ? availability.available : null

  return (
    <div className='max-w-2xl rounded bg-gray-50 p-8 shadow'>
      <h2 className='mb-6 text-2xl font-bold text-dark'>Book a Table</h2>
      <form onSubmit={handleSubmit}>
        <div className='grid grid-cols-1 gap-x-6 md:grid-cols-2'>
          <InputField label='Full Name' name='fullname' value={booking.fullname} onChange={handleChange} placeholder='Your name' required />
          <InputField label='Email' name='email' type='email' value={booking.email} onChange={handleChange} placeholder='you@example.com' required />
          <InputField label='Phone' name='phone' type='tel' value={booking.phone} onChange={handleChange} placeholder='Your phone number' required />
          <InputField label='Guests' name='partySize' type='number' value={booking.partySize} onChange={handleChange} minValue='1' required />
          <InputField label='Date' name='date' type='date' value={booking.date} onChange={handleChange} required />
          <InputField label={`Time (${hoursLabel(restaurant)})`} name='time' type='time' value={booking.time} onChange={handleChange} required />
          <div className='mb-4 md:col-span-2'>
            <label htmlFor='tableRef' className='block text-dark mb-2 font-semibold'>Table Preference</label>
            <select id='tableRef' name='tableRef' value={booking.tableRef} onChange={handleChange} className='w-full px-4 py-2 rounded border'>
              <option value=''>No preference</option>
              <option value='indoor'>Indoor</option>
              <option value='outdoor'>Outdoor</option>
              <option value='window'>Window seat</option>
            </select>
          </div>
          <div className='mb-4 md:col-span-2'>
            <label htmlFor='specialRequest' className='block text-dark mb-2 font-semibold'>Special Request</label>
            <textarea id='specialRequest' name='specialRequest' value={booking.specialRequest} onChange={handleChange} rows='3' placeholder='Birthday, anniversary, allergies...' className='w-full px-4 py-2 rounded border placeholder:text-xs' />
          </div>
        </div>

        {slotAvailable !== null && (
          <p className={`mb-4 text-sm font-semibold ${slotAvailable > 0 ? 'text-green-700' : 'text-red-600'}`}>
            {slotAvailable > 0 ? `${slotAvailable} tables available for this slot` : 'No tables left for this slot, please pick another time'}
          </p>
        )}
        {submitError && <p className='mb-4 text-red-600'>{submitError}</p>}

        <button
          type='submit'
          disabled={isSubmitting || slotAvailable === 0}
          className='w-full bg-primary px-8 py-3 rounded text-white font-semibold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed'
        >
          {isSubmitting ? 'Booking...' : 'Confirm Booking'}
        </button>
      </form>

      {confirmed && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8' role='presentation' onClick={() => setConfirmed(null)}>
          <div className='relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl' role='dialog' aria-modal='true' aria-labelledby='booking-title' onClick={(e) => e.stopPropagation()}>
            <button type='button' onClick={() => setConfirmed(null)} aria-label='Close confirmation' className='absolute right-4 top-3 text-2xl text-gray-600 hover:text-dark'>&times;</button>
            <h2 id='booking-title' className='mb-2 text-2xl font-bold text-dark'>Table Booked!</h2>
            <p className='mb-5 text-gray-700'>Your table at {confirmed.restaurant?.name} is reserved.</p>
            <dl className='grid grid-cols-2 gap-x-4 gap-y-3 text-sm'>
              <dt className='font-semibold text-dark'>Name</dt>
              <dd className='wrap-break-word text-gray-700'>{confirmed.fullname}</dd>
              <dt className='font-semibold text-dark'>Date</dt>
              <dd className='text-gray-700'>{confirmed.date}</dd>
              <dt className='font-semibold text-dark'>Time</dt>
              <dd className='text-gray-700'>{confirmed.time}</dd>
              <dt className='font-semibold text-dark'>Guests</dt>
              <dd className='text-gray-700'>{confirmed.partySize}</dd>
              <dt className='font-semibold text-dark'>Booking ID</dt>
              <dd className='break-all text-gray-700'>{confirmed._id}</dd>
            </dl>
            <button type='button' onClick={() => setConfirmed(null)} className='mt-6 w-full rounded bg-primary px-6 py-3 font-semibold text-white'>Done</button>
            <Link to='/my-bookings?tab=bookings' className='mt-3 block text-center text-sm font-semibold text-primary'>View or cancel in My Orders & Bookings</Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default BookTableForm
