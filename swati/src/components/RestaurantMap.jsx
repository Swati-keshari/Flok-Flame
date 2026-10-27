// RestaurantMap: an OpenStreetMap map (using Leaflet / react-leaflet).
// Red dots = restaurants (popup with a "Book a table" link), blue dot = the user.
// Props: restaurants, userLocation (optional), className (for height).
// Used on /restaurants and on a restaurant's Info tab.

import { useEffect, useMemo } from 'react'
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet'
import { Link } from 'react-router-dom'
import 'leaflet/dist/leaflet.css'

// Re-centres the map whenever the list of points changes
const FitBounds = ({ points }) => {
  const map = useMap()
  useEffect(() => {
    // No animation: an animation still running when the page changes makes Leaflet throw
    if (points.length === 1) map.setView(points[0], 14, { animate: false })
    else if (points.length > 1) map.fitBounds(points, { padding: [30, 30], animate: false })
  }, [map, points])
  return null
}

const RestaurantMap = ({ restaurants, userLocation, className = 'h-96' }) => {
  const points = useMemo(() => {
    const list = restaurants.map((r) => [r.location.coordinates[1], r.location.coordinates[0]])
    if (userLocation) list.push([userLocation.lat, userLocation.lng])
    return list
  }, [restaurants, userLocation])
  const center = points[0] || [28.6315, 77.2167]

  return (
    <MapContainer center={center} zoom={13} scrollWheelZoom={false} className={`w-full rounded-lg z-0 ${className}`}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      />
      <FitBounds points={points} />

      {userLocation && (
        <CircleMarker
          center={[userLocation.lat, userLocation.lng]}
          radius={9}
          pathOptions={{ color: '#1e3a8a', fillColor: '#3b82f6', fillOpacity: 0.9 }}
        >
          <Popup>You are here</Popup>
        </CircleMarker>
      )}

      {restaurants.map((r) => (
        <CircleMarker
          key={r._id}
          center={[r.location.coordinates[1], r.location.coordinates[0]]}
          radius={8}
          pathOptions={{ color: '#7f1d1d', fillColor: '#c41e3a', fillOpacity: 0.9 }}
        >
          <Popup>
            <p className='font-bold'>{r.name}</p>
            <p className='text-xs'>{r.cuisines.join(', ')}</p>
            {r.distanceKm !== undefined && <p className='text-xs'>{r.distanceKm} km away</p>}
            <Link to={`/restaurants/${r._id}`} className='text-primary font-semibold'>Book a table</Link>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  )
}

export default RestaurantMap
