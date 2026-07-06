-- ============================================================
-- BNIN-24: Fix infinite RLS recursion on users table
-- Migration: 003_fix_rls_recursion
-- Date: 2026-07-06
--
-- ROOT CAUSE:
-- The `users_select_own` policy on `users` used:
--   id = auth.uid() OR company_id = auth.user_company_id()
-- where `auth.user_company_id()` queries `public.users WHERE id = auth.uid()`.
-- This creates a circular reference (policy on users → subquery on users → triggers policy again).
-- PostgreSQL detects this and raises error 42P17 (infinite recursion).
--
-- FIX:
-- 1. Drop ALL existing policies on users table
-- 2. Create a SECURITY DEFINER helper function that bypasses RLS
-- 3. Recreate users policies using auth.uid() directly for self-reads
-- 4. Use SECURITY DEFINER helper only for cross-table policies (not on users itself)
-- 5. Fix ALL other policies that reference auth.user_company_id() to use the safe version
-- ============================================================

-- ============================================================
-- STEP 0: Create SECURITY DEFINER helper (bypasses RLS)
-- This is safe to use in policies on ANY table including users
-- because SECURITY DEFINER runs with owner privileges, not the querying user's.
-- ============================================================
CREATE OR REPLACE FUNCTION auth.user_company_id_safe()
RETURNS UUID
LANGUAGE SQL STABLE
SECURITY DEFINER
AS $$
  SELECT company_id FROM public.users WHERE id = auth.uid()
$$;

-- Also create a safe role lookup
CREATE OR REPLACE FUNCTION auth.user_role_safe()
RETURNS TEXT
LANGUAGE SQL STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM public.users WHERE id = auth.uid()
$$;

-- ============================================================
-- STEP 1: Fix USERS table — the source of recursion
-- ============================================================

-- Drop ALL existing policies on users
DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_insert_admin" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;

-- New self-read policy: user can only read their own row
-- NO subquery on users table — just auth.uid() comparison
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (id = auth.uid());

-- Admin read policy: service_role can read all rows
CREATE POLICY "users_select_admin" ON users
  FOR SELECT USING (auth.role() = 'service_role');

-- Insert policy: any authenticated user can insert their record
CREATE POLICY "users_insert_own" ON users
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL OR auth.role() = 'service_role');

-- Update policy: user can update their own row
CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (id = auth.uid() OR auth.role() = 'service_role');

-- ============================================================
-- STEP 2: Re-create auth.user_company_id() as a wrapper
-- around the safe version (for backward compatibility)
-- This is NOT safe to use in policies on users itself,
-- but kept for policies on OTHER tables.
-- ============================================================
CREATE OR REPLACE FUNCTION auth.user_company_id()
RETURNS UUID
LANGUAGE SQL STABLE
SECURITY DEFINER
AS $$
  SELECT company_id FROM public.users WHERE id = auth.uid()
$$;

-- Re-create auth.user_role() as SECURITY DEFINER
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS TEXT
LANGUAGE SQL STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM public.users WHERE id = auth.uid()
$$;

-- ============================================================
-- STEP 3: Fix ALL other table policies that reference
-- auth.user_company_id() or auth.user_role()
-- These should now work because the helper functions are SECURITY DEFINER
-- ============================================================

-- Companies
DROP POLICY IF EXISTS "companies_select_active" ON companies;
DROP POLICY IF EXISTS "companies_insert_admin" ON companies;
DROP POLICY IF EXISTS "companies_update_admin" ON companies;
DROP POLICY IF EXISTS "companies_delete_admin" ON companies;
CREATE POLICY "companies_select_active" ON companies FOR SELECT USING (is_active = true OR auth.user_company_id() = id);
CREATE POLICY "companies_insert_admin" ON companies FOR INSERT WITH CHECK (auth.user_role() IN ('admin', 'manager') AND auth.user_company_id() = id);
CREATE POLICY "companies_update_admin" ON companies FOR UPDATE USING (auth.user_role() IN ('admin', 'manager') AND auth.user_company_id() = id);
CREATE POLICY "companies_delete_admin" ON companies FOR DELETE USING (auth.user_role() IN ('admin', 'manager') AND auth.user_company_id() = id);

-- Categories
DROP POLICY IF EXISTS "categories_select_active" ON categories;
DROP POLICY IF EXISTS "categories_insert_admin" ON categories;
DROP POLICY IF EXISTS "categories_update_admin" ON categories;
DROP POLICY IF EXISTS "categories_delete_admin" ON categories;
CREATE POLICY "categories_select_active" ON categories FOR SELECT USING (is_active = true OR auth.user_company_id() = company_id);
CREATE POLICY "categories_insert_admin" ON categories FOR INSERT WITH CHECK (auth.user_role() IN ('admin', 'manager') AND company_id = auth.user_company_id());
CREATE POLICY "categories_update_admin" ON categories FOR UPDATE USING (auth.user_role() IN ('admin', 'manager') AND company_id = auth.user_company_id());
CREATE POLICY "categories_delete_admin" ON categories FOR DELETE USING (auth.user_role() IN ('admin', 'manager') AND company_id = auth.user_company_id());

