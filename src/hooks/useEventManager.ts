
import { useState, useEffect } from "react";
import { Event, User, InviteStatus } from "@/types";
import { mockUsers, generateMockEvents } from "@/data/mockData";
import { toast } from "@/hooks/use-toast";

export interface UseEventManagerResult {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  calendarView: 'day' | 'week' | 'month';
  setCalendarView: (view: 'day' | 'week' | 'month') => void;
  users: User[];
  selectedUsers: string[];
  setSelectedUsers: (ids: string[]) => void;
  handleUserSelect: (userId: string) => void;
  handleSelectAllUsers: () => void;
  events: Event[];
  handleAddEvent: (userIds: string[], start: Date, end: Date) => void;
  handleEditEvent: (event: Event) => void;
  handleSaveEvent: (updatedEvent: Event) => void;
  handleDeleteEvent: (eventId: string) => void;
  handleFindFreeSlots: () => void;
  handleCreateFromFreeSlot: (start: Date, end: Date, userIds: string[]) => void;
  refreshEvents: () => void;
  showFreeSlotFinder: boolean;
  setShowFreeSlotFinder: (value: boolean) => void;
  selectedEvent: Event | null;
  setSelectedEvent: (event: Event | null) => void;
  isEventDialogOpen: boolean;
  setIsEventDialogOpen: (open: boolean) => void;
}

export function useEventManager(): UseEventManagerResult {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [calendarView, setCalendarView] = useState<'day' | 'week' | 'month'>('week'); // Cambiato da 'day' a 'week'
  const [users] = useState<User[]>(mockUsers);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>(mockUsers.map(user => user.id));
  const [showFreeSlotFinder, setShowFreeSlotFinder] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState<boolean>(false);

  const refreshEvents = () => {
    const mockEvents = generateMockEvents(currentDate);
    const eventsWithEnhancements = mockEvents.map(event => {
      // Aggiungi status di invito e scadenza caso per caso
      const hasDeadline = Math.random() > 0.7; // 30% degli eventi hanno una scadenza
      const deadline = hasDeadline ? 
        new Date(new Date(event.start).getTime() - Math.floor(Math.random() * 48) * 3600000) : 
        undefined;
      
      // Genera stati casuali per gli inviti
      const statuses: Record<string, InviteStatus> = {};
      event.userIds.forEach(userId => {
        const randomStatus = Math.random();
        if (randomStatus < 0.6) statuses[userId] = 'accepted';
        else if (randomStatus < 0.8) statuses[userId] = 'declined';
        else statuses[userId] = 'pending';
      });

      return {
        ...event,
        attachments: event.attachments || [],
        rsvpDeadline: deadline,
        inviteStatus: statuses
      };
    });
    
    setEvents(eventsWithEnhancements);
    toast({
      title: "Aggiornamento completato",
      description: "Gli eventi sono stati aggiornati",
    });
  };

  useEffect(() => {
    refreshEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate]);

  const handleUserSelect = (userId: string) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleSelectAllUsers = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user.id));
    }
  };

  const handleAddEvent = (userIds: string[], start: Date, end: Date) => {
    // Crea stato iniziale degli inviti
    const inviteStatus: Record<string, InviteStatus> = {};
    userIds.forEach(userId => {
      inviteStatus[userId] = 'pending';
    });
    
    const newEvent: Event = {
      id: `new-${Date.now()}`,
      title: "",
      description: "",
      start,
      end,
      userIds,
      color: "#9b87f5",
      type: 'impegno',
      attachments: [],
      inviteStatus
    };
    
    setSelectedEvent(newEvent);
    setIsEventDialogOpen(true);
  };

  const handleEditEvent = (event: Event) => {
    const eventCopy = structuredClone(event);
    eventCopy.start = new Date(eventCopy.start);
    eventCopy.end = new Date(eventCopy.end);
    if (!eventCopy.attachments) {
      eventCopy.attachments = [];
    }
    if (eventCopy.rsvpDeadline) {
      eventCopy.rsvpDeadline = new Date(eventCopy.rsvpDeadline);
    }
    if (!eventCopy.inviteStatus) {
      eventCopy.inviteStatus = {};
    }
    setSelectedEvent(eventCopy);
    setIsEventDialogOpen(true);
  };

  const handleSaveEvent = (updatedEvent: Event) => {
    const eventToSave = structuredClone(updatedEvent);
    eventToSave.start = new Date(eventToSave.start);
    eventToSave.end = new Date(eventToSave.end);
    if (!eventToSave.attachments) {
      eventToSave.attachments = [];
    }
    if (eventToSave.rsvpDeadline) {
      eventToSave.rsvpDeadline = new Date(eventToSave.rsvpDeadline);
    }
    if (!eventToSave.inviteStatus) {
      eventToSave.inviteStatus = {};
    }
    
    setEvents(prev => {
      if (eventToSave.id.startsWith('new-')) {
        toast({
          title: "Evento creato",
          description: `L'evento "${eventToSave.title}" è stato creato.`,
        });
        return [...prev, { 
          ...eventToSave, 
          id: `event-${Date.now()}`,
          attachments: eventToSave.attachments
        }];
      } else {
        toast({
          title: "Evento aggiornato",
          description: `L'evento "${eventToSave.title}" è stato aggiornato.`,
        });
        return prev.map(e => 
          e.id === eventToSave.id 
            ? eventToSave 
            : e
        );
      }
    });
    setIsEventDialogOpen(false);
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(prev => prev.filter(e => e.id !== eventId));
    toast({
      title: "Evento eliminato",
      description: "L'evento è stato eliminato con successo.",
      variant: "destructive",
    });
    setIsEventDialogOpen(false);
  };

  const handleFindFreeSlots = () => {
    setShowFreeSlotFinder(prev => !prev);
  };

  const handleCreateFromFreeSlot = (start: Date, end: Date, userIds: string[]) => {
    if (userIds.length > 0) {
      handleAddEvent(userIds, start, end);
    }
  };

  return {
    currentDate,
    setCurrentDate,
    calendarView,
    setCalendarView,
    users,
    selectedUsers,
    setSelectedUsers,
    handleUserSelect,
    handleSelectAllUsers,
    events,
    handleAddEvent,
    handleEditEvent,
    handleSaveEvent,
    handleDeleteEvent,
    handleFindFreeSlots,
    handleCreateFromFreeSlot,
    refreshEvents,
    showFreeSlotFinder,
    setShowFreeSlotFinder,
    selectedEvent,
    setSelectedEvent,
    isEventDialogOpen,
    setIsEventDialogOpen,
  };
}
