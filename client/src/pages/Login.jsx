import React from 'react'
import { assets } from '../assets/assets'
import { Star } from 'lucide-react'
import {SignIn} from '@clerk/clerk-react'
const Login = () => {
  return (
      <div className='min-h-screen flex flex-col md:flex-row'>
          <img src={assets.bgImage} alt='' className='absolute top-0 left-0 -z-1 w-full h-full object-cover'></img>
          <div className='flex-1 flex flex-col items-start justify-between p-6 md:p-10 lg:pl-40'>
              <div className='flex text-3xl text-indigo-800'>
              <img src={'/favicon.svg'} alt='' className='h-12 object-contain'></img>mern app
              </div>
              <div>
                  <div className='flex items-center gap-3 mb-4 max-md:mt-10'>
                      <img src={assets.group_users} alt='' className='h-8 md:h-10'></img>
                      <div>
                          <div className='flex'>
                              {Array(5).fill(0).map((_, i)=>(<Star key={i} className='size-4 md:size-4.5 text-transparent fill-amber-500'></Star>))}
                          </div>
                          <p>used by developers</p>
                      </div>
                  </div>
                  <h1 className='text-3xl md:text-6xl md:pb-2 font-bold bg-gradient-to-r from-indigo-950 to-indigo-800 bg-clip-text text-transparent'>more than just friends truly connect</h1>
                  <p className='text-xl md:text-3xl text-indigo-900 max-w-72 md:max-w-md'>connect with a global community on mern app</p>
              </div>
              <span className='md:h-10'></span>  
          </div>
          <div className='flex-1 flex items-center justify-center p-6 sm:p-10'>
              <SignIn></SignIn>
          </div>
      </div>
  )
}

export default Login