// useCurrentLocation(): asks the browser for the user's GPS location when the page opens.
// Returns { location: { lat, lng } | null, status: "loading" | "success" | "error", error, requestLocation }.
// requestLocation() asks again (e.g. after the user allows location in browser settings).
// Used by pages/Restaurants.jsx to show restaurants nearest to the user.

import { useCallback, useEffect, useState } from 'react'

const hasGeolocation = typeof navigator !== 'undefined' && 'geolocation' in navigator

// Asks the browser for the user's current position on mount.
// status: 'loading' | 'success' | 'error'
const useCurrentLocation = () => {
  const [location, setLocation] = useState(null)
  const [status, setStatus] = useState(hasGeolocation ? 'loading' : 'error')
  const [error, setError] = useState(hasGeolocation ? '' : 'Your browser does not support location')

  const locate = useCallback(() => {
    if (!hasGeolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setStatus('success')
        setError('')
      },
      (err) => {
        setStatus('error')
        setError(
          err.code === err.PERMISSION_DENIED
            ? 'Location permission denied. Allow location access in your browser and try again.'
            : 'Could not get your location. Please try again.'
        )
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )
  }, [])

  useEffect(() => {
    locate()
  }, [locate])

  const requestLocation = () => {
    if (!hasGeolocation) return
    setStatus('loading')
    locate()
  }

  return { location, status, error, requestLocation }
}

export default useCurrentLocation
