'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

/**
 * Landing page — immediately redirects to /menu or /auth/signin
 * No marketing content whatsoever.
 */
export default function HomePage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading) {
      router.replace(user ? '/menu' : '/auth/signin')
    }
  }, [user, loading, router])

  return (
    <div className="min-h-screen bg-[#0f0f13] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
