// Footer: shown at the bottom of every page.
// Quick links, contact info, social icons, and the newsletter form
// (sends the email to /api/newsletter).

import { useState } from 'react'
import { FaFacebook, FaInstagram, FaLinkedin, FaLocationArrow, FaTwitter } from 'react-icons/fa6'
import { Link } from 'react-router-dom'
import { postJSON } from '../api'
import { phoneLink, siteInfo } from '../siteInfo'

const Footer = () => {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState({ type: '', text: '' })

  const handleSubscribe = async (event) => {
    event.preventDefault()
    try {
      const res = await postJSON('/api/newsletter', { email })
      setStatus({ type: 'success', text: res.message })
      setEmail('')
    } catch (err) {
      setStatus({ type: 'error', text: err.message })
    }
  }

  return (
    <div className='no-print py-20 bg-secondary'>
      <div className='container mx-auto px-6'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
         { /*first-col*/}
          <div>
            <h1 className='text-xl font-semibold mb-4'>Fork &{' '}
              <span className='text-primary'>Flame</span></h1>
              <p>Experience the finest culinary journey in the heart
                of the city
              </p>

          </div>
          { /*second-col*/}
          <div>
            <h1 className='text-xl text-dark font-semibold mb-4'>Quick Links</h1>
            <ul className='space-y-2'>
              <li>
                <a href='/#home'>Home</a>
              </li>
               <li>
                <a href='/#about'>About</a>
              </li>
               <li>
                <a href='/#menu'>Menu</a>
              </li>
               <li>
                <a href='/#reservation'>Reservation</a>
              </li>
               <li>
                <Link to='/my-bookings'>My Orders</Link>
              </li>
               <li>
                <Link to='/admin'>Admin</Link>
              </li>
            </ul>
          </div>
          { /*third-col*/}
          <div className='space-y-2'>
             <h1 className='text-xl text-dark font-semibold mb-4'>Contact info</h1>
             <ul className='space-y-2'>
              <li>{siteInfo.address}</li>
              <li><a href={phoneLink} className='hover:text-primary'>{siteInfo.phone}</a></li>
              <li><a href={`mailto:${siteInfo.email}`} className='break-all hover:text-primary'>{siteInfo.email}</a></li>
              {siteInfo.hours.map((h) => <li key={h.days}>{h.days}: {h.time}</li>)}
             </ul>
          </div>
          {/*4-col*/}
          <div>
            <h1 className='text-xl text-dark font-semibold mb-4'>Follow us </h1>
            <div className='flex items-center gap-4 mb-6'>
             <div className='w-10 h-10 bg-primary text-white
              flex items-center justify-center rounded-full'>
               <FaInstagram  className='text-2xl'/>
             </div>
             <div className='w-10 h-10 bg-primary text-white
              flex items-center justify-center rounded-full'>
               <FaTwitter className='text-2xl'/>
             </div>
             <div className='w-10 h-10 bg-primary text-white
              flex items-center justify-center rounded-full'>
               <FaFacebook  className='text-2xl'/>
             </div>
             <div className='w-10 h-10 bg-primary text-white
              flex items-center justify-center rounded-full'>
               <FaLinkedin  className='text-2xl'/>
             </div>
            </div>
            <div>
              <h1 className='text-xl font-bold text-dark mb-4'>
                Subscribe to Newsletter</h1>
                <form onSubmit={handleSubscribe} className='flex border  border-primary rounded'>
                   <input className='w-full px-4 py-2 rounded outline-none placeholder:text-xs'
                   placeholder='Your Email'
                   type="email"
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   required/>
                   <button type='submit' aria-label='Subscribe' className='border- px-4 py-2 cursor-pointer
                   bg-primary text-white rounded-r'>
                    <FaLocationArrow/>
                   </button>
                </form>
                {status.text && (
                  <p className={`mt-2 text-sm ${status.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{status.text}</p>
                )}
            </div>




          </div>
        </div>
        <div className='border-t py-6 mt-6 border-gray-300'>
          <p className='text-dark/50 text-center'>© 2026 Fork & Flame. All rights reserved.</p>
        </div>
      </div>
      
    </div>
  )
}

export default Footer