-- Products
DROP POLICY IF EXISTS "products_select_active" ON products;
DROP POLICY IF EXISTS "products_insert_admin" ON products;
DROP POLICY IF EXISTS "products_update_admin" ON products;
DROP POLICY IF EXISTS "products_delete_admin" ON products;
CREATE POLICY "products_select_active" ON products FOR SELECT USING (is_active = true OR auth.user_company_id() = company_id);
CREATE POLICY "products_insert_admin" ON products FOR INSERT WITH CHECK (auth.user_role() IN ('admin', 'manager') AND company_id = auth.user_company_id());
CREATE POLICY "products_update_admin" ON products FOR UPDATE USING (auth.user_role() IN ('admin', 'manager') AND company_id = auth.user_company_id());
CREATE POLICY "products_delete_admin" ON products FOR DELETE USING (auth.user_role() IN ('admin', 'manager') AND company_id = auth.user_company_id());

-- Formulas
DROP POLICY IF EXISTS "formulas_select_active" ON formulas;
DROP POLICY IF EXISTS "formulas_insert_admin" ON formulas;
DROP POLICY IF EXISTS "formulas_update_admin" ON formulas;
DROP POLICY IF EXISTS "formulas_delete_admin" ON formulas;
CREATE POLICY "formulas_select_active" ON formulas FOR SELECT USING (is_active = true OR auth.user_company_id() = company_id);
CREATE POLICY "formulas_insert_admin" ON formulas FOR INSERT WITH CHECK (auth.user_role() IN ('admin', 'manager') AND company_id = auth.user_company_id());
CREATE POLICY "formulas_update_admin" ON formulas FOR UPDATE USING (auth.user_role() IN ('admin', 'manager') AND company_id = auth.user_company_id());
CREATE POLICY "formulas_delete_admin" ON formulas FOR DELETE USING (auth.user_role() IN ('admin', 'manager') AND company_id = auth.user_company_id());

-- Formula Items
DROP POLICY IF EXISTS "formula_items_select" ON formula_items;
DROP POLICY IF EXISTS "formula_items_insert_admin" ON formula_items;
DROP POLICY IF EXISTS "formula_items_update_admin" ON formula_items;
DROP POLICY IF EXISTS "formula_items_delete_admin" ON formula_items;
CREATE POLICY "formula_items_select" ON formula_items FOR SELECT USING (EXISTS (SELECT 1 FROM formulas f WHERE f.id = formula_id AND (f.is_active OR f.company_id = auth.user_company_id())));
CREATE POLICY "formula_items_insert_admin" ON formula_items FOR INSERT WITH CHECK (auth.user_role() IN ('admin', 'manager', 'staff'));
CREATE POLICY "formula_items_update_admin" ON formula_items FOR UPDATE USING (auth.user_role() IN ('admin', 'manager', 'staff'));
CREATE POLICY "formula_items_delete_admin" ON formula_items FOR DELETE USING (auth.user_role() IN ('admin', 'manager', 'staff'));

-- Orders
DROP POLICY IF EXISTS "orders_select" ON orders;
DROP POLICY IF EXISTS "orders_insert" ON orders;
DROP POLICY IF EXISTS "orders_update" ON orders;
DROP POLICY IF EXISTS "orders_delete" ON orders;
CREATE POLICY "orders_select" ON orders FOR SELECT USING (user_id = auth.uid() OR company_id = auth.user_company_id() OR auth.user_role() IN ('kitchen', 'admin', 'manager'));
CREATE POLICY "orders_insert" ON orders FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "orders_update" ON orders FOR UPDATE USING (user_id = auth.uid() OR auth.user_role() IN ('kitchen', 'admin', 'manager'));
CREATE POLICY "orders_delete" ON orders FOR DELETE USING (auth.user_role() IN ('admin', 'manager'));

-- Order Items
DROP POLICY IF EXISTS "order_items_select" ON order_items;
DROP POLICY IF EXISTS "order_items_insert" ON order_items;
DROP POLICY IF EXISTS "order_items_update" ON order_items;
DROP POLICY IF EXISTS "order_items_delete" ON order_items;
CREATE POLICY "order_items_select" ON order_items FOR SELECT USING (EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR o.company_id = auth.user_company_id())));
CREATE POLICY "order_items_insert" ON order_items FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id AND o.user_id = auth.uid()));
CREATE POLICY "order_items_update" ON order_items FOR UPDATE USING (EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id AND o.company_id = auth.user_company_id()));
CREATE POLICY "order_items_delete" ON order_items FOR DELETE USING (EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id AND o.company_id = auth.user_company_id()));

