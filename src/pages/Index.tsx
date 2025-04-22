
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
    
    // Assicuriamoci che gli eventi abbiano sempre la proprietà attachments
    const eventsWithAttachments = mockEvents.map(event => ({
      ...event,
      attachments: event.attachments || []
    }));
    
    setEvents(eventsWithAttachments);
    
    // Debug: Verifica che gli eventi abbiano l'array attachments
    console.log("Eventi caricati:", eventsWithAttachments);
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
    setSelectedEvent(newEvent);
    setIsEventDialogOpen(true);
  };

  // Edit event - ensuring to create a deep copy of the event to break any references
  const handleEditEvent = (event: Event) => {
    // Assicuriamoci che l'evento abbia la proprietà attachments e che sia una copia profonda
    const eventWithAttachments = JSON.parse(JSON.stringify({
      ...event,
      attachments: event.attachments || []
    }));
    
    // Riconverti le date da stringhe a oggetti Date
    eventWithAttachments.start = new Date(eventWithAttachments.start);
    eventWithAttachments.end = new Date(eventWithAttachments.end);
    
    console.log("Editing event:", eventWithAttachments.id, eventWithAttachments.title);
    console.log("Event attachments before edit:", eventWithAttachments.attachments);
    
    setSelectedEvent(eventWithAttachments);
    setIsEventDialogOpen(true);
  };

  // Salva evento preservando gli allegati
  const handleSaveEvent = (updatedEvent: Event) => {
    // Use deep clone to ensure we're not modifying the original object by reference
    const eventToSave = {
      ...updatedEvent,
      attachments: updatedEvent.attachments || [],
      // Assicuriamoci che le date siano oggetti Date
      start: updatedEvent.start instanceof Date ? updatedEvent.start : new Date(updatedEvent.start),
      end: updatedEvent.end instanceof Date ? updatedEvent.end : new Date(updatedEvent.end)
    };
    
    console.log("Salvataggio evento con allegati:", eventToSave);
    
    setEvents(prev => {
      // Nuovo evento
      if (eventToSave.id.startsWith('new-')) {
        toast({
          title: "Evento creato",
          description: `L'evento "${eventToSave.title}" è stato creato.`,
        });
        // id reale
        return [...prev, { 
          ...eventToSave, 
          id: `event-${Date.now()}` 
        }];
      } else {
        // Aggiornamento evento - manteniamo gli allegati esistenti
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
