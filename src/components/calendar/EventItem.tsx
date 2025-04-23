
import { Event, User } from "@/types";
import { cn } from "@/lib/utils";
import { getEventStyle } from "@/utils/timeUtils";
import { useEventInteractions } from "@/hooks/useEventInteractions";
import EventItemContent from "./EventItemContent";
import EventContextMenu from "./EventContextMenu";

interface EventItemProps {
  event: Event;
  mainUserId: string;
  users: User[];
  zIndex: number;
  hoveredEventId: string | null;
  hourHeight: number;
  onEventClick: (e: React.MouseEvent, event: Event) => void;
  onEventMouseEnter: (eventId: string) => void;
  onEventMouseLeave: () => void;
  onEventLongPress?: (event: Event) => void;
  isSelected?: boolean;
  isDragging?: boolean;
  onDragStart?: (e: React.TouchEvent | React.MouseEvent, event: Event) => void;
  onDragMove?: (e: React.TouchEvent | React.MouseEvent) => void;
  onDragEnd?: (e: React.TouchEvent | React.MouseEvent) => void;
}

const EventItem = ({
  event,
  mainUserId,
  users,
  zIndex,
  hoveredEventId,
  hourHeight,
  onEventClick,
  onEventMouseEnter,
  onEventMouseLeave,
  onEventLongPress,
  isSelected = false,
  isDragging = false,
  onDragStart,
  onDragMove,
  onDragEnd,
}: EventItemProps) => {
  const eventStyle = getEventStyle(event, hourHeight);
  const user = users.find(u => u.id === mainUserId);
  const isHovered = hoveredEventId === event.id;
  const effectiveZIndex = isDragging ? 100 : isHovered ? 50 : zIndex;

  const { handlers } = useEventInteractions({
    event,
    isSelected,
    onEventLongPress,
    onEventClick,
    onDragStart,
    onDragMove,
    onDragEnd,
  });

  const dragClass = isSelected || isDragging 
    ? "select-none touch-none cursor-grabbing ring-2 ring-blue-400 z-[100]" 
    : "";

  return (
    <EventContextMenu>
      <div
        key={event.id + "-" + mainUserId}
        className={cn(
          "absolute left-[100px] right-4 event-container rounded-md shadow-sm p-2 overflow-hidden cursor-pointer hover:shadow-md transition-shadow",
          dragClass,
          event.type === 'promemoria' && "bg-yellow-50 border-l-4 border-l-yellow-400",
          isHovered && "ring-2 ring-primary bg-primary/10"
        )}
        style={{
          top: event.type === 'promemoria' ? 'auto' : eventStyle.top,
          height: eventStyle.height,
          backgroundColor: event.type === 'promemoria' 
            ? undefined 
            : `${event.color}${isHovered || isSelected ? '40' : '20'}`,
          borderLeft: event.type === 'promemoria' 
            ? undefined 
            : `3px solid ${event.color}`,
          zIndex: effectiveZIndex,
          touchAction: "none"
        }}
        {...handlers}
        onMouseEnter={() => onEventMouseEnter(event.id)}
        onMouseLeave={onEventMouseLeave}
        aria-label={`Apri evento: ${event.title}`}
      >
        <EventItemContent 
          event={event} 
          user={user} 
          height={parseInt(eventStyle.height.toString())} 
        />
        {isSelected && (
          <div className="absolute top-0 left-0 w-full h-full bg-blue-300/20 border-2 border-blue-400 pointer-events-none rounded-md animate-fade-in" />
        )}
      </div>
    </EventContextMenu>
  );
};

export default EventItem;
