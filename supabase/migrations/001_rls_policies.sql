-- Bningoo RLS Policies
-- Run this in Supabase SQL Editor (Project → SQL Editor)
-- 
-- This migration enables Row Level Security on all tables
-- and creates policies based on user roles.

-- ============================================================
-- 1. ENABLE RLS ON ALL TABLES
-- ============================================================
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE formulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE formula_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE formula_inclusions ENABLE ROW LEVEL SECURITY;
ALTER TABLE formula_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE option_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE option_choices ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_option_choices ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_rewards ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2. HELPER FUNCTION: Get current user's company_id
-- ============================================================
CREATE OR REPLACE FUNCTION auth.user_company_id()
RETURNS UUID
LANGUAGE SQL STABLE
AS $$
  SELECT company_id FROM public.users WHERE id = auth.uid()
$$;

-- ============================================================
-- 3. HELPER FUNCTION: Get current user's role
-- ============================================================
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS TEXT
LANGUAGE SQL STABLE
AS $$
  SELECT role FROM public.users WHERE id = auth.uid()
$$;

-- ============================================================
-- 4. COMPANIES — Admins can manage their own; public can read active
-- ============================================================
CREATE POLICY "companies_select_active" ON companies
  FOR SELECT USING (is_active = true OR auth.user_company_id() = id);

CREATE POLICY "companies_insert_admin" ON companies
  FOR INSERT WITH CHECK (auth.user_role() = 'admin' AND auth.user_company_id() = id);

CREATE POLICY "companies_update_admin" ON companies
  FOR UPDATE USING (auth.user_role() = 'admin' AND auth.user_company_id() = id);

CREATE POLICY "companies_delete_admin" ON companies
  FOR DELETE USING (auth.user_role() = 'admin' AND auth.user_company_id() = id);

-- ============================================================
-- 5. USERS — Read own; admins read company users
-- ============================================================
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (id = auth.uid() OR company_id = auth.user_company_id());

CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "users_insert_admin" ON users
  FOR INSERT WITH CHECK (auth.user_role() IN ('admin', 'manager'));

-- ============================================================
-- 6. CATEGORIES — Public read active; admin CRUD
-- ============================================================
CREATE POLICY "categories_select_active" ON categories
  FOR SELECT USING (is_active = true OR auth.user_company_id() = company_id);

CREATE POLICY "categories_insert_admin" ON categories
  FOR INSERT WITH CHECK (auth.user_role() IN ('admin', 'manager') AND company_id = auth.user_company_id());

CREATE POLICY "categories_update_admin" ON categories
  FOR UPDATE USING (auth.user_role() IN ('admin', 'manager') AND company_id = auth.user_company_id());

CREATE POLICY "categories_delete_admin" ON categories
  FOR DELETE USING (auth.user_role() IN ('admin', 'manager') AND company_id = auth.user_company_id());

-- ============================================================
-- 7. PRODUCTS — Public read active; admin CRUD
-- ============================================================
CREATE POLICY "products_select_active" ON products
  FOR SELECT USING (is_active = true OR auth.user_company_id() = company_id);

CREATE POLICY "products_insert_admin" ON products
  FOR INSERT WITH CHECK (auth.user_role() IN ('admin', 'manager') AND company_id = auth.user_company_id());

CREATE POLICY "products_update_admin" ON products
  FOR UPDATE USING (auth.user_role() IN ('admin', 'manager') AND company_id = auth.user_company_id());

CREATE POLICY "products_delete_admin" ON products
  FOR DELETE USING (auth.user_role() IN ('admin', 'manager') AND company_id = auth.user_company_id());

-- ============================================================
-- 8. FORMULAS — Public read active; admin CRUD
-- ============================================================
CREATE POLICY "formulas_select_active" ON formulas
  FOR SELECT USING (is_active = true OR auth.user_company_id() = company_id);

CREATE POLICY "formulas_insert_admin" ON formulas
  FOR INSERT WITH CHECK (auth.user_role() IN ('admin', 'manager') AND company_id = auth.user_company_id());

CREATE POLICY "formulas_update_admin" ON formulas
  FOR UPDATE USING (auth.user_role() IN ('admin', 'manager') AND company_id = auth.user_company_id());

CREATE POLICY "formulas_delete_admin" ON formulas
  FOR DELETE USING (auth.user_role() IN ('admin', 'manager') AND company_id = auth.user_company_id());

-- ============================================================
-- 9. FORMULA ITEMS — Linked to formula's company
-- ============================================================
CREATE POLICY "formula_items_select" ON formula_items
  FOR SELECT USING (EXISTS (SELECT 1 FROM formulas f WHERE f.id = formula_id AND (f.is_active OR f.company_id = auth.user_company_id())));

CREATE POLICY "formula_items_insert_admin" ON formula_items
  FOR INSERT WITH CHECK (auth.user_role() IN ('admin', 'manager', 'staff'));

