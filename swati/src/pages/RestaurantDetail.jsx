// One restaurant's page (route "/restaurants/:id").
// Header with photo, rating, open/closed badge and hours, then 3 tabs:
//   - Order Online  → RestaurantMenu (add dishes to the cart)
//   - Book a Table  → BookTableForm
//   - Info & Location → map, directions link, phone
// The active tab is kept in the URL (?tab=order|book|info) so it survives refresh.

import { Link, useParams, useSearchParams } from 'react-router-dom'
import { FaArrowLeft, FaClock, FaLocationDot, FaMotorcycle, FaPhone, FaStar } from 'react-icons/fa6'
import useFetch from '../hooks/useFetch'
import RestaurantMap from '../components/RestaurantMap'
import RestaurantMenu from '../components/RestaurantMenu'
import BookTableForm from '../components/BookTableForm'
import { restaurantImage } from '../utils/restaurantImage'
import { hoursLabel, isOpenNow } from '../utils/time'

const tabs = [
  { id: 'order', label: 'Order Online' },
  { id: 'book', label: 'Book a Table' },
  { id: 'info', label: 'Info & Location' },
]

const RestaurantDetail = () => {
  const { id } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = tabs.some((t) => t.id === searchParams.get('tab')) ? searchParams.get('tab') : 'order'
  const { data: restaurant, error, isLoading } = useFetch(`/api/restaurants/${id}`)

  if (isLoading) return <p className='py-20 text-center text-gray-700'>Loading...</p>
  if (error) {
    return (
      <div className='py-20 text-center'>
        <p className='mb-4 text-red-600'>{error.message}</p>
        <Link to='/restaurants' className='text-primary font-semibold'>Back to restaurants</Link>
      </div>
    )
  }

  const isOpen = isOpenNow(restaurant)
  const [lng, lat] = restaurant.location.coordinates

  return (
    <div className='min-h-screen bg-secondary py-10'>
      <div className='container mx-auto px-6'>
        <Link to='/restaurants' className='mb-6 inline-flex items-center gap-2 font-semibold text-primary'>
          <FaArrowLeft /> All restaurants
        </Link>

        {/* header */}
        <div className='mb-8 flex flex-col gap-6 md:flex-row'>
          <img src={restaurantImage(restaurant)} alt={restaurant.name} className='h-56 w-full rounded-lg object-cover md:w-80' />
          <div className='flex-1'>
            <div className='flex flex-wrap items-center gap-3'>
              <h1 className='text-3xl font-bold text-dark'>{restaurant.name}</h1>
              <span className='flex items-center gap-1 rounded bg-green-700 px-2 py-1 text-sm font-bold text-white'>
                {restaurant.rating} <FaStar className='text-xs' />
              </span>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isOpen ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}`}>
                {isOpen ? 'Open now' : 'Closed'}
              </span>
            </div>
            <p className='mb-3 text-gray-600'>{restaurant.cuisines.join(', ')} · ₹{restaurant.priceForTwo} for two</p>
            {restaurant.description && <p className='mb-3 text-dark'>{restaurant.description}</p>}
            <ul className='space-y-1 text-sm text-gray-700'>
              <li className='flex items-center gap-2'><FaLocationDot className='text-primary' /> {restaurant.address}</li>
              <li className='flex items-center gap-2'><FaClock className='text-primary' /> {hoursLabel(restaurant)}</li>
              <li className='flex items-center gap-2'><FaMotorcycle className='text-primary' /> Delivers within {restaurant.deliveryRadiusKm} km</li>
            </ul>
          </div>
        </div>

        {/* tabs */}
        <div className='mb-6 flex gap-2 overflow-x-auto border-b border-gray-300' role='tablist'>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type='button'
              role='tab'
              aria-selected={activeTab === tab.id}
              onClick={() => setSearchParams({ tab: tab.id }, { replace: true })}
              className={`shrink-0 border-b-2 px-4 py-2 font-semibold transition ${
                activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-gray-600 hover:text-dark'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'order' && <RestaurantMenu restaurant={restaurant} />}
        {activeTab === 'book' && <BookTableForm restaurant={restaurant} />}
        {activeTab === 'info' && (
          <div className='max-w-3xl'>
            <RestaurantMap restaurants={[restaurant]} className='h-72' />
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
              target='_blank'
              rel='noreferrer'
              className='mt-3 inline-block font-semibold text-primary'
            >
              Get directions →
            </a>
            {restaurant.phone && (
              <p className='mt-3 flex items-center gap-2 text-gray-700'>
                <FaPhone className='text-primary' /> <a href={`tel:${restaurant.phone}`}>{restaurant.phone}</a>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default RestaurantDetail
