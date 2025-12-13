'use client'

import { useState, useEffect, ReactNode } from 'react'

interface DelayedContentProps {
  children: ReactNode
  delayMinutes?: number
}

export function DelayedContent({ children, delayMinutes = 9 }: DelayedContentProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delayMinutes * 60 * 1000) // 9 min = 540000ms

    return () => clearTimeout(timer)
  }, [delayMinutes])

  if (!isVisible) return null
  
  return <>{children}</>
}
