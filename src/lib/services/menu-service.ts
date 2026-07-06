// Menu Service Layer
// SWAPPABLE: change USE_SEED_DATA to true/false to swap between seed and Supabase
// Seed data serves as fallback when DB is unavailable

'use client'

import { createClient } from '@/lib/supabase/client'

export const USE_SEED_DATA = false // Set to true to use seed data instead of Supabase

export interface MenuCategory {
  id: string
  name: string
  slug: string
  icon?: string
  sort_order: number
  is_active: boolean
}

export interface MenuItem {
  id: string
  category_id?: string
  name: string
  description?: string
  price: number
  image?: string
  rating: number
  review_count: number
  prep_time: number
  badges: string[]
  is_available: boolean
  is_active: boolean
}

// ============================================================
// SEED DATA (fallback when DB is unavailable)
// ============================================================

export const seedCategories: MenuCategory[] = [
  { id: 'cat-all', name: 'All', slug: 'all', icon: '🍽️', sort_order: 0, is_active: true },
  { id: 'cat-breakfast', name: 'Breakfast', slug: 'breakfast', icon: '🌅', sort_order: 1, is_active: true },
  { id: 'cat-lunch', name: 'Lunch', slug: 'lunch', icon: '🍱', sort_order: 2, is_active: true },
  { id: 'cat-dinner', name: 'Dinner', slug: 'dinner', icon: '🍛', sort_order: 3, is_active: true },
  { id: 'cat-drinks', name: 'Drinks', slug: 'drinks', icon: '🥤', sort_order: 4, is_active: true },
  { id: 'cat-coffee', name: 'Coffee', slug: 'coffee', icon: '☕', sort_order: 5, is_active: true },
  { id: 'cat-healthy', name: 'Healthy', slug: 'healthy', icon: '🥗', sort_order: 6, is_active: true },
  { id: 'cat-snacks', name: 'Snacks', slug: 'snacks', icon: '🍿', sort_order: 7, is_active: true },
  { id: 'cat-desserts', name: 'Desserts', slug: 'desserts', icon: '🍰', sort_order: 8, is_active: true },
]

