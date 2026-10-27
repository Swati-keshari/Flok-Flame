// 404 page: shown for any URL that doesn't match a route (the "*" route in App.jsx).

import { Link } from 'react-router-dom'

const NotFound = () => (
  <div className='flex min-h-[60vh] flex-col items-center justify-center bg-secondary px-6 py-20 text-center'>
    <p className='mb-2 text-6xl font-bold text-primary'>404</p>
    <h1 className='mb-3 text-2xl font-bold text-dark'>Page not found</h1>
    <p className='mb-6 text-gray-700'>The page you are looking for doesn't exist or was moved.</p>
    <div className='flex flex-wrap justify-center gap-3'>
      <Link to='/' className='rounded-full bg-primary px-6 py-3 font-semibold text-white'>Go home</Link>
      <Link to='/restaurants' className='rounded-full border border-primary px-6 py-3 font-semibold text-primary'>Order food</Link>
    </div>
  </div>
)

export default NotFound
