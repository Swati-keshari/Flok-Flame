// Stars: shows a 1-5 star rating as filled / empty stars (read only).
// Props: rating (number), size (Tailwind text size class, default 'text-sm').
// Used by the order rating card and the restaurant Reviews tab.

import { FaStar } from 'react-icons/fa6'

const Stars = ({ rating, size = 'text-sm' }) => (
  <span className={`inline-flex gap-0.5 ${size}`} role='img' aria-label={`${rating} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((n) => (
      <FaStar key={n} className={n <= Math.round(rating) ? 'text-yellow-500' : 'text-gray-300'} />
    ))}
  </span>
)

export default Stars
