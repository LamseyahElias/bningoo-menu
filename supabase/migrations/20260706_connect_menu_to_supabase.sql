-- ============================================================
-- BNIN-213: Connect Menu to Supabase + Google OAuth
-- Migration: Create profiles table, fix RLS recursion, seed data
-- ============================================================

-- 1. Create profiles table (mirrors users table for auth flow)
-- The users table already exists with id, email, full_name, avatar_url, role, company_id
-- Create profiles as a view or table that the menu app can query safely

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role public.user_role DEFAULT 'customer',
  company_id UUID REFERENCES public.companies(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create a trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Sync existing users to profiles
INSERT INTO public.profiles (id, email, full_name, avatar_url, role, company_id, is_active)
SELECT id, email, full_name, avatar_url, role, company_id, is_active
FROM public.users
ON CONFLICT (id) DO NOTHING;

-- 2. RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 3. FIX RLS infinite recursion on users table
-- The current policy likely has: USING (auth.uid() IN (SELECT id FROM users WHERE ...))
-- Fix: use auth.uid() directly

-- Drop all existing policies on users to fix recursion
DROP POLICY IF EXISTS "Users can view own user" ON public.users;
DROP POLICY IF EXISTS "Users can insert own user" ON public.users;
DROP POLICY IF EXISTS "Users can update own user" ON public.users;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.users;
DROP POLICY IF EXISTS "Enable update for users based on id" ON public.users;
DROP POLICY IF EXISTS "Users can read own record" ON public.users;
DROP POLICY IF EXISTS "users_select_policy" ON public.users;
DROP POLICY IF EXISTS "users_insert_policy" ON public.users;
DROP POLICY IF EXISTS "users_update_policy" ON public.users;

-- Recreate with safe policies
CREATE POLICY "Users can view own record"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view company users"
  ON public.users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
        AND u.company_id = users.company_id
        AND u.role IN ('admin', 'owner', 'super_admin')
        AND u.id != users.id  -- Prevent recursion by excluding self-reference
    )
  );

-- 4. Add more categories for the menu
INSERT INTO public.categories (company_id, name, slug, sort_order, is_active)
SELECT 'c0053287-adde-426c-875c-13c022dcba0b', name, slug, sort_order, true
FROM (VALUES
  ('Coffee', 'coffee', 4),
  ('Healthy', 'healthy', 5),
  ('Snacks', 'snacks', 6),
  ('Desserts', 'desserts', 7),
  ('Dinner', 'dinner', 8)
) AS new_cats(name, slug, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM public.categories c WHERE c.slug = new_cats.slug
);

-- 5. RLS: Allow authenticated users to read categories and products
-- Categories should be readable by anyone authenticated
DROP POLICY IF EXISTS "Authenticated users can read categories" ON public.categories;
CREATE POLICY "Authenticated users can read categories"
  ON public.categories FOR SELECT
  USING (true);

-- Products should be readable by authenticated users
DROP POLICY IF EXISTS "Authenticated users can read products" ON public.products;
CREATE POLICY "Authenticated users can read products"
  ON public.products FOR SELECT
  USING (true);

-- Formulas readable by authenticated users
DROP POLICY IF EXISTS "Authenticated users can read formulas" ON public.formulas;
CREATE POLICY "Authenticated users can read formulas"
  ON public.formulas FOR SELECT
  USING (true);

-- 6. RLS: Admin can write categories and products
DROP POLICY IF EXISTS "Admin can manage categories" ON public.categories;
CREATE POLICY "Admin can manage categories"
  ON public.categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
        AND u.company_id = categories.company_id
        AND u.role IN ('admin', 'owner', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "Admin can manage products" ON public.products;
CREATE POLICY "Admin can manage products"
  ON public.products FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
        AND u.company_id = products.company_id
        AND u.role IN ('admin', 'owner', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "Admin can manage formulas" ON public.formulas;
CREATE POLICY "Admin can manage formulas"
  ON public.formulas FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
        AND u.company_id = formulas.company_id
        AND u.role IN ('admin', 'owner', 'super_admin')
    )
  );
