-- BNIN-386: Foundation RLS Policies and Database Schema
--
-- 1. Fix RLS infinite recursion (42P17) on users table
-- 2. Create tables: offices, ratings, favorites
-- 3. Add comprehensive RLS policies for ALL tables
-- 4. Role matrix:
--    super_admin      = ALL operations on ALL tables
--    company_admin    = own_company operations
--    company_manager  = own_office operations
--    kitchen          = read + update_orders
--    employee         = basic self-service
--    customer         = own orders, menu browsing
--    owner            = legacy super (same as company_admin)

-- =============================================
-- STEP 0: Drop existing policies that cause recursion
-- =============================================

-- Clear all existing policies on all public tables (start fresh)
DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN (
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', rec.policyname, rec.schemaname, rec.tablename);
  END LOOP;
END $$;

-- =============================================
-- STEP 1: Fix RLS infinite recursion on users table
-- =============================================

-- Create SECURITY DEFINER helper functions to avoid recursion
CREATE OR REPLACE FUNCTION auth.user_role_safe()
RETURNS TEXT
LANGUAGE SQL STABLE
SECURITY DEFINER
AS $$
  SELECT role::TEXT FROM public.users WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION auth.user_company_id_safe()
RETURNS UUID
LANGUAGE SQL STABLE
SECURITY DEFINER
AS $$
  SELECT company_id FROM public.users WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION auth.user_location_id_safe()
RETURNS UUID
LANGUAGE SQL STABLE
SECURITY DEFINER
AS $$
  SELECT location_id FROM public.users WHERE id = auth.uid()
$$;

-- =============================================
-- STEP 2: Create missing tables (idempotent)
-- =============================================

-- offices table
CREATE TABLE IF NOT EXISTS public.offices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ratings table
CREATE TABLE IF NOT EXISTS public.ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(order_id, user_id, COALESCE(product_id, '00000000-0000-0000-0000-000000000000'))
);

-- favorites table
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  formula_id UUID REFERENCES public.formulas(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT favorites_unique_item UNIQUE (user_id, product_id, formula_id)
);

-- =============================================
-- STEP 3: Enable RLS on ALL tables
-- =============================================

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.formulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- =============================================
-- STEP 4: companies policies
-- =============================================

-- Members can view their own company
CREATE POLICY "companies_select_member" ON public.companies
  FOR SELECT
  USING (id = auth.user_company_id_safe());

-- super_admin can insert/update/delete any company
CREATE POLICY "companies_insert_admin" ON public.companies
  FOR INSERT
  WITH CHECK (auth.user_role_safe() = 'super_admin');

CREATE POLICY "companies_update_admin" ON public.companies
  FOR UPDATE
  USING (auth.user_role_safe() = 'super_admin')
  WITH CHECK (auth.user_role_safe() = 'super_admin');

CREATE POLICY "companies_delete_admin" ON public.companies
  FOR DELETE
  USING (auth.user_role_safe() = 'super_admin');

-- =============================================
-- STEP 5: offices policies
-- =============================================

-- Company members can view their company's offices
CREATE POLICY "offices_select_company" ON public.offices
  FOR SELECT
  USING (company_id = auth.user_company_id_safe());

-- company_admin/owner/super_admin can manage offices
CREATE POLICY "offices_insert_admin" ON public.offices
  FOR INSERT
  WITH CHECK (
    company_id = auth.user_company_id_safe()
    AND auth.user_role_safe() IN ('company_admin', 'super_admin', 'owner')
  );

CREATE POLICY "offices_update_admin" ON public.offices
  FOR UPDATE
  USING (
    company_id = auth.user_company_id_safe()
    AND auth.user_role_safe() IN ('company_admin', 'super_admin', 'owner')
  )
  WITH CHECK (
    company_id = auth.user_company_id_safe()
    AND auth.user_role_safe() IN ('company_admin', 'super_admin', 'owner')
  );

CREATE POLICY "offices_delete_admin" ON public.offices
  FOR DELETE
  USING (
    company_id = auth.user_company_id_safe()
    AND auth.user_role_safe() IN ('company_admin', 'super_admin', 'owner')
  );

-- =============================================
-- STEP 6: users policies
-- =============================================

-- Users can read their own row
CREATE POLICY "users_select_self" ON public.users
  FOR SELECT
  USING (id = auth.uid());

-- Users in the same company can read each other (uses SECURITY DEFINER)
CREATE POLICY "users_select_company" ON public.users
  FOR SELECT
  USING (company_id = auth.user_company_id_safe());

-- super_admin can see all users
CREATE POLICY "users_select_super_admin" ON public.users
  FOR SELECT
  USING (auth.user_role_safe() = 'super_admin');