CREATE POLICY "formula_items_update_admin" ON formula_items
  FOR UPDATE USING (auth.user_role() IN ('admin', 'manager', 'staff'));

CREATE POLICY "formula_items_delete_admin" ON formula_items
  FOR DELETE USING (auth.user_role() IN ('admin', 'manager', 'staff'));

-- ============================================================
-- 10. FORMULA INCLUSIONS
-- ============================================================
CREATE POLICY "formula_inclusions_select" ON formula_inclusions
  FOR SELECT USING (EXISTS (SELECT 1 FROM formulas f WHERE f.id = formula_id));

CREATE POLICY "formula_inclusions_insert_admin" ON formula_inclusions
  FOR INSERT WITH CHECK (auth.user_role() IN ('admin', 'manager'));

CREATE POLICY "formula_inclusions_update_admin" ON formula_inclusions
  FOR UPDATE USING (auth.user_role() IN ('admin', 'manager'));

CREATE POLICY "formula_inclusions_delete_admin" ON formula_inclusions
  FOR DELETE USING (auth.user_role() IN ('admin', 'manager'));

-- ============================================================
-- 11. OPTION GROUPS & CHOICES — Public read; admin CRUD
-- ============================================================
CREATE POLICY "option_groups_select" ON option_groups
  FOR SELECT USING (true);

CREATE POLICY "option_groups_insert_admin" ON option_groups
  FOR INSERT WITH CHECK (auth.user_role() IN ('admin', 'manager'));

CREATE POLICY "option_groups_update_admin" ON option_groups
  FOR UPDATE USING (auth.user_role() IN ('admin', 'manager'));

CREATE POLICY "option_groups_delete_admin" ON option_groups
  FOR DELETE USING (auth.user_role() IN ('admin', 'manager'));

CREATE POLICY "option_choices_select" ON option_choices
  FOR SELECT USING (true);

CREATE POLICY "option_choices_insert_admin" ON option_choices
  FOR INSERT WITH CHECK (auth.user_role() IN ('admin', 'manager'));

CREATE POLICY "option_choices_update_admin" ON option_choices
  FOR UPDATE USING (auth.user_role() IN ('admin', 'manager'));

CREATE POLICY "option_choices_delete_admin" ON option_choices
  FOR DELETE USING (auth.user_role() IN ('admin', 'manager'));

-- ============================================================
-- 12. MENU SCHEDULES & ITEMS
-- ============================================================
CREATE POLICY "menu_schedules_select" ON menu_schedules
  FOR SELECT USING (is_active = true OR auth.user_company_id() = company_id);

CREATE POLICY "menu_schedules_insert_admin" ON menu_schedules
  FOR INSERT WITH CHECK (auth.user_role() IN ('admin', 'manager') AND company_id = auth.user_company_id());

CREATE POLICY "menu_schedules_update_admin" ON menu_schedules
  FOR UPDATE USING (auth.user_role() IN ('admin', 'manager') AND company_id = auth.user_company_id());

CREATE POLICY "menu_schedules_delete_admin" ON menu_schedules
  FOR DELETE USING (auth.user_role() IN ('admin', 'manager') AND company_id = auth.user_company_id());

CREATE POLICY "menu_items_select" ON menu_items
  FOR SELECT USING (true);

CREATE POLICY "menu_items_insert_admin" ON menu_items
  FOR INSERT WITH CHECK (auth.user_role() IN ('admin', 'manager'));

CREATE POLICY "menu_items_update_admin" ON menu_items
  FOR UPDATE USING (auth.user_role() IN ('admin', 'manager'));

CREATE POLICY "menu_items_delete_admin" ON menu_items
  FOR DELETE USING (auth.user_role() IN ('admin', 'manager'));

-- ============================================================
-- 13. ORDERS — User reads own; admin reads company; kitchen reads all
-- ============================================================
CREATE POLICY "orders_select" ON orders
  FOR SELECT USING (
    user_id = auth.uid()
    OR company_id = auth.user_company_id()
    OR auth.user_role() IN ('kitchen', 'admin', 'manager')
  );

CREATE POLICY "orders_insert" ON orders
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "orders_update" ON orders
  FOR UPDATE USING (
    user_id = auth.uid()
    OR auth.user_role() IN ('kitchen', 'admin', 'manager')
  );

CREATE POLICY "orders_delete" ON orders
  FOR DELETE USING (auth.user_role() IN ('admin', 'manager'));

-- ============================================================
-- 14. ORDER ITEMS — Same scope as orders
-- ============================================================
CREATE POLICY "order_items_select" ON order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id AND (
      o.user_id = auth.uid() OR o.company_id = auth.user_company_id()
    ))
  );

CREATE POLICY "order_items_insert" ON order_items
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id AND o.user_id = auth.uid()));

CREATE POLICY "order_items_update" ON order_items
  FOR UPDATE USING (EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id AND o.company_id = auth.user_company_id()));

