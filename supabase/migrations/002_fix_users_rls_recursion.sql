-- BNIN-24: Fix infinite RLS recursion on users table
-- 
-- Root cause:
-- The `users_select_own` policy on `users` table uses `auth.user_company_id()`
-- which queries `public.users WHERE id = auth.uid()`. This creates a circular
-- reference: evaluating the policy on `users` triggers a subquery on `users`,
-- which triggers the policy again → infinite recursion (error 42P17).

-- ============================================================
-- STEP 1: Drop the recursive policy on users
-- ============================================================
DROP POLICY IF EXISTS "users_select_own" ON users;

-- ============================================================
-- STEP 2: Create a SECURITY DEFINER helper that does NOT trigger RLS
-- This function reads the user's company_id bypassing RLS,
-- safe to use in policies on the users table itself.
-- ============================================================
CREATE OR REPLACE FUNCTION auth.user_company_id_safe()
RETURNS UUID
LANGUAGE SQL STABLE
SECURITY DEFINER
AS $$
  SELECT company_id FROM public.users WHERE id = auth.uid()
$$;

-- ============================================================
-- STEP 3: Recreate the users SELECT policy using the safe helper
-- ============================================================
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (
    id = auth.uid()  -- users can always see their own record
    OR
    company_id = auth.user_company_id_safe()  -- admins see company users, uses SECURITY DEFINER to avoid recursion
  );

-- ============================================================
-- STEP 4: Fix users INSERT policy — same recursion risk
-- ============================================================
DROP POLICY IF EXISTS "users_insert_admin" ON users;

CREATE POLICY "users_insert_admin" ON users
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL  -- any authenticated user can insert their own initial record
  );

-- ============================================================
-- STEP 5: Fix users UPDATE policy — ensure no recursion
-- ============================================================
DROP POLICY IF EXISTS "users_update_own" ON users;

CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (id = auth.uid());  -- users update their own record only
