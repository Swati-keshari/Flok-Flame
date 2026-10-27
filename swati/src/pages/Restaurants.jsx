// Restaurants page (route "/restaurants") — "Restaurants Near You".
// - Gets the user's current location (useCurrentLocation) and asks the backend for
//   restaurants sorted by distance.
// - Search box (name / cuisine / area) and a distance filter (2, 5, 10, 25 km).
// - Shows a map (RestaurantMap) and a list of RestaurantCard.
// If location is denied, all restaurants are shown (sorted by rating).

import { useEffect, useState } from 'react'
import { FaLocationCrosshairs, FaMagnifyingGlass } from 'react-icons/fa6'
import { Link } from 'react-router-dom'
import { getJSON } from '../api'
import useCurrentLocation from '../hooks/useCurrentLocation'
import RestaurantCard from '../components/RestaurantCard'
import RestaurantMap from '../components/RestaurantMap'

const distanceOptions = [
  { value: '', label: 'Any distance' },
  { value: '2', label: 'Within 2 km' },
  { value: '5', label: 'Within 5 km' },
  { value: '10', label: 'Within 10 km' },
  { value: '25', label: 'Within 25 km' },
]

const Restaurants = () => {
  const { location, status: locationStatus, error: locationError, requestLocation } = useCurrentLocation()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [maxKm, setMaxKm] = useState('')
  // Results are stored with the query they belong to, so "loading" is just
  // "the latest results are for an older query"
  const [result, setResult] = useState({ key: null, restaurants: [], error: '' })

  // "Debounce": wait until the user stops typing for 300 ms before searching,
  // instead of calling the server on every key press
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(id)
  }, [search])

  const params = {
    lat: location?.lat,
    lng: location?.lng,
    maxKm: location ? maxKm : '',
    search: debouncedSearch,
  }
  const queryKey = JSON.stringify(params)
  const waitingForLocation = locationStatus === 'loading'

  // Load restaurants whenever the query changes. We wait for the location first,
  // so the list doesn't load twice (once without and once with distance).
  // `ignore` drops answers from older requests that arrive late.
  useEffect(() => {
    if (waitingForLocation) return
    let ignore = false
    getJSON('/api/restaurants', JSON.parse(queryKey))
      .then((restaurants) => !ignore && setResult({ key: queryKey, restaurants, error: '' }))
      .catch((err) => !ignore && setResult({ key: queryKey, restaurants: [], error: err.message }))
    return () => { ignore = true }
  }, [queryKey, waitingForLocation])

  const isLoading = waitingForLocation || result.key !== queryKey
  const { restaurants, error } = result
  const nearest = restaurants[0]?.distanceKm

  return (
    <div className='min-h-screen bg-secondary py-12'>
      <div className='container mx-auto px-6'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl sm:text-4xl text-dark font-bold mb-4'>Restaurants Near You</h1>
          <div className='w-20 h-1 bg-primary mx-auto mb-4'></div>
          <p className='text-gray-700'>Order food home or book a table at great places near you</p>
        </div>

        {/* location status */}
        <div className='mb-6 flex flex-col items-center gap-2 text-sm'>
          {locationStatus === 'loading' && <p className='text-gray-700'>Getting your current location...</p>}
          {locationStatus === 'success' && (
            <p className='text-green-700'>Showing restaurants closest to your current location</p>
          )}
          {locationStatus === 'error' && <p className='text-red-600'>{locationError} Showing all restaurants instead.</p>}
          {locationStatus !== 'loading' && (
            <button
              type='button'
              onClick={requestLocation}
              className='flex items-center gap-2 rounded-full border border-primary px-4 py-2 font-semibold text-primary hover:bg-primary hover:text-white transition'
            >
              <FaLocationCrosshairs /> {locationStatus === 'success' ? 'Refresh my location' : 'Use my current location'}
            </button>
          )}
        </div>

        {/* filters */}
        <div className='mb-8 flex flex-col gap-4 md:flex-row'>
          <div className='relative flex-1'>
            <FaMagnifyingGlass className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
            <input
              type='search'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Search by name, cuisine or area...'
              aria-label='Search restaurants'
              className='w-full rounded border bg-white py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary'
            />
          </div>
          <select
            value={maxKm}
            onChange={(e) => setMaxKm(e.target.value)}
            disabled={!location}
            aria-label='Distance'
            className='rounded border bg-white px-4 py-3 disabled:opacity-50'
          >
            {distanceOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {error && <p className='mb-6 text-center text-red-600'>{error}</p>}

        {!isLoading && location && nearest > 25 && (
          <p className='mb-6 rounded bg-yellow-50 p-4 text-sm text-yellow-800'>
            The nearest restaurant is {nearest} km away. Admin can add restaurants near you from{' '}
            <Link to='/admin' className='font-semibold underline'>Admin Panel → Restaurants → "Add sample restaurants near me"</Link>.
          </p>
        )}

        {isLoading ? (
          <p className='text-center text-gray-700'>Loading restaurants...</p>
        ) : (
          <div className='flex flex-col gap-8 lg:flex-row'>
            <div className='lg:w-2/5 lg:sticky lg:top-24 lg:self-start'>
              <RestaurantMap restaurants={restaurants} userLocation={location} className='h-80 lg:h-[70vh]' />
            </div>
            <div className='lg:w-3/5'>
              {restaurants.length === 0 ? (
                <div className='text-center text-gray-700'>
                  <p className='mb-3'>
                    {maxKm && location ? `No restaurants within ${maxKm} km of you.` : 'No restaurants found. Try a different search.'}
                  </p>
                  {maxKm && location && (
                    <button type='button' onClick={() => setMaxKm('')} className='rounded-full bg-primary px-6 py-2 font-semibold text-white'>
                      Show nearest restaurants
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <p className='mb-4 text-sm text-gray-600'>{restaurants.length} restaurants found</p>
                  <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
                    {restaurants.map((r) => (
                      <RestaurantCard key={r._id} restaurant={r} />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Restaurants
