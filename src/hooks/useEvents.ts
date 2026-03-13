import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Database, EventStatus, ParticipantStatus } from '@/types/database';

type DbEvent = Database['public']['Tables']['events']['Row'];
type DbParticipant = Database['public']['Tables']['event_participants']['Row'];

export interface AppEvent {
  id: string;
  creator_id: string;
  title: string;
  description: string | null;
  start: Date;
  end: Date;
  type: string;
  status: EventStatus;
  color: string;
  rsvp_deadline: Date | null;
  requires_confirmation: boolean;
  participants: {
    user_id: string;
    status: ParticipantStatus;
    is_reserve: boolean;
    profile?: {
      full_name: string;
      email: string;
      color: string;
      avatar_url: string | null;
    };
  }[];
  is_creator: boolean;
  created_at: string;
}

export function useEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    // Fetch events created by user OR where user is a participant
    const { data: createdEvents } = await supabase
      .from('events')
      .select('*')
      .eq('creator_id', user.id);

    const { data: participantEvents } = await supabase
      .from('event_participants')
      .select('event_id')
      .eq('user_id', user.id);

    const participantEventIds = participantEvents?.map((p) => p.event_id) || [];

    let allEventIds = new Set<string>();
    createdEvents?.forEach((e) => allEventIds.add(e.id));
    participantEventIds.forEach((id) => allEventIds.add(id));

    if (allEventIds.size === 0) {
      setEvents([]);
      setLoading(false);
      return;
    }

    // Fetch all events
    const { data: allEvents } = await supabase
      .from('events')
      .select('*')
      .in('id', Array.from(allEventIds));

    // Fetch all participants for these events
    const { data: allParticipants } = await supabase
      .from('event_participants')
      .select('*')
      .in('event_id', Array.from(allEventIds));

    // Fetch participant profiles
    const participantUserIds = new Set<string>();
    allParticipants?.forEach((p) => participantUserIds.add(p.user_id));

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, email, color, avatar_url')
      .in('id', Array.from(participantUserIds));

    const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

    // Build enriched events
    const enrichedEvents: AppEvent[] = (allEvents || []).map((event) => {
      const eventParticipants = (allParticipants || [])
        .filter((p) => p.event_id === event.id)
        .map((p) => ({
          user_id: p.user_id,
          status: p.status as ParticipantStatus,
          is_reserve: p.is_reserve,
          profile: profileMap.get(p.user_id),
        }));

      return {
        id: event.id,
        creator_id: event.creator_id,
        title: event.title,
        description: event.description,
        start: new Date(event.start_date),
        end: new Date(event.end_date),
        type: event.type,
        status: event.status as EventStatus,
        color: event.color,
        rsvp_deadline: event.rsvp_deadline ? new Date(event.rsvp_deadline) : null,
        requires_confirmation: event.requires_confirmation,
        participants: eventParticipants,
        is_creator: event.creator_id === user.id,
        created_at: event.created_at,
      };
    });

    setEvents(enrichedEvents.sort((a, b) => a.start.getTime() - b.start.getTime()));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const createEvent = async (eventData: {
    title: string;
    description?: string;
    start: Date;
    end: Date;
    type?: string;
    color?: string;
    requires_confirmation?: boolean;
    rsvp_deadline?: Date | null;
    participant_ids?: string[];
    reserve_ids?: string[];
  }) => {
    if (!user) return { error: new Error('Non autenticato') };

    const { data: event, error } = await supabase
      .from('events')
      .insert({
        creator_id: user.id,
        title: eventData.title,
        description: eventData.description || null,
        start_date: eventData.start.toISOString(),
        end_date: eventData.end.toISOString(),
        type: eventData.type || 'appuntamento',
        color: eventData.color || '#9b87f5',
        requires_confirmation: eventData.requires_confirmation || false,
        rsvp_deadline: eventData.rsvp_deadline?.toISOString() || null,
        status: eventData.participant_ids?.length ? 'pending_confirmations' : 'confirmed',
      })
      .select()
      .single();

    if (error || !event) return { error: error || new Error('Errore creazione evento') };

    // Add participants
    const participants = [
      ...(eventData.participant_ids || []).map((id) => ({
        event_id: event.id,
        user_id: id,
        is_reserve: false,
      })),
      ...(eventData.reserve_ids || []).map((id) => ({
        event_id: event.id,
        user_id: id,
        is_reserve: true,
      })),
    ];

    if (participants.length > 0) {
      await supabase.from('event_participants').insert(participants);

      // Send notifications to participants
      const { data: creatorProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      const notifications = participants.map((p) => ({
        user_id: p.user_id,
        type: 'event_invite' as const,
        title: 'Nuovo invito a evento',
        message: `${creatorProfile?.full_name || 'Un utente'} ti ha invitato all'evento "${eventData.title}".`,
        data: { event_id: event.id },
      }));

      await supabase.from('notifications').insert(notifications);
    }

    await fetchEvents();
    return { data: event, error: null };
  };

  const updateEvent = async (
    eventId: string,
    updates: Partial<{
      title: string;
      description: string | null;
      start: Date;
      end: Date;
      type: string;
      status: EventStatus;
      color: string;
      rsvp_deadline: Date | null;
      requires_confirmation: boolean;
    }>
  ) => {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.start) dbUpdates.start_date = updates.start.toISOString();
    if (updates.end) dbUpdates.end_date = updates.end.toISOString();
    if (updates.type !== undefined) dbUpdates.type = updates.type;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.color !== undefined) dbUpdates.color = updates.color;
    if (updates.rsvp_deadline !== undefined)
      dbUpdates.rsvp_deadline = updates.rsvp_deadline?.toISOString() || null;
    if (updates.requires_confirmation !== undefined)
      dbUpdates.requires_confirmation = updates.requires_confirmation;

    const { error } = await supabase
      .from('events')
      .update(dbUpdates)
      .eq('id', eventId);

    if (!error) {
      // Notify participants of update
      const event = events.find((e) => e.id === eventId);
      if (event) {
        const notifications = event.participants.map((p) => ({
          user_id: p.user_id,
          type: 'event_updated' as const,
          title: 'Evento aggiornato',
          message: `L'evento "${event.title}" è stato aggiornato.`,
          data: { event_id: eventId },
        }));
        await supabase.from('notifications').insert(notifications);
      }
      await fetchEvents();
    }
    return { error };
  };

  const deleteEvent = async (eventId: string) => {
    const event = events.find((e) => e.id === eventId);

    const { error } = await supabase.from('events').delete().eq('id', eventId);

    if (!error && event) {
      // Notify participants of cancellation
      const notifications = event.participants.map((p) => ({
        user_id: p.user_id,
        type: 'event_cancelled' as const,
        title: 'Evento annullato',
        message: `L'evento "${event.title}" è stato annullato.`,
        data: { event_id: eventId },
      }));
      await supabase.from('notifications').insert(notifications);
      await fetchEvents();
    }
    return { error };
  };

  const respondToEvent = async (eventId: string, status: ParticipantStatus) => {
    if (!user) return { error: new Error('Non autenticato') };

    const { error } = await supabase
      .from('event_participants')
      .update({ status, responded_at: new Date().toISOString() })
      .eq('event_id', eventId)
      .eq('user_id', user.id);

    if (!error) {
      await fetchEvents();
    }
    return { error };
  };

  const checkAvailability = async (userId: string, start: Date, end: Date) => {
    const { data } = await supabase.rpc('check_user_availability', {
      p_user_id: userId,
      p_start: start.toISOString(),
      p_end: end.toISOString(),
    });
    return data;
  };

  return {
    events,
    loading,
    createEvent,
    updateEvent,
    deleteEvent,
    respondToEvent,
    checkAvailability,
    refreshEvents: fetchEvents,
  };
}
