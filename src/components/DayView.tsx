
import { useState, useRef } from "react";
import { DayViewProps, Event } from "@/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { useDayViewDrag } from "@/hooks/useDayViewDrag";
import { useDayViewTimeSlots } from "@/hooks/useDayViewTimeSlots";
import { useDayViewEventHandlers } from "@/hooks/useDayViewEventHandlers";
import UserSidebar from "./calendar/UserSidebar";
import CalendarGrid from "./calendar/CalendarGrid";
import { ScrollArea } from "./ui/scroll-area";
import { getEventTimeByOffset } from "@/hooks/useDayViewTimeSlots";

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
  const { handleTimeSlotClick, handleTimeSlotLongPress } = useDayViewTimeSlots();
  const { handleEventLongPress, handleEventClick } = useDayViewEventHandlers();
  const isMobile = useIsMobile();

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

  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    setSelectedEventId(null);
    if (isMobile) {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  return (
    <ScrollArea className="h-[calc(100vh-180px)]">
      <div className="flex-1 overflow-y-auto border rounded-md bg-white touch-pan-y">
        <div className="flex">
          <UserSidebar 
            users={users} 
            selectedUsers={selectedUsers}
            onUserSelect={(userId) => {
              if (selectedEventId !== null) return;
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
            onEventClick={(e, event: Event) => handleEventClick(e, event, onEditEvent, setSelectedEventId)}
            onEventMouseEnter={(id) => {
              if (selectedEventId === null) {
                setHoveredEventId(id);
              }
            }}
            onEventMouseLeave={() => {
              if (selectedEventId === null) {
                setHoveredEventId(null);
              }
            }}
            onEventLongPress={(event: Event) => handleEventLongPress(event, setSelectedEventId, setHoveredEventId)}
            onEventDragStart={handleEventDragStart}
            onEventDrag={handleEventDrag}
            onEventDragEnd={handleEventDragEnd}
            onTimeSlotClick={(e, timeString) => handleTimeSlotClick(date, users, onAddEvent, isMobile, selectedEventId, timeString, e)}
            onTimeSlotLongPress={(e, timeString) => handleTimeSlotLongPress(date, users, onAddEvent, isMobile, selectedEventId, timeString, e)}
            onBackgroundClick={handleBackgroundClick}
          />
        </div>
      </div>
    </ScrollArea>
  );
};

export default DayView;
