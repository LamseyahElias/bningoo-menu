# ── Bningoo Engineering Standards ──────────────────────────

## Code Quality
- TypeScript strict mode. No `any`. No `// @ts-ignore`.
- Every file has a single responsibility.
- Components are either Server or Client, never both.

## Component Architecture
- `src/components/ui/` — shadcn/ui primitives (button, card, input, etc.)
- `src/components/features/` — domain components (MenuCard, OrderList, etc.)
- `src/components/layout/` — layout components (Sidebar, Header, etc.)

## Pages (App Router)
- `src/app/(auth)/` — login, signup, callback
- `src/app/(menu)/` — customer-facing menu, cart, checkout
- `src/app/(dashboard)/` — admin dashboard routes
- `src/app/(kitchen)/` — kitchen view routes

## Data Layer
- `src/lib/supabase/client.ts` — browser client
- `src/lib/supabase/server.ts` — server/client components
- `src/lib/supabase/admin.ts` — service_role client (server-only)
- `src/lib/supabase/middleware.ts` — auth session refresh
- `src/types/database.ts` — generated Supabase types
- `src/types/index.ts` — domain types

## State Management
- Server Components preferred. Server Actions for mutations.
- React Context only for truly global state (auth, cart, theme).
- Local state for everything else.

## Auth & Security
- Never expose `service_role` key to client.
- RLS policies enforce row-level access for all tables.
- Admin routes check `role === 'admin'` server-side.

## Git Conventions
- `feat:` new feature
- `fix:` bug fix
- `chore:` maintenance
- `docs:` documentation
- `refactor:` code restructuring

## Build Checks (run before every commit)
- `npm run typecheck`
- `npm run lint`
- `npm run build`
