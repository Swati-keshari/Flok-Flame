// RestaurantCard: one restaurant in the list on /restaurants.
// Shows photo, rating, name, distance, cuisines, price for two, open/closed and hours.
// Clicking the card opens that restaurant's page. Prop: restaurant.

import { Link } from 'react-router-dom'
import { FaLocationDot, FaStar } from 'react-icons/fa6'
import { restaurantImage } from '../utils/restaurantImage'
import { hoursLabel, isOpenNow } from '../utils/time'

const RestaurantCard = ({ restaurant }) => {
  return (
    <Link
      to={`/restaurants/${restaurant._id}`}
      className='group block overflow-hidden rounded-lg bg-white shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl'
    >
      <div className='relative overflow-hidden'>
        <img
          className='h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105'
          src={restaurantImage(restaurant)}
          alt={restaurant.name}
        />
        <span className='absolute right-3 top-3 flex items-center gap-1 rounded bg-green-700 px-2 py-1 text-sm font-bold text-white'>
          {restaurant.rating} <FaStar className='text-xs' />
        </span>
      </div>
      <div className='p-4'>
        <div className='flex items-start justify-between gap-2'>
          <h2 className='text-lg font-bold text-dark'>{restaurant.name}</h2>
          {restaurant.distanceKm !== undefined && (
            <span className='shrink-0 text-sm font-semibold text-primary'>{restaurant.distanceKm} km</span>
          )}
        </div>
        <p className='text-sm text-gray-600'>{restaurant.cuisines.join(', ')}</p>
        <div className='mt-2 flex items-center justify-between text-sm text-gray-700'>
          <span className='flex items-center gap-1'>
            <FaLocationDot className='text-primary' /> {restaurant.city || restaurant.address}
          </span>
          <span>₹{restaurant.priceForTwo} for two</span>
        </div>
        <p className='mt-2 text-xs text-gray-500'>
          <span className={`mr-2 font-semibold ${isOpenNow(restaurant) ? 'text-green-700' : 'text-gray-500'}`}>
            {isOpenNow(restaurant) ? 'Open now' : 'Closed'}
          </span>
          {hoursLabel(restaurant)} · Delivery within {restaurant.deliveryRadiusKm ?? 10} km
        </p>
      </div>
    </Link>
  )
}

export default RestaurantCard
