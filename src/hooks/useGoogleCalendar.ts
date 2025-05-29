
import { useState, useEffect } from 'react';
import { googleCalendarService, GoogleCalendarEvent } from '@/services/googleCalendar';
import { Event, User } from '@/types';
import { toast } from '@/hooks/use-toast';

export interface UseGoogleCalendarResult {
  isSignedIn: boolean;
  isInitialized: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  syncEvents: (startDate: Date, endDate: Date) => Promise<Event[]>;
  createGoogleEvent: (event: Event) => Promise<void>;
  updateGoogleEvent: (event: Event) => Promise<void>;
  deleteGoogleEvent: (eventId: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const useGoogleCalendar = (): UseGoogleCalendarResult => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      try {
        const initialized = await googleCalendarService.initialize();
        setIsInitialized(initialized);
        setIsSignedIn(googleCalendarService.getSignInStatus());
      } catch (err) {
        setError('Errore nell\'inizializzazione di Google Calendar');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  const signIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const success = await googleCalendarService.signIn();
      setIsSignedIn(success);
      if (success) {
        toast({
          title: "Connesso a Google Calendar",
          description: "Autenticazione riuscita",
        });
      }
    } catch (err) {
      setError('Errore nell\'autenticazione');
      toast({
        title: "Errore di autenticazione",
        description: "Impossibile connettersi a Google Calendar",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await googleCalendarService.signOut();
      setIsSignedIn(false);
      toast({
        title: "Disconnesso",
        description: "Disconnesso da Google Calendar",
      });
    } catch (err) {
      setError('Errore nella disconnessione');
    }
  };

  const convertGoogleEventToEvent = (googleEvent: GoogleCalendarEvent): Event => {
    return {
      id: `google-${googleEvent.id}`,
      title: googleEvent.summary || 'Evento senza titolo',
      description: googleEvent.description || '',
      start: new Date(googleEvent.start.dateTime),
      end: new Date(googleEvent.end.dateTime),
      userIds: googleEvent.attendees?.map(a => a.email) || [],
      color: '#4285f4', // Google blue
      type: 'appuntamento',
      attachments: []
    };
  };

  const convertEventToGoogleEvent = (event: Event): Partial<GoogleCalendarEvent> => {
    return {
      summary: event.title,
      description: event.description,
      start: {
        dateTime: event.start.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: event.end.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      attendees: event.userIds.map(userId => ({
        email: userId,
        responseStatus: 'needsAction'
      }))
    };
  };

  const syncEvents = async (startDate: Date, endDate: Date): Promise<Event[]> => {
    if (!isSignedIn) {
      throw new Error('Non autenticato');
    }

    setIsLoading(true);
    setError(null);
    try {
      const googleEvents = await googleCalendarService.getEvents('primary', startDate, endDate);
      const events = googleEvents.map(convertGoogleEventToEvent);
      
      toast({
        title: "Sincronizzazione completata",
        description: `Importati ${events.length} eventi da Google Calendar`,
      });
      
      return events;
    } catch (err) {
      setError('Errore nella sincronizzazione');
      toast({
        title: "Errore di sincronizzazione",
        description: "Impossibile sincronizzare con Google Calendar",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const createGoogleEvent = async (event: Event): Promise<void> => {
    if (!isSignedIn) return;

    setIsLoading(true);
    try {
      const googleEvent = convertEventToGoogleEvent(event);
      await googleCalendarService.createEvent('primary', googleEvent);
      
      toast({
        title: "Evento creato",
        description: "Evento sincronizzato con Google Calendar",
      });
    } catch (err) {
      setError('Errore nella creazione dell\'evento');
      toast({
        title: "Errore",
        description: "Impossibile creare l'evento su Google Calendar",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateGoogleEvent = async (event: Event): Promise<void> => {
    if (!isSignedIn || !event.id.startsWith('google-')) return;

    setIsLoading(true);
    try {
      const googleEventId = event.id.replace('google-', '');
      const googleEvent = convertEventToGoogleEvent(event);
      await googleCalendarService.updateEvent('primary', googleEventId, googleEvent);
      
      toast({
        title: "Evento aggiornato",
        description: "Evento sincronizzato con Google Calendar",
      });
    } catch (err) {
      setError('Errore nell\'aggiornamento dell\'evento');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteGoogleEvent = async (eventId: string): Promise<void> => {
    if (!isSignedIn || !eventId.startsWith('google-')) return;

    setIsLoading(true);
    try {
      const googleEventId = eventId.replace('google-', '');
      await googleCalendarService.deleteEvent('primary', googleEventId);
      
      toast({
        title: "Evento eliminato",
        description: "Evento rimosso da Google Calendar",
      });
    } catch (err) {
      setError('Errore nell\'eliminazione dell\'evento');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isSignedIn,
    isInitialized,
    signIn,
    signOut,
    syncEvents,
    createGoogleEvent,
    updateGoogleEvent,
    deleteGoogleEvent,
    isLoading,
    error
  };
};