CREATE POLICY "order_items_delete" ON order_items
  FOR DELETE USING (EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id AND o.company_id = auth.user_company_id()));

-- ============================================================
-- 15. ORDER STATUS HISTORY
-- ============================================================
CREATE POLICY "order_status_history_select" ON order_status_history
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id AND (
      o.user_id = auth.uid() OR o.company_id = auth.user_company_id()
    ))
  );

CREATE POLICY "order_status_history_insert" ON order_status_history
  FOR INSERT WITH CHECK (auth.user_role() IN ('kitchen', 'admin', 'manager', 'staff'));

-- ============================================================
-- 16. INVENTORY — Admin/manager/kitchen CRUD
-- ============================================================
CREATE POLICY "inventory_select" ON inventory
  FOR SELECT USING (company_id = auth.user_company_id());

CREATE POLICY "inventory_insert_admin" ON inventory
  FOR INSERT WITH CHECK (auth.user_role() IN ('admin', 'manager') AND company_id = auth.user_company_id());

CREATE POLICY "inventory_update_admin" ON inventory
  FOR UPDATE USING (auth.user_role() IN ('admin', 'manager', 'staff') AND company_id = auth.user_company_id());

CREATE POLICY "inventory_delete_admin" ON inventory
  FOR DELETE USING (auth.user_role() IN ('admin', 'manager') AND company_id = auth.user_company_id());

-- ============================================================
-- 17. INVENTORY TRANSACTIONS
-- ============================================================
CREATE POLICY "inventory_transactions_select" ON inventory_transactions
  FOR SELECT USING (EXISTS (SELECT 1 FROM inventory i WHERE i.id = inventory_id AND i.company_id = auth.user_company_id()));

CREATE POLICY "inventory_transactions_insert" ON inventory_transactions
  FOR INSERT WITH CHECK (auth.user_role() IN ('admin', 'manager', 'staff'));

-- ============================================================
-- 18. DISCOUNTS
-- ============================================================
CREATE POLICY "discounts_select" ON discounts
  FOR SELECT USING (company_id = auth.user_company_id());

CREATE POLICY "discounts_insert_admin" ON discounts
  FOR INSERT WITH CHECK (auth.user_role() IN ('admin', 'manager') AND company_id = auth.user_company_id());

CREATE POLICY "discounts_update_admin" ON discounts
  FOR UPDATE USING (auth.user_role() IN ('admin', 'manager') AND company_id = auth.user_company_id());

-- ============================================================
-- 19. DAILY REPORTS
-- ============================================================
CREATE POLICY "daily_reports_select" ON daily_reports
  FOR SELECT USING (company_id = auth.user_company_id());

CREATE POLICY "daily_reports_insert_admin" ON daily_reports
  FOR INSERT WITH CHECK (auth.user_role() IN ('admin', 'manager') AND company_id = auth.user_company_id());

-- ============================================================
-- 20. NOTIFICATIONS
-- ============================================================
CREATE POLICY "notifications_select" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "notifications_update" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- ============================================================
-- 21. LOCATIONS
-- ============================================================
CREATE POLICY "locations_select" ON locations
  FOR SELECT USING (company_id = auth.user_company_id() OR company_id IS NULL);

CREATE POLICY "locations_insert_admin" ON locations
  FOR INSERT WITH CHECK (auth.user_role() IN ('admin', 'manager'));

CREATE POLICY "locations_update_admin" ON locations
  FOR UPDATE USING (auth.user_role() IN ('admin', 'manager'));

-- ============================================================
-- 22. LOYALTY
-- ============================================================
CREATE POLICY "loyalty_points_select" ON loyalty_points
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "loyalty_rewards_select" ON loyalty_rewards
  FOR SELECT USING (company_id = auth.user_company_id() OR company_id IS NULL);

CREATE POLICY "loyalty_rewards_insert_admin" ON loyalty_rewards
  FOR INSERT WITH CHECK (auth.user_role() IN ('admin', 'manager'));

-- ============================================================
-- 23. PRODUCT OPTIONS
-- ============================================================
CREATE POLICY "product_options_select" ON product_options
  FOR SELECT USING (true);

CREATE POLICY "product_options_insert_admin" ON product_options
  FOR INSERT WITH CHECK (auth.user_role() IN ('admin', 'manager'));

CREATE POLICY "product_options_update_admin" ON product_options
  FOR UPDATE USING (auth.user_role() IN ('admin', 'manager'));

CREATE POLICY "product_option_choices_select" ON product_option_choices
  FOR SELECT USING (true);

CREATE POLICY "product_option_choices_insert_admin" ON product_option_choices
  FOR INSERT WITH CHECK (auth.user_role() IN ('admin', 'manager'));

CREATE POLICY "product_option_choices_update_admin" ON product_option_choices
  FOR UPDATE USING (auth.user_role() IN ('admin', 'manager'));
