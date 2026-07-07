# Bningoo — B2B Office Food Ordering Platform

**Part of Lamseyah Corporation**

Corporate food ordering platform for modern workplaces. Built with Next.js, Supabase, and Tailwind CSS.

## Architecture

```
bningoo-menu/          → Customer ordering app
bningoo-dashboard/     → Admin dashboard
bningoo-inventory/     → Inventory management
bningoo-shared/        → Shared types and utilities
```

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (email + Google OAuth)
- **Deployment:** Vercel
- **Version Control:** GitHub

## Getting Started

```bash
npm install
npm run dev
```

## Project Structure

```
src/
├── app/           # Next.js App Router pages
├── components/    # Reusable UI components
├── hooks/         # Custom React hooks
├── lib/           # Utilities, clients, helpers
├── types/         # TypeScript type definitions
└── middleware.ts  # Auth middleware
```

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=
```

## Branch Strategy

- `main` — clean foundation, always deployable
- `archive/*` — preserved historical implementations
- Feature branches created from `main` as needed
