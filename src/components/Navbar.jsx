import { useState } from 'react'
import { FaBars, FaXmark } from 'react-icons/fa6'

const Navbar = () => {
    const[showMenu, setShowMenu] = useState(false);

  return (
    <div className='shadow-md sticky top-0 z-50 backdrop-blur-3xl'>
        <div className='container mx-auto px-6 sm:px-8 md:px12 lg:px-24'>
            <div className='flex justify-between py-4'>
            {/* logo */}
            <div className='flex items-center text-2xl font-bold '>
              <img className='h-12 w-12' src="./logo2.png" alt="Logo" />
              <h1 className='text-primary'>
                Fork & <span className='text-accent'>Flame</span></h1>
            </div>
            {/* New links(Hidden on small screens) */}
           <nav className='hidden md:flex items-center space-x-6 text-dark'>
             <a className='font-semibold hover:text-primary'
             href="#home">Home</a>
             <a className='font-semibold hover:text-primary'
              href="#about">About</a>
             <a className='font-semibold hover:text-primary'
              href="#menu">Menu</a>
             <a className='font-semibold hover:text-primary'
              href="#reservations">Reservations</a>
             <a className='font-semibold hover:text-primary'
              href="#contact">Contact</a>

           </nav>
           {/* Mobile menu button (visible on mobile screens) */}
            <button
              type='button'
              className='md:hidden'
              aria-label={showMenu ? 'Close menu' : 'Open menu'}
              aria-expanded={showMenu}
              onClick={() => setShowMenu(!showMenu)}
            >
              {showMenu ? <FaXmark /> : <FaBars />}
            </button>



            </div>

        </div>
      {
        showMenu && (
            <div className='md:hidden flex flex-col items-center space-y-4 py-4 text-dark'>
                <a onClick={() => setShowMenu(!showMenu)} className='font-semibold hover:text-primary'
                href="#home">Home</a>
                <a onClick={() => setShowMenu(!showMenu)} className='font-semibold hover:text-primary'
                 href="#about">About</a>
                <a onClick={() => setShowMenu(!showMenu)} className='font-semibold hover:text-primary'
                 href="#menu">Menu</a>
                <a onClick={() => setShowMenu(!showMenu)} className='font-semibold hover:text-primary'
                 href="#reservations">Reservations</a>
                <a onClick={() => setShowMenu(!showMenu)} className='font-semibold hover:text-primary'
                 href="#contact">Contact</a>
            </div>
        )

      }
    </div>
  )
}

export default Navbar
