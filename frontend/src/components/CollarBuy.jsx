import React from 'react'
import { useNavigate } from 'react-router-dom'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import NewsLetterBox from '../components/NewsLetterBox'

const CollarBuy = () => {
    const navigate = useNavigate(); // Initialize navigation function

    return (
        <div className='py-24'>

            <div className='my-10 flex flex-col md:flex-row gap-16'>

                <img className='w-full md:max-w-[450px]' src={assets.collarBuy} alt="" />
                <div className='flex flex-col justify-center gap-6 md:w-2/4 text-gray-600 '>
                    <div className='text-2xl text-center pt-4'>
                        <Title text1={'About Our'} text2={'Premium Pet Collars'} />
                    </div>
                    <p>At PetTech Innovations, we combine cutting-edge technology with premium craftsmanship to create smart collars that keep pets safe and owners connected.</p>
                    <p>As leaders in <strong>GPS dog collars</strong> and <strong>smart pet tracking</strong>, we're committed to providing the most reliable <strong>waterproof pet collars</strong> with <strong>long battery life</strong>. Our <strong>durable dog collars</strong> are designed for active pets and come with a <strong>2-year warranty</strong>, making them the best choice for <strong>pet safety solutions</strong>.</p>
                    <b className='text-gray-800'>Our Mission</b>
                    <p>Join over 750,000 satisfied customers who trust our collars to keep their pets safe.</p>
                    <div>
                        <button 
                            className='bg-black text-white font-light px-8 py-2 mt-4'
                            onClick={() => navigate('/collardetails')} // Navigate on click
                        >
                            Buy Now
                        </button>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default CollarBuy