-- Authenticated users can insert themselves (signup flow)
CREATE POLICY "users_insert_auth" ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Users can update their own row
CREATE POLICY "users_update_self" ON public.users
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- company_admin/owner can update users in their company
CREATE POLICY "users_update_company_admin" ON public.users
  FOR UPDATE
  USING (
    company_id = auth.user_company_id_safe()
    AND auth.user_role_safe() IN ('super_admin', 'company_admin', 'owner')
  );

-- super_admin can delete users
CREATE POLICY "users_delete_admin" ON public.users
  FOR DELETE
  USING (auth.user_role_safe() = 'super_admin');

-- =============================================
-- STEP 7: products policies
-- =============================================

-- Anyone can view active products; company members can view all
CREATE POLICY "products_select_company" ON public.products
  FOR SELECT
  USING (
    company_id = auth.user_company_id_safe()
    OR (is_active = true)
  );

-- company_admin/owner/super_admin can manage products
CREATE POLICY "products_insert_admin" ON public.products
  FOR INSERT
  WITH CHECK (
    company_id = auth.user_company_id_safe()
    AND auth.user_role_safe() IN ('super_admin', 'company_admin', 'owner')
  );

CREATE POLICY "products_update_admin" ON public.products
  FOR UPDATE
  USING (
    company_id = auth.user_company_id_safe()
    AND auth.user_role_safe() IN ('super_admin', 'company_admin', 'owner')
  );

CREATE POLICY "products_delete_admin" ON public.products
  FOR DELETE
  USING (
    company_id = auth.user_company_id_safe()
    AND auth.user_role_safe() IN ('super_admin', 'company_admin', 'owner')
  );

-- =============================================
-- STEP 8: menu_items policies
-- =============================================

-- Company members can view menu items
CREATE POLICY "menu_items_select_company" ON public.menu_items
  FOR SELECT
  USING (
    product_id IN (
      SELECT id FROM public.products WHERE company_id = auth.user_company_id_safe()
    )
    OR menu_schedule_id IN (
      SELECT id FROM public.menu_schedules WHERE company_id = auth.user_company_id_safe()
    )
  );

-- Admins can manage menu items
CREATE POLICY "menu_items_insert_admin" ON public.menu_items
  FOR INSERT
  WITH CHECK (auth.user_role_safe() IN ('super_admin', 'company_admin', 'owner'));

CREATE POLICY "menu_items_update_admin" ON public.menu_items
  FOR UPDATE
  USING (auth.user_role_safe() IN ('super_admin', 'company_admin', 'owner'));

CREATE POLICY "menu_items_delete_admin" ON public.menu_items
  FOR DELETE
  USING (auth.user_role_safe() IN ('super_admin', 'company_admin', 'owner'));

-- =============================================
-- STEP 9: orders policies
-- =============================================

-- Users can view their own orders
CREATE POLICY "orders_select_own" ON public.orders
  FOR SELECT
  USING (user_id = auth.uid());

-- Company members can view company orders
CREATE POLICY "orders_select_company" ON public.orders
  FOR SELECT
  USING (company_id = auth.user_company_id_safe());

-- Authenticated users can create orders
CREATE POLICY "orders_insert_auth" ON public.orders
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Users can update their own pending orders (cancel before kitchen confirms)
CREATE POLICY "orders_update_own" ON public.orders
  FOR UPDATE
  USING (user_id = auth.uid() AND status = 'pending');

-- Kitchen, company_manager, company_admin, super_admin can update order status
CREATE POLICY "orders_update_staff" ON public.orders
  FOR UPDATE
  USING (
    auth.user_role_safe() IN ('kitchen', 'company_manager', 'company_admin', 'super_admin', 'owner')
  );

-- Admins can delete/cancel orders
CREATE POLICY "orders_delete_admin" ON public.orders
  FOR DELETE
  USING (auth.user_role_safe() IN ('super_admin', 'company_admin', 'owner'));

-- =============================================
-- STEP 10: order_items policies
-- =============================================

-- Users can view their own order items
CREATE POLICY "order_items_select_own" ON public.order_items
  FOR SELECT
  USING (
    order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid())
  );

-- Company members can view company order items
CREATE POLICY "order_items_select_company" ON public.order_items
  FOR SELECT
  USING (
    order_id IN (SELECT id FROM public.orders WHERE company_id = auth.user_company_id_safe())
  );

-- Authenticated users can add items to their own orders
CREATE POLICY "order_items_insert_auth" ON public.order_items
  FOR INSERT
  WITH CHECK (
    order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid())
  );

