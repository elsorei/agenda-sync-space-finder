
import React from "react";
import { Event, User } from "@/types";
import { useCalendarGrid } from "./hooks/useCalendarGrid";
import EventItem from "./EventItem";
import RemindersList from "./RemindersList";
import TimeGrid from "./TimeGrid";

interface CalendarGridProps {
  events: Event[];
  users: User[];
  date: Date;
  hourHeight: number;
  containerRef: React.RefObject<HTMLDivElement>;
  hoveredEventId: string | null;
  selectedEventId: string | null;
  dragActive: boolean;
  draggingEvent: { event: Event; yOffset: number } | null;
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
  const {
    gridRef,
    timeSlots,
    reminders,
    appointments,
    isEventVisible
  } = useCalendarGrid({
    events,
    users,
    date,
    selectedEventId,
    dragActive,
    draggingEvent
  });

  const isDialogOpen = selectedEventId !== null && !dragActive;

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
        onDragStart={onEventDragStart}
        onDragMove={onEventDrag}
        onDragEnd={onEventDragEnd}
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
          <TimeGrid
            timeSlots={timeSlots}
            hourHeight={hourHeight}
            onTimeSlotClick={onTimeSlotClick}
            onTimeSlotLongPress={onTimeSlotLongPress}
            isDialogOpen={isDialogOpen}
          />
          
          {appointments.map((event, index) =>
            event.userIds.map(userId => {
              const user = users.find((user) => user.id === userId);
              if (!user) return null;
              
              if (!isEventVisible(event.id)) return null;

              return (
                <EventItem
                  key={`${event.id}-${userId}`}
                  event={event}
                  mainUserId={userId}
                  users={users}
                  zIndex={1000 + index}
                  top={`${(event.start.getHours() + event.start.getMinutes() / 60 - 7) * hourHeight}px`}
                  height={`${((new Date(event.end).getTime() - new Date(event.start).getTime()) / (60 * 60 * 1000)) * hourHeight}px`}
                  hourHeight={hourHeight}
                  hoveredEventId={hoveredEventId}
                  onEventClick={onEventClick}
                  onEventMouseEnter={onEventMouseEnter}
                  onEventMouseLeave={onEventMouseLeave}
                  onEventLongPress={onEventLongPress}
                  isSelected={selectedEventId === event.id}
                  isDragging={dragActive && draggingEvent?.event.id === event.id}
                  isDraggable={true}
                  onDragStart={onEventDragStart}
                  onDragMove={onEventDrag}
                  onDragEnd={onEventDragEnd}
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
