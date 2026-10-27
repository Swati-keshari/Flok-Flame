// CartBar: green "N items · ₹X — View Cart" bar fixed at the bottom of the screen.
// Shown on every page while the cart has items (hidden on /cart and admin pages).

import { Link, useLocation } from 'react-router-dom'
import { FaBagShopping } from 'react-icons/fa6'
import { useCart } from '../context/cartContext'

// Sticky "View cart" bar shown at the bottom of every page while the cart has items
const CartBar = () => {
  const { count, subtotal, restaurant } = useCart()
  const { pathname } = useLocation()
  if (!count || pathname === '/cart' || pathname.startsWith('/admin')) return null

  return (
    <>
    {/* spacer so the fixed bar never hides the end of the page */}
    <div className='h-24' aria-hidden='true' />
    <div className='fixed inset-x-0 bottom-0 z-40 px-4 pb-4'>
      <Link
        to='/cart'
        className='mx-auto flex max-w-2xl items-center justify-between gap-4 rounded-lg bg-green-700 px-5 py-3 text-white shadow-xl transition hover:bg-green-800'
      >
        <div className='min-w-0'>
          <p className='font-bold'>{count} {count > 1 ? 'items' : 'item'} · ₹{subtotal}</p>
          <p className='truncate text-xs text-green-100'>from {restaurant.name}</p>
        </div>
        <span className='flex shrink-0 items-center gap-2 font-bold'>
          <FaBagShopping /> View Cart →
        </span>
      </Link>
    </div>
    </>
  )
}

export default CartBar
