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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      battle_pass: {
        Row: {
          created_at: string | null
          description: string | null
          end_date: string
          id: string
          is_active: boolean | null
          max_tier: number | null
          name: string
          season_number: number
          start_date: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date: string
          id?: string
          is_active?: boolean | null
          max_tier?: number | null
          name: string
          season_number: number
          start_date: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string
          id?: string
          is_active?: boolean | null
          max_tier?: number | null
          name?: string
          season_number?: number
          start_date?: string
        }
        Relationships: []
      }
      battle_pass_progress: {
        Row: {
          battle_pass_id: string
          created_at: string | null
          current_tier: number | null
          id: string
          is_premium: boolean | null
          player_id: string
          updated_at: string | null
          xp: number | null
        }
        Insert: {
          battle_pass_id: string
          created_at?: string | null
          current_tier?: number | null
          id?: string
          is_premium?: boolean | null
          player_id: string
          updated_at?: string | null
          xp?: number | null
        }
        Update: {
          battle_pass_id?: string
          created_at?: string | null
          current_tier?: number | null
          id?: string
          is_premium?: boolean | null
          player_id?: string
          updated_at?: string | null
          xp?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "battle_pass_progress_battle_pass_id_fkey"
            columns: ["battle_pass_id"]
            isOneToOne: false
            referencedRelation: "battle_pass"
            referencedColumns: ["id"]
          },
        ]
      }
      battle_pass_rewards: {
        Row: {
          battle_pass_id: string
          created_at: string | null
          id: string
          is_premium: boolean | null
          reward_amount: number | null
          reward_id: string | null
          reward_type: string
          tier: number
        }
        Insert: {
          battle_pass_id: string
          created_at?: string | null
          id?: string
          is_premium?: boolean | null
          reward_amount?: number | null
          reward_id?: string | null
          reward_type: string
          tier: number
        }
        Update: {
          battle_pass_id?: string
          created_at?: string | null
          id?: string
          is_premium?: boolean | null
          reward_amount?: number | null
          reward_id?: string | null
          reward_type?: string
          tier?: number
        }
        Relationships: [
          {
            foreignKeyName: "battle_pass_rewards_battle_pass_id_fkey"
            columns: ["battle_pass_id"]
            isOneToOne: false
            referencedRelation: "battle_pass"
            referencedColumns: ["id"]
          },
        ]
      }
      match_analytics: {
        Row: {
          accuracy_percentage: number | null
          created_at: string | null
          id: string
          match_duration_seconds: number | null
          match_ended_at: string | null
          match_started_at: string
          room_id: string
          total_deaths: number | null
          total_hits: number | null
          total_kills: number | null
          total_shots_fired: number | null
          winning_team: string | null
        }
        Insert: {
          accuracy_percentage?: number | null
          created_at?: string | null
          id?: string
          match_duration_seconds?: number | null
          match_ended_at?: string | null
          match_started_at: string
          room_id: string
          total_deaths?: number | null
          total_hits?: number | null
          total_kills?: number | null
          total_shots_fired?: number | null
          winning_team?: string | null
        }
        Update: {
          accuracy_percentage?: number | null
          created_at?: string | null
          id?: string
          match_duration_seconds?: number | null
          match_ended_at?: string | null
          match_started_at?: string
          room_id?: string
          total_deaths?: number | null
          total_hits?: number | null
          total_kills?: number | null
          total_shots_fired?: number | null
          winning_team?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "match_analytics_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_analytics_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms_public"
            referencedColumns: ["id"]
          },
        ]
      }
      match_events: {
        Row: {
          damage: number | null
          event_type: string
          id: string
          match_id: string
          player_id: string
          position_x: number | null
          position_y: number | null
          position_z: number | null
          target_player_id: string | null
          timestamp: string | null
          weapon_type: string | null
        }
        Insert: {
          damage?: number | null
          event_type: string
          id?: string
          match_id: string
          player_id: string
          position_x?: number | null
          position_y?: number | null
          position_z?: number | null
          target_player_id?: string | null
          timestamp?: string | null
          weapon_type?: string | null
        }
        Update: {
          damage?: number | null
          event_type?: string
          id?: string
          match_id?: string
          player_id?: string
          position_x?: number | null
          position_y?: number | null
          position_z?: number | null
          target_player_id?: string | null
          timestamp?: string | null
          weapon_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "match_events_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "match_analytics"
            referencedColumns: ["id"]
          },
        ]
      }
      player_inventory: {
        Row: {
          equipped: boolean | null
          id: string
          item_id: string
          item_type: string
          player_id: string
          purchased_at: string | null
        }
        Insert: {
          equipped?: boolean | null
          id?: string
          item_id: string
          item_type: string
          player_id: string
          purchased_at?: string | null
        }
        Update: {
          equipped?: boolean | null
          id?: string
          item_id?: string
          item_type?: string
          player_id?: string
          purchased_at?: string | null
        }
        Relationships: []
      }
      player_match_stats: {
        Row: {
          accuracy_percentage: number | null
          assists: number | null
          created_at: string | null
          damage_dealt: number | null
          deaths: number | null
          id: string
          kills: number | null
          match_id: string
          player_id: string
          shots_fired: number | null
          shots_hit: number | null
          team: string | null
          time_alive_seconds: number | null
        }
        Insert: {
          accuracy_percentage?: number | null
          assists?: number | null
          created_at?: string | null
          damage_dealt?: number | null
          deaths?: number | null
          id?: string
          kills?: number | null
          match_id: string
          player_id: string
          shots_fired?: number | null
          shots_hit?: number | null
          team?: string | null
          time_alive_seconds?: number | null
        }
        Update: {
          accuracy_percentage?: number | null
          assists?: number | null
          created_at?: string | null
          damage_dealt?: number | null
          deaths?: number | null
          id?: string
          kills?: number | null
          match_id?: string
          player_id?: string
          shots_fired?: number | null
          shots_hit?: number | null
          team?: string | null
          time_alive_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "player_match_stats_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "match_analytics"
            referencedColumns: ["id"]
          },
        ]
      }
      player_progression: {
        Row: {
          created_at: string | null
          currency: number | null
          id: string
          level: number | null
          player_id: string
          premium_currency: number | null
          total_deaths: number | null
          total_kills: number | null
          total_matches: number | null
          updated_at: string | null
          wins: number | null
          xp: number | null
        }
        Insert: {
          created_at?: string | null
          currency?: number | null
          id?: string
          level?: number | null
          player_id: string
          premium_currency?: number | null
          total_deaths?: number | null
          total_kills?: number | null
          total_matches?: number | null
          updated_at?: string | null
          wins?: number | null
          xp?: number | null
        }
        Update: {
          created_at?: string | null
          currency?: number | null
          id?: string
          level?: number | null
          player_id?: string
          premium_currency?: number | null
          total_deaths?: number | null
          total_kills?: number | null
          total_matches?: number | null
          updated_at?: string | null
          wins?: number | null
          xp?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          updated_at: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id: string
          updated_at?: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      room_players: {
        Row: {
          id: string
          is_ready: boolean
          joined_at: string
          player_id: string
          room_id: string
          team: string | null
        }
        Insert: {
          id?: string
          is_ready?: boolean
          joined_at?: string
          player_id: string
          room_id: string
          team?: string | null
        }
        Update: {
          id?: string
          is_ready?: boolean
          joined_at?: string
          player_id?: string
          room_id?: string
          team?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "room_players_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_players_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_players_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms_public"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          created_at: string
          created_by: string
          current_players: number
          ended_at: string | null
          game_mode: string
          hashed_password: string | null
          id: string
          map_name: string
          max_players: number
          name: string
          room_code: string
          started_at: string | null
          status: string
        }
        Insert: {
          created_at?: string
          created_by: string
          current_players?: number
          ended_at?: string | null
          game_mode?: string
          hashed_password?: string | null
          id?: string
          map_name?: string
          max_players?: number
          name: string
          room_code: string
          started_at?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          current_players?: number
          ended_at?: string | null
          game_mode?: string
          hashed_password?: string | null
          id?: string
          map_name?: string
          max_players?: number
          name?: string
          room_code?: string
          started_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "rooms_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      skins_catalog: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_premium: boolean | null
          name: string
          price: number
          rarity: string
          skin_type: string
          unlock_level: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_premium?: boolean | null
          name: string
          price: number
          rarity: string
          skin_type: string
          unlock_level?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_premium?: boolean | null
          name?: string
          price?: number
          rarity?: string
          skin_type?: string
          unlock_level?: number | null
        }
        Relationships: []
      }
      store_purchases: {
        Row: {
          currency_type: string
          id: string
          item_id: string
          item_type: string
          player_id: string
          price: number
          purchased_at: string | null
        }
        Insert: {
          currency_type: string
          id?: string
          item_id: string
          item_type: string
          player_id: string
          price: number
          purchased_at?: string | null
        }
        Update: {
          currency_type?: string
          id?: string
          item_id?: string
          item_type?: string
          player_id?: string
          price?: number
          purchased_at?: string | null
        }
        Relationships: []
      }
      weapons_catalog: {
        Row: {
          created_at: string | null
          damage: number
          description: string | null
          fire_rate: number
          id: string
          is_premium: boolean | null
          mag_size: number
          name: string
          price: number | null
          reload_time: number
          unlock_cost: number | null
          unlock_level: number | null
          weapon_type: string
        }
        Insert: {
          created_at?: string | null
          damage: number
          description?: string | null
          fire_rate: number
          id?: string
          is_premium?: boolean | null
          mag_size: number
          name: string
          price?: number | null
          reload_time: number
          unlock_cost?: number | null
          unlock_level?: number | null
          weapon_type: string
        }
        Update: {
          created_at?: string | null
          damage?: number
          description?: string | null
          fire_rate?: number
          id?: string
          is_premium?: boolean | null
          mag_size?: number
          name?: string
          price?: number | null
          reload_time?: number
          unlock_cost?: number | null
          unlock_level?: number | null
          weapon_type?: string
        }
        Relationships: []
      }
    }
    Views: {
      rooms_public: {
        Row: {
          created_at: string | null
          created_by: string | null
          current_players: number | null
          ended_at: string | null
          game_mode: string | null
          has_password: boolean | null
          id: string | null
          map_name: string | null
          max_players: number | null
          name: string | null
          room_code: string | null
          started_at: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          current_players?: number | null
          ended_at?: string | null
          game_mode?: string | null
          has_password?: never
          id?: string | null
          map_name?: string | null
          max_players?: number | null
          name?: string | null
          room_code?: string | null
          started_at?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          current_players?: number | null
          ended_at?: string | null
          game_mode?: string | null
          has_password?: never
          id?: string | null
          map_name?: string | null
          max_players?: number | null
          name?: string | null
          room_code?: string | null
          started_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rooms_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      record_match_event: {
        Args: {
          p_damage?: number
          p_event_type: string
          p_match_id: string
          p_player_id: string
          p_position?: Json
          p_target_player_id?: string
          p_weapon_type?: string
        }
        Returns: undefined
      }
      set_room_password: {
        Args: { new_password: string; room_id: string }
        Returns: undefined
      }
      verify_room_password: {
        Args: { password_attempt: string; room_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
