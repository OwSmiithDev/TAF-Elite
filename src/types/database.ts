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
      profiles: {
        Row: {
          id: string
          full_name: string | null
          email: string | null
          gender: string | null
          birth_date: string | null
          height_cm: number | null
          weight_kg: number | null
          target_exam: string | null
          exam_date: string | null
          current_level: string | null
          training_days_per_week: number | null
          goal_type: string | null
          physical_restrictions: string | null
          avatar_url: string | null
          role: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          email?: string | null
          gender?: string | null
          birth_date?: string | null
          height_cm?: number | null
          weight_kg?: number | null
          target_exam?: string | null
          exam_date?: string | null
          current_level?: string | null
          training_days_per_week?: number | null
          goal_type?: string | null
          physical_restrictions?: string | null
          avatar_url?: string | null
          role?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          email?: string | null
          gender?: string | null
          birth_date?: string | null
          height_cm?: number | null
          weight_kg?: number | null
          target_exam?: string | null
          exam_date?: string | null
          current_level?: string | null
          training_days_per_week?: number | null
          goal_type?: string | null
          physical_restrictions?: string | null
          avatar_url?: string | null
          role?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      contests: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      profile_target_exams: {
        Row: {
          profile_id: string
          contest_id: string
          created_at: string
        }
        Insert: {
          profile_id: string
          contest_id: string
          created_at?: string
        }
        Update: {
          profile_id?: string
          contest_id?: string
          created_at?: string
        }
      }
      onboarding_answers: {
        Row: {
          id: string
          user_id: string
          pullups_max: number | null
          pushups_max: number | null
          situps_max: number | null
          running_level: string | null
          weekly_availability: number | null
          has_injuries: boolean | null
          injury_notes: string | null
          preferred_goal: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          pullups_max?: number | null
          pushups_max?: number | null
          situps_max?: number | null
          running_level?: string | null
          weekly_availability?: number | null
          has_injuries?: boolean | null
          injury_notes?: string | null
          preferred_goal?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          pullups_max?: number | null
          pushups_max?: number | null
          situps_max?: number | null
          running_level?: string | null
          weekly_availability?: number | null
          has_injuries?: boolean | null
          injury_notes?: string | null
          preferred_goal?: string | null
          created_at?: string
        }
      }
      exercises: {
        Row: {
          id: string
          title: string
          slug: string
          category: string
          difficulty_level: string | null
          description: string | null
          instructions: string | null
          common_mistakes: string | null
          tips: string | null
          safety_notes: string | null
          video_url: string | null
          thumbnail_url: string | null
          sets_count: number | null
          reps_text: string | null
          rest_seconds: number | null
          estimated_duration_minutes: number | null
          equipment: string | null
          is_premium: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          category: string
          difficulty_level?: string | null
          description?: string | null
          instructions?: string | null
          common_mistakes?: string | null
          tips?: string | null
          safety_notes?: string | null
          video_url?: string | null
          thumbnail_url?: string | null
          sets_count?: number | null
          reps_text?: string | null
          rest_seconds?: number | null
          estimated_duration_minutes?: number | null
          equipment?: string | null
          is_premium?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          category?: string
          difficulty_level?: string | null
          description?: string | null
          instructions?: string | null
          common_mistakes?: string | null
          tips?: string | null
          safety_notes?: string | null
          video_url?: string | null
          thumbnail_url?: string | null
          sets_count?: number | null
          reps_text?: string | null
          rest_seconds?: number | null
          estimated_duration_minutes?: number | null
          equipment?: string | null
          is_premium?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      exercise_contests: {
        Row: {
          exercise_id: string
          contest_id: string
          created_at: string
        }
        Insert: {
          exercise_id: string
          contest_id: string
          created_at?: string
        }
        Update: {
          exercise_id?: string
          contest_id?: string
          created_at?: string
        }
      }
      training_plans: {
        Row: {
          id: string
          title: string
          description: string | null
          level: string | null
          objective: string | null
          duration_weeks: number | null
          weekly_days: number | null
          is_premium: boolean
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          level?: string | null
          objective?: string | null
          duration_weeks?: number | null
          weekly_days?: number | null
          is_premium?: boolean
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          level?: string | null
          objective?: string | null
          duration_weeks?: number | null
          weekly_days?: number | null
          is_premium?: boolean
          is_active?: boolean
          created_at?: string
        }
      }
      user_active_plans: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          started_at: string
          current_week: number
          current_day: number
          status: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_id: string
          started_at?: string
          current_week?: number
          current_day?: number
          status?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_id?: string
          started_at?: string
          current_week?: number
          current_day?: number
          status?: string
        }
      }
      workout_logs: {
        Row: {
          id: string
          user_id: string
          workout_id: string
          completed_at: string
          duration_minutes: number | null
          notes: string | null
        }
        Insert: {
          id?: string
          user_id: string
          workout_id: string
          completed_at?: string
          duration_minutes?: number | null
          notes?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          workout_id?: string
          completed_at?: string
          duration_minutes?: number | null
          notes?: string | null
        }
      }
      fitness_tests: {
        Row: {
          id: string
          user_id: string
          test_date: string
          pullups_result: number | null
          pushups_result: number | null
          situps_result: number | null
          run_distance_meters: number | null
          run_time_seconds: number | null
          observations: string | null
        }
        Insert: {
          id?: string
          user_id: string
          test_date: string
          pullups_result?: number | null
          pushups_result?: number | null
          situps_result?: number | null
          run_distance_meters?: number | null
          run_time_seconds?: number | null
          observations?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          test_date?: string
          pullups_result?: number | null
          pushups_result?: number | null
          situps_result?: number | null
          run_distance_meters?: number | null
          run_time_seconds?: number | null
          observations?: string | null
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_name: string | null
          status: string | null
          started_at: string | null
          expires_at: string | null
          gateway: string | null
          gateway_subscription_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_name?: string | null
          status?: string | null
          started_at?: string | null
          expires_at?: string | null
          gateway?: string | null
          gateway_subscription_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_name?: string | null
          status?: string | null
          started_at?: string | null
          expires_at?: string | null
          gateway?: string | null
          gateway_subscription_id?: string | null
          created_at?: string
          updated_at?: string
        }
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
