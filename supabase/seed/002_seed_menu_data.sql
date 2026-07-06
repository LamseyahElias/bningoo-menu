-- Seed data for Bningoo Menu
-- Uses existing categories and products tables
-- Company ID for Bningoo
-- Run this in Supabase SQL Editor

DO $$
DECLARE
  company_id UUID := 'c0053287-adde-426c-875c-13c022dcba0b';
  cat_breakfast UUID; cat_lunch UUID; cat_dinner UUID;
  cat_drinks UUID; cat_coffee UUID; cat_healthy UUID;
  cat_snacks UUID; cat_desserts UUID; cat_extras UUID;
BEGIN

-- ============================================================
-- 1. CATEGORIES
-- ============================================================

-- Insert missing categories (existing: Breakfast, Lunch, Extras, Drinks)
-- Use ON CONFLICT to avoid duplicates

INSERT INTO categories (company_id, name, slug, sort_order, is_active) VALUES
  (company_id, 'Dinner', 'dinner', 2, true),
  (company_id, 'Coffee', 'coffee', 4, true),
  (company_id, 'Healthy', 'healthy', 5, true),
  (company_id, 'Snacks', 'snacks', 6, true),
  (company_id, 'Desserts', 'desserts', 7, true)
ON CONFLICT (company_id, slug) DO NOTHING;

-- Get all category IDs
SELECT id INTO cat_breakfast FROM categories WHERE company_id = company_id AND slug = 'breakfast';
SELECT id INTO cat_lunch FROM categories WHERE company_id = company_id AND slug = 'lunch';
SELECT id INTO cat_dinner FROM categories WHERE company_id = company_id AND slug = 'dinner';
SELECT id INTO cat_drinks FROM categories WHERE company_id = company_id AND slug = 'drinks';
SELECT id INTO cat_coffee FROM categories WHERE company_id = company_id AND slug = 'coffee';
SELECT id INTO cat_healthy FROM categories WHERE company_id = company_id AND slug = 'healthy';
SELECT id INTO cat_snacks FROM categories WHERE company_id = company_id AND slug = 'snacks';
SELECT id INTO cat_desserts FROM categories WHERE company_id = company_id AND slug = 'desserts';
SELECT id INTO cat_extras FROM categories WHERE company_id = company_id AND slug = 'extras';

-- ============================================================
-- 2. PRODUCTS (24 menu items)
-- ============================================================

