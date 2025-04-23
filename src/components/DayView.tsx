
import { useRef, useState } from "react";
import { DayViewProps, Event } from "@/types";
import { UserAvatar } from "./UserAvatar";
import { getDayViewHalfHourIntervals } from "@/utils/timeUtils";
import { startOfDay, addMinutes } from "date-fns";
import EventItem from "./calendar/EventItem";
import TimeSlots from "./calendar/TimeSlots";
import RemindersList from "./calendar/RemindersList";
import { useIsMobile } from "@/hooks/use-mobile";

// Nuovi helper
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
  const isMobile = useIsMobile();

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
    // Visual feedback handled in EventItem
  };

  // Double tap/click su evento (apre dialog)
  // La logica è ora in EventItem tramite useDoubleTap, ma qui serve per drag!
  // drag handlers:
  const handleEventDragStart = (e: React.TouchEvent | React.MouseEvent, event: Event) => {
    e.stopPropagation();
    if (!selectedEventId || selectedEventId !== event.id) return;
    if (!containerRef.current) return;

    let clientY = e.type === "touchstart"
      ? (e as React.TouchEvent).touches[0].clientY
      : (e as React.MouseEvent).clientY;

    // Calcola y rispetto alla griglia
    const rect = containerRef.current.getBoundingClientRect();
    const yOffset = clientY - rect.top;
    setDraggingEvent({ event, yOffset });
    document.body.style.userSelect = "none";
  };

  const handleEventDrag = (e: React.TouchEvent | React.MouseEvent) => {
    e.stopPropagation();
    if (!draggingEvent || !containerRef.current) return;
    // Si potrebbe aggiungere overlay "shadow"...
    // Opzionale: for future, not now
  };

  const handleEventDragEnd = (e: React.TouchEvent | React.MouseEvent) => {
    e.stopPropagation();
    if (!draggingEvent || !containerRef.current) return;

    let clientY = e.type === "touchend"
      ? ((e as React.TouchEvent).changedTouches
          ? (e as React.TouchEvent).changedTouches[0].clientY
          : (e as React.TouchEvent).touches[0].clientY)
      : (e as React.MouseEvent).clientY;

    const rect = containerRef.current.getBoundingClientRect();
    const y = clientY - rect.top;

    const { newEventStart, newEventEnd } = getEventTimeByOffset(date, y, hourHeight);

    // Sposta evento
    if (onAddEvent) {
      // Togliamo l'evento dalla lista e lo rimettiamo alla nuova ora:
      // (Qui si potrebbe chiamare una prop onEventMove se si volesse distinguere)
      const movedEvent = { ...draggingEvent.event, start: newEventStart, end: newEventEnd };
      // Inoltra come "edita" evento
      if (movedEvent) {
        // Si può anche ottimizzare con onMove prop separato
        setTimeout(() => setSelectedEventId(null), 100);
        onEditEvent && onEditEvent(movedEvent);
      }
    }

    setDraggingEvent(null);
    document.body.style.userSelect = "";
  };

  // --- Visualizzazione e interattività agende --- //
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
                <div
                  key={`${event.id}-${userId}`}
                  style={{ touchAction: isMobile ? "none" : undefined }}
                  onTouchStart={(e) => {
                    e.stopPropagation();
                    if (selectedEventId === event.id) handleEventDragStart(e, event);
                  }}
                  onTouchMove={(e) => {
                    e.stopPropagation();
                    if (draggingEvent && selectedEventId === event.id) handleEventDrag(e);
                  }}
                  onTouchEnd={(e) => {
                    e.stopPropagation();
                    if (draggingEvent && selectedEventId === event.id) handleEventDragEnd(e);
                  }}
                >
                  <EventItem
                    event={event}
                    mainUserId={userId}
                    users={users}
                    zIndex={eventIndex}
                    hoveredEventId={hoveredEventId}
                    hourHeight={hourHeight}
                    onEventClick={handleEventClick}
                    onEventMouseEnter={handleEventMouseEnter}
                    onEventMouseLeave={handleEventMouseLeave}
                    onEventLongPress={isMobile ? handleEventLongPress : undefined}
                    isSelected={selectedEventId === event.id}
                    isDragging={!!draggingEvent && selectedEventId === event.id}
                  />
                </div>
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
