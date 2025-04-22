
import { useRef } from "react";
import { DayViewProps, Event } from "@/types";
import { UserAvatar } from "./UserAvatar";
import { formatTime, getEventStyle, getDayViewHalfHourIntervals } from "@/utils/timeUtils";
import { startOfDay, addMinutes, format } from "date-fns";
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
  
  // Separa i promemoria dagli altri eventi
  const reminders = events.filter(event => event.type === 'promemoria');
  const regularEvents = events.filter(event => event.type !== 'promemoria');

  // Get half-hour intervals for the day view
  const halfHourIntervals = getDayViewHalfHourIntervals(date);
  
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

  // Gestore unificato per click e touch che impedisce attivamente la propagazione
  const handleTimeSlotClick = (e: React.MouseEvent | React.TouchEvent, timeString: string) => {
    // Ferma la propagazione dell'evento e previene il comportamento predefinito
    e.stopPropagation();
    e.preventDefault(); // Importante per dispositivi touch
    
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
    const eventStyle = getEventStyle(event, hourHeight);
    const user = users.find(u => u.id === mainUserId);

    return (
      <div
        key={event.id + "-" + mainUserId}
        className={cn(
          "absolute left-[100px] right-4 event-container rounded-md shadow-sm p-2 overflow-hidden",
          event.type === 'promemoria' && "bg-yellow-50 border-l-4 border-l-yellow-400"
        )}
        style={{
          top: event.type === 'promemoria' ? 'auto' : eventStyle.top,
          height: eventStyle.height,
          backgroundColor: event.type === 'promemoria' ? undefined : `${event.color}20`,
          borderLeft: event.type === 'promemoria' ? undefined : `3px solid ${event.color}`,
          zIndex
        }}
        onClick={(e) => {
          e.stopPropagation();
          onEditEvent && onEditEvent(event);
        }}
      >
        <div className="flex items-start justify-between h-full">
          <div className="overflow-hidden">
            <div className="font-medium truncate text-sm">
              {event.title}
              <span className="ml-2 text-xs opacity-70">
                ({event.type})
              </span>
            </div>
            <div className="text-xs opacity-70 truncate">
              {formatTime(event.start)} - {formatTime(event.end)}
            </div>
            {/* Use a number check directly instead of comparing height as a string */}
            {parseInt(eventStyle.height.toString()) > 60 && event.description && (
              <div className="text-xs mt-1 line-clamp-2 opacity-70">
                {event.description}
              </div>
            )}
          </div>
          {/* Use a number check directly instead of comparing height as a string */}
          {parseInt(eventStyle.height.toString()) > 50 && user && (
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
          {/* Promemoria section */}
          {reminders.length > 0 && (
            <div className="sticky top-0 z-50 bg-yellow-50/90 backdrop-blur-sm border-b p-2">
              <h3 className="text-sm font-medium mb-2">Promemoria del giorno</h3>
              <div className="space-y-2">
                {reminders.map((reminder, index) => 
                  reminder.userIds.map(userId => renderEvent(reminder, 1000 + index, userId))
                )}
              </div>
            </div>
          )}

          {/* Regular events */}
          {regularEvents.map((event, eventIndex) => 
            event.userIds.map(userId => renderEvent(event, eventIndex, userId))
          )}

          {/* Time indicators with half-hour slots */}
          <div className="absolute left-0 top-0 w-full h-full pointer-events-auto">
            {halfHourIntervals.map((interval, index) => {
              const timeStr = format(interval, "HH:mm");
              const isFullHour = timeStr.endsWith(":00");
              return (
                <div 
                  key={index} 
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
                    className="absolute left-0 top-0 w-full h-full z-10 hover:bg-blue-100 hover:bg-opacity-20 transition-colors touch-manipulation"
                    style={{ touchAction: "manipulation" }}
                    onClick={(e) => handleTimeSlotClick(e, timeStr)}
                    onTouchStart={(e) => handleTimeSlotClick(e, timeStr)}
                    aria-label={`Seleziona orario ${timeStr}`}
                  />
                </div>
              );
            })}
          </div>
          
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