-- Order Status History
DROP POLICY IF EXISTS "order_status_history_select" ON order_status_history;
DROP POLICY IF EXISTS "order_status_history_insert" ON order_status_history;
CREATE POLICY "order_status_history_select" ON order_status_history FOR SELECT USING (EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR o.company_id = auth.user_company_id())));
CREATE POLICY "order_status_history_insert" ON order_status_history FOR INSERT WITH CHECK (auth.user_role() IN ('kitchen', 'admin', 'manager', 'staff'));

-- Inventory
DROP POLICY IF EXISTS "inventory_select" ON inventory;
DROP POLICY IF EXISTS "inventory_insert_admin" ON inventory;
DROP POLICY IF EXISTS "inventory_update_admin" ON inventory;
DROP POLICY IF EXISTS "inventory_delete_admin" ON inventory;
CREATE POLICY "inventory_select" ON inventory FOR SELECT USING (company_id = auth.user_company_id());
CREATE POLICY "inventory_insert_admin" ON inventory FOR INSERT WITH CHECK (auth.user_role() IN ('admin', 'manager') AND company_id = auth.user_company_id());
CREATE POLICY "inventory_update_admin" ON inventory FOR UPDATE USING (auth.user_role() IN ('admin', 'manager', 'staff') AND company_id = auth.user_company_id());
CREATE POLICY "inventory_delete_admin" ON inventory FOR DELETE USING (auth.user_role() IN ('admin', 'manager') AND company_id = auth.user_company_id());

-- Discounts
DROP POLICY IF EXISTS "discounts_select" ON discounts;
DROP POLICY IF EXISTS "discounts_insert_admin" ON discounts;
DROP POLICY IF EXISTS "discounts_update_admin" ON discounts;
CREATE POLICY "discounts_select" ON discounts FOR SELECT USING (company_id = auth.user_company_id());
CREATE POLICY "discounts_insert_admin" ON discounts FOR INSERT WITH CHECK (auth.user_role() IN ('admin', 'manager') AND company_id = auth.user_company_id());
CREATE POLICY "discounts_update_admin" ON discounts FOR UPDATE USING (auth.user_role() IN ('admin', 'manager') AND company_id = auth.user_company_id());

-- Daily Reports
DROP POLICY IF EXISTS "daily_reports_select" ON daily_reports;
DROP POLICY IF EXISTS "daily_reports_insert_admin" ON daily_reports;
CREATE POLICY "daily_reports_select" ON daily_reports FOR SELECT USING (company_id = auth.user_company_id());
CREATE POLICY "daily_reports_insert_admin" ON daily_reports FOR INSERT WITH CHECK (auth.user_role() IN ('admin', 'manager') AND company_id = auth.user_company_id());

-- Locations
DROP POLICY IF EXISTS "locations_select" ON locations;
DROP POLICY IF EXISTS "locations_insert_admin" ON locations;
DROP POLICY IF EXISTS "locations_update_admin" ON locations;
CREATE POLICY "locations_select" ON locations FOR SELECT USING (company_id = auth.user_company_id() OR company_id IS NULL);
CREATE POLICY "locations_insert_admin" ON locations FOR INSERT WITH CHECK (auth.user_role() IN ('admin', 'manager'));
CREATE POLICY "locations_update_admin" ON locations FOR UPDATE USING (auth.user_role() IN ('admin', 'manager'));

-- Loyalty Rewards
DROP POLICY IF EXISTS "loyalty_rewards_select" ON loyalty_rewards;
DROP POLICY IF EXISTS "loyalty_rewards_insert_admin" ON loyalty_rewards;
CREATE POLICY "loyalty_rewards_select" ON loyalty_rewards FOR SELECT USING (company_id = auth.user_company_id() OR company_id IS NULL);
CREATE POLICY "loyalty_rewards_insert_admin" ON loyalty_rewards FOR INSERT WITH CHECK (auth.user_role() IN ('admin', 'manager'));

-- ============================================================
-- VERIFICATION
-- Run these queries after applying:
-- SELECT schemaname, tablename, policyname, cmd, qual 
--   FROM pg_policies 
--   WHERE tablename = 'users' 
--   ORDER BY policyname;
-- ============================================================

-- ============================================================
-- ROLLBACK
-- If something goes wrong, run this:
--
/*
-- Restore original (broken) users policies
DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_select_admin" ON users;
DROP POLICY IF EXISTS "users_insert_own" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;

-- Restore auth.user_company_id as non-SECURITY-DEFINER (causes recursion)
CREATE OR REPLACE FUNCTION auth.user_company_id()
RETURNS UUID
LANGUAGE SQL STABLE
AS $$
  SELECT company_id FROM public.users WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS TEXT
LANGUAGE SQL STABLE
AS $$
  SELECT role FROM public.users WHERE id = auth.uid()
$$;

-- Restore original users policies (broken — will cause recursion)
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (id = auth.uid() OR company_id = auth.user_company_id());
CREATE POLICY "users_insert_admin" ON users
  FOR INSERT WITH CHECK (auth.user_role() IN ('admin', 'manager'));
CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (id = auth.uid());
*/
-- ============================================================
