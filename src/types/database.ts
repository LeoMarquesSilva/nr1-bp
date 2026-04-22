export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '14.1'
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string
          actor_auth_id: string
          created_at: string
          details: Json
          id: string
          tenant_id: string | null
        }
        Insert: {
          action: string
          actor_auth_id: string
          created_at?: string
          details?: Json
          id?: string
          tenant_id?: string | null
        }
        Update: {
          action?: string
          actor_auth_id?: string
          created_at?: string
          details?: Json
          id?: string
          tenant_id?: string | null
        }
      }
      submissions: {
        Row: {
          id: string
          tenant_id: string
          setor: string
          funcao: string
          answers: Json
          submitted_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          setor: string
          funcao?: string
          answers: Json
          submitted_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          setor?: string
          funcao?: string
          answers?: Json
          submitted_at?: string
        }
      }
      tenant_registry: {
        Row: {
          tenant_id: string
          display_name: string | null
          active: boolean
          whistleblower_enabled: boolean
          logo_url: string | null
          cnpj: string | null
          cnpjs: Json
          nicho: string | null
          setores: Json
          created_at: string
        }
        Insert: {
          tenant_id: string
          display_name?: string | null
          active?: boolean
          whistleblower_enabled?: boolean
          logo_url?: string | null
          cnpj?: string | null
          cnpjs?: Json
          nicho?: string | null
          setores?: Json
          created_at?: string
        }
        Update: {
          tenant_id?: string
          display_name?: string | null
          active?: boolean
          whistleblower_enabled?: boolean
          logo_url?: string | null
          cnpj?: string | null
          cnpjs?: Json
          nicho?: string | null
          setores?: Json
          created_at?: string
        }
      }
      whistleblower_reports: {
        Row: {
          id: string
          tenant_id: string
          protocol_id: string | null
          category: string | null
          body: string
          created_at: string
          read_at: string | null
          status: string
          is_anonymous: boolean | null
          reporter_name: string | null
          reporter_contact: string | null
          subject: string | null
          accused_relationship: string | null
          complaint_category: string | null
          complainant_gender: string | null
          incident_date: string | null
          location_has_camera: string | null
          evidence_paths: Json
        }
        Insert: {
          id?: string
          tenant_id: string
          protocol_id?: string | null
          category?: string | null
          body: string
          created_at?: string
          read_at?: string | null
          status?: string
          is_anonymous?: boolean | null
          reporter_name?: string | null
          reporter_contact?: string | null
          subject?: string | null
          accused_relationship?: string | null
          complaint_category?: string | null
          complainant_gender?: string | null
          incident_date?: string | null
          location_has_camera?: string | null
          evidence_paths?: Json
        }
        Update: {
          read_at?: string | null
          status?: string
        }
      }
      users: {
        Row: {
          id: string
          auth_id: string
          name: string
          email: string
          department: string | null
          role: string
          is_active: boolean
          avatar_url: string | null
          requires_password_change: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          auth_id: string
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email: string
          id?: string
          is_active?: boolean
          name: string
          requires_password_change?: boolean
          role?: string
          updated_at?: string
        }
        Update: {
          auth_id?: string
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email?: string
          id?: string
          is_active?: boolean
          name?: string
          requires_password_change?: boolean
          role?: string
          updated_at?: string
        }
      }
    }
    Views: {
      tenant_list: {
        Row: {
          tenant_id: string | null
        }
      }
      tenant_overview: {
        Row: {
          tenant_id: string | null
          submission_count: number | null
          last_submitted_at: string | null
        }
      }
    }
    Functions: {
      search_organizations: {
        Args: { p_query: string }
        Returns: { tenant_id: string; display_name: string | null; logo_url: string | null }[]
      }
      get_tenant_public_branding: {
        Args: { p_tenant_id: string }
        Returns: { display_name: string | null; logo_url: string | null }[]
      }
      delete_tenant_registry: {
        Args: { p_tenant_id: string }
        Returns: undefined
      }
      upsert_tenant_registry: {
        Args: {
          p_tenant_id: string
          p_display_name?: string
          p_active?: boolean
          p_cnpj?: string
          p_cnpjs?: Json
          p_nicho?: string
          p_setores?: Json
          p_whistleblower_enabled?: boolean
          p_logo_url?: string
        }
        Returns: undefined
      }
      get_whistleblower_status: {
        Args: { p_protocol_id: string }
        Returns: { status: string; created_at: string }[]
      }
      is_admin: {
        Args: never
        Returns: boolean
      }
    }
  }
}

