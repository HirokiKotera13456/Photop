export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string;
          avatar_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      pairs: {
        Row: {
          id: string;
          user_a_id: string;
          user_b_id: string | null;
          invite_code: string | null;
          invite_expires_at: string | null;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_a_id: string;
          user_b_id?: string | null;
          invite_code?: string | null;
          invite_expires_at?: string | null;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_a_id?: string;
          user_b_id?: string | null;
          invite_code?: string | null;
          invite_expires_at?: string | null;
          status?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      photos: {
        Row: {
          id: string;
          user_id: string;
          pair_id: string;
          storage_path: string;
          caption: string | null;
          month: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          pair_id: string;
          storage_path: string;
          caption?: string | null;
          month: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          pair_id?: string;
          storage_path?: string;
          caption?: string | null;
          month?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      likes: {
        Row: {
          id: string;
          user_id: string;
          photo_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          photo_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          photo_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      comments: {
        Row: {
          id: string;
          user_id: string;
          photo_id: string;
          body: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          photo_id: string;
          body: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          photo_id?: string;
          body?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      monthly_bests: {
        Row: {
          id: string;
          pair_id: string;
          selector_id: string;
          photo_id: string;
          month: string;
          is_confirmed: boolean;
          created_at: string;
          confirmed_at: string | null;
        };
        Insert: {
          id?: string;
          pair_id: string;
          selector_id: string;
          photo_id: string;
          month: string;
          is_confirmed?: boolean;
          created_at?: string;
          confirmed_at?: string | null;
        };
        Update: {
          id?: string;
          pair_id?: string;
          selector_id?: string;
          photo_id?: string;
          month?: string;
          is_confirmed?: boolean;
          created_at?: string;
          confirmed_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      generate_invite_code: {
        Args: Record<string, never>;
        Returns: Json;
      };
      join_pair: {
        Args: { code: string };
        Returns: Json;
      };
      select_monthly_best: {
        Args: { p_photo_id: string };
        Returns: Json;
      };
      confirm_monthly_bests: {
        Args: Record<string, never>;
        Returns: Json;
      };
      get_my_pair_id: {
        Args: Record<string, never>;
        Returns: string;
      };
      is_pair_partner: {
        Args: { target_user_id: string };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
