-- BNIN-213: Create Menu Core Tables + Profiles
-- menu_categories, menu_items, profiles for the menu app

-- ============================================================
-- 1. MENU CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS menu_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 2. MENU ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES menu_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  image TEXT,
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  prep_time INTEGER DEFAULT 0,
  badges TEXT[] DEFAULT '{}',
  is_available BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for faster category-based queries
CREATE INDEX IF NOT EXISTS idx_menu_items_category_id ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_active ON menu_items(is_active) WHERE is_active = true;

-- ============================================================
-- 3. PROFILES (sync with auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'customer',
  company_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 4. RLS POLICIES
-- ============================================================

-- menu_categories: authenticated users can read, admin can write
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "menu_categories_select_authenticated" ON menu_categories
  FOR SELECT USING (auth.role() = 'authenticated' OR is_active = true);

CREATE POLICY "menu_categories_insert_admin" ON menu_categories
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  ));

CREATE POLICY "menu_categories_update_admin" ON menu_categories
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  ));

CREATE POLICY "menu_categories_delete_admin" ON menu_categories
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  ));

-- menu_items: authenticated users can read, admin can write
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "menu_items_select_authenticated" ON menu_items
  FOR SELECT USING (auth.role() = 'authenticated' OR is_active = true);

CREATE POLICY "menu_items_insert_admin" ON menu_items
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  ));

CREATE POLICY "menu_items_update_admin" ON menu_items
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  ));

CREATE POLICY "menu_items_delete_admin" ON menu_items
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  ));

-- profiles: user can read own, admin can read all
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- Trigger to auto-create profile on auth.users insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    'customer'
  );
  RETURN NEW;
END;
$$;

-- Trigger on auth.users for new signups
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 5. SEED DATA: Categories
-- ============================================================
INSERT INTO menu_categories (name, slug, icon, sort_order, is_active) VALUES
  ('All', 'all', '🍽️', 0, true),
  ('Breakfast', 'breakfast', '🌅', 1, true),
  ('Lunch', 'lunch', '🍱', 2, true),
  ('Dinner', 'dinner', '🍛', 3, true),
  ('Drinks', 'drinks', '🥤', 4, true),
  ('Coffee', 'coffee', '☕', 5, true),
  ('Healthy', 'healthy', '🥗', 6, true),
  ('Snacks', 'snacks', '🍿', 7, true),
  ('Desserts', 'desserts', '🍰', 8, true)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 6. SEED DATA: Menu Items (24 items)
-- ============================================================

-- Helper: get category id by slug
DO $$
DECLARE
  cat_breakfast UUID; cat_lunch UUID; cat_dinner UUID;
  cat_drinks UUID; cat_coffee UUID; cat_healthy UUID;
  cat_snacks UUID; cat_desserts UUID;
