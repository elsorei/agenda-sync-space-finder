
import { useState, useEffect } from "react";
import { Event, User } from "@/types";
import CalendarHeader from "@/components/CalendarHeader";
import UsersList from "@/components/UsersList";
import DayView from "@/components/DayView";
import EventDialog from "@/components/event-dialog";
import FreeSlotFinder from "@/components/FreeSlotFinder";
import { mockUsers, generateMockEvents } from "@/data/mockData";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [calendarView, setCalendarView] = useState<'day' | 'week' | 'month'>('day');
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>(mockUsers.map(user => user.id));
  const [showFreeSlotFinder, setShowFreeSlotFinder] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState<boolean>(false);

  // Carica eventi per il giorno corrente
  useEffect(() => {
    const mockEvents = generateMockEvents(currentDate);
    
    // Assicuriamoci che gli eventi abbiano la proprietà attachments
    const eventsWithAttachments = mockEvents.map(event => ({
      ...event,
      attachments: event.attachments || []
    }));
    
    setEvents(eventsWithAttachments);
  }, [currentDate]);

  const handleDateChange = (date: Date) => {
    setCurrentDate(date);
  };

  const handleViewChange = (view: 'day' | 'week' | 'month') => {
    setCalendarView(view);
  };

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

  // Gestisce l'aggiunta di eventi con un orario di inizio e fine specifico
  const handleAddEvent = (userIds: string[], start: Date, end: Date) => {
    const newEvent: Event = {
      id: `new-${Date.now()}`,
      title: "",
      description: "",
      start,
      end,
      userIds,
      color: "#9b87f5",
      type: 'impegno',
      attachments: []
    };
    setSelectedEvent(newEvent);
    setIsEventDialogOpen(true);
  };

  // Aggiorna anche edit event: ora un evento può avere più utenti
  const handleEditEvent = (event: Event) => {
    // Assicuriamoci che l'evento abbia la proprietà attachments
    const eventWithAttachments = {
      ...event,
      attachments: event.attachments || []
    };
    
    setSelectedEvent(eventWithAttachments);
    setIsEventDialogOpen(true);
  };

  // Salva evento con più utenti: lo aggiunge a ogni utente invitato
  const handleSaveEvent = (updatedEvent: Event) => {
    setEvents(prev => {
      // Assicuriamoci che l'evento abbia sempre gli allegati
      const eventWithAttachments = {
        ...updatedEvent,
        attachments: updatedEvent.attachments || []
      };
      
      // Nuovo evento
      if (eventWithAttachments.id.startsWith('new-')) {
        toast({
          title: "Evento creato",
          description: `L'evento "${eventWithAttachments.title}" è stato creato.`,
        });
        // id reale
        return [...prev, { ...eventWithAttachments, id: `event-${Date.now()}` }];
      } else {
        // Aggiornamento evento
        toast({
          title: "Evento aggiornato",
          description: `L'evento "${eventWithAttachments.title}" è stato aggiornato.`,
        });
        return prev.map(e => e.id === eventWithAttachments.id ? eventWithAttachments : e);
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
  };

  const handleFindFreeSlots = () => {
    setShowFreeSlotFinder(prev => !prev);
  };

  const handleCreateFromFreeSlot = (start: Date, end: Date, userIds: string[]) => {
    // Quando creo da slot libero, posso selezionare gli utenti invitati
    if (userIds.length > 0) {
      handleAddEvent(userIds, start, end);
    }
  };

  return (
    <div className="flex flex-col bg-background h-[calc(100vh-64px)] lg:h-screen">
      <CalendarHeader
        date={currentDate}
        onDateChange={handleDateChange}
        view={calendarView}
        onViewChange={handleViewChange}
        onFindFreeSlots={handleFindFreeSlots}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar with users */}
        <div className="border-r w-[250px] hidden lg:block">
          <UsersList
            users={users}
            selectedUsers={selectedUsers}
            onUserSelect={handleUserSelect}
            onSelectAll={handleSelectAllUsers}
          />
        </div>

        {/* Main calendar view */}
        <div className="flex-1 overflow-hidden flex">
          <div className={`flex-1 p-4 ${showFreeSlotFinder ? 'w-2/3' : 'w-full'} overflow-hidden transition-all`}>
            {calendarView === 'day' && (
              <DayView
                date={currentDate}
                users={users.filter(user => selectedUsers.includes(user.id))}
                events={events}
                hourHeight={70}
                onAddEvent={handleAddEvent}
                onEditEvent={handleEditEvent}
              />
            )}
          </div>

          {/* Free slot finder panel */}
          {showFreeSlotFinder && (
            <div className="w-1/3 p-4 overflow-y-auto animate-fade-in">
              <FreeSlotFinder
                users={users}
                events={events}
                selectedUsers={selectedUsers}
                date={currentDate}
                onSlotSelect={handleCreateFromFreeSlot}
              />
            </div>
          )}
        </div>
      </div>

      {/* Event dialog */}
      <EventDialog
        event={selectedEvent}
        users={users}
        isOpen={isEventDialogOpen}
        onClose={() => setIsEventDialogOpen(false)}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
      />
    </div>
  );
};

export default Index;
