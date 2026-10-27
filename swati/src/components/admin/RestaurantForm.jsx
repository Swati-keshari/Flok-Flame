// RestaurantForm: add or edit a restaurant (used by RestaurantsTab).
// The location is picked by clicking on the map (LocationPicker) or "Use my current location".
// Props: restaurant (null when adding), onSave(formData), onCancel.

import { useState } from 'react'
import InputField from '../InputField'
import LocationPicker from './LocationPicker'

const emptyForm = {
  name: '',
  description: '',
  cuisines: '',
  address: '',
  city: '',
  phone: '',
  image: '',
  rating: '4',
  priceForTwo: '500',
  openTime: '11:00',
  closeTime: '23:00',
  totalTables: '10',
  deliveryRadiusKm: '10',
  lat: '',
  lng: '',
}

const toForm = (r) => ({
  ...emptyForm,
  ...Object.fromEntries(Object.keys(emptyForm).map((k) => [k, r[k] ?? emptyForm[k]])),
  cuisines: (r.cuisines || []).join(', '),
  lat: r.location?.coordinates[1] ?? '',
  lng: r.location?.coordinates[0] ?? '',
})

const RestaurantForm = ({ restaurant, onSave, onCancel }) => {
  const [form, setForm] = useState(restaurant ? toForm(restaurant) : emptyForm)
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const pickLocation = ({ lat, lng }) => setForm((prev) => ({ ...prev, lat, lng }))

  const useMyLocation = () => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => pickLocation({ lat: Number(pos.coords.latitude.toFixed(6)), lng: Number(pos.coords.longitude.toFixed(6)) }),
      () => setError('Could not get your location')
    )
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (form.lat === '' || form.lng === '') return setError('Pick the restaurant location on the map')
    setError('')
    setIsSaving(true)
    try {
      await onSave({
        ...form,
        rating: Number(form.rating),
        priceForTwo: Number(form.priceForTwo),
        totalTables: Number(form.totalTables),
        deliveryRadiusKm: Number(form.deliveryRadiusKm),
      })
    } catch (err) {
      setError(err.message)
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className='mb-6 rounded-lg bg-white p-6 shadow'>
      <h2 className='mb-4 text-xl font-bold text-dark'>{restaurant ? `Edit ${restaurant.name}` : 'Add Restaurant'}</h2>
      <div className='grid grid-cols-1 gap-x-6 md:grid-cols-2'>
        <InputField label='Name' name='name' value={form.name} onChange={handleChange} placeholder='Restaurant name' required />
        <InputField label='Cuisines (comma separated)' name='cuisines' value={form.cuisines} onChange={handleChange} placeholder='North Indian, Chinese' />
        <InputField label='Address' name='address' value={form.address} onChange={handleChange} placeholder='Street, area' required />
        <InputField label='City' name='city' value={form.city} onChange={handleChange} placeholder='City' />
        <InputField label='Phone' name='phone' type='tel' value={form.phone} onChange={handleChange} placeholder='+91 ...' />
        <InputField label='Image URL (optional)' name='image' type='url' value={form.image} onChange={handleChange} placeholder='https://...' />
        <InputField label='Rating (0-5)' name='rating' type='number' value={form.rating} onChange={handleChange} minValue='0' step='0.1' />
        <InputField label='Price for two (₹)' name='priceForTwo' type='number' value={form.priceForTwo} onChange={handleChange} minValue='0' />
        <InputField label='Opens at' name='openTime' type='time' value={form.openTime} onChange={handleChange} required />
        <InputField label='Closes at (can be after midnight; same as opening = 24 hours)' name='closeTime' type='time' value={form.closeTime} onChange={handleChange} required />
        <InputField label='Total tables' name='totalTables' type='number' value={form.totalTables} onChange={handleChange} minValue='1' required />
        <InputField label='Delivery radius (km, 0 = no delivery)' name='deliveryRadiusKm' type='number' value={form.deliveryRadiusKm} onChange={handleChange} minValue='0' step='0.5' required />
        <div className='mb-4 md:col-span-2'>
          <label htmlFor='description' className='block text-dark mb-2 font-semibold'>Description</label>
          <textarea id='description' name='description' value={form.description} onChange={handleChange} rows='2' className='w-full px-4 py-2 rounded border' />
        </div>
      </div>

      <div className='mb-4'>
        <div className='mb-2 flex flex-wrap items-center justify-between gap-2'>
          <p className='font-semibold text-dark'>Location <span className='font-normal text-sm text-gray-600'>(click on the map)</span></p>
          <button type='button' onClick={useMyLocation} className='text-sm font-semibold text-primary'>Use my current location</button>
        </div>
        <LocationPicker lat={form.lat} lng={form.lng} onPick={pickLocation} />
        <div className='mt-3 grid grid-cols-2 gap-4'>
          <InputField label='Latitude' name='lat' type='number' value={form.lat} onChange={handleChange} step='any' required />
          <InputField label='Longitude' name='lng' type='number' value={form.lng} onChange={handleChange} step='any' required />
        </div>
      </div>

      {error && <p className='mb-4 text-red-600'>{error}</p>}
      <div className='flex gap-3'>
        <button type='submit' disabled={isSaving} className='bg-primary px-6 py-2 rounded text-white font-semibold disabled:opacity-60'>
          {isSaving ? 'Saving...' : 'Save'}
        </button>
        <button type='button' onClick={onCancel} className='rounded border px-6 py-2 font-semibold text-dark'>Cancel</button>
      </div>
    </form>
  )
}

export default RestaurantForm
