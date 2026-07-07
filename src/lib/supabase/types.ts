export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          role: string | null;
          company_id: string | null;
          is_active: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: string | null;
          company_id?: string | null;
          is_active?: boolean | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: string | null;
          company_id?: string | null;
          is_active?: boolean | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      companies: {
        Row: {
          id: string;
          created_at: string | null;
          name: string;
          slug: string;
          address: string | null;
          city: string | null;
          phone: string | null;
          email: string | null;
          logo_url: string | null;
          is_active: boolean | null;
        };
        Insert: {
          id?: string;
          created_at?: string | null;
          name: string;
          slug: string;
          address?: string | null;
          city?: string | null;
          phone?: string | null;
          email?: string | null;
          logo_url?: string | null;
          is_active?: boolean | null;
        };
        Update: {
          id?: string;
          created_at?: string | null;
          name?: string;
          slug?: string;
          address?: string | null;
          city?: string | null;
          phone?: string | null;
          email?: string | null;
          logo_url?: string | null;
          is_active?: boolean | null;
        };
        Relationships: [];
      };
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: string | null;
          company_id: string | null;
          location_id: string | null;
          phone: string | null;
          is_active: boolean | null;
          created_at: string | null;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: string | null;
          company_id?: string | null;
          location_id?: string | null;
          phone?: string | null;
          is_active?: boolean | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: string | null;
          company_id?: string | null;
          location_id?: string | null;
          phone?: string | null;
          is_active?: boolean | null;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "users_company_id_fkey";
            columns: ["company_id"];
            referencedRelation: "companies";
            referencedColumns: ["id"];
          }
        ];
      };
      categories: {
        Row: {
          id: string;
          created_at: string | null;
          company_id: string | null;
          name: string;
          slug: string;
          sort_order: number | null;
          is_active: boolean | null;
          image_url: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string | null;
          company_id?: string | null;
          name: string;
          slug: string;
          sort_order?: number | null;
          is_active?: boolean | null;
          image_url?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string | null;
          company_id?: string | null;
          name?: string;
          slug?: string;
          sort_order?: number | null;
          is_active?: boolean | null;
          image_url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "categories_company_id_fkey";
            columns: ["company_id"];
            referencedRelation: "companies";
            referencedColumns: ["id"];
          }
        ];
      };
      products: {
        Row: {
          id: string;
          created_at: string | null;
          company_id: string | null;
          name: string;
          description: string | null;
          price: number | null;
          category: string | null;
          image_url: string | null;
          type: string | null;
          is_active: boolean | null;
        };
        Insert: {
          id?: string;
          created_at?: string | null;
          company_id?: string | null;
          name: string;
          description?: string | null;
          price?: number | null;
          category?: string | null;
          image_url?: string | null;
          type?: string | null;
          is_active?: boolean | null;
        };
        Update: {
          id?: string;
          created_at?: string | null;
          company_id?: string | null;
          name?: string;
          description?: string | null;
          price?: number | null;
          category?: string | null;
          image_url?: string | null;
          type?: string | null;
          is_active?: boolean | null;
        };
        Relationships: [
          {
            foreignKeyName: "products_company_id_fkey";
            columns: ["company_id"];
            referencedRelation: "companies";
            referencedColumns: ["id"];
          }
        ];
      };
      orders: {
        Row: {
          id: string;
          created_at: string | null;
          order_number: string | null;
          company_id: string | null;
          user_id: string | null;
          location_id: string | null;
          status: string | null;
          total_amount: number | null;
          notes: string | null;
          is_paid: boolean | null;
          pickup_time: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string | null;
          order_number?: string | null;
          company_id?: string | null;
          user_id?: string | null;
          location_id?: string | null;
          status?: string | null;
          total_amount?: number | null;
          notes?: string | null;
          is_paid?: boolean | null;
          pickup_time?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string | null;
          order_number?: string | null;
          company_id?: string | null;
          user_id?: string | null;
          location_id?: string | null;
          status?: string | null;
          total_amount?: number | null;
          notes?: string | null;
          is_paid?: boolean | null;
          pickup_time?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "orders_company_id_fkey";
            columns: ["company_id"];
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      order_items: {
        Row: {
          id: string;
          created_at: string | null;
          order_id: string | null;
          product_id: string | null;
          formula_id: string | null;
          quantity: number | null;
          unit_price: number | null;
          total_price: number | null;
          customization: Json | null;
        };
        Insert: {
          id?: string;
          created_at?: string | null;
          order_id?: string | null;
          product_id?: string | null;
          formula_id?: string | null;
          quantity?: number | null;
          unit_price?: number | null;
          total_price?: number | null;
          customization?: Json | null;
        };
        Update: {
          id?: string;
          created_at?: string | null;
          order_id?: string | null;
          product_id?: string | null;
          formula_id?: string | null;
          quantity?: number | null;
          unit_price?: number | null;
          total_price?: number | null;
          customization?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            referencedRelation: "orders";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      orders_with_company: {
        Row: {
          id: string | null;
          order_number: string | null;
          company_id: string | null;
          company_name: string | null;
          user_id: string | null;
          user_name: string | null;
          status: string | null;
          total_amount: number | null;
          created_at: string | null;
        };
      };
    };
    Functions: Record<string, unknown>;
    Enums: Record<string, unknown>;
  };
};
