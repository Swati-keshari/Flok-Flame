import React from 'react'
import Hero from '../components/Hero'
import About from '../components/About'
import Menu from '../components/Menu'
import Reservation from '../components/Reservation'
import Testimonial from '../components/Testimonial'
import Contact from'../components/Contact'

const Home = () => {
  return (
    <div>
      <Hero />
      <About />
      <Menu />
      <Reservation />
      <Testimonial />
      <Contact />
    </div>
  )
}

export default Home
