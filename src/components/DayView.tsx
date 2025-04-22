
import { useRef, useState } from "react";
import { DayViewProps, Event } from "@/types";
import { UserAvatar } from "./UserAvatar";
import { getDayViewHalfHourIntervals } from "@/utils/timeUtils";
import { startOfDay, addMinutes } from "date-fns";
import EventItem from "./calendar/EventItem";
import TimeSlots from "./calendar/TimeSlots";
import RemindersList from "./calendar/RemindersList";

const DayView = ({ 
  date, 
  users, 
  events, 
  hourHeight = 60,
  onAddEvent,
  onEditEvent
}: DayViewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredEventId, setHoveredEventId] = useState<string | null>(null);
  
  // Separa i promemoria dagli altri eventi
  const reminders = events.filter(event => event.type === 'promemoria');
  const regularEvents = events.filter(event => event.type !== 'promemoria');

  // Get half-hour intervals for the day view
  const halfHourIntervals = getDayViewHalfHourIntervals(date);
  
  // Generate the current day's start time
  const dayStart = startOfDay(date);
  
  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !onAddEvent || e.target !== e.currentTarget) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    
    const clickedHour = 7 + y / hourHeight;
    const hour = Math.floor(clickedHour);
    const minutes = Math.round((clickedHour - hour) * 60 / 30) * 30;
    
    const newEventStart = new Date(date);
    newEventStart.setHours(hour, minutes, 0, 0);
    
    const newEventEnd = addMinutes(newEventStart, 60);
    
    if (users.length > 0) {
      onAddEvent([users[0].id], newEventStart, newEventEnd);
    }
  };

  const handleTimeSlotClick = (e: React.MouseEvent | React.TouchEvent, timeString: string) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!onAddEvent) return;
    
    const [hours, minutes] = timeString.split(':').map(Number);
    
    const newEventStart = new Date(date);
    newEventStart.setHours(hours, minutes, 0, 0);
    
    const newEventEnd = addMinutes(newEventStart, 30);
    
    if (users.length > 0) {
      onAddEvent([users[0].id], newEventStart, newEventEnd);
    }
  };
  
  const handleEventClick = (e: React.MouseEvent, event: Event) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (onEditEvent) {
      console.log("Editing event:", event.id, event.title);
      onEditEvent(event);
    }
  };

  const handleEventMouseEnter = (eventId: string) => {
    setHoveredEventId(eventId);
  };

  const handleEventMouseLeave = () => {
    setHoveredEventId(null);
  };

  return (
    <div className="flex-1 overflow-y-auto border rounded-md bg-white">
      <div className="flex">
        {/* Left sidebar with user thumbnails */}
        <div className="w-[100px] flex-shrink-0 border-r pt-[40px]">
          <div className="flex flex-col items-center gap-2 p-2">
            {users.map((user) => (
              <div key={user.id} className="flex flex-col items-center">
                <UserAvatar user={user} size="sm" />
                <span className="text-xs mt-1 font-medium text-center">{user.name.split(' ')[0]}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Main calendar grid */}
        <div className="flex-1 relative" style={{ height: `${16 * hourHeight}px` }}>
          {/* Promemoria section */}
          <RemindersList
            reminders={reminders}
            users={users}
            hoveredEventId={hoveredEventId}
            hourHeight={hourHeight}
            onEventClick={handleEventClick}
            onEventMouseEnter={handleEventMouseEnter}
            onEventMouseLeave={handleEventMouseLeave}
          />

          {/* Regular events */}
          <div className="relative">
            {regularEvents.map((event, eventIndex) => 
              event.userIds.map(userId => (
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
                />
              ))
            )}
          </div>

          {/* Time indicators with half-hour slots */}
          <TimeSlots
            intervals={halfHourIntervals}
            hourHeight={hourHeight}
            onTimeSlotClick={handleTimeSlotClick}
          />
          
          {/* Background for click handling */}
          <div 
            ref={containerRef}
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
