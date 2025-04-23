import { useRef } from "react";
import { Event, User } from "@/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { getDayViewHalfHourIntervals } from "@/utils/timeUtils";
import { format } from "date-fns";
import EventItem from "./EventItem";
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
  draggingEvent: any;
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
  const isMobile = useIsMobile();
  const timeSlots = getDayViewHalfHourIntervals();
  const gridRef = useRef<HTMLDivElement>(null);

  const getEventTop = (event: Event) => {
    const start = new Date(event.start);
    const hours = start.getHours();
    const minutes = start.getMinutes();
    return (hours + minutes / 60 - 7) * hourHeight;
  };

  const getEventHeight = (event: Event) => {
    const start = new Date(event.start);
    const end = new Date(event.end);
    const duration = end.getTime() - start.getTime();
    return (duration / (60 * 60 * 1000)) * hourHeight;
  };

  const isEventDraggable = (event: Event) => {
    return !isMobile;
  };

  const reminders = events.filter(event => event.type === 'promemoria');
  const appointments = events.filter(event => event.type === 'appuntamento' || event.type === 'impegno');

  return (
    <div className="flex flex-col h-full w-full">
      <RemindersList
        reminders={reminders}
        users={users}
        hoveredEventId={hoveredEventId}
        hourHeight={hourHeight}
        onEventClick={onEventClick}
        onEventMouseEnter={onEventMouseEnter}
        onEventMouseLeave={onEventMouseLeave}
        onEventLongPress={onEventLongPress}
        isSelected={false}
        isDragging={false}
        onDragStart={() => {}}
        onDragMove={() => {}}
        onDragEnd={() => {}}
      />
      <div
        ref={containerRef}
        className="relative flex-1 overflow-y-auto touch-pan-y"
        onClick={onBackgroundClick}
      >
        <div
          ref={gridRef}
          className="relative grid"
          style={{
            gridTemplateRows: `repeat(17, ${hourHeight}px)`,
          }}
        >
          {timeSlots.map((timeSlot, index) => (
            <div
              key={index}
              className="relative border-t border-border"
              style={{
                gridRowStart: index + 1,
                height: hourHeight,
              }}
            >
              <div className="absolute left-2 top-0.5 text-xs text-muted-foreground">
                {timeSlot}
              </div>
              <button
                className="absolute inset-0 w-full h-full opacity-0 hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 disabled:cursor-not-allowed data-[disabled=true]:pointer-events-none"
                onClick={(e) => onTimeSlotClick(e, timeSlot)}
                onTouchStart={(e) => onTimeSlotLongPress(e, timeSlot)}
                onMouseDown={(e) => {
                  if (!isMobile) {
                    onTimeSlotClick(e, timeSlot);
                  }
                }}
                onContextMenu={(e) => e.preventDefault()}
              />
            </div>
          ))}
          {appointments.map((event, index) =>
            event.userIds.map(userId => {
              const user = users.find((user) => user.id === userId);
              if (!user) return null;

              const top = getEventTop(event);
              const height = getEventHeight(event);
              const isEventSelected = selectedEventId === event.id;
              const isEventDragging = dragActive && draggingEvent?.event.id === event.id;

              return (
                <EventItem
                  key={`${event.id}-${userId}`}
                  event={event}
                  mainUserId={userId}
                  users={users}
                  zIndex={1000 + index}
                  style={{ top: `${top}px`, height: `${height}px` }}
                  hourHeight={hourHeight}
                  hoveredEventId={hoveredEventId}
                  onEventClick={onEventClick}
                  onEventMouseEnter={onEventMouseEnter}
                  onEventMouseLeave={onEventMouseLeave}
                  onEventLongPress={onEventLongPress}
                  isSelected={isEventSelected}
                  isDragging={isEventDragging}
                  isDraggable={isEventDraggable(event)}
                  onDragStart={onEventDragStart ? (e) => onEventDragStart(e, event) : undefined}
                  onDragMove={onEventDrag ? (e) => onEventDrag(e) : undefined}
                  onDragEnd={onEventDragEnd ? (e) => onEventDragEnd(e) : undefined}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarGrid;
