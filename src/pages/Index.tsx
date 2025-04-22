
import { useState, useEffect } from "react";
import { Event, User } from "@/types";
import CalendarHeader from "@/components/CalendarHeader";
import UsersList from "@/components/UsersList";
import DayView from "@/components/DayView";
import EventDialog from "@/components/event-dialog/EventDialog";
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

  // Aggiungi un metodo di refresh esplicito
  const refreshEvents = () => {
    const mockEvents = generateMockEvents(currentDate);
    const eventsWithAttachments = mockEvents.map(event => ({
      ...event,
      attachments: event.attachments || []
    }));
    
    setEvents(eventsWithAttachments);
    
    toast({
      title: "Aggiornamento completato",
      description: "Gli eventi sono stati aggiornati",
    });
  };

  // Carica eventi per il giorno corrente
  useEffect(() => {
    refreshEvents(); // Chiama il refresh all'avvio
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

  // Funzione per aggiungere eventi
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
      attachments: [] // Assicuriamoci che ogni nuovo evento abbia l'array attachments inizializzato
    };
    console.log("Creating new event:", newEvent);
    setSelectedEvent(newEvent);
    setIsEventDialogOpen(true);
  };

  // Modifica evento - assicurandoci di creare una copia profonda dell'evento
  const handleEditEvent = (event: Event) => {
    // Crea una copia profonda dell'evento utilizzando structuredClone
    const eventCopy = structuredClone(event);
    
    // Assicurati che le date siano oggetti Date
    eventCopy.start = new Date(eventCopy.start);
    eventCopy.end = new Date(eventCopy.end);
    
    // Assicurati che ci sia l'array attachments
    if (!eventCopy.attachments) {
      eventCopy.attachments = [];
    }
    
    console.log("Editing event:", eventCopy.id, eventCopy.title);
    console.log("Event attachments before edit:", eventCopy.attachments?.length || 0);
    
    setSelectedEvent(eventCopy);
    setIsEventDialogOpen(true);
  };

  // Salva evento preservando gli allegati
  const handleSaveEvent = (updatedEvent: Event) => {
    console.log("Salvataggio evento:", updatedEvent.id);
    console.log("Allegati prima del salvataggio:", updatedEvent.attachments?.length || 0);
    
    // Creiamo una copia profonda usando structuredClone per isolare completamente l'oggetto
    const eventToSave = structuredClone(updatedEvent);
    
    // Assicuriamoci che le date siano oggetti Date
    eventToSave.start = new Date(eventToSave.start);
    eventToSave.end = new Date(eventToSave.end);
    
    // Verifica la presenza degli allegati
    if (!eventToSave.attachments) {
      eventToSave.attachments = [];
    }
    
    setEvents(prev => {
      // Nuovo evento
      if (eventToSave.id.startsWith('new-')) {
        toast({
          title: "Evento creato",
          description: `L'evento "${eventToSave.title}" è stato creato.`,
        });
        // Generiamo un ID reale e manteniamo gli allegati
        return [...prev, { 
          ...eventToSave, 
          id: `event-${Date.now()}`,
          attachments: eventToSave.attachments // Assicuriamoci che gli allegati vengano mantenuti
        }];
      } else {
        // Aggiornamento evento - manteniamo gli allegati
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
    // Quando creo da slot libero, posso selezionare gli utenti invitati
    if (userIds.length > 0) {
      handleAddEvent(userIds, start, end);
    }
  };

  // Aggiungi il metodo di refresh come proprietà
  return (
    <div className="flex flex-col bg-background h-[calc(100vh-64px)] lg:h-screen">
      <CalendarHeader
        date={currentDate}
        onDateChange={handleDateChange}
        view={calendarView}
        onViewChange={handleViewChange}
        onFindFreeSlots={handleFindFreeSlots}
        onRefresh={refreshEvents} // Passa il metodo di refresh
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
