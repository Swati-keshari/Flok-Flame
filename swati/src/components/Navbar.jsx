// Navbar: the top bar on every page — logo, links, and the cart icon with item count.
// On small screens the links are hidden behind a menu (hamburger) button.
// Home page sections use "/#about" style links so they also work from other pages.

import { useState } from 'react'
import { FaBagShopping, FaBars, FaXmark } from 'react-icons/fa6'
import { Link } from 'react-router-dom'
import { useCart } from '../context/cartContext'

const Navbar = () => {
    const[showMenu, setShowMenu] = useState(false);
    const { count } = useCart()

  return (
    <div className='shadow-md sticky top-0 z-50 backdrop-blur-3xl'>
        <div className='container mx-auto px-6 sm:px-8 md:px12 lg:px-24'>
            <div className='flex justify-between py-4'>
            {/* logo */}
            <Link to='/' className='flex items-center text-2xl font-bold '>
              <img className='h-12 w-12' src="/logo2.png" alt="Logo" />
              <h1 className='text-primary'>
                Fork & <span className='text-accent'>Flame</span></h1>
            </Link>
            {/* New links(Hidden on small screens) */}
           <nav className='hidden lg:flex items-center space-x-6 text-dark'>
             <a className='font-semibold hover:text-primary'
             href="/#home">Home</a>
             <a className='font-semibold hover:text-primary'
              href="/#about">About</a>
             <a className='font-semibold hover:text-primary'
              href="/#menu">Menu</a>
             <a className='font-semibold hover:text-primary'
              href="/#reservation">Reservations</a>
             <Link className='font-semibold hover:text-primary'
              to="/restaurants">Order Online</Link>
             <Link className='font-semibold hover:text-primary'
              to="/my-bookings">My Orders</Link>
             <a className='font-semibold hover:text-primary'
              href="/#contact">Contact</a>

           </nav>
           <div className='flex items-center gap-5'>
            {/* cart (all screens) */}
            <Link to='/cart' aria-label={`Cart, ${count} items`} className='relative text-2xl text-dark hover:text-primary'>
              <FaBagShopping />
              {count > 0 && (
                <span className='absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-bold text-white'>
                  {count}
                </span>
              )}
            </Link>
           {/* Mobile menu button (visible on mobile screens) */}
            <button
              type='button'
              className='lg:hidden'
              aria-label={showMenu ? 'Close menu' : 'Open menu'}
              aria-expanded={showMenu}
              onClick={() => setShowMenu(!showMenu)}
            >
              {showMenu ? <FaXmark /> : <FaBars />}
            </button>
           </div>



            </div>

        </div>
      {
        showMenu && (
            <div className='lg:hidden flex flex-col items-center space-y-4 py-4 text-dark'>
                <a onClick={() => setShowMenu(!showMenu)} className='font-semibold hover:text-primary'
                href="/#home">Home</a>
                <a onClick={() => setShowMenu(!showMenu)} className='font-semibold hover:text-primary'
                 href="/#about">About</a>
                <a onClick={() => setShowMenu(!showMenu)} className='font-semibold hover:text-primary'
                 href="/#menu">Menu</a>
                <a onClick={() => setShowMenu(!showMenu)} className='font-semibold hover:text-primary'
                 href="/#reservation">Reservations</a>
                <Link onClick={() => setShowMenu(!showMenu)} className='font-semibold hover:text-primary'
                 to="/restaurants">Order Online</Link>
                <Link onClick={() => setShowMenu(!showMenu)} className='font-semibold hover:text-primary'
                 to="/my-bookings">My Orders</Link>
                <a onClick={() => setShowMenu(!showMenu)} className='font-semibold hover:text-primary'
                 href="/#contact">Contact</a>
            </div>
        )

      }
    </div>
  )
}

export default Navbar
