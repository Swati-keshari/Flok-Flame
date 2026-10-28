// RateOrder: "Rate your order" card on the tracking page, shown once an order is delivered.
// Props: orderId, phone (the server needs the order's phone to accept the review).
// Loads the existing review (GET /api/orders/:id/review); if there is none, shows
// 5 star buttons + an optional comment and sends it with POST /api/orders/:id/review.
// Each order can be rated only once; the restaurant's rating is then updated by the server.

import { useState } from 'react'
import { FaStar } from 'react-icons/fa6'
import { postJSON } from '../api'
import useFetch from '../hooks/useFetch'
import Stars from './Stars'

const labels = ['', 'Bad', 'Not good', 'Okay', 'Good', 'Loved it!']

const RateOrder = ({ orderId, phone }) => {
  const { data: review, isLoading, setData } = useFetch(`/api/orders/${orderId}/review`, { phone })
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState('')
  const [justSent, setJustSent] = useState(false)

  if (isLoading) return null

  if (review) {
    return (
      <div className='mt-6 rounded-lg border border-green-200 bg-green-50 p-4'>
        <p className='mb-1 font-semibold text-green-800'>{justSent ? 'Thanks for your review!' : 'Your review'}</p>
        <Stars rating={review.rating} size='text-lg' />
        {review.comment && <p className='mt-2 text-sm text-gray-700'>“{review.comment}”</p>}
      </div>
    )
  }

  const submit = async (event) => {
    event.preventDefault()
    if (!rating) return setError('Please tap the stars to rate')
    setError('')
    setIsSending(true)
    try {
      setData(await postJSON(`/api/orders/${orderId}/review`, { phone, rating, comment }))
      setJustSent(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSending(false)
    }
  }

  const shown = hover || rating
  return (
    <form onSubmit={submit} className='mt-6 rounded-lg border border-gray-200 p-4'>
      <p className='mb-2 font-semibold text-dark'>Rate your order</p>
      <div className='mb-1 flex items-center gap-1' onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type='button'
            onClick={() => setRating(n)}
            onMouseEnter={() => setHover(n)}
            aria-label={`${n} star${n > 1 ? 's' : ''}`}
            aria-pressed={rating === n}
            className={`p-1 text-3xl transition ${n <= shown ? 'text-yellow-500' : 'text-gray-300'}`}
          >
            <FaStar />
          </button>
        ))}
        <span className='ml-2 text-sm text-gray-600'>{labels[shown]}</span>
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={500}
        rows={2}
        placeholder='Tell us about the food (optional)'
        aria-label='Review comment'
        className='mt-2 w-full rounded border px-3 py-2 text-sm placeholder:text-xs'
      />
      {error && <p className='mt-1 text-sm text-red-600'>{error}</p>}
      <button type='submit' disabled={isSending} className='mt-2 rounded bg-primary px-5 py-2 text-sm font-semibold text-white disabled:opacity-60'>
        {isSending ? 'Sending...' : 'Submit review'}
      </button>
    </form>
  )
}

export default RateOrder
