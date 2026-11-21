
import { useEffect, useState } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap
} from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const hotelIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
})

const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
})

function MapUpdater({ position }) {
  const map = useMap()

  useEffect(() => {
    if (position) {
      map.fitBounds([position, map.getCenter()], {
        padding: [40, 40]
      })
    }
  }, [position, map])

  return null
}

export default function HotelMap({ hotel }) {
  const hotelPosition = [
    Number(hotel.latitude),
    Number(hotel.longitude)
  ]

  const [userPosition, setUserPosition] = useState(null)
  const [locationMessage, setLocationMessage] = useState('')

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage('Geolocation is not supported by this browser.')
      return
    }

    setLocationMessage('Getting your current location...')

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const currentPosition = [
          position.coords.latitude,
          position.coords.longitude
        ]

        setUserPosition(currentPosition)
        setLocationMessage('Your current location is shown on the map.')
      },
      (error) => {
        setLocationMessage(
          error.code === 1
            ? 'Location permission denied. Hotel location is still available.'
            : 'Unable to get your location. Please try again.'
        )
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  return (
    <div className="map-frame">
      <button
        type="button"
        onClick={getUserLocation}
        className="location-button"
      >
        Use my current location
      </button>

      {locationMessage && (
        <p role="status">{locationMessage}</p>
      )}

      <MapContainer
        center={hotelPosition}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={hotelPosition} icon={hotelIcon}>
          <Popup>{hotel.title} – Hotel location</Popup>
        </Marker>

        {userPosition && (
          <>
            <Marker position={userPosition} icon={userIcon}>
              <Popup>Your current location</Popup>
            </Marker>
            <MapUpdater position={userPosition} />
          </>
        )}
      </MapContainer>
    </div>
  )
}
