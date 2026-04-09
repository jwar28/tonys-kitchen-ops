export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          actor_user_id: string | null
          business_id: string
          created_at: string
          entity_id: string | null
          entity_name: string
          id: number
          new_data: Json | null
          old_data: Json | null
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          business_id: string
          created_at?: string
          entity_id?: string | null
          entity_name: string
          id?: never
          new_data?: Json | null
          old_data?: Json | null
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          business_id?: string
          created_at?: string
          entity_id?: string | null
          entity_name?: string
          id?: never
          new_data?: Json | null
          old_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_days: {
        Row: {
          business_date: string
          business_id: string
          closed_at: string | null
          closed_by: string | null
          closing_note: string | null
          created_at: string
          id: string
          opened_at: string
          opened_by: string
          opening_note: string | null
          status: Database["public"]["Enums"]["day_status"]
          updated_at: string
        }
        Insert: {
          business_date: string
          business_id: string
          closed_at?: string | null
          closed_by?: string | null
          closing_note?: string | null
          created_at?: string
          id?: string
          opened_at?: string
          opened_by: string
          opening_note?: string | null
          status?: Database["public"]["Enums"]["day_status"]
          updated_at?: string
        }
        Update: {
          business_date?: string
          business_id?: string
          closed_at?: string | null
          closed_by?: string | null
          closing_note?: string | null
          created_at?: string
          id?: string
          opened_at?: string
          opened_by?: string
          opening_note?: string | null
          status?: Database["public"]["Enums"]["day_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_days_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          created_at: string
          created_by: string
          currency_code: string
          id: string
          is_active: boolean
          name: string
          timezone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          currency_code?: string
          id?: string
          is_active?: boolean
          name: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          currency_code?: string
          id?: string
          is_active?: boolean
          name?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      cash_movements: {
        Row: {
          amount: number
          business_id: string
          created_at: string
          created_by: string
          day_id: string | null
          id: string
          movement_type: Database["public"]["Enums"]["movement_type"]
          reason: string
          source: string
        }
        Insert: {
          amount: number
          business_id: string
          created_at?: string
          created_by: string
          day_id?: string | null
          id?: string
          movement_type: Database["public"]["Enums"]["movement_type"]
          reason: string
          source?: string
        }
        Update: {
          amount?: number
          business_id?: string
          created_at?: string
          created_by?: string
          day_id?: string | null
          id?: string
          movement_type?: Database["public"]["Enums"]["movement_type"]
          reason?: string
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "cash_movements_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_movements_day_id_business_id_fkey"
            columns: ["day_id", "business_id"]
            isOneToOne: false
            referencedRelation: "business_days"
            referencedColumns: ["id", "business_id"]
          },
        ]
      }
      daily_closures: {
        Row: {
          business_id: string
          closed_by: string
          cogs: number
          created_at: string
          day_id: string
          gross_profit: number
          id: string
          net_profit: number
          notes: string | null
          total_expenses: number
          total_sales: number
          updated_at: string
        }
        Insert: {
          business_id: string
          closed_by: string
          cogs?: number
          created_at?: string
          day_id: string
          gross_profit?: number
          id?: string
          net_profit?: number
          notes?: string | null
          total_expenses?: number
          total_sales?: number
          updated_at?: string
        }
        Update: {
          business_id?: string
          closed_by?: string
          cogs?: number
          created_at?: string
          day_id?: string
          gross_profit?: number
          id?: string
          net_profit?: number
          notes?: string | null
          total_expenses?: number
          total_sales?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_closures_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_closures_day_id_business_id_fkey"
            columns: ["day_id", "business_id"]
            isOneToOne: false
            referencedRelation: "business_days"
            referencedColumns: ["id", "business_id"]
          },
        ]
      }
      day_inventory: {
        Row: {
          available_qty: number | null
          business_id: string
          created_at: string
          day_id: string
          id: string
          initial_qty: number
          product_id: string
          returned_qty: number
          sold_qty: number
          updated_at: string
          waste_qty: number
        }
        Insert: {
          available_qty?: number | null
          business_id: string
          created_at?: string
          day_id: string
          id?: string
          initial_qty?: number
          product_id: string
          returned_qty?: number
          sold_qty?: number
          updated_at?: string
          waste_qty?: number
        }
        Update: {
          available_qty?: number | null
          business_id?: string
          created_at?: string
          day_id?: string
          id?: string
          initial_qty?: number
          product_id?: string
          returned_qty?: number
          sold_qty?: number
          updated_at?: string
          waste_qty?: number
        }
        Relationships: [
          {
            foreignKeyName: "day_inventory_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "day_inventory_day_id_business_id_fkey"
            columns: ["day_id", "business_id"]
            isOneToOne: false
            referencedRelation: "business_days"
            referencedColumns: ["id", "business_id"]
          },
          {
            foreignKeyName: "day_inventory_product_id_business_id_fkey"
            columns: ["product_id", "business_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id", "business_id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          business_id: string
          category: string
          created_at: string
          created_by: string
          day_id: string | null
          description: string | null
          id: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          updated_at: string
        }
        Insert: {
          amount: number
          business_id: string
          category: string
          created_at?: string
          created_by: string
          day_id?: string | null
          description?: string | null
          id?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          updated_at?: string
        }
        Update: {
          amount?: number
          business_id?: string
          category?: string
          created_at?: string
          created_by?: string
          day_id?: string | null
          description?: string | null
          id?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_day_id_business_id_fkey"
            columns: ["day_id", "business_id"]
            isOneToOne: false
            referencedRelation: "business_days"
            referencedColumns: ["id", "business_id"]
          },
        ]
      }
      products: {
        Row: {
          business_id: string
          category: Database["public"]["Enums"]["product_category"]
          cost_price: number
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          name: string
          sale_price: number
          sort_order: number
          unit: string
          updated_at: string
        }
        Insert: {
          business_id: string
          category?: Database["public"]["Enums"]["product_category"]
          cost_price?: number
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          name: string
          sale_price: number
          sort_order?: number
          unit?: string
          updated_at?: string
        }
        Update: {
          business_id?: string
          category?: Database["public"]["Enums"]["product_category"]
          cost_price?: number
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          name?: string
          sale_price?: number
          sort_order?: number
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      sale_items: {
        Row: {
          business_id: string
          created_at: string
          id: string
          line_total: number | null
          product_id: string
          quantity: number
          sale_id: string
          unit_cost: number
          unit_price: number
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          line_total?: number | null
          product_id: string
          quantity: number
          sale_id: string
          unit_cost?: number
          unit_price: number
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          line_total?: number | null
          product_id?: string
          quantity?: number
          sale_id?: string
          unit_cost?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "sale_items_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_product_id_business_id_fkey"
            columns: ["product_id", "business_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id", "business_id"]
          },
          {
            foreignKeyName: "sale_items_sale_id_business_id_fkey"
            columns: ["sale_id", "business_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id", "business_id"]
          },
        ]
      }
      sales: {
        Row: {
          business_id: string
          cancel_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          created_at: string
          created_by: string
          day_id: string
          discount_total: number
          id: string
          notes: string | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          sale_number: number
          status: Database["public"]["Enums"]["sale_status"]
          subtotal: number
          total_amount: number
          updated_at: string
        }
        Insert: {
          business_id: string
          cancel_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          created_at?: string
          created_by: string
          day_id: string
          discount_total?: number
          id?: string
          notes?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"]
          sale_number?: never
          status?: Database["public"]["Enums"]["sale_status"]
          subtotal?: number
          total_amount?: number
          updated_at?: string
        }
        Update: {
          business_id?: string
          cancel_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          created_at?: string
          created_by?: string
          day_id?: string
          discount_total?: number
          id?: string
          notes?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"]
          sale_number?: never
          status?: Database["public"]["Enums"]["sale_status"]
          subtotal?: number
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_day_id_business_id_fkey"
            columns: ["day_id", "business_id"]
            isOneToOne: false
            referencedRelation: "business_days"
            referencedColumns: ["id", "business_id"]
          },
        ]
      }
      user_business_roles: {
        Row: {
          business_id: string
          created_at: string
          id: string
          is_active: boolean
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_business_roles_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cancel_sale: {
        Args: { p_business_id: string; p_reason: string; p_sale_id: string }
        Returns: undefined
      }
      close_business_day: {
        Args: { p_business_id: string; p_day_id: string; p_notes?: string }
        Returns: string
      }
      has_business_role: {
        Args: {
          allowed_roles: Database["public"]["Enums"]["app_role"][]
          target_business_id: string
        }
        Returns: boolean
      }
      is_business_member: {
        Args: { target_business_id: string }
        Returns: boolean
      }
      record_sale: {
        Args: {
          p_business_id: string
          p_day_id: string
          p_discount_total?: number
          p_items: Json
          p_notes?: string
          p_payment_method: Database["public"]["Enums"]["payment_method"]
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "owner" | "manager" | "cashier"
      day_status: "open" | "closed"
      movement_type: "in" | "out"
      payment_method: "cash" | "transfer" | "card" | "mixed"
      product_category: "frito" | "pizza" | "bebida" | "otro"
      sale_status: "completed" | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["owner", "manager", "cashier"],
      day_status: ["open", "closed"],
      movement_type: ["in", "out"],
      payment_method: ["cash", "transfer", "card", "mixed"],
      product_category: ["frito", "pizza", "bebida", "otro"],
      sale_status: ["completed", "cancelled"],
    },
  },
} as const
