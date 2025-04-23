
import { useRef, useState, useEffect } from "react";
import { DayViewProps, Event } from "@/types";
import { UserAvatar } from "./UserAvatar";
import { getDayViewHalfHourIntervals } from "@/utils/timeUtils";
import { startOfDay, addMinutes } from "date-fns";
import EventItem from "./calendar/EventItem";
import TimeSlots from "./calendar/TimeSlots";
import RemindersList from "./calendar/RemindersList";
import { useIsMobile } from "@/hooks/use-mobile";

// Helper per calcolare l'ora in base alla posizione verticale
function getEventTimeByOffset(date: Date, y: number, hourHeight: number) {
  const clickedHour = 7 + y / hourHeight;
  const hour = Math.floor(clickedHour);
  const minutes = Math.round((clickedHour - hour) * 60 / 30) * 30;
  const newEventStart = new Date(date);
  newEventStart.setHours(hour, minutes, 0, 0);
  const newEventEnd = addMinutes(newEventStart, 30);
  return { newEventStart, newEventEnd };
}

const DayView = ({
  date,
  users,
  events,
  hourHeight = 60,
  onAddEvent,
  onEditEvent,
}: DayViewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredEventId, setHoveredEventId] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [draggingEvent, setDraggingEvent] = useState<{ event: Event, yOffset: number } | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const isMobile = useIsMobile();

  // Gestione dello stato del dragging attivo
  useEffect(() => {
    if (dragActive) {
      // Imposta lo stile del body durante il dragging
      document.body.style.userSelect = "none";
      document.body.style.overflow = "hidden"; // Impedisce lo scroll durante il trascinamento
      
      // Aggiungi event listeners globali per terminare il dragging se necessario
      const handleGlobalMouseUp = () => {
        setDragActive(false);
        setDraggingEvent(null);
      };
      
      window.addEventListener("mouseup", handleGlobalMouseUp);
      window.addEventListener("touchend", handleGlobalMouseUp);
      
      return () => {
        window.removeEventListener("mouseup", handleGlobalMouseUp);
        window.removeEventListener("touchend", handleGlobalMouseUp);
      };
    } else {
      // Ripristina lo stile del body
      document.body.style.userSelect = "";
      document.body.style.overflow = "";
    }
  }, [dragActive]);

  // Separa i promemoria dagli altri eventi
  const reminders = events.filter(event => event.type === 'promemoria');
  const regularEvents = events.filter(event => event.type !== 'promemoria');

  // Get half-hour intervals for the day view
  const halfHourIntervals = getDayViewHalfHourIntervals(date);

  // --- Creazione evento SOLO via long press --- //
  const handleTimeSlotClick = (
    e: React.MouseEvent | React.TouchEvent,
    timeString: string
  ) => {
    // Disabilitato su mobile - solo long press crea!
    if (isMobile) return;
    // Solo desktop: click per creare nuovo evento
    if (!onAddEvent) return;
    e.stopPropagation();
    e.preventDefault();

    const [hours, minutes] = timeString.split(':').map(Number);
    const newEventStart = new Date(date);
    newEventStart.setHours(hours, minutes, 0, 0);
    const newEventEnd = addMinutes(newEventStart, 30);
    if (users.length > 0) {
      onAddEvent([users[0].id], newEventStart, newEventEnd);
    }
  };

  const handleTimeSlotLongPress = (
    e: React.MouseEvent | React.TouchEvent,
    timeString: string
  ) => {
    if (!onAddEvent) return;
    // SOLO su mobile, long-press crea evento!
    if (!isMobile) return;
    e.stopPropagation();
    e.preventDefault();

    const [hours, minutes] = timeString.split(':').map(Number);
    const newEventStart = new Date(date);
    newEventStart.setHours(hours, minutes, 0, 0);
    const newEventEnd = addMinutes(newEventStart, 30);
    if (users.length > 0) {
      onAddEvent([users[0].id], newEventStart, newEventEnd);
    }
  };

  // === Apra la dialog evento SOLO da doppio click/tap === //
  // Long press su evento = seleziona per drag
  const handleEventLongPress = (event: Event) => {
    setSelectedEventId(event.id);
    setHoveredEventId(event.id);
  };

  // Gestione inizio trascinamento evento
  const handleEventDragStart = (e: React.TouchEvent | React.MouseEvent, event: Event) => {
    e.stopPropagation();
    if (!containerRef.current) return;

    let clientY: number;
    if ("touches" in e) {
      clientY = e.touches[0].clientY;
    } else {
      clientY = e.clientY;
    }

    // Calcola y rispetto alla griglia
    const rect = containerRef.current.getBoundingClientRect();
    const yOffset = clientY - rect.top;

    console.log("Drag started at position:", yOffset);
    
    setDraggingEvent({ event, yOffset });
    setDragActive(true);
    e.preventDefault(); // Previene comportamenti default del browser
  };

  // Gestione trascinamento in corso
  const handleEventDrag = (e: React.TouchEvent | React.MouseEvent) => {
    e.stopPropagation();
    if (!draggingEvent || !containerRef.current || !dragActive) return;

    // Ottieni la posizione attuale
    let clientY: number;
    if ("touches" in e) {
      clientY = e.touches[0].clientY;
    } else {
      clientY = e.clientY;
    }

    console.log("Dragging at position:", clientY);
    
    e.preventDefault(); // Previene scroll durante il drag
  };

  // Gestione fine trascinamento
  const handleEventDragEnd = (e: React.TouchEvent | React.MouseEvent) => {
    e.stopPropagation();
    if (!draggingEvent || !containerRef.current || !dragActive) return;

    // Ottieni la posizione finale
    let clientY: number;
    if ("changedTouches" in e) {
      clientY = e.changedTouches[0].clientY;
    } else if ("touches" in e) {
      clientY = e.touches[0].clientY;
    } else {
      clientY = e.clientY;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const y = clientY - rect.top;

    console.log("Drag ended at position:", y);

    const { newEventStart, newEventEnd } = getEventTimeByOffset(date, y, hourHeight);

    // Sposta evento
    if (onEditEvent) {
      const movedEvent = { ...draggingEvent.event, start: newEventStart, end: newEventEnd };
      console.log("Moving event to new time:", formatTimeLog(newEventStart), formatTimeLog(newEventEnd));
      
      // Attendi un momento prima di deselezionare per un feedback visivo migliore
      setTimeout(() => setSelectedEventId(null), 100);
      onEditEvent(movedEvent);
    }

    setDraggingEvent(null);
    setDragActive(false);
    e.preventDefault(); // Previene click accidentali al termine del drag
  };

  // Funzione per il debug dei timestamp
  const formatTimeLog = (date: Date): string => {
    return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  // Double tap/click su evento (apre dialog)
  const handleEventClick = (e: React.MouseEvent, event: Event) => {
    e.stopPropagation();
    // Desktop e mobile, double-tap/click gestito in EventItem
    if (onEditEvent) {
      onEditEvent(event);
      setSelectedEventId(null); // deseleziona eventuale selezione pre-drag
    }
  };

  const handleEventMouseEnter = (eventId: string) => setHoveredEventId(eventId);
  const handleEventMouseLeave = () => setHoveredEventId(null);

  // Sfiorando lo sfondo della griglia NON crea più eventi su mobile
  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Deseleziona l'evento se si fa click sullo sfondo
    setSelectedEventId(null);
    // Su mobile impedisce interazioni indesiderate
    if (isMobile) {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  return (
    <div className="flex-1 overflow-y-auto border rounded-md bg-white touch-pan-y">
      <div className="flex">
        {/* User sidebar */}
        <div className="w-[100px] flex-shrink-0 border-r pt-[40px]">
          <div className="flex flex-col items-center gap-2 p-2">
            {users.map((user) => (
              <div key={user.id} className="flex flex-col items-center">
                <UserAvatar user={user} size="sm" />
                <span className="text-xs mt-1 font-medium text-center">
                  {user.name.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>
        </div>
        {/* Main calendar grid */}
        <div
          className="flex-1 relative"
          style={{ height: `${16 * hourHeight}px` }}
          ref={containerRef}
        >
          {/* Promemoria */}
          <RemindersList
            reminders={reminders}
            users={users}
            hoveredEventId={hoveredEventId}
            hourHeight={hourHeight}
            onEventClick={handleEventClick}
            onEventMouseEnter={handleEventMouseEnter}
            onEventMouseLeave={handleEventMouseLeave}
          />

          {/* Eventi "normali": */}
          <div className="relative">
            {regularEvents.map((event, eventIndex) =>
              event.userIds.map((userId) => (
                <EventItem
                  key={`${event.id}-${userId}`}
                  event={event}
                  mainUserId={userId}
                  users={users}
                  zIndex={eventIndex}
                  hoveredEventId={hoveredEventId}
                  hourHeight={hourHeight}
                  onEventClick={handleEventClick}
                  onEventMouseEnter={handleEventMouseEnter}
                  onEventMouseLeave={handleEventMouseLeave}
                  onEventLongPress={handleEventLongPress}
                  isSelected={selectedEventId === event.id}
                  isDragging={dragActive && draggingEvent?.event.id === event.id}
                  onDragStart={(e) => handleEventDragStart(e, event)}
                  onDragMove={handleEventDrag}
                  onDragEnd={handleEventDragEnd}
                />
              ))
            )}
          </div>
          {/* Time indicators + slots */}
          <TimeSlots
            intervals={halfHourIntervals}
            hourHeight={hourHeight}
            onTimeSlotClick={handleTimeSlotClick}
            onTimeSlotLongPress={handleTimeSlotLongPress}
          />
          {/* Sfondo cliccabile ma NON usato su mobile */}
          <div
            className="absolute left-0 top-0 w-full h-full touch-none z-0"
            style={{ touchAction: "none" }}
            onClick={handleBackgroundClick}
          />
        </div>
      </div>
    </div>
  );
};

export default DayView;
