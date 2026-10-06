import React from 'react'
import { FaFacebook, FaInstagram, FaLinkedin, FaLocationArrow, FaTwitter } from 'react-icons/fa6'

const footer = () => {
  return (
    <div className='py-20 bg-secondary'>
      <div className='container mx-auto px-6'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
         { /*first-col*/}
          <div>
            <h1 className='text-xl font-semibold mb-4'>Flok & 
              <span className='text-primary'>Flame</span></h1>
              <p>Experince the finest clurinary joureny in the heart 
                of the city
              </p>

          </div>
          { /*second-col*/}
          <div>
            <h1 className='text-xl text-dark font-semibold mb-4'>Quick Link</h1>
            <ul className='space-y-2'>
              <li>
                <a href='#home'>Home</a>
              </li>
               <li>
                <a href='#about'>About</a>
              </li>
               <li>
                <a href='#menu'>Menu</a>
              </li>
               <li>
                <a href='#reservaion'>Reservation</a>
              </li>
            </ul>
          </div>
          { /*third-col*/}
          <div className='space-y-2'>
             <h1 className='text-xl text-dark font-semibold mb-4'>Contact info</h1>
             <ul>
              <li>123 Delhi street,10091</li>
              <li>(123) 432-7659 </li>
              <li>info@swati.com</li>
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
                Subscribe to NewLetter</h1>
                <div className='flex border  border-primary rounded'>
                   <input className='w-full px-4 py-2 rounded outline-none placeholder:text-xs'
                   placeholder='Your Email'
                   type="email"/>
                   <button className='border- px-4 py-2 cursor-pointer
                   bg-primary text-white rounded-r'>
                    <FaLocationArrow/>
                   </button>
                </div>
            </div>




          </div>
        </div>
        <div className='border-1py-6 mt-6 border-gray-300'>
          <p className='text-dark/50 text-center'>@ 2026.Flok& Flame.All rights reserve</p>
        </div>
      </div>
      
    </div>
  )
}

export default footer
