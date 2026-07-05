export interface Company {
  id: string
  name: string
  slug: string
  address?: string
  city?: string
  phone?: string
  email?: string
  logo_url?: string
  is_active: boolean
}

export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  role: 'customer' | 'admin' | 'kitchen' | 'staff' | 'manager'
  company_id?: string
  location_id?: string
  phone?: string
  is_active: boolean
}

export interface Category {
  id: string
  company_id: string
  name: string
  slug: string
  sort_order: number
  is_active: boolean
  image_url?: string
  product_count?: number
}

export interface Product {
  id: string
  company_id: string
  name: string
  description?: string
  price: number
  category_id?: string
  image_url?: string
  type: 'product' | 'ingredient'
  is_active: boolean
  category_name?: string
}

export interface Formula {
  id: string
  company_id: string
  name: string
  description?: string
  price: number
  crispy_price?: number
  image_url?: string
  is_active: boolean
  code?: string
  daily_available?: number
  items?: FormulaItem[]
  inclusions?: FormulaInclusion[]
}

export interface FormulaItem {
  id: string
  formula_id: string
  product_id: string
  quantity: number
  product?: Product
}

export interface FormulaInclusion {
  id: string
  formula_id: string
  text: string
  sort_order: number
}

export interface OptionGroup {
  id: string
  name: string
  description?: string
  type: 'single' | 'multiple'
  sort_order: number
  is_active: boolean
  choices?: OptionChoice[]
}

export interface OptionChoice {
  id: string
  option_group_id: string
  name: string
  price_adjustment: number
  sort_order: number
  is_active: boolean
}

export interface Order {
  id: string
  order_number: string
  company_id: string
  user_id: string
  location_id?: string
  status: OrderStatus
  total_amount: number
  notes?: string
  is_paid: boolean
  pickup_time?: string
  created_at: string
  updated_at?: string
  items?: OrderItem[]
  user?: User
  company?: Company
}

export type OrderStatus = 'cart' | 'new' | 'confirmed' | 'preparing' | 'ready' | 'collected' | 'cancelled'

export interface OrderItem {
  id: string
  order_id: string
  product_id?: string
  formula_id?: string
  quantity: number
  unit_price: number
  total_price: number
  customization?: string
  product?: Product
  formula?: Formula
}

export interface OrderStatusHistory {
  id: string
  order_id: string
  status: OrderStatus
  changed_by?: string
  note?: string
  created_at: string
}

export interface Inventory {
  id: string
  company_id: string
  product_id: string
  quantity: number
  low_stock_threshold: number
  unit: string
  product?: Product
}

export interface InventoryTransaction {
  id: string
  inventory_id: string
  quantity_change: number
  type: 'in' | 'out' | 'adjustment'
  note?: string
  created_at: string
}

export interface Discount {
  id: string
  company_id: string
  code: string
  type: 'percentage' | 'fixed'
  value: number
  max_uses?: number
  current_uses: number
  starts_at?: string
  expires_at?: string
}

export interface CartItem {
  id: string
  product?: Product
  formula?: Formula
  quantity: number
  unit_price: number
  customization?: Record<string, string>
  type: 'product' | 'formula'
}

export interface MenuSchedule {
  id: string
  company_id: string
  day_of_week: number
  start_time: string
  end_time: string
  is_active: boolean
  items?: MenuItem[]
}

export interface MenuItem {
  id: string
  menu_schedule_id: string
  product_id?: string
  formula_id?: string
  price_override?: number
  is_available: boolean
  product?: Product
  formula?: Formula
}

export interface Location {
  id: string
  company_id?: string
  name: string
  address?: string
  is_active?: boolean
}
