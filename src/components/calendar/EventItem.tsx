
import { Event, User } from "@/types";
import { UserAvatar } from "../UserAvatar";
import { cn } from "@/lib/utils";
import { PaperclipIcon } from "lucide-react";
import { formatTime, getEventStyle } from "@/utils/timeUtils";

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
  onEventMouseLeave
}: EventItemProps) => {
  const eventStyle = getEventStyle(event, hourHeight);
  const user = users.find(u => u.id === mainUserId);
  const hasAttachments = event.attachments && event.attachments.length > 0;
  const isHovered = hoveredEventId === event.id;
  const effectiveZIndex = isHovered ? 50 : zIndex;

  return (
    <div
      key={event.id + "-" + mainUserId}
      className={cn(
        "absolute left-[100px] right-4 event-container rounded-md shadow-sm p-2 overflow-hidden cursor-pointer hover:shadow-md transition-shadow",
        event.type === 'promemoria' && "bg-yellow-50 border-l-4 border-l-yellow-400",
        isHovered && "ring-2 ring-primary bg-primary/10"
      )}
      style={{
        top: event.type === 'promemoria' ? 'auto' : eventStyle.top,
        height: eventStyle.height,
        backgroundColor: event.type === 'promemoria' ? undefined : `${event.color}${isHovered ? '40' : '20'}`,
        borderLeft: event.type === 'promemoria' ? undefined : `3px solid ${event.color}`,
        zIndex: effectiveZIndex
      }}
      onClick={(e) => onEventClick(e, event)}
      onMouseEnter={() => onEventMouseEnter(event.id)}
      onMouseLeave={onEventMouseLeave}
      onTouchStart={() => onEventMouseEnter(event.id)}
      onTouchEnd={onEventMouseLeave}
      aria-label={`Apri evento: ${event.title}`}
    >
      <div className="flex items-start justify-between h-full">
        <div className="overflow-hidden flex-1">
          <div className="font-medium truncate text-sm flex items-center">
            {event.title}
            <span className="ml-2 text-xs opacity-70">
              ({event.type})
            </span>
            {hasAttachments && (
              <PaperclipIcon className="h-3 w-3 ml-1 text-muted-foreground" />
            )}
          </div>
          <div className="text-xs opacity-70 truncate">
            {formatTime(event.start)} - {formatTime(event.end)}
          </div>
          {parseInt(eventStyle.height.toString()) > 60 && event.description && (
            <div className="text-xs mt-1 line-clamp-2 opacity-70">
              {event.description}
            </div>
          )}
          {hasAttachments && parseInt(eventStyle.height.toString()) > 80 && (
            <div className="text-xs mt-1 text-blue-600">
              {event.attachments!.length} allegato/i
            </div>
          )}
        </div>
        {parseInt(eventStyle.height.toString()) > 50 && user && (
          <UserAvatar user={user} size="sm" />
        )}
      </div>
    </div>
  );
};

export default EventItem;
