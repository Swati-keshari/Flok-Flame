// About section on the home page ("Our story").

import { assets } from '../assets/fork-flame-static (11)/assets'
import { FaLeaf, FaUtensils } from 'react-icons/fa6'

const About = () => {
  return (
    <div id='about' className='bg-white py-20'>
      <div className='container mx-auto px-6'>
        <div className='text-center mb-12'>
          <h1 className='text-3xl sm:text-4xl text-dark font-bold mb-4'>Our story</h1>
          <div className='w-20 h-1 bg-primary mx-auto'></div>
        </div>
        <div className='flex flex-col md:flex-row items-center gap-12'>
         {/*left side image*/}
         <div className='md:w-1/2'>
           <img className='w-full h-full object-cover rounded-xl' src={assets.aboutImg} alt="About" />
         </div>
         {/*right side content*/}
         <div className='md:w-1/2'>
         <h3 className='text-xl font-bold text-dark mb-4'>A culinary journey </h3>
         <p className='text-dark mb-4'>
          Founded in 2023, Fork & Flame is a culinary haven where passion meets flavor. Our journey began with a simple idea: to create a dining experience that celebrates the art of cooking and the joy of sharing meals. From our humble beginnings, we have grown into a beloved destination for food enthusiasts seeking exceptional cuisine and warm hospitality.
         </p>
         <p className='text-dark mb-4'>
          We source our ingredients from local farms and trusted suppliers, ensuring that every dish is crafted with the freshest produce and finest cuts of meat. Our chefs blend traditional recipes with innovative techniques, resulting in a menu that delights the senses and satisfies every palate.
         </p>
        {/*button section*/}
        <div className='flex flex-wrap items-center gap-x-8 gap-y-4'>
          <div className='flex items-center gap-3'>
            <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-white'>
              <FaUtensils className='text-xl' aria-hidden='true' />
            </div>
            <span className='font-semibold text-dark'>Fine Dining</span>
          </div>
          <div className='flex items-center gap-3'>
            <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-white'>
              <FaLeaf className='text-xl' aria-hidden='true' />
            </div>
            <span className='font-semibold text-dark'>Fresh Ingredients</span>
          </div>
        </div>
         </div>
       
       
        </div>
      </div>

    </div>
  )
}

export default About
