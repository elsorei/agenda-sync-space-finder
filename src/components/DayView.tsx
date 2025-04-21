
import { useRef } from "react";
import { DayViewProps, Event } from "@/types";
import { UserAvatar } from "./UserAvatar";
import { formatTime, getEventStyle, getDayViewHalfHourIntervals } from "@/utils/timeUtils";
import { startOfDay, addMinutes } from "date-fns";
import { cn } from "@/lib/utils";

const DayView = ({ 
  date, 
  users, 
  events, 
  hourHeight = 60,
  onAddEvent,
  onEditEvent
}: DayViewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Get half-hour intervals for the day view
  const halfHourIntervals = getDayViewHalfHourIntervals();
  
  // Generate the current day's start time
  const dayStart = startOfDay(date);
  
  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Solo se il click è direttamente sul background, non su un elemento figlio
    if (!containerRef.current || !onAddEvent || e.target !== e.currentTarget) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    
    // Calculate hour based on click position
    const clickedHour = 7 + y / hourHeight; // Add 7 because we start at 7am
    const hour = Math.floor(clickedHour);
    const minutes = Math.round((clickedHour - hour) * 60 / 30) * 30; // Round to nearest 30 min
    
    // Create a new date with the clicked time
    const newEventStart = new Date(date);
    newEventStart.setHours(hour, minutes, 0, 0);
    
    // Create a default end time 60 minutes later
    const newEventEnd = addMinutes(newEventStart, 60);
    
    // For simplicity, we'll create a 1-hour event for the first user
    // In a real app, you'd show a form to select user and other details
    if (users.length > 0) {
      onAddEvent([users[0].id], newEventStart, newEventEnd);
    }
  };

  const handleTimeSlotClick = (e: React.MouseEvent, timeString: string) => {
    // Ferma la propagazione dell'evento per evitare che il click raggiunga il background
    e.stopPropagation();
    
    if (!onAddEvent) return;
    
    // Parse the time string (format: "HH:MM")
    const [hours, minutes] = timeString.split(':').map(Number);
    
    // Create a new date with the selected time
    const newEventStart = new Date(date);
    newEventStart.setHours(hours, minutes, 0, 0);
    
    // Create an end time 30 minutes later
    const newEventEnd = addMinutes(newEventStart, 30);
    
    // Create an event for the first selected user (or will select in dialog)
    if (users.length > 0) {
      onAddEvent([users[0].id], newEventStart, newEventEnd);
    }
  };
  
  const renderEvent = (event: Event, zIndex: number, mainUserId: string) => {
    const { top, height } = getEventStyle(event, hourHeight, startOfDay(date));
    const user = users.find(u => u.id === mainUserId);

    return (
      <div
        key={event.id + "-" + mainUserId}
        className="absolute left-[100px] right-4 event-container rounded-md shadow-sm p-2 overflow-hidden"
        style={{
          top: `${top}px`,
          height: `${height}px`,
          backgroundColor: `${event.color}20`,
          borderLeft: `3px solid ${event.color}`,
          zIndex
        }}
        onClick={(e) => {
          e.stopPropagation(); // Impedisci click sul background
          onEditEvent && onEditEvent(event);
        }}
      >
        <div className="flex items-start justify-between h-full">
          <div className="overflow-hidden">
            <div className="font-medium truncate text-sm">{event.title}</div>
            <div className="text-xs opacity-70 truncate">
              {formatTime(event.start)} - {formatTime(event.end)}
            </div>
            {height > 60 && event.description && (
              <div className="text-xs mt-1 line-clamp-2 opacity-70">
                {event.description}
              </div>
            )}
          </div>
          {height > 50 && user && (
            <UserAvatar user={user} size="sm" />
          )}
        </div>
      </div>
    );
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
          {/* Time indicators with half-hour slots */}
          <div className="absolute left-0 top-0 w-full h-full">
            {halfHourIntervals.map((timeStr, index) => {
              const isFullHour = timeStr.endsWith(":00");
              return (
                <div 
                  key={timeStr} 
                  className={cn(
                    "absolute left-0 w-full flex items-center",
                    isFullHour ? "border-t border-gray-200" : "border-t border-gray-100"
                  )}
                  style={{ 
                    top: `${index * (hourHeight / 2)}px`,
                    height: `${hourHeight / 2}px` 
                  }}
                >
                  {isFullHour && (
                    <span className="text-xs text-gray-500 ml-2">
                      {timeStr}
                    </span>
                  )}
                  <button 
                    className="absolute left-0 top-0 w-full h-full opacity-0 hover:bg-blue-100 hover:bg-opacity-20 transition-colors"
                    onClick={(e) => handleTimeSlotClick(e, timeStr)}
                  />
                </div>
              );
            })}
          </div>
          
          {/* Background for click handling */}
          <div 
            ref={containerRef}
            className="absolute left-0 top-0 w-full h-full"
            onClick={handleBackgroundClick}
          />

          {/* Event per ogni user */}
          {users.map((user, userIndex) => {
            // mostra solo eventi in cui l'utente è invitato
            const userEvents = events.filter((event) => 
              event.userIds && event.userIds.includes(user.id)
            );
            return userEvents.map((event, eventIndex) =>
              renderEvent(event, userIndex * 100 + eventIndex, user.id)
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DayView;
