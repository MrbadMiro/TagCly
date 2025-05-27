import React, { useContext, useState } from 'react'
import { assets } from '../assets/assets'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'
import { useDispatch } from 'react-redux'
import { logout } from '../redux/features/auth/authSlice' // Import your logout action

const Navbar = () => {
  const [visible, setVisible] = useState(false)
  const { setShowSearch, getCartCount } = useContext(ShopContext)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = () => {
    dispatch(logout()) // Dispatch the logout action
    navigate('/') // Redirect to home page
    setVisible(false) // Close the mobile menu if open
  }

  return (
    <div className='flex items-center justify-between py-5 font-medium'>
      <Link to='/'><img src={assets.logo} alt="" className='w-36' /></Link>

      <ul className='hidden sm:flex gap-5 text-sm text-gray-700'>
        <NavLink to='/' className="flex flex-col items-center gap-1">
          <p>HOME</p>
          <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
        </NavLink>
        
        <NavLink to='/about' className="flex flex-col items-center gap-1">
          <p>ABOUT</p>
          <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
        </NavLink>

        <NavLink to='/contact' className="flex flex-col items-center gap-1">
          <p>CONTACT</p>
          <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
        </NavLink>
      </ul>

      <div className='flex items-center gap-6'>
        

        <div className='group relative'>
          <Link to='/login'><img src={assets.profile_icon} alt="" className='w-5 cursor-pointer' /></Link>
          <div className='group-hover:block hidden absolute dropdown-menu right-0 pt-4'>
            <div className='flex flex-col gap-2 w-36 py-3 px-5 bg-slate-100 text-gray-500 rounded'>
              <p onClick={() => navigate('/profile')} className='cursor-pointer hover:text-black'>My Profile</p>
              <p onClick={() => navigate('/orderscollar')} className='cursor-pointer hover:text-black'>Orders</p>
              <p className='cursor-pointer hover:text-black' onClick={handleLogout}>Logout</p>
            </div>
          </div>
        </div>
        
        
        
        <img onClick={() => setVisible(true)} src={assets.menu_icon} alt="" className='w-5 cursor-pointer sm:hidden' />
      </div>

      {/* Mobile menu */}
      <div className={`absolute top-0 bottom-0 overflow-hidden bg-white transition-all ${visible ? 'w-full' : 'w-0'}`}>
        <div className='flex flex-col text-gray-600'>
          <div className='flex items-center gap-4 p-3 cursor-pointer'>
            <img onClick={() => setVisible(false)} src={assets.dropdown_icon} alt="" className='h-4 rotate-180' />
            <p>Back</p>
          </div>
          <NavLink onClick={() => setVisible(false)} className="py-2 border-b" to='/'>HOME</NavLink>
          <NavLink onClick={() => setVisible(false)} className="py-2 border-b" to='/collection'>COLLECTION</NavLink>
          <NavLink onClick={() => setVisible(false)} className="py-2 border-b" to='/about'>ABOUT</NavLink>
          <NavLink onClick={() => setVisible(false)} className="py-2 border-b" to='/contact'>CONTACT</NavLink>
          <p className='py-2 border-b cursor-pointer' onClick={handleLogout}>LOGOUT</p>
        </div>
      </div>
    </div>
  )
}

export default Navbar