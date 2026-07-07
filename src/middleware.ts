import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// ──────────────────────────────────────────
// BNIN-385: Role-Based Access Control & Middleware
// Consistent middleware pattern shared across all Bningoo repos.
// ──────────────────────────────────────────

// Role constants — inline so middleware (Edge runtime) doesn't
// need to resolve @/ path aliases
const ROLES = {
  SUPER_ADMIN: 'super_admin',
  COMPANY_ADMIN: 'company_admin',
  KITCHEN_STAFF: 'kitchen_staff',
  INVENTORY_STAFF: 'inventory_staff',
  EMPLOYEE: 'employee',
  /** Legacy — mapped to company_admin */
  OWNER: 'owner',
  /** Legacy — mapped to employee */
  CUSTOMER: 'customer',
} as const

type Role = (typeof ROLES)[keyof typeof ROLES]

interface RouteRule {
  path: string
  roles: readonly Role[]
}

// ──────────────────────────────────────────
// Route Definitions
// ──────────────────────────────────────────

/** Public routes that require NO authentication */
const PUBLIC_ROUTES = [
  '/login',
  '/auth/callback',
  '/',
]

/** Protected routes with allowed roles */
const PROTECTED_ROUTES: RouteRule[] = [
  { path: '/menu', roles: ['employee', 'customer', 'company_admin', 'owner', 'super_admin', 'kitchen_staff', 'inventory_staff'] as const },
  { path: '/orders', roles: ['employee', 'customer', 'company_admin', 'owner', 'super_admin', 'kitchen_staff'] as const },
  { path: '/cart', roles: ['employee', 'customer', 'company_admin', 'owner', 'super_admin'] as const },
  { path: '/profile', roles: ['employee', 'customer', 'company_admin', 'owner', 'super_admin', 'kitchen_staff', 'inventory_staff'] as const },
  { path: '/admin', roles: ['company_admin', 'owner', 'super_admin'] as const },
  { path: '/kitchen', roles: ['kitchen_staff', 'company_admin', 'owner', 'super_admin'] as const },
  { path: '/inventory', roles: ['inventory_staff', 'company_admin', 'owner', 'super_admin'] as const },
  { path: '/dashboard', roles: ['company_admin', 'owner', 'super_admin', 'kitchen_staff', 'inventory_staff', 'employee', 'customer'] as const },
]

function getRequiredRoles(pathname: string): readonly Role[] | null {
  for (const route of PROTECTED_ROUTES) {
    if (pathname === route.path || pathname.startsWith(route.path + '/')) {
      return route.roles
    }
  }
  return null
}

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  )
}

function normalizeRole(role: string | null | undefined): string {
  if (role === 'owner') return 'company_admin'
  if (role === 'customer') return 'employee'
  return role ?? 'employee'
}

function getDefaultPathForRole(role: string | null | undefined): string {
  const normalized = normalizeRole(role)
  const paths: Record<string, string> = {
    company_admin: '/admin',
    super_admin: '/admin',
    owner: '/admin',
    kitchen_staff: '/kitchen',
    inventory_staff: '/inventory',
    employee: '/menu',
    customer: '/menu',
  }
  return paths[normalized] ?? '/menu'
}

// ──────────────────────────────────────────
// Middleware Handler
// ──────────────────────────────────────────

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
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

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // ── Skip middleware for static assets and Next.js internals ──
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/favicon') ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico)$/)
  ) {
    return supabaseResponse
  }

  // ── Check if route is protected ──
  const requiredRoles = getRequiredRoles(pathname)
  const isPublic = isPublicRoute(pathname)
  const isLoginPage = pathname === '/login'
  const hasPendingParam = request.nextUrl.searchParams.has('pending')

  // ── NOT AUTHENTICATED ──
  if (!user) {
    // Let through public routes
    if (isPublic || !requiredRoles) {
      return supabaseResponse
    }
    // Protected route → redirect to login
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // ── AUTHENTICATED ──

  // On login page (not pending) → redirect to default page
  if (isLoginPage && !hasPendingParam) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // If route has no role restrictions, let through
  if (!requiredRoles) {
    return supabaseResponse
  }

  // Fetch role from users table
  const { data: userData } = (await supabase
    .from('users')
    .select('role, is_active')
    .eq('id', user.id)
    .single()) as unknown as {
    data: { role: string; is_active: boolean } | null
  }

  // User not in users table → pending
  if (!userData) {
    return NextResponse.redirect(new URL('/login?pending=true', request.url))
  }

  // Not active → pending
  if (!userData.is_active) {
    return NextResponse.redirect(new URL('/login?pending=true', request.url))
  }

  // Normalize legacy roles
  const effectiveRole = normalizeRole(userData.role) as Role

  // Check role permission
  const hasAccess = requiredRoles.includes(effectiveRole)

  if (!hasAccess) {
    const redirectPath = getDefaultPathForRole(userData.role)
    return NextResponse.redirect(new URL(redirectPath, request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
