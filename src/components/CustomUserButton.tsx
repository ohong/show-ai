'use client'

import { useUser } from '@clerk/nextjs'
import Image from 'next/image'
import { UserButton } from '@clerk/nextjs'
import { useRef } from 'react'

interface CustomUserButtonProps {
  afterSignOutUrl?: string
  className?: string
}

export function CustomUserButton({ afterSignOutUrl = "/", className = "" }: CustomUserButtonProps) {
  const { isLoaded, isSignedIn, user } = useUser()
  const userButtonRef = useRef<HTMLDivElement>(null)

  if (!isLoaded || !isSignedIn || !user) {
    return null
  }

  const handleProfileClick = () => {
    // Trigger the UserButton click programmatically
    if (userButtonRef.current) {
      const button = userButtonRef.current.querySelector('button')
      if (button) {
        button.click()
      }
    }
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Profile picture with full name - clickable */}
      <div 
        className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={handleProfileClick}
      >
        <Image
          src={user.imageUrl}
          width={32}
          height={32}
          alt={user.fullName || 'User'}
          className="rounded-full border-2 border-gray-200"
        />
        <span className="text-sm font-medium text-gray-700 hidden sm:block">
          {user.fullName || user.firstName || 'User'}
        </span>
      </div>
      
      {/* Clerk's UserButton for dropdown functionality - hidden but functional */}
      <div ref={userButtonRef} className="opacity-0 absolute pointer-events-none">
        <UserButton afterSignOutUrl={afterSignOutUrl} />
      </div>
    </div>
  )
}
