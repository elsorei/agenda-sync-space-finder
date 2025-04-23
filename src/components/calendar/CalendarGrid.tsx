
import { Event, User } from "@/types";
import { useRef } from "react";
import EventItem from "./EventItem";
import TimeSlots from "./TimeSlots";
import RemindersList from "./RemindersList";

interface CalendarGridProps {
  events: Event[];
  users: User[];
  date: Date;
  hourHeight: number;
  containerRef: React.RefObject<HTMLDivElement>;
  hoveredEventId: string | null;
  selectedEventId: string | null;
  dragActive: boolean;
  draggingEvent: { event: Event, yOffset: number } | null;
  onEventClick: (e: React.MouseEvent, event: Event) => void;
  onEventMouseEnter: (eventId: string) => void;
  onEventMouseLeave: () => void;
  onEventLongPress: (event: Event) => void;
  onEventDragStart: (e: React.TouchEvent | React.MouseEvent, event: Event) => void;
  onEventDrag: (e: React.TouchEvent | React.MouseEvent) => void;
  onEventDragEnd: (e: React.TouchEvent | React.MouseEvent) => void;
  onTimeSlotClick: (e: React.MouseEvent | React.TouchEvent, timeString: string) => void;
  onTimeSlotLongPress: (e: React.MouseEvent | React.TouchEvent, timeString: string) => void;
  onBackgroundClick: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const CalendarGrid = ({
  events,
  users,
  date,
  hourHeight,
  containerRef,
  hoveredEventId,
  selectedEventId,
  dragActive,
  draggingEvent,
  onEventClick,
  onEventMouseEnter,
  onEventMouseLeave,
  onEventLongPress,
  onEventDragStart,
  onEventDrag,
  onEventDragEnd,
  onTimeSlotClick,
  onTimeSlotLongPress,
  onBackgroundClick,
}: CalendarGridProps) => {
  // Separate reminders from regular events
  const reminders = events.filter(event => event.type === 'promemoria');
  const regularEvents = events.filter(event => event.type !== 'promemoria');
  
  return (
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
        onEventClick={onEventClick}
        onEventMouseEnter={onEventMouseEnter}
        onEventMouseLeave={onEventMouseLeave}
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
              onEventClick={onEventClick}
              onEventMouseEnter={onEventMouseEnter}
              onEventMouseLeave={onEventMouseLeave}
              onEventLongPress={onEventLongPress}
              isSelected={selectedEventId === event.id}
              isDragging={dragActive && draggingEvent?.event.id === event.id}
              onDragStart={(e) => onEventDragStart(e, event)}
              onDragMove={onEventDrag}
              onDragEnd={onEventDragEnd}
            />
          ))
        )}
      </div>

      {/* Time indicators + slots */}
      <TimeSlots
        intervals={getDayViewHalfHourIntervals(date)}
        hourHeight={hourHeight}
        onTimeSlotClick={onTimeSlotClick}
        onTimeSlotLongPress={onTimeSlotLongPress}
      />

      {/* Sfondo cliccabile ma NON usato su mobile */}
      <div
        className="absolute left-0 top-0 w-full h-full touch-none z-0"
        style={{ touchAction: "none" }}
        onClick={onBackgroundClick}
      />
    </div>
  );
};

export default CalendarGrid;
