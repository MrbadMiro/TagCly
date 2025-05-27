import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'

import About from './pages/About'
import Contact from './pages/Contact'
import Product from './pages/Product'
import CollarDetails from './pages/CollarDetails'

import Login from './pages/Login'

import Order from './pages/Order'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import SearachBar from './components/SearachBar'
import { ToastContainer } from 'react-toastify';
import PlaceOrderCollar from './pages/PlaceOrderCollar'
import OrderCollar from './pages/OrderCollar'
import ProtectedRoute from './components/ProtectedRoute'
import Profile from './pages/Profile'
import OrderCollarDetails from './pages/OrderCollarDetails'

const App = () => {
  return (
    <div className='px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'>
      <Navbar />
      <SearachBar />
      <Routes>
        {/* Public Routes */}
        <Route path='/' element={<Home />} />

        <Route path='/about' element={<About />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='/product/:productId' element={<Product />} />
        <Route path='/login' element={<Login />} />
        <Route path='/collardetails' element={<CollarDetails />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>

          <Route path='/place-ordercollar' element={<PlaceOrderCollar />} />
          <Route path='/orders' element={<Order />} />
          <Route path='/orderscollar' element={<OrderCollar />} />
          <Route path="/orderscollar/:id" element={<OrderCollarDetails />} />
          <Route path='/profile' element={<Profile />} />
        </Route>
      </Routes>
      <Footer />
      <ToastContainer />
    </div>
  )
}

export default App