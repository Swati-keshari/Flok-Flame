import React from 'react'
import heroImg from '../assets/fork-flame-static (11)/hero.avif'

const Hero = () => {
  return (
    <div id='home' className='relative h-screen bg-cover bg-center w-full' 
    style={{ backgroundImage: `url('${heroImg}')` }}>
        <div className='absolute inset-0  bg-black opacity-50'></div>
       <div className='container mx-auto px-6  h-full flex items-center relative z-10'>
        <div className='text-white max-w-2xl'>
            <h2 className='text-5xl font-bold mb-4'>Experience Fine Dining</h2>
            <p className='text-xl mb-4'>Indulge in a culinary journey that combines traditional flavors with modern innovation.</p>
            <a className='bg-primary hover:bg-red-800 text-white font-bold py-3 px-8 rounded-full cursor-pointer transtion duration-300 transform hover:scale-105'
            href='#reservation'>Book a Table</a>
        </div>

       </div>
    </div>
  )
}

export default Hero
