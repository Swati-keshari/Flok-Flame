// RestaurantReviews: the "Reviews" tab on a restaurant page.
// Prop: restaurantId. Lists the latest reviews from GET /api/restaurants/:id/reviews
// (customer first name, stars, comment, date). Reviews come from delivered orders only.

import useFetch from '../hooks/useFetch'
import Stars from './Stars'

const formatDate = (iso) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

const RestaurantReviews = ({ restaurantId }) => {
  const { data: reviews, error, isLoading } = useFetch(`/api/restaurants/${restaurantId}/reviews`)

  if (isLoading) return <p className='text-gray-700'>Loading reviews...</p>
  if (error) return <p className='text-red-600'>{error.message}</p>
  if (!reviews.length) {
    return <p className='text-gray-700'>No reviews yet. Order from here and be the first to rate it!</p>
  }

  return (
    <ul className='max-w-3xl space-y-4'>
      {reviews.map((r) => (
        <li key={r._id} className='rounded-lg bg-white p-5 shadow'>
          <div className='mb-1 flex flex-wrap items-center justify-between gap-2'>
            <span className='font-semibold text-dark'>{r.name}</span>
            <span className='text-xs text-gray-500'>{formatDate(r.createdAt)}</span>
          </div>
          <Stars rating={r.rating} />
          {r.comment && <p className='mt-2 text-sm text-gray-700 break-words'>{r.comment}</p>}
        </li>
      ))}
    </ul>
  )
}

export default RestaurantReviews
