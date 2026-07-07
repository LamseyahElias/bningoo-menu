'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function CallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClient()
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error) {
        console.error('Auth callback error:', error)
        router.push('/login')
        return
      }

      if (session?.user) {
        // Check if user profile exists in profiles table
        // The profiles table is auto-populated by a DB trigger on auth.users insert
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_active')
          .eq('id', session.user.id)
          .single()

        if (!profile) {
          // Profile doesn't exist yet — try inserting one
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: session.user.id,
              email: session.user.email!,
              full_name: session.user.user_metadata.full_name || null,
              avatar_url: session.user.user_metadata.avatar_url || null,
              role: 'customer',
              is_active: false,  // New users start unapproved
            } as any)

          if (insertError) {
            console.error('Profile creation error:', insertError)
          }

          // New user — not approved yet, show pending screen
          router.push('/login?pending=true')
          return
        }

        // Check if user is approved (is_active = true)
        const isApproved = (profile as any).is_active
        if (!isApproved) {
          router.push('/login?pending=true')
          return
        }

        const redirectTo = searchParams.get('redirect') || '/menu'
        router.push(redirectTo)
      } else {
        router.push('/login')
      }
    }

    handleCallback()
  }, [router, searchParams])

  return (
    <div className="min-h-screen bg-[#0f0f13] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-zinc-400 text-sm">Completing sign in...</p>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0f0f13] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  )
}
