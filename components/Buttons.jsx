"use client"
import React from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'

const Buttons = () => {
  const { data: session } = useSession()

  // If user is logged in, show username and signout button
  if (session) {
    return (
      <div className="absolute top-4 right-[28rem] flex items-center gap-4 z-50">
        <span className="text-white font-medium text-shadow">
          Welcome, {session.user?.name || session.user?.email}
        </span>
        <button 
          onClick={() => signOut()}
          type="button" 
          className="text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center shadow-lg"
        >
          Sign Out
        </button>
      </div>
    )
  }

  // If user is not logged in, show login and signup buttons
  return (
    <div className='absolute top-2 right-[35rem]  flex items-center gap-2 z-50'>
      <Link href="/login">
        <button 
          type="button" 
          className="text-white bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center shadow-lg"
        >
          Login
        </button>
      </Link>
      
      <Link href="/signup">
        <button 
          type="button" 
          className="text-white bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center shadow-lg"
        >
          Signup
        </button>
      </Link>
    </div>
  )
}

export default Buttons