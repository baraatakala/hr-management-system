export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          code: string
          name_en: string
          name_ar: string
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          name_en: string
          name_ar: string
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          name_en?: string
          name_ar?: string
          created_at?: string
        }
        Relationships: []
      }
      departments: {
        Row: {
          id: string
          code: string
          name_en: string
          name_ar: string
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          name_en: string
          name_ar: string
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          name_en?: string
          name_ar?: string
          created_at?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          id: string
          code: string
          name_en: string
          name_ar: string
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          name_en: string
          name_ar: string
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          name_en?: string
          name_ar?: string
          created_at?: string
        }
        Relationships: []
      }
      employees: {
        Row: {
          id: string
          employee_no: string
          name_en: string
          name_ar: string
          nationality: string
          company_id: string
          department_id: string
          job_id: string
          passport_no: string | null
          passport_expiry: string | null
          card_no: string | null
          card_expiry: string | null
          emirates_id: string | null
          emirates_id_expiry: string | null
          residence_no: string | null
          residence_expiry: string | null
          email: string | null
          phone: string | null
          added_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employee_no: string
          name_en: string
          name_ar: string
          nationality: string
          company_id: string
          department_id: string
          job_id: string
          passport_no?: string | null
          passport_expiry?: string | null
          card_no?: string | null
          card_expiry?: string | null
          emirates_id?: string | null
          emirates_id_expiry?: string | null
          residence_no?: string | null
          residence_expiry?: string | null
          email?: string | null
          phone?: string | null
          added_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employee_no?: string
          name_en?: string
          name_ar?: string
          nationality?: string
          company_id?: string
          department_id?: string
          job_id?: string
          passport_no?: string | null
          passport_expiry?: string | null
          card_no?: string | null
          card_expiry?: string | null
          emirates_id?: string | null
          emirates_id_expiry?: string | null
          residence_no?: string | null
          residence_expiry?: string | null
          email?: string | null
          phone?: string | null
          added_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      activity_log: {
        Row: {
          id: string
          employee_id: string
          action: string
          details: Json | null
          timestamp: string
          user_id: string | null
        }
        Insert: {
          id?: string
          employee_id: string
          action: string
          details?: Json | null
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          id?: string
          employee_id?: string
          action?: string
          details?: Json | null
          timestamp?: string
          user_id?: string | null
        }
        Relationships: []
      }
      reminders: {
        Row: {
          id: string
          employee_id: string
          type: string
          target_date: string
          status: 'pending' | 'sent' | 'failed'
          sent_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          type: string
          target_date: string
          status?: 'pending' | 'sent' | 'failed'
          sent_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          type?: string
          target_date?: string
          status?: 'pending' | 'sent' | 'failed'
          sent_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
