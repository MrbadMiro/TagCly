import React from 'react'
import Hero from '../components/Hero'
import LatestCollection from '../components/LatestCollection'

import OurPolicy from '../components/OurPolicy'
import NewsLetterBox from '../components/NewsLetterBox'
import CollarBuy from '../components/CollarBuy'


const Home = () => {
  return (
    <div>
      <Hero/>
      
      <CollarBuy/>
      <OurPolicy/>
      <NewsLetterBox/>
      
    </div>
  )
}

export default Home