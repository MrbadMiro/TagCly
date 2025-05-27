import React, { useState } from 'react'
import { useLoginMutation, useRegisterMutation } from '../redux/api/usersApiSlice'
import { useDispatch } from 'react-redux'
import { setCredentials } from '../redux/features/auth/authSlice'

const Login = ({ onLoginSuccess }) => {
  const [currentState, setCurrentState] = useState('Login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const dispatch = useDispatch()

  const [login, { isLoading: isLoginLoading }] = useLoginMutation()
  const [register, { isLoading: isRegisterLoading }] = useRegisterMutation()

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setError('')

    try {
      // Determine which mutation to use based on current state
      const userData = currentState === 'Login' 
        ? { email, password }
        : { name, email, password }

      const mutation = currentState === 'Login' ? login : register

      const res = await mutation(userData).unwrap()
      
      // Dispatch action to set user credentials
      dispatch(setCredentials({ ...res }))

      // Call login success callback if provided
      if (onLoginSuccess) {
        onLoginSuccess()
      }
    } catch (err) {
      // Handle login/registration error
      setError(err.data?.message || 'An error occurred')
      console.error('Login/Registration failed:', err)
    }
  }

  return (
    <form onSubmit={onSubmitHandler} className='flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800'>
      <div className='inline-flex items-center gap-2 mb-2 mt-10'>
        <p className='prata-regular text-3xl'>{currentState}</p>
        <hr className='border-none h-[1.5px] w-8 bg-gray-800 ' />
      </div>
      
      {error && (
        <div className="w-full text-red-600 text-center mb-4">
          {error}
        </div>
      )}

      {currentState === 'Login' ? '' : (
        <input 
          type="text" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          className='w-full px-3 py-2 border border-gray-800'  
          placeholder='Name'
          required
        />
      )}
      
      <input 
        type="email" 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className='w-full px-3 py-2 border border-gray-800'  
        placeholder='Email'
        required
      />
      
      <input 
        type="password" 
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className='w-full px-3 py-2 border border-gray-800'  
        placeholder='Password'
        required
      />
      
      <div className='w-full flex justify-between text-sm mt-[-8px]'>
        <p className='cursor-pointer'>Forgot your password</p>
        {
          currentState === 'Login'?
          <p onClick={()=>setCurrentState('Sign Up')}  className='cursor-pointer '> Create account</p>: 
          <p onClick={()=>setCurrentState('Login')}  className='cursor-pointer ' >Login here</p>
        }
      </div>
      
      <button 
        type="submit" 
        disabled={isLoginLoading || isRegisterLoading}
        className='bg-black text-white font-light px-8 py-2 mt-4'
      >
        {currentState === 'Login' ? ' Sign in' : 'Sign up'}
      </button>
    </form>
  )
}

export default Login