export const seedMenuItems: MenuItem[] = [
  // Breakfast
  { id: 'item-1', category_id: 'cat-breakfast', name: 'Classic Pancakes', description: 'Fluffy buttermilk pancakes with maple syrup and fresh berries', price: 8.99, image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop', rating: 4.8, review_count: 156, prep_time: 12, badges: ['best_seller'], is_available: true, is_active: true },
  { id: 'item-2', category_id: 'cat-breakfast', name: 'Avocado Toast', description: 'Artisan sourdough with smashed avocado, cherry tomatoes, and olive oil', price: 6.99, image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400&h=300&fit=crop', rating: 4.3, review_count: 76, prep_time: 7, badges: [], is_available: true, is_active: true },
  { id: 'item-3', category_id: 'cat-breakfast', name: 'Breakfast Burrito', description: 'Scrambled eggs, cheese, bacon, and salsa in a flour tortilla', price: 9.49, image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=300&fit=crop', rating: 4.5, review_count: 112, prep_time: 10, badges: ['chef_choice'], is_available: true, is_active: true },
  // Lunch
  { id: 'item-4', category_id: 'cat-lunch', name: 'Beef Burger', description: 'Quarter-pound beef patty with lettuce, tomato, onion, and special sauce', price: 10.99, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop', rating: 4.8, review_count: 245, prep_time: 15, badges: ['chef_choice'], is_available: true, is_active: true },
  { id: 'item-5', category_id: 'cat-lunch', name: 'Chicken Wrap', description: 'Grilled chicken, mixed greens, tomato, and ranch dressing in a tortilla', price: 8.49, image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=300&fit=crop', rating: 4.2, review_count: 89, prep_time: 10, badges: [], is_available: true, is_active: true },
  { id: 'item-6', category_id: 'cat-lunch', name: 'Mushroom Risotto', description: 'Creamy Arborio rice with wild mushrooms, parmesan, and truffle oil', price: 12.49, image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&h=300&fit=crop', rating: 4.6, review_count: 73, prep_time: 22, badges: ['chef_choice'], is_available: true, is_active: true },
  { id: 'item-7', category_id: 'cat-lunch', name: 'Caesar Salad', description: 'Romaine lettuce, parmesan, croutons, classic Caesar dressing', price: 7.99, image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop', rating: 4.4, review_count: 134, prep_time: 8, badges: [], is_available: true, is_active: true },
  // Dinner
  { id: 'item-8', category_id: 'cat-dinner', name: 'Grilled Salmon', description: 'Atlantic salmon fillet with lemon butter sauce and seasonal vegetables', price: 16.99, image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop', rating: 4.9, review_count: 198, prep_time: 25, badges: ['best_seller', 'chef_choice'], is_available: true, is_active: true },
  { id: 'item-9', category_id: 'cat-dinner', name: 'Chicken Alfredo', description: 'Fettuccine with creamy alfredo sauce, grilled chicken, and parmesan', price: 11.99, image: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=400&h=300&fit=crop', rating: 4.6, review_count: 167, prep_time: 18, badges: ['best_seller'], is_available: true, is_active: true },
  { id: 'item-10', category_id: 'cat-dinner', name: 'Vegetable Stir Fry', description: 'Mixed vegetables with tofu in a savory ginger soy sauce', price: 9.99, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop', rating: 4.1, review_count: 54, prep_time: 14, badges: [], is_available: true, is_active: true },
  // Drinks
  { id: 'item-11', category_id: 'cat-drinks', name: 'Fresh Orange Juice', description: 'Freshly squeezed Valencia oranges, no added sugar', price: 3.99, image: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400&h=300&fit=crop', rating: 4.3, review_count: 45, prep_time: 3, badges: [], is_available: true, is_active: true },
  { id: 'item-12', category_id: 'cat-drinks', name: 'Mango Lassi', description: 'Creamy yogurt drink with ripe Alphonso mangoes and a pinch of cardamom', price: 4.49, image: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=400&h=300&fit=crop', rating: 4.4, review_count: 67, prep_time: 4, badges: [], is_available: true, is_active: true },
  { id: 'item-13', category_id: 'cat-drinks', name: 'Iced Tea', description: 'Freshly brewed black tea served over ice with a hint of lemon', price: 2.99, image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop', rating: 4.2, review_count: 88, prep_time: 2, badges: [], is_available: true, is_active: true },
  // Coffee
  { id: 'item-14', category_id: 'cat-coffee', name: 'Americano Coffee', description: 'Freshly brewed espresso with hot water. Premium Arabica beans for a smooth finish', price: 3.49, image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop', rating: 4.7, review_count: 312, prep_time: 3, badges: ['best_seller'], is_available: true, is_active: true },
  { id: 'item-15', category_id: 'cat-coffee', name: 'Cappuccino', description: 'Espresso with steamed milk and velvety foam, dusted with cocoa', price: 4.29, image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop', rating: 4.6, review_count: 234, prep_time: 4, badges: [], is_available: true, is_active: true },
  { id: 'item-16', category_id: 'cat-coffee', name: 'Iced Latte', description: 'Chilled espresso with cold milk poured over ice', price: 4.49, image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop', rating: 4.5, review_count: 156, prep_time: 3, badges: [], is_available: true, is_active: true },
  // Healthy
  { id: 'item-17', category_id: 'cat-healthy', name: 'Veggie Buddha Bowl', description: 'Nutritious quinoa bowl with roasted sweet potato, chickpeas, hummus, and tahini', price: 10.49, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop', rating: 4.2, review_count: 58, prep_time: 14, badges: [], is_available: true, is_active: true },
  { id: 'item-18', category_id: 'cat-healthy', name: 'Greek Salad', description: 'Tomatoes, cucumber, olives, feta cheese with oregano dressing', price: 7.49, image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop', rating: 4.3, review_count: 92, prep_time: 6, badges: [], is_available: true, is_active: true },
  { id: 'item-19', category_id: 'cat-healthy', name: 'Protein Smoothie', description: 'Banana, whey protein, almond milk, spinach, and peanut butter', price: 5.99, image: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400&h=300&fit=crop', rating: 4.5, review_count: 78, prep_time: 4, badges: ['best_seller'], is_available: true, is_active: true },
  // Snacks
  { id: 'item-20', category_id: 'cat-snacks', name: 'French Fries', description: 'Crispy golden fries seasoned with sea salt and herbs', price: 4.49, image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop', rating: 4.5, review_count: 203, prep_time: 8, badges: [], is_available: true, is_active: true },
  { id: 'item-21', category_id: 'cat-snacks', name: 'Chicken Wings', description: 'Spicy buffalo wings with blue cheese dip and celery sticks', price: 8.99, image: 'https://images.unsplash.com/photo-1608039829572-9b18d477b137?w=400&h=300&fit=crop', rating: 4.6, review_count: 145, prep_time: 14, badges: ['best_seller'], is_available: true, is_active: true },
  { id: 'item-22', category_id: 'cat-snacks', name: 'Nachos Supreme', description: 'Tortilla chips with cheese, jalapeños, sour cream, and salsa', price: 7.99, image: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=400&h=300&fit=crop', rating: 4.3, review_count: 112, prep_time: 10, badges: [], is_available: true, is_active: true },
  // Desserts
  { id: 'item-23', category_id: 'cat-desserts', name: 'Chocolate Chip Cookie', description: 'Freshly baked, warm, gooey cookie with Belgian chocolate chunks', price: 2.49, image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=300&fit=crop', rating: 4.6, review_count: 289, prep_time: 1, badges: ['best_seller'], is_available: true, is_active: true },
  { id: 'item-24', category_id: 'cat-desserts', name: 'Tiramisu', description: 'Classic Italian dessert with layers of espresso-soaked ladyfingers', price: 5.99, image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop', rating: 4.7, review_count: 134, prep_time: 5, badges: ['chef_choice'], is_available: true, is_active: true },
]

// ============================================================
// DATA ACCESS FUNCTIONS
// ============================================================

const supabase = typeof window !== 'undefined' ? createClient() : null

/**
 * Fetches categories, falling back to seed data if Supabase fails
 */
export async function fetchCategories(): Promise<MenuCategory[]> {
  if (USE_SEED_DATA || !supabase) return seedCategories
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug, sort_order, is_active')
      .eq('is_active', true)
      .order('sort_order')

    if (error) throw error
    if (!data || data.length === 0) return seedCategories

    // Add "All" category at the front
    const allCat: MenuCategory = { id: 'cat-all', name: 'All', slug: 'all', icon: '🍽️', sort_order: -1, is_active: true }
    const mapped = data.map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      icon: getCategoryIcon(cat.slug),
      sort_order: cat.sort_order || 0,
      is_active: cat.is_active ?? true,
    }))
    return [allCat, ...mapped]
  } catch {
    console.warn('Failed to fetch categories from Supabase, using seed data')
    return seedCategories
  }
}

/**
 * Fetches menu items, falling back to seed data if Supabase fails
 */
export async function fetchMenuItems(): Promise<MenuItem[]> {
  if (USE_SEED_DATA || !supabase) return seedMenuItems
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)

    if (error) throw error
    if (!data || data.length === 0) return seedMenuItems

    return data.map((p: any) => ({
      id: p.id,
      category_id: getCategoryIdFromSlug(p.category),
      name: p.name,
      description: p.description || '',
      price: Number(p.price) || 0,
      image: p.image_url || '',
      rating: 4.5,
      review_count: 0,
      prep_time: 10,
      badges: [],
      is_available: p.is_active ?? true,
      is_active: p.is_active ?? true,
    }))
  } catch {
    console.warn('Failed to fetch menu items from Supabase, using seed data')
    return seedMenuItems
  }
}

/**
 * Fetches a single menu item by ID
 */
export async function fetchMenuItemById(id: string): Promise<MenuItem | null> {
  if (USE_SEED_DATA || !supabase) return seedMenuItems.find(i => i.id === id) || null
  try {
    const items = await fetchMenuItems()
    return items.find(i => i.id === id) || null
  } catch {
    return seedMenuItems.find(i => i.id === id) || null
  }
}

// ============================================================
// HELPERS
// ============================================================

function getCategoryIdFromSlug(slug: string): string | undefined {
  const map: Record<string, string> = {
    breakfast: 'cat-breakfast',
    lunch: 'cat-lunch',
    dinner: 'cat-dinner',
    drinks: 'cat-drinks',
    coffee: 'cat-coffee',
    healthy: 'cat-healthy',
    snacks: 'cat-snacks',
    desserts: 'cat-desserts',
    extras: 'cat-snacks',
  }
  return map[slug]
}

function getCategoryIcon(slug: string): string {
  const icons: Record<string, string> = {
    all: '🍽️',
    breakfast: '🌅',
    lunch: '🍱',
    dinner: '🍛',
    drinks: '🥤',
    coffee: '☕',
    healthy: '🥗',
    snacks: '🍿',
    desserts: '🍰',
    extras: '➕',
  }
  return icons[slug] || '🍽️'
}
