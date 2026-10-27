// LocationPicker: a small map; clicking it picks a latitude/longitude (used by RestaurantForm).
// Props: lat, lng (current point, shown as a red dot), onPick({ lat, lng }).

import { useEffect } from 'react'
import { CircleMarker, MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

// Listens for clicks on the map (react-leaflet hooks only work inside <MapContainer>,
// so this is a tiny component that renders nothing)
const ClickHandler = ({ onPick }) => {
  useMapEvents({
    click: (e) => onPick({ lat: Number(e.latlng.lat.toFixed(6)), lng: Number(e.latlng.lng.toFixed(6)) }),
  })
  return null
}

// Keeps the picked point in view when it changes from outside (typing / "use my location")
const FollowPoint = ({ lat, lng }) => {
  const map = useMap()
  useEffect(() => {
    if (lat !== null) map.panTo([lat, lng], { animate: false })
  }, [map, lat, lng])
  return null
}

const LocationPicker = ({ lat, lng, onPick }) => {
  const hasPoint = lat !== '' && lng !== '' && !Number.isNaN(Number(lat)) && !Number.isNaN(Number(lng))
  const point = hasPoint ? [Number(lat), Number(lng)] : null

  return (
    <MapContainer center={point || [28.6315, 77.2167]} zoom={13} className='h-64 w-full rounded z-0'>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      />
      <ClickHandler onPick={onPick} />
      <FollowPoint lat={point?.[0] ?? null} lng={point?.[1] ?? null} />
      {point && (
        <CircleMarker center={point} radius={9} pathOptions={{ color: '#7f1d1d', fillColor: '#c41e3a', fillOpacity: 0.9 }} />
      )}
    </MapContainer>
  )
}

export default LocationPicker
