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
          actor_id: string | null
          created_at: string
          entity: string | null
          entity_id: string | null
          id: string
          meta: Json | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity?: string | null
          entity_id?: string | null
          id?: string
          meta?: Json | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity?: string | null
          entity_id?: string | null
          id?: string
          meta?: Json | null
        }
        Relationships: []
      }
      company_settings: {
        Row: {
          account_holder_name: string | null
          account_type: string | null
          address: string | null
          bank_ac_no: string | null
          bank_name: string | null
          branch_name: string | null
          business_type: string | null
          city: string | null
          company_name: string
          email: string | null
          gst_no: string | null
          ifsc_code: string | null
          logo_path: string | null
          owner_id: string
          owner_name: string | null
          pan_no: string | null
          phone: string | null
          pincode: string | null
          state: string | null
          terms_and_conditions: string | null
          updated_at: string
          upi_id: string | null
          website: string | null
        }
        Insert: {
          account_holder_name?: string | null
          account_type?: string | null
          address?: string | null
          bank_ac_no?: string | null
          bank_name?: string | null
          branch_name?: string | null
          business_type?: string | null
          city?: string | null
          company_name?: string
          email?: string | null
          gst_no?: string | null
          ifsc_code?: string | null
          logo_path?: string | null
          owner_id: string
          owner_name?: string | null
          pan_no?: string | null
          phone?: string | null
          pincode?: string | null
          state?: string | null
          terms_and_conditions?: string | null
          updated_at?: string
          upi_id?: string | null
          website?: string | null
        }
        Update: {
          account_holder_name?: string | null
          account_type?: string | null
          address?: string | null
          bank_ac_no?: string | null
          bank_name?: string | null
          branch_name?: string | null
          business_type?: string | null
          city?: string | null
          company_name?: string
          email?: string | null
          gst_no?: string | null
          ifsc_code?: string | null
          logo_path?: string | null
          owner_id?: string
          owner_name?: string | null
          pan_no?: string | null
          phone?: string | null
          pincode?: string | null
          state?: string | null
          terms_and_conditions?: string | null
          updated_at?: string
          upi_id?: string | null
          website?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          email: string | null
          gst_no: string | null
          id: string
          name: string
          notes: string | null
          opening_balance: number
          owner_id: string
          pan_no: string | null
          phone: string | null
          pincode: string | null
          state: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          gst_no?: string | null
          id?: string
          name: string
          notes?: string | null
          opening_balance?: number
          owner_id?: string
          pan_no?: string | null
          phone?: string | null
          pincode?: string | null
          state?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          gst_no?: string | null
          id?: string
          name?: string
          notes?: string | null
          opening_balance?: number
          owner_id?: string
          pan_no?: string | null
          phone?: string | null
          pincode?: string | null
          state?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      deliveries: {
        Row: {
          challan_no: string
          created_at: string
          customer_id: string | null
          delivery_date: string
          driver_name: string | null
          id: string
          invoice_id: string | null
          items: Json
          notes: string | null
          owner_id: string
          signature_path: string | null
          vehicle_no: string | null
          work_order_id: string | null
        }
        Insert: {
          challan_no: string
          created_at?: string
          customer_id?: string | null
          delivery_date?: string
          driver_name?: string | null
          id?: string
          invoice_id?: string | null
          items?: Json
          notes?: string | null
          owner_id?: string
          signature_path?: string | null
          vehicle_no?: string | null
          work_order_id?: string | null
        }
        Update: {
          challan_no?: string
          created_at?: string
          customer_id?: string | null
          delivery_date?: string
          driver_name?: string | null
          id?: string
          invoice_id?: string | null
          items?: Json
          notes?: string | null
          owner_id?: string
          signature_path?: string | null
          vehicle_no?: string | null
          work_order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deliveries_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliveries_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliveries_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          description: string | null
          expense_date: string
          id: string
          owner_id: string
          payment_method: Database["public"]["Enums"]["payment_method"]
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          description?: string | null
          expense_date?: string
          id?: string
          owner_id?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          description?: string | null
          expense_date?: string
          id?: string
          owner_id?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          amount: number
          area_sqft: number | null
          description: string
          gst_percent: number
          height: number | null
          hsn_code: string | null
          id: string
          invoice_id: string
          owner_id: string
          product_id: string | null
          qty: number
          rate: number
          sort_order: number
          unit: Database["public"]["Enums"]["dim_unit"] | null
          width: number | null
        }
        Insert: {
          amount?: number
          area_sqft?: number | null
          description: string
          gst_percent?: number
          height?: number | null
          hsn_code?: string | null
          id?: string
          invoice_id: string
          owner_id?: string
          product_id?: string | null
          qty?: number
          rate?: number
          sort_order?: number
          unit?: Database["public"]["Enums"]["dim_unit"] | null
          width?: number | null
        }
        Update: {
          amount?: number
          area_sqft?: number | null
          description?: string
          gst_percent?: number
          height?: number | null
          hsn_code?: string | null
          id?: string
          invoice_id?: string
          owner_id?: string
          product_id?: string | null
          qty?: number
          rate?: number
          sort_order?: number
          unit?: Database["public"]["Enums"]["dim_unit"] | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          attender: string | null
          biller: string | null
          cgst: number
          created_at: string
          customer_id: string | null
          customer_snapshot: Json
          discount: number
          due_date: string | null
          gst_type: string
          id: string
          igst: number
          invoice_date: string
          invoice_no: string
          invoice_type: Database["public"]["Enums"]["invoice_type"]
          net_amount: number
          notes: string | null
          owner_id: string
          paid_amount: number
          project_id: string | null
          quotation_id: string | null
          sgst: number
          sub_total: number
          updated_at: string
        }
        Insert: {
          attender?: string | null
          biller?: string | null
          cgst?: number
          created_at?: string
          customer_id?: string | null
          customer_snapshot?: Json
          discount?: number
          due_date?: string | null
          gst_type?: string
          id?: string
          igst?: number
          invoice_date?: string
          invoice_no: string
          invoice_type?: Database["public"]["Enums"]["invoice_type"]
          net_amount?: number
          notes?: string | null
          owner_id?: string
          paid_amount?: number
          project_id?: string | null
          quotation_id?: string | null
          sgst?: number
          sub_total?: number
          updated_at?: string
        }
        Update: {
          attender?: string | null
          biller?: string | null
          cgst?: number
          created_at?: string
          customer_id?: string | null
          customer_snapshot?: Json
          discount?: number
          due_date?: string | null
          gst_type?: string
          id?: string
          igst?: number
          invoice_date?: string
          invoice_no?: string
          invoice_type?: Database["public"]["Enums"]["invoice_type"]
          net_amount?: number
          notes?: string | null
          owner_id?: string
          paid_amount?: number
          project_id?: string | null
          quotation_id?: string | null
          sgst?: number
          sub_total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      leftover_sheets: {
        Row: {
          created_at: string
          glass_type: string | null
          id: string
          length_ft: number
          owner_id: string
          source_work_order: string | null
          thickness_mm: number | null
          unit_value: number
          used: boolean
          width_ft: number
        }
        Insert: {
          created_at?: string
          glass_type?: string | null
          id?: string
          length_ft: number
          owner_id?: string
          source_work_order?: string | null
          thickness_mm?: number | null
          unit_value?: number
          used?: boolean
          width_ft: number
        }
        Update: {
          created_at?: string
          glass_type?: string | null
          id?: string
          length_ft?: number
          owner_id?: string
          source_work_order?: string | null
          thickness_mm?: number | null
          unit_value?: number
          used?: boolean
          width_ft?: number
        }
        Relationships: [
          {
            foreignKeyName: "leftover_sheets_source_work_order_fkey"
            columns: ["source_work_order"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          customer_id: string | null
          id: string
          invoice_id: string | null
          method: Database["public"]["Enums"]["payment_method"]
          notes: string | null
          owner_id: string
          paid_on: string
          reference: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          customer_id?: string | null
          id?: string
          invoice_id?: string | null
          method?: Database["public"]["Enums"]["payment_method"]
          notes?: string | null
          owner_id?: string
          paid_on?: string
          reference?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          customer_id?: string | null
          id?: string
          invoice_id?: string | null
          method?: Database["public"]["Enums"]["payment_method"]
          notes?: string | null
          owner_id?: string
          paid_on?: string
          reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string | null
          cost_rate: number
          created_at: string
          gst_percent: number
          hsn_code: string | null
          id: string
          low_stock_threshold: number
          name: string
          owner_id: string
          rate: number
          stock: number
          thickness_mm: number | null
          unit: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          cost_rate?: number
          created_at?: string
          gst_percent?: number
          hsn_code?: string | null
          id?: string
          low_stock_threshold?: number
          name: string
          owner_id?: string
          rate?: number
          stock?: number
          thickness_mm?: number | null
          unit?: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          cost_rate?: number
          created_at?: string
          gst_percent?: number
          hsn_code?: string | null
          id?: string
          low_stock_threshold?: number
          name?: string
          owner_id?: string
          rate?: number
          stock?: number
          thickness_mm?: number | null
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          customer_id: string | null
          id: string
          name: string
          notes: string | null
          owner_id: string
          site_address: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          id?: string
          name: string
          notes?: string | null
          owner_id?: string
          site_address?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          id?: string
          name?: string
          notes?: string | null
          owner_id?: string
          site_address?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_items: {
        Row: {
          amount: number
          description: string
          gst_percent: number
          id: string
          owner_id: string
          product_id: string | null
          purchase_id: string
          qty: number
          rate: number
        }
        Insert: {
          amount?: number
          description: string
          gst_percent?: number
          id?: string
          owner_id?: string
          product_id?: string | null
          purchase_id: string
          qty?: number
          rate?: number
        }
        Update: {
          amount?: number
          description?: string
          gst_percent?: number
          id?: string
          owner_id?: string
          product_id?: string | null
          purchase_id?: string
          qty?: number
          rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_items_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "purchases"
            referencedColumns: ["id"]
          },
        ]
      }
      purchases: {
        Row: {
          bill_date: string
          bill_no: string
          created_at: string
          gst: number
          id: string
          net_amount: number
          notes: string | null
          owner_id: string
          paid_amount: number
          sub_total: number
          supplier_id: string | null
        }
        Insert: {
          bill_date?: string
          bill_no: string
          created_at?: string
          gst?: number
          id?: string
          net_amount?: number
          notes?: string | null
          owner_id?: string
          paid_amount?: number
          sub_total?: number
          supplier_id?: string | null
        }
        Update: {
          bill_date?: string
          bill_no?: string
          created_at?: string
          gst?: number
          id?: string
          net_amount?: number
          notes?: string | null
          owner_id?: string
          paid_amount?: number
          sub_total?: number
          supplier_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchases_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      quotation_items: {
        Row: {
          amount: number
          area_sqft: number | null
          description: string
          gst_percent: number
          height: number | null
          id: string
          owner_id: string
          product_id: string | null
          qty: number
          quotation_id: string
          rate: number
          sort_order: number
          unit: Database["public"]["Enums"]["dim_unit"] | null
          width: number | null
        }
        Insert: {
          amount?: number
          area_sqft?: number | null
          description: string
          gst_percent?: number
          height?: number | null
          id?: string
          owner_id?: string
          product_id?: string | null
          qty?: number
          quotation_id: string
          rate?: number
          sort_order?: number
          unit?: Database["public"]["Enums"]["dim_unit"] | null
          width?: number | null
        }
        Update: {
          amount?: number
          area_sqft?: number | null
          description?: string
          gst_percent?: number
          height?: number | null
          id?: string
          owner_id?: string
          product_id?: string | null
          qty?: number
          quotation_id?: string
          rate?: number
          sort_order?: number
          unit?: Database["public"]["Enums"]["dim_unit"] | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quotation_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotation_items_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      quotations: {
        Row: {
          cgst: number
          created_at: string
          customer_id: string | null
          customer_snapshot: Json
          discount: number
          gst_type: string
          id: string
          igst: number
          net_amount: number
          notes: string | null
          owner_id: string
          project_id: string | null
          quote_date: string
          quote_no: string
          sgst: number
          status: Database["public"]["Enums"]["quotation_status"]
          sub_total: number
          terms: string | null
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          cgst?: number
          created_at?: string
          customer_id?: string | null
          customer_snapshot?: Json
          discount?: number
          gst_type?: string
          id?: string
          igst?: number
          net_amount?: number
          notes?: string | null
          owner_id?: string
          project_id?: string | null
          quote_date?: string
          quote_no: string
          sgst?: number
          status?: Database["public"]["Enums"]["quotation_status"]
          sub_total?: number
          terms?: string | null
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          cgst?: number
          created_at?: string
          customer_id?: string | null
          customer_snapshot?: Json
          discount?: number
          gst_type?: string
          id?: string
          igst?: number
          net_amount?: number
          notes?: string | null
          owner_id?: string
          project_id?: string | null
          quote_date?: string
          quote_no?: string
          sgst?: number
          status?: Database["public"]["Enums"]["quotation_status"]
          sub_total?: number
          terms?: string | null
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          email: string | null
          gst_no: string | null
          id: string
          name: string
          notes: string | null
          opening_balance: number
          owner_id: string
          pan_no: string | null
          phone: string | null
          pincode: string | null
          state: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          gst_no?: string | null
          id?: string
          name: string
          notes?: string | null
          opening_balance?: number
          owner_id?: string
          pan_no?: string | null
          phone?: string | null
          pincode?: string | null
          state?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          gst_no?: string | null
          id?: string
          name?: string
          notes?: string | null
          opening_balance?: number
          owner_id?: string
          pan_no?: string | null
          phone?: string | null
          pincode?: string | null
          state?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      work_orders: {
        Row: {
          created_at: string
          customer_id: string | null
          glass_type: string | null
          id: string
          instructions: string | null
          invoice_id: string | null
          owner_id: string
          pieces: Json
          project_id: string | null
          quotation_id: string | null
          status: Database["public"]["Enums"]["production_status"]
          thickness_mm: number | null
          updated_at: string
          wo_no: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          glass_type?: string | null
          id?: string
          instructions?: string | null
          invoice_id?: string | null
          owner_id?: string
          pieces?: Json
          project_id?: string | null
          quotation_id?: string | null
          status?: Database["public"]["Enums"]["production_status"]
          thickness_mm?: number | null
          updated_at?: string
          wo_no: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          glass_type?: string | null
          id?: string
          instructions?: string | null
          invoice_id?: string | null
          owner_id?: string
          pieces?: Json
          project_id?: string | null
          quotation_id?: string | null
          status?: Database["public"]["Enums"]["production_status"]
          thickness_mm?: number | null
          updated_at?: string
          wo_no?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "manager" | "operator" | "accountant"
      dim_unit: "ft" | "in" | "mm"
      invoice_type: "gst" | "tax" | "retail"
      payment_method:
        | "cash"
        | "upi"
        | "bank_transfer"
        | "cheque"
        | "card"
        | "other"
      production_status:
        | "pending"
        | "cutting"
        | "grinding"
        | "polishing"
        | "tempering"
        | "ready"
        | "delivered"
      quotation_status: "draft" | "sent" | "accepted" | "rejected" | "expired"
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
      app_role: ["admin", "manager", "operator", "accountant"],
      dim_unit: ["ft", "in", "mm"],
      invoice_type: ["gst", "tax", "retail"],
      payment_method: [
        "cash",
        "upi",
        "bank_transfer",
        "cheque",
        "card",
        "other",
      ],
      production_status: [
        "pending",
        "cutting",
        "grinding",
        "polishing",
        "tempering",
        "ready",
        "delivered",
      ],
      quotation_status: ["draft", "sent", "accepted", "rejected", "expired"],
    },
  },
} as const