BEGIN
  SELECT id INTO cat_breakfast FROM menu_categories WHERE slug = 'breakfast';
  SELECT id INTO cat_lunch FROM menu_categories WHERE slug = 'lunch';
  SELECT id INTO cat_dinner FROM menu_categories WHERE slug = 'dinner';
  SELECT id INTO cat_drinks FROM menu_categories WHERE slug = 'drinks';
  SELECT id INTO cat_coffee FROM menu_categories WHERE slug = 'coffee';
  SELECT id INTO cat_healthy FROM menu_categories WHERE slug = 'healthy';
  SELECT id INTO cat_snacks FROM menu_categories WHERE slug = 'snacks';
  SELECT id INTO cat_desserts FROM menu_categories WHERE slug = 'desserts';

  -- Breakfast (3)
  INSERT INTO menu_items (category_id, name, description, price, image, rating, review_count, prep_time, badges, is_available) VALUES
    (cat_breakfast, 'Classic Pancakes', 'Fluffy buttermilk pancakes with maple syrup and fresh berries', 8.99, 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop', 4.8, 156, 12, ARRAY['best_seller'], true),
    (cat_breakfast, 'Avocado Toast', 'Artisan sourdough with smashed avocado, cherry tomatoes, olive oil', 6.99, 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400&h=300&fit=crop', 4.3, 76, 7, '{}', true),
    (cat_breakfast, 'Breakfast Burrito', 'Scrambled eggs, cheese, bacon, and salsa in a flour tortilla', 9.49, 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=300&fit=crop', 4.5, 112, 10, ARRAY['chef_choice'], true);

  -- Lunch (4)
  INSERT INTO menu_items (category_id, name, description, price, image, rating, review_count, prep_time, badges, is_available) VALUES
    (cat_lunch, 'Beef Burger', 'Quarter-pound beef patty with lettuce, tomato, onion, special sauce', 10.99, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop', 4.8, 245, 15, ARRAY['chef_choice'], true),
    (cat_lunch, 'Chicken Wrap', 'Grilled chicken, mixed greens, tomato, ranch dressing in a tortilla', 8.49, 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=300&fit=crop', 4.2, 89, 10, '{}', true),
    (cat_lunch, 'Mushroom Risotto', 'Creamy Arborio rice with wild mushrooms, parmesan, truffle oil', 12.49, 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&h=300&fit=crop', 4.6, 73, 22, ARRAY['chef_choice'], true),
    (cat_lunch, 'Caesar Salad', 'Romaine lettuce, parmesan, croutons, classic Caesar dressing', 7.99, 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop', 4.4, 134, 8, '{}', true);

  -- Dinner (3)
  INSERT INTO menu_items (category_id, name, description, price, image, rating, review_count, prep_time, badges, is_available) VALUES
    (cat_dinner, 'Grilled Salmon', 'Atlantic salmon fillet with lemon butter sauce and seasonal vegetables', 16.99, 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop', 4.9, 198, 25, ARRAY['best_seller', 'chef_choice'], true),
    (cat_dinner, 'Chicken Alfredo', 'Fettuccine with creamy alfredo sauce, grilled chicken, and parmesan', 11.99, 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=400&h=300&fit=crop', 4.6, 167, 18, ARRAY['best_seller'], true),
    (cat_dinner, 'Vegetable Stir Fry', 'Mixed vegetables with tofu in a savory ginger soy sauce', 9.99, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop', 4.1, 54, 14, '{}', true);

  -- Drinks (3)
  INSERT INTO menu_items (category_id, name, description, price, image, rating, review_count, prep_time, badges, is_available) VALUES
    (cat_drinks, 'Fresh Orange Juice', 'Freshly squeezed Valencia oranges, no added sugar', 3.99, 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400&h=300&fit=crop', 4.3, 45, 3, '{}', true),
    (cat_drinks, 'Mango Lassi', 'Creamy yogurt drink with ripe Alphonso mangoes and cardamom', 4.49, 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=400&h=300&fit=crop', 4.4, 67, 4, '{}', true),
    (cat_drinks, 'Iced Tea', 'Freshly brewed black tea served over ice with a hint of lemon', 2.99, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop', 4.2, 88, 2, '{}', true);

  -- Coffee (3)
  INSERT INTO menu_items (category_id, name, description, price, image, rating, review_count, prep_time, badges, is_available) VALUES
    (cat_coffee, 'Americano Coffee', 'Freshly brewed espresso with hot water, premium Arabica beans', 3.49, 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop', 4.7, 312, 3, ARRAY['best_seller'], true),
    (cat_coffee, 'Cappuccino', 'Espresso with steamed milk and velvety foam, dusted with cocoa', 4.29, 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop', 4.6, 234, 4, '{}', true),
    (cat_coffee, 'Iced Latte', 'Chilled espresso with cold milk poured over ice', 4.49, 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop', 4.5, 156, 3, '{}', true);

  -- Healthy (3)
  INSERT INTO menu_items (category_id, name, description, price, image, rating, review_count, prep_time, badges, is_available) VALUES
    (cat_healthy, 'Veggie Buddha Bowl', 'Quinoa bowl with roasted sweet potato, chickpeas, hummus, tahini', 10.49, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop', 4.2, 58, 14, '{}', true),
    (cat_healthy, 'Greek Salad', 'Tomatoes, cucumber, olives, feta cheese with oregano dressing', 7.49, 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop', 4.3, 92, 6, '{}', true),
    (cat_healthy, 'Protein Smoothie', 'Banana, whey protein, almond milk, spinach, and peanut butter', 5.99, 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400&h=300&fit=crop', 4.5, 78, 4, ARRAY['best_seller'], true);

  -- Snacks (3)
  INSERT INTO menu_items (category_id, name, description, price, image, rating, review_count, prep_time, badges, is_available) VALUES
    (cat_snacks, 'French Fries', 'Crispy golden fries seasoned with sea salt and herbs', 4.49, 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop', 4.5, 203, 8, '{}', true),
    (cat_snacks, 'Chicken Wings', 'Spicy buffalo wings with blue cheese dip and celery sticks', 8.99, 'https://images.unsplash.com/photo-1608039829572-9b18d477b137?w=400&h=300&fit=crop', 4.6, 145, 14, ARRAY['best_seller'], true),
    (cat_snacks, 'Nachos Supreme', 'Tortilla chips with cheese, jalapeños, sour cream, and salsa', 7.99, 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=400&h=300&fit=crop', 4.3, 112, 10, '{}', true);

  -- Desserts (2)
  INSERT INTO menu_items (category_id, name, description, price, image, rating, review_count, prep_time, badges, is_available) VALUES
    (cat_desserts, 'Chocolate Chip Cookie', 'Freshly baked, warm, gooey cookie with Belgian chocolate chunks', 2.49, 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=300&fit=crop', 4.6, 289, 1, ARRAY['best_seller'], true),
    (cat_desserts, 'Tiramisu', 'Classic Italian dessert with layers of espresso-soaked ladyfingers', 5.99, 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop', 4.7, 134, 5, ARRAY['chef_choice'], true);
END $$;
