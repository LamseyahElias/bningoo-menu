import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Protected routes
  const protectedPaths = ['/menu', '/admin', '/kitchen', '/cart', '/orders', '/profile']
  const isProtected = protectedPaths.some(p => request.nextUrl.pathname === p || request.nextUrl.pathname.startsWith(p + '/'))

  // Auth pages
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth')

  if (!user && isProtected) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  if (user && isAuthPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/menu'
    return NextResponse.redirect(url)
  }
  
  // Also redirect /login to /menu if already logged in (unless pending)
  const isLoginPage = request.nextUrl.pathname === '/login' && !request.nextUrl.searchParams.has('pending')
  if (user && isLoginPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/menu'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
