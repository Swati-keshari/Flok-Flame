// Admin → Restaurants tab.
// - List of restaurants with Menu / Edit / Delete buttons.
// - "+ Add Restaurant" opens RestaurantForm; "Menu" opens MenuEditor.
// - "Add sample restaurants near me" replaces the demo restaurants with 12 new ones
//   around the admin's current GPS location (restaurants added by hand are kept).
// Prop: onUnauthorized.

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaStar } from 'react-icons/fa6'
import { deleteJSON, postJSON, putJSON } from '../../api'
import useFetch from '../../hooks/useFetch'
import RestaurantForm from './RestaurantForm'
import MenuEditor from './MenuEditor'
import { hoursLabel } from '../../utils/time'

const RestaurantsTab = ({ onUnauthorized }) => {
  const { data: restaurants, error, isLoading, reload } = useFetch('/api/restaurants')
  // null = form closed, 'new' = adding, object = editing that restaurant
  const [editing, setEditing] = useState(null)
  const [menuFor, setMenuFor] = useState(null)
  const [actionError, setActionError] = useState('')
  const [notice, setNotice] = useState('')
  const [isAddingSamples, setIsAddingSamples] = useState(false)

  const addSamplesNearMe = () => {
    if (!window.confirm('Replace the old sample restaurants with 12 new ones around your current location? Restaurants you added yourself are kept.')) return
    if (!navigator.geolocation) return setActionError('Your browser does not support location')
    setActionError('')
    setNotice('')
    setIsAddingSamples(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await withAuth(() =>
            postJSON('/api/restaurants/samples', { lat: pos.coords.latitude, lng: pos.coords.longitude })
          )
          setNotice(res.message)
          reload()
        } catch (err) {
          setActionError(err.message)
        } finally {
          setIsAddingSamples(false)
        }
      },
      () => {
        setActionError('Could not get your location. Allow location access in the browser and try again.')
        setIsAddingSamples(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const withAuth = async (fn) => {
    try {
      return await fn()
    } catch (err) {
      if (err.status === 401) onUnauthorized()
      throw err
    }
  }

  const save = async (form) => {
    await withAuth(() =>
      editing === 'new' ? postJSON('/api/restaurants', form) : putJSON(`/api/restaurants/${editing._id}`, form)
    )
    setEditing(null)
    reload()
  }

  const remove = async (restaurant) => {
    if (!window.confirm(`Delete ${restaurant.name}? Its old bookings will stay in the Bookings tab.`)) return
    setActionError('')
    try {
      await withAuth(() => deleteJSON(`/api/restaurants/${restaurant._id}`))
      reload()
    } catch (err) {
      setActionError(err.message)
    }
  }

  return (
    <div>
      {editing ? (
        <RestaurantForm
          key={editing === 'new' ? 'new' : editing._id}
          restaurant={editing === 'new' ? null : editing}
          onSave={save}
          onCancel={() => setEditing(null)}
        />
      ) : (
        <div className='mb-6 flex flex-wrap gap-3'>
          <button type='button' onClick={() => setEditing('new')} className='bg-primary px-6 py-2 rounded text-white font-semibold'>
            + Add Restaurant
          </button>
          <button
            type='button'
            onClick={addSamplesNearMe}
            disabled={isAddingSamples}
            className='rounded border border-accent px-6 py-2 font-semibold text-accent hover:bg-accent hover:text-white transition disabled:opacity-60'
          >
            {isAddingSamples ? 'Getting your location...' : 'Add sample restaurants near me'}
          </button>
        </div>
      )}

      {menuFor && (
        <MenuEditor key={menuFor._id} restaurant={menuFor} onClose={() => setMenuFor(null)} onUnauthorized={onUnauthorized} />
      )}

      {notice && <p className='mb-4 text-green-700'>{notice}</p>}
      {(error || actionError) && <p className='mb-4 text-red-600'>{actionError || error.message}</p>}

      {isLoading ? (
        <p className='text-gray-700'>Loading restaurants...</p>
      ) : restaurants?.length === 0 ? (
        <p className='text-gray-700'>No restaurants yet. Add your first one!</p>
      ) : (
        <ul className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          {restaurants?.map((r) => (
            <li key={r._id} className='rounded-lg bg-white p-5 shadow'>
              <div className='mb-1 flex items-start justify-between gap-2'>
                <Link to={`/restaurants/${r._id}`} className='text-lg font-bold text-dark hover:text-primary'>{r.name}</Link>
                <span className='flex shrink-0 items-center gap-1 text-sm font-semibold text-green-700'>{r.rating} <FaStar className='text-xs' /></span>
              </div>
              <p className='text-sm text-gray-600'>{r.cuisines.join(', ')}</p>
              <p className='text-sm text-gray-600'>{r.address}{r.city && `, ${r.city}`}</p>
              <p className='mt-1 text-xs text-gray-500'>
                {hoursLabel(r)} · {r.totalTables} tables · ₹{r.priceForTwo} for two · delivers {r.deliveryRadiusKm ?? 10} km
              </p>
              <div className='mt-3 flex gap-2'>
                <button type='button' onClick={() => { setMenuFor(r); setEditing(null); window.scrollTo({ top: 0, behavior: 'smooth' }) }} className='rounded bg-green-700 px-3 py-1 text-sm text-white'>Menu</button>
                <button type='button' onClick={() => { setEditing(r); setMenuFor(null); window.scrollTo({ top: 0, behavior: 'smooth' }) }} className='rounded bg-accent px-3 py-1 text-sm text-white'>Edit</button>
                <button type='button' onClick={() => remove(r)} className='rounded border border-primary px-3 py-1 text-sm text-primary'>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default RestaurantsTab