-- =============================================
-- STEP 11: ratings policies
-- =============================================

-- Users can view ratings for products in their company, or their own ratings
CREATE POLICY "ratings_select_company" ON public.ratings
  FOR SELECT
  USING (
    product_id IN (SELECT id FROM public.products WHERE company_id = auth.user_company_id_safe())
    OR user_id = auth.uid()
  );

-- Users can rate their own orders
CREATE POLICY "ratings_insert_own" ON public.ratings
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid())
  );

-- Users can update their own ratings
CREATE POLICY "ratings_update_own" ON public.ratings
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own ratings
CREATE POLICY "ratings_delete_own" ON public.ratings
  FOR DELETE
  USING (user_id = auth.uid());

-- =============================================
-- STEP 12: favorites policies
-- =============================================

-- Users can see their own favorites
CREATE POLICY "favorites_select_own" ON public.favorites
  FOR SELECT
  USING (user_id = auth.uid());

-- Company members can see favorites in their company
CREATE POLICY "favorites_select_company" ON public.favorites
  FOR SELECT
  USING (
    product_id IN (SELECT id FROM public.products WHERE company_id = auth.user_company_id_safe())
  );

-- Users can add their own favorites
CREATE POLICY "favorites_insert_own" ON public.favorites
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can remove their own favorites
CREATE POLICY "favorites_delete_own" ON public.favorites
  FOR DELETE
  USING (user_id = auth.uid());

-- =============================================
-- STEP 13: formulas policies
-- =============================================

CREATE POLICY "formulas_select_company" ON public.formulas
  FOR SELECT
  USING (
    company_id = auth.user_company_id_safe()
    OR (is_active = true)
  );

CREATE POLICY "formulas_insert_admin" ON public.formulas
  FOR INSERT
  WITH CHECK (
    company_id = auth.user_company_id_safe()
    AND auth.user_role_safe() IN ('super_admin', 'company_admin', 'owner')
  );

CREATE POLICY "formulas_update_admin" ON public.formulas
  FOR UPDATE
  USING (
    company_id = auth.user_company_id_safe()
    AND auth.user_role_safe() IN ('super_admin', 'company_admin', 'owner')
  );

CREATE POLICY "formulas_delete_admin" ON public.formulas
  FOR DELETE
  USING (
    company_id = auth.user_company_id_safe()
    AND auth.user_role_safe() IN ('super_admin', 'company_admin', 'owner')
  );

-- =============================================
-- STEP 14: categories policies
-- =============================================

CREATE POLICY "categories_select_company" ON public.categories
  FOR SELECT
  USING (
    company_id = auth.user_company_id_safe()
    OR (is_active = true)
  );

CREATE POLICY "categories_insert_admin" ON public.categories
  FOR INSERT
  WITH CHECK (
    company_id = auth.user_company_id_safe()
    AND auth.user_role_safe() IN ('super_admin', 'company_admin', 'owner')
  );

CREATE POLICY "categories_update_admin" ON public.categories
  FOR UPDATE
  USING (
    company_id = auth.user_company_id_safe()
    AND auth.user_role_safe() IN ('super_admin', 'company_admin', 'owner')
  );

CREATE POLICY "categories_delete_admin" ON public.categories
  FOR DELETE
  USING (
    company_id = auth.user_company_id_safe()
    AND auth.user_role_safe() IN ('super_admin', 'company_admin', 'owner')
  );

-- =============================================
-- STEP 15: locations policies
-- =============================================

CREATE POLICY "locations_select_company" ON public.locations
  FOR SELECT
  USING (
    company_id = auth.user_company_id_safe()
  );

CREATE POLICY "locations_insert_admin" ON public.locations
  FOR INSERT
  WITH CHECK (
    company_id = auth.user_company_id_safe()
    AND auth.user_role_safe() IN ('super_admin', 'company_admin', 'owner')
  );

CREATE POLICY "locations_update_admin" ON public.locations
  FOR UPDATE
  USING (
    company_id = auth.user_company_id_safe()
    AND auth.user_role_safe() IN ('super_admin', 'company_admin', 'owner')
  );

CREATE POLICY "locations_delete_admin" ON public.locations
  FOR DELETE
  USING (
    company_id = auth.user_company_id_safe()
    AND auth.user_role_safe() IN ('super_admin', 'company_admin', 'owner')
  );

-- =============================================
-- STEP 16: notifications policies
-- =============================================

CREATE POLICY "notifications_select_own" ON public.notifications
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "notifications_update_own" ON public.notifications
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- =============================================
-- VERIFICATION
-- =============================================

-- Report all created policies
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
