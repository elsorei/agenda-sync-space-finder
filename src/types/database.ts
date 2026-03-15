export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type FriendshipStatus = 'pending' | 'accepted' | 'rejected';
export type EventStatus = 'draft' | 'pending_confirmations' | 'confirmed' | 'suspended' | 'cancelled';
export type ParticipantStatus = 'pending' | 'accepted' | 'declined';
export type NotificationType =
  | 'friendship_request'
  | 'friendship_accepted'
  | 'friendship_rejected'
  | 'event_invite'
  | 'event_updated'
  | 'event_cancelled'
  | 'event_reminder'
  | 'rsvp_deadline_reminder'
  | 'contact_registered'
  | 'general';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          phone: string | null;
          avatar_url: string | null;
          color: string;
          bio: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          phone?: string | null;
          avatar_url?: string | null;
          color?: string;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          phone?: string | null;
          avatar_url?: string | null;
          color?: string;
          bio?: string | null;
          updated_at?: string;
        };
      };
      contacts: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          email: string | null;
          phone: string | null;
          notes: string | null;
          linked_user_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          notes?: string | null;
          linked_user_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          email?: string | null;
          phone?: string | null;
          notes?: string | null;
          linked_user_id?: string | null;
          updated_at?: string;
        };
      };
      friendships: {
        Row: {
          id: string;
          requester_id: string;
          addressee_id: string;
          status: FriendshipStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          requester_id: string;
          addressee_id: string;
          status?: FriendshipStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: FriendshipStatus;
          updated_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          creator_id: string;
          title: string;
          description: string | null;
          start_date: string;
          end_date: string;
          type: string;
          status: EventStatus;
          color: string;
          rsvp_deadline: string | null;
          requires_confirmation: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          creator_id: string;
          title: string;
          description?: string | null;
          start_date: string;
          end_date: string;
          type?: string;
          status?: EventStatus;
          color?: string;
          rsvp_deadline?: string | null;
          requires_confirmation?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          start_date?: string;
          end_date?: string;
          type?: string;
          status?: EventStatus;
          color?: string;
          rsvp_deadline?: string | null;
          requires_confirmation?: boolean;
          updated_at?: string;
        };
      };
      event_participants: {
        Row: {
          id: string;
          event_id: string;
          user_id: string;
          status: ParticipantStatus;
          is_reserve: boolean;
          invited_at: string;
          responded_at: string | null;
        };
        Insert: {
          id?: string;
          event_id: string;
          user_id: string;
          status?: ParticipantStatus;
          is_reserve?: boolean;
          invited_at?: string;
          responded_at?: string | null;
        };
        Update: {
          status?: ParticipantStatus;
          responded_at?: string | null;
        };
      };
      event_external_invites: {
        Row: {
          id: string;
          event_id: string;
          email: string | null;
          phone: string | null;
          name: string;
          status: ParticipantStatus;
          token: string;
          invited_at: string;
          responded_at: string | null;
        };
        Insert: {
          id?: string;
          event_id: string;
          email?: string | null;
          phone?: string | null;
          name: string;
          status?: ParticipantStatus;
          token?: string;
          invited_at?: string;
          responded_at?: string | null;
        };
        Update: {
          status?: ParticipantStatus;
          responded_at?: string | null;
        };
      };
      event_attachments: {
        Row: {
          id: string;
          event_id: string;
          file_name: string;
          file_type: string;
          file_size: number;
          storage_path: string;
          uploaded_by: string;
          uploaded_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          file_name: string;
          file_type: string;
          file_size: number;
          storage_path: string;
          uploaded_by: string;
          uploaded_at?: string;
        };
        Update: {
          file_name?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: NotificationType;
          title: string;
          message: string;
          data: Json | null;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: NotificationType;
          title: string;
          message: string;
          data?: Json | null;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          read?: boolean;
        };
      };
      todos: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          due_date: string | null;
          reminder_at: string | null;
          completed: boolean;
          priority: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          due_date?: string | null;
          reminder_at?: string | null;
          completed?: boolean;
          priority?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          due_date?: string | null;
          reminder_at?: string | null;
          completed?: boolean;
          priority?: number;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      friendship_status: FriendshipStatus;
      event_status: EventStatus;
      participant_status: ParticipantStatus;
      notification_type: NotificationType;
    };
  };
}
