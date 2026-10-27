// Reservation section on the home page ("Make a Reservation").
// Books a table at Fork & Flame itself (no restaurant id is sent).
// Posts the form to /api/reservations and shows a confirmation popup with the Booking ID.

import { useState } from 'react'
import InputField from '../components/InputField'
import { postJSON } from '../api'

const emptyReservation = {
  fullname: '',
  email: '',
  phone: '',
  date: '',
  time: '',
  partySize: '',
  tableRef: '',
  specialRequest: '',
}

const Reservation = () => {
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false)
  const [reservation, setReservation] = useState(emptyReservation)
  const [confirmed, setConfirmed] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    setReservation((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      const saved = await postJSON('/api/reservations', {
        ...reservation,
        partySize: Number(reservation.partySize),
      })
      setConfirmed(saved)
      setReservation(emptyReservation)
      setIsConfirmationOpen(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div id='reservation' className='w-full bg-secondary py-20'>
        <div className='container mx-auto py-6'>
            <div className='text-center mb-12'>
                <h1 className='text-3xl text-dark font-bold mb-4'>
                    Make a Reservation</h1>
                <div className='w-20 h-1 bg-primary mx-auto'></div>
                <p className='text-gray-700'>Book your table in advance to ensure the best dining experience</p>
            </div> 
            {/* reservation form*/}
           <div className='max-w-2xl mx-auto bg-gray-50 p-8 rounded shadow'>
            {/*booking form*/}
            <form onSubmit={handleSubmit}>
               <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
               <InputField label='Full Name' name='fullname' value={reservation.fullname} onChange={handleChange} placeholder='Your name' required />
               <InputField label='Email' name='email' type='email' value={reservation.email} onChange={handleChange} placeholder='you@example.com' required />
               <InputField label='Phone' name='phone' type='tel' value={reservation.phone} onChange={handleChange} placeholder='Your phone number' required />
               <InputField label='Date' name='date' type='date' value={reservation.date} onChange={handleChange} required />
               <InputField label='Time' name='time' type='time' value={reservation.time} onChange={handleChange} required />
               <InputField label='Party Size' name='partySize' type='number' value={reservation.partySize} onChange={handleChange} minValue='1' required />
               <div className='mb-4'>
                 <label htmlFor='tableRef' className='block text-dark mb-2 font-semibold'>Table Preference</label>
                 <select id='tableRef' name='tableRef' value={reservation.tableRef} onChange={handleChange} className='w-full px-4 py-2 rounded border'>
                   <option value=''>No preference</option>
                   <option value='indoor'>Indoor</option>
                   <option value='outdoor'>Outdoor</option>
                   <option value='window'>Window seat</option>
                 </select>
               </div>
               <div className='mb-4 md:col-span-2'>
                 <label htmlFor='specialRequest' className='block text-dark mb-2 font-semibold'>Special Request</label>
                 <textarea id='specialRequest' name='specialRequest' value={reservation.specialRequest} onChange={handleChange} rows='4' placeholder='Add any special requests' className='w-full px-4 py-2 rounded border placeholder:text-xs' />
               </div>
               </div>
              {error && <p className='mb-4 text-red-600'>{error}</p>}
              <button type='submit' disabled={isSubmitting} className='bg-primary px-8 py-3 rounded text-white cursor-pointer disabled:opacity-60'>
                {isSubmitting ? 'Booking...' : 'Confirm Reservation'}
              </button>
            </form>

           </div>
        </div>
        {isConfirmationOpen && confirmed && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8' role='presentation' onClick={() => setIsConfirmationOpen(false)}>
            <div className='relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl' role='dialog' aria-modal='true' aria-labelledby='reservation-confirmation-title' onClick={(event) => event.stopPropagation()}>
              <button type='button' onClick={() => setIsConfirmationOpen(false)} aria-label='Close confirmation' className='absolute right-4 top-3 text-2xl text-gray-600 hover:text-dark'>&times;</button>
              <h2 id='reservation-confirmation-title' className='mb-2 text-2xl font-bold text-dark'>Reservation Confirmed</h2>
              <p className='mb-5 text-gray-700'>Your reservation details are ready.</p>
              <dl className='grid grid-cols-2 gap-x-4 gap-y-3 text-sm'>
                <dt className='font-semibold text-dark'>Name</dt>
                <dd className='wrap-break-word text-gray-700'>{confirmed.fullname}</dd>
                <dt className='font-semibold text-dark'>Date</dt>
                <dd className='text-gray-700'>{confirmed.date}</dd>
                <dt className='font-semibold text-dark'>Time</dt>
                <dd className='text-gray-700'>{confirmed.time}</dd>
                <dt className='font-semibold text-dark'>Party size</dt>
                <dd className='text-gray-700'>{confirmed.partySize}</dd>
                <dt className='font-semibold text-dark'>Table preference</dt>
                <dd className='text-gray-700'>{confirmed.tableRef || 'No preference'}</dd>
                <dt className='font-semibold text-dark'>Booking ID</dt>
                <dd className='break-all text-gray-700'>{confirmed._id}</dd>
              </dl>
              <button type='button' onClick={() => setIsConfirmationOpen(false)} className='mt-6 w-full rounded bg-primary px-6 py-3 font-semibold text-white'>Booking confirm</button>
            </div>
          </div>
        )}
    </div>
  )
}

export default Reservation
