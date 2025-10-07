"use client"
import React from 'react'
import { signIn, signOut, useSession } from "next-auth/react";


const Navbar = () => {
  // 1. Get the session status and data
  const { data: session, status } = useSession(); 

 
  
  // Optional: Loading state (You might show a spinner here)
  if (status === "loading") {
    return (
      <div className='bg-[#4f39f6] flex items-center justify-around py-2'>
        <div className="logo text-white">Logo</div>
        <div className="text-white">Loading Auth...</div>
      </div>
    );
  }

  

  // 2. Determine if the user is signed in
  const isSignedIn = status === "authenticated";

  return (
    <div>
      <div className='bg-[#4f39f6] flex items-center justify-around py-2'>
        
      
        {/* 3. CONDITIONAL RENDERING BLOCK */}
        {isSignedIn ? (
          // --- RENDERED WHEN SIGNED IN ---
          <div className="flex items-center gap-4">
            <span className="text-white font-medium">
              {/* Safely display the user's name */}
              <span className='hidden md:inline'>Welcome, </span>{session.user.name}!
            </span>
            <button 
              onClick={() => signOut()} 
              type="button" 
              className="text-white bg-red-600 hover:bg-red-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition duration-150"
            >
              Sign Out
            </button>
          </div>
        ) : (
          // --- RENDERED WHEN SIGNED OUT ---
          <button 
            onClick={() => signIn("google")} 
            type="button" 
            className="text-white hover:cursor-pointer bg-[#4285F4] hover:bg-[#4285F4]/90 focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#4285F4]/55 me-2 mb-2"
          >
            <svg className="w-4 h-4 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 19">
              <path fillRule="evenodd" d="M8.842 18.083a8.8 8.8 0 0 1-8.65-8.948 8.841 8.841 0 0 1 8.8-8.652h.153a8.464 8.464 0 0 1 5.7 2.257l-2.193 2.038A5.27 5.27 0 0 0 9.09 3.4a5.882 5.882 0 0 0-.2 11.76h.124a5.091 5.091 0 0 0 5.248-4.057L14.3 11H9V8h8.34c.066.543.095 1.09.088 1.636-.086 5.053-3.463 8.449-8.4 8.449l-.186-.002Z" clipRule="evenodd"/>
            </svg>
            Sign in with Google
          </button>
        )}
      </div>
    </div>
  )
}

export default Navbar
