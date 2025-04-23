
import { useState, useRef } from "react";
import { DayViewProps, Event } from "@/types";
import { addMinutes } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import { getDayViewHalfHourIntervals } from "@/utils/timeUtils";
import { useDayViewDrag } from "@/hooks/useDayViewDrag";
import UserSidebar from "@/components/calendar/UserSidebar";
import CalendarGrid from "@/components/calendar/CalendarGrid";
import RemindersList from "@/components/calendar/RemindersList";

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
  const [selectedUsers, setSelectedUsers] = useState<string[]>(users.map(u => u.id));
  const { draggingEvent, setDraggingEvent, dragActive, setDragActive } = useDayViewDrag();
  const isMobile = useIsMobile();

  // Filter reminders for the current day
  const reminders = events.filter(event => {
    return (
      event.type === 'promemoria' &&
      event.start.getDate() === date.getDate() &&
      event.start.getMonth() === date.getMonth() &&
      event.start.getFullYear() === date.getFullYear()
    );
  });

  // === Event handlers === //
  const handleTimeSlotClick = (
    e: React.MouseEvent | React.TouchEvent,
    timeString: string
  ) => {
    if (isMobile) return;
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
    if (!onAddEvent || !isMobile) return;
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

  const handleEventLongPress = (event: Event) => {
    setSelectedEventId(event.id);
    setHoveredEventId(event.id);
  };

  const handleEventDragStart = (e: React.TouchEvent | React.MouseEvent, event: Event) => {
    e.stopPropagation();
    if (!containerRef.current) return;

    let clientY: number;
    if ("touches" in e) {
      clientY = e.touches[0].clientY;
    } else {
      clientY = e.clientY;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const yOffset = clientY - rect.top;
    
    setDraggingEvent({ event, yOffset });
    setDragActive(true);
    e.preventDefault();
  };

  const handleEventDrag = (e: React.TouchEvent | React.MouseEvent) => {
    e.stopPropagation();
    if (!draggingEvent || !containerRef.current || !dragActive) return;
    e.preventDefault();
  };

  const handleEventDragEnd = (e: React.TouchEvent | React.MouseEvent) => {
    e.stopPropagation();
    if (!draggingEvent || !containerRef.current || !dragActive) return;

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
    const { newEventStart, newEventEnd } = getEventTimeByOffset(date, y, hourHeight);

    if (onEditEvent) {
      const movedEvent = { ...draggingEvent.event, start: newEventStart, end: newEventEnd };
      setTimeout(() => setSelectedEventId(null), 100);
      onEditEvent(movedEvent);
    }

    setDraggingEvent(null);
    setDragActive(false);
    e.preventDefault();
  };

  const handleEventClick = (e: React.MouseEvent, event: Event) => {
    e.stopPropagation();
    if (onEditEvent) {
      onEditEvent(event);
      setSelectedEventId(null);
    }
  };

  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    setSelectedEventId(null);
    if (isMobile) {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  return (
    <div className="flex-1 overflow-y-auto border rounded-md bg-white touch-pan-y">
      <div className="flex">
        <UserSidebar 
          users={users} 
          selectedUsers={selectedUsers}
          onUserSelect={(userId) => {
            setSelectedUsers(prev => 
              prev.includes(userId) 
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
            );
          }}
        />
        <CalendarGrid
          events={events}
          users={users}
          date={date}
          hourHeight={hourHeight}
          containerRef={containerRef}
          hoveredEventId={hoveredEventId}
          selectedEventId={selectedEventId}
          dragActive={dragActive}
          draggingEvent={draggingEvent}
          onEventClick={handleEventClick}
          onEventMouseEnter={setHoveredEventId}
          onEventMouseLeave={() => setHoveredEventId(null)}
          onEventLongPress={handleEventLongPress}
          onEventDragStart={handleEventDragStart}
          onEventDrag={handleEventDrag}
          onEventDragEnd={handleEventDragEnd}
          onTimeSlotClick={handleTimeSlotClick}
          onTimeSlotLongPress={handleTimeSlotLongPress}
          onBackgroundClick={handleBackgroundClick}
        />
      </div>
      {reminders.length > 0 && (
        <RemindersList 
          reminders={reminders}
          users={users}
          hoveredEventId={hoveredEventId}
          hourHeight={hourHeight}
          onEventClick={handleEventClick}
          onEventMouseEnter={setHoveredEventId}
          onEventMouseLeave={() => setHoveredEventId(null)}
          onEventLongPress={handleEventLongPress}
          isSelected={false}
          isDragging={false}
          onDragStart={handleEventDragStart}
          onDragMove={handleEventDrag}
          onDragEnd={handleEventDragEnd}
        />
      )}
    </div>
  );
};

export default DayView;
