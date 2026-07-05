// Database types matching Supabase schema
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: string
          company_id: string | null
          location_id: string | null
          phone: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string
          company_id?: string | null
          location_id?: string | null
          phone?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string
          company_id?: string | null
          location_id?: string | null
          phone?: string | null
          is_active?: boolean
        }
      }
      companies: {
        Row: {
          id: string
          name: string
          slug: string
          address: string | null
          city: string | null
          phone: string | null
          email: string | null
          logo_url: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          name: string
          slug: string
          address?: string | null
          city?: string | null
          phone?: string | null
          email?: string | null
          logo_url?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          address?: string | null
          city?: string | null
          phone?: string | null
          email?: string | null
          logo_url?: string | null
          is_active?: boolean
        }
      }
      categories: {
        Row: {
          id: string
          company_id: string
          name: string
          slug: string
          sort_order: number
          is_active: boolean
          image_url: string | null
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          slug: string
          sort_order?: number
          is_active?: boolean
          image_url?: string | null
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          slug?: string
          sort_order?: number
          is_active?: boolean
          image_url?: string | null
        }
      }
      products: {
        Row: {
          id: string
          company_id: string
          name: string
          description: string | null
          price: number
          category_id: string | null
          image_url: string | null
          type: string
          is_active: boolean
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          description?: string | null
          price: number
          category_id?: string | null
          image_url?: string | null
          type?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          description?: string | null
          price?: number
          category_id?: string | null
          image_url?: string | null
          type?: string
          is_active?: boolean
        }
      }
      formulas: {
        Row: {
          id: string
          company_id: string
          name: string
          description: string | null
          price: number
          crispy_price: number | null
          image_url: string | null
          is_active: boolean
          code: string | null
          daily_available: number | null
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          description?: string | null
          price: number
          crispy_price?: number | null
          image_url?: string | null
          is_active?: boolean
          code?: string | null
          daily_available?: number | null
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          description?: string | null
          price?: number
          crispy_price?: number | null
          image_url?: string | null
          is_active?: boolean
          code?: string | null
          daily_available?: number | null
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          company_id: string
          user_id: string
          location_id: string | null
          status: string
          total_amount: number
          notes: string | null
          is_paid: boolean
          pickup_time: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          order_number: string
          company_id: string
          user_id: string
          location_id?: string | null
          status?: string
          total_amount: number
          notes?: string | null
          is_paid?: boolean
          pickup_time?: string | null
        }
        Update: {
          id?: string
          order_number?: string
          company_id?: string
          user_id?: string
          location_id?: string | null
          status?: string
          total_amount?: number
          notes?: string | null
          is_paid?: boolean
          pickup_time?: string | null
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          formula_id: string | null
          quantity: number
          unit_price: number
          total_price: number
          customization: string | null
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          formula_id?: string | null
          quantity: number
          unit_price: number
          total_price: number
          customization?: string | null
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string | null
          formula_id?: string | null
          quantity?: number
          unit_price?: number
          total_price?: number
          customization?: string | null
        }
      }
      order_status_history: {
        Row: {
          id: string
          order_id: string
          status: string
          changed_by: string | null
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          status: string
          changed_by?: string | null
          note?: string | null
        }
        Update: {
          id?: string
          order_id?: string
          status?: string
          changed_by?: string | null
          note?: string | null
        }
      }
      inventory: {
        Row: {
          id: string
          company_id: string
          product_id: string
          quantity: number
          low_stock_threshold: number
          unit: string
        }
        Insert: {
          id?: string
          company_id: string
          product_id: string
          quantity: number
          low_stock_threshold?: number
          unit?: string
        }
        Update: {
          id?: string
          company_id?: string
          product_id?: string
          quantity?: number
          low_stock_threshold?: number
          unit?: string
        }
      }
      inventory_transactions: {
        Row: {
          id: string
          inventory_id: string
          quantity_change: number
          type: string
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          inventory_id: string
          quantity_change: number
          type: string
          note?: string | null
        }
        Update: {
          id?: string
          inventory_id?: string
          quantity_change?: number
          type?: string
          note?: string | null
        }
      }
      discounts: {
        Row: {
          id: string
          company_id: string
          code: string
          type: string
          value: number
          max_uses: number | null
          current_uses: number
          starts_at: string | null
          expires_at: string | null
        }
        Insert: {
          id?: string
          company_id: string
          code: string
          type: string
          value: number
          max_uses?: number | null
          current_uses?: number
          starts_at?: string | null
          expires_at?: string | null
        }
        Update: {
          id?: string
          company_id?: string
          code?: string
          type?: string
          value?: number
          max_uses?: number | null
          current_uses?: number
          starts_at?: string | null
          expires_at?: string | null
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: string
          is_read: boolean
          link: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type?: string
          is_read?: boolean
          link?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: string
          is_read?: boolean
          link?: string | null
        }
      }
      locations: {
        Row: {
          id: string
          company_id: string
          name: string
          address: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          address?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          address?: string | null
          is_active?: boolean
        }
      }
    }
    Views: {
      orders_with_company: {
        Row: {
          id: string
          order_number: string
          company_id: string
          user_id: string
          location_id: string | null
          status: string
          total_amount: number
          notes: string | null
          is_paid: boolean
          pickup_time: string | null
          created_at: string
          updated_at: string | null
          company_name: string | null
          company_slug: string | null
          user_full_name: string | null
          user_email: string | null
        }
      }
    }
    Functions: {
      [key: string]: unknown
    }
  }
}