-- Breakfast (3)
INSERT INTO products (company_id, name, description, price, category, image_url, type, is_active) VALUES
  (company_id, 'Classic Pancakes', 'Fluffy buttermilk pancakes with maple syrup and fresh berries', 8.99, 'breakfast', 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop', 'product', true),
  (company_id, 'Avocado Toast', 'Artisan sourdough with smashed avocado, cherry tomatoes, and olive oil', 6.99, 'breakfast', 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400&h=300&fit=crop', 'product', true),
  (company_id, 'Breakfast Burrito', 'Scrambled eggs, cheese, bacon, and salsa in a flour tortilla', 9.49, 'breakfast', 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=300&fit=crop', 'product', true);

-- Lunch (4)
INSERT INTO products (company_id, name, description, price, category, image_url, type, is_active) VALUES
  (company_id, 'Beef Burger', 'Quarter-pound beef patty with lettuce, tomato, onion, and special sauce', 10.99, 'lunch', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop', 'product', true),
  (company_id, 'Chicken Wrap', 'Grilled chicken, mixed greens, tomato, and ranch dressing in a tortilla', 8.49, 'lunch', 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=300&fit=crop', 'product', true),
  (company_id, 'Mushroom Risotto', 'Creamy Arborio rice with wild mushrooms, parmesan, and truffle oil', 12.49, 'lunch', 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&h=300&fit=crop', 'product', true),
  (company_id, 'Caesar Salad', 'Romaine lettuce, parmesan, croutons, classic Caesar dressing', 7.99, 'lunch', 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop', 'product', true);

-- Dinner (3)
INSERT INTO products (company_id, name, description, price, category, image_url, type, is_active) VALUES
  (company_id, 'Grilled Salmon', 'Atlantic salmon fillet with lemon butter sauce and seasonal vegetables', 16.99, 'dinner', 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop', 'product', true),
  (company_id, 'Chicken Alfredo', 'Fettuccine with creamy alfredo sauce, grilled chicken, and parmesan', 11.99, 'dinner', 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=400&h=300&fit=crop', 'product', true),
  (company_id, 'Vegetable Stir Fry', 'Mixed vegetables with tofu in a savory ginger soy sauce', 9.99, 'dinner', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop', 'product', true);

-- Drinks (3)
INSERT INTO products (company_id, name, description, price, category, image_url, type, is_active) VALUES
  (company_id, 'Fresh Orange Juice', 'Freshly squeezed Valencia oranges, no added sugar', 3.99, 'drinks', 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400&h=300&fit=crop', 'product', true),
  (company_id, 'Mango Lassi', 'Creamy yogurt drink with ripe Alphonso mangoes and a pinch of cardamom', 4.49, 'drinks', 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=400&h=300&fit=crop', 'product', true),
  (company_id, 'Iced Tea', 'Freshly brewed black tea served over ice with a hint of lemon', 2.99, 'drinks', 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop', 'product', true);

-- Coffee (3)
INSERT INTO products (company_id, name, description, price, category, image_url, type, is_active) VALUES
  (company_id, 'Americano Coffee', 'Freshly brewed espresso with hot water. Made from premium Arabica beans', 3.49, 'coffee', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop', 'product', true),
  (company_id, 'Cappuccino', 'Espresso with steamed milk and velvety foam, dusted with cocoa', 4.29, 'coffee', 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop', 'product', true),
  (company_id, 'Iced Latte', 'Chilled espresso with cold milk poured over ice', 4.49, 'coffee', 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop', 'product', true);

-- Healthy (3)
INSERT INTO products (company_id, name, description, price, category, image_url, type, is_active) VALUES
  (company_id, 'Veggie Buddha Bowl', 'Nutritious quinoa bowl with roasted sweet potato, chickpeas, and tahini', 10.49, 'healthy', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop', 'product', true),
  (company_id, 'Greek Salad', 'Tomatoes, cucumber, olives, feta cheese with oregano dressing', 7.49, 'healthy', 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop', 'product', true),
  (company_id, 'Protein Smoothie', 'Banana, whey protein, almond milk, spinach, and peanut butter', 5.99, 'healthy', 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400&h=300&fit=crop', 'product', true);

-- Snacks (3)
INSERT INTO products (company_id, name, description, price, category, image_url, type, is_active) VALUES
  (company_id, 'French Fries', 'Crispy golden fries seasoned with sea salt and herbs', 4.49, 'snacks', 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop', 'product', true),
  (company_id, 'Chicken Wings', 'Spicy buffalo wings with blue cheese dip and celery sticks', 8.99, 'snacks', 'https://images.unsplash.com/photo-1608039829572-9b18d477b137?w=400&h=300&fit=crop', 'product', true),
  (company_id, 'Nachos Supreme', 'Tortilla chips with cheese, jalapeños, sour cream, and salsa', 7.99, 'snacks', 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=400&h=300&fit=crop', 'product', true);

-- Desserts (2)
INSERT INTO products (company_id, name, description, price, category, image_url, type, is_active) VALUES
  (company_id, 'Chocolate Chip Cookie', 'Freshly baked, warm, gooey chocolate chip cookie with Belgian chocolate chunks', 2.49, 'desserts', 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=300&fit=crop', 'product', true),
  (company_id, 'Tiramisu', 'Classic Italian dessert with layers of espresso-soaked ladyfingers', 5.99, 'desserts', 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop', 'product', true);

-- Extras (2)
INSERT INTO products (company_id, name, description, price, category, image_url, type, is_active) VALUES
  (company_id, 'Garlic Bread', 'Toasted baguette with garlic butter and melted mozzarella', 3.99, 'extras', 'https://images.unsplash.com/photo-1619535860434-ba1d8fa125e0?w=400&h=300&fit=crop', 'product', true),
  (company_id, 'Side Salad', 'Mixed greens with cherry tomatoes, cucumber, and vinaigrette', 3.49, 'extras', 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop', 'product', true);

END $$;
