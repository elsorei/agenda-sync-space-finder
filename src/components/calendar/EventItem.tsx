
import { Event, User } from "@/types";
import { UserAvatar } from "../UserAvatar";
import { cn } from "@/lib/utils";
import { PaperclipIcon } from "lucide-react";
import { formatTime, getEventStyle } from "@/utils/timeUtils";
import { useLongPress } from "@/hooks/useLongPress";
import { useDoubleTap } from "@/hooks/useDoubleTap";
import { useIsMobile } from "@/hooks/use-mobile";
import React from "react";

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
}: EventItemProps) => {
  const eventStyle = getEventStyle(event, hourHeight);
  const user = users.find(u => u.id === mainUserId);
  const hasAttachments = event.attachments && event.attachments.length > 0;
  const isHovered = hoveredEventId === event.id;
  const effectiveZIndex = isDragging ? 100 : isHovered ? 50 : zIndex;
  const isMobile = useIsMobile();

  // Long Press per selezionare (prepara drag)
  const longPressHandlers = useLongPress(
    () => {
      if (onEventLongPress) onEventLongPress(event);
    },
    { delay: 500, cancelOnMove: true }
  );

  // Double Tap/Click per aprire (mobile e desktop)
  const doubleTapHandler = useDoubleTap((e) => {
    e.stopPropagation();
    e.preventDefault();
    onEventClick(e as any, event);
  });

  // Disable text selection during drag
  const dragClass = isSelected || isDragging 
    ? "select-none touch-none cursor-grabbing ring-2 ring-blue-400 z-[100]" 
    : "";

  const handleMobileTouch = (e: React.TouchEvent) => {
    if (isMobile) {
      doubleTapHandler(e);
      longPressHandlers.onTouchStart(e);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isMobile) {
      longPressHandlers.onMouseDown(e);
    }
  };

  // Centralize all mouse/touch leave handlers to avoid duplicates
  const handleMouseLeave = () => {
    if (!isMobile) {
      longPressHandlers.onMouseLeave && longPressHandlers.onMouseLeave();
    }
    onEventMouseLeave();
  };

  return (
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
        zIndex: effectiveZIndex
      }}
      onClick={isMobile ? undefined : (e) => doubleTapHandler(e)}
      onDoubleClick={isMobile ? undefined : (e) => doubleTapHandler(e)}
      onTouchEnd={isMobile ? (e) => doubleTapHandler(e) : undefined}
      onTouchStart={isMobile ? longPressHandlers.onTouchStart : undefined}
      onMouseDown={handleMouseDown}
      onMouseUp={!isMobile ? longPressHandlers.onMouseUp : undefined}
      onMouseLeave={handleMouseLeave}
      onTouchMove={isMobile ? longPressHandlers.onTouchMove : undefined}
      onMouseEnter={() => onEventMouseEnter(event.id)}
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
      {/* Visualizza overlay se selezionato per drag */}
      {isSelected && (
        <div className="absolute top-0 left-0 w-full h-full bg-blue-300/20 border-2 border-blue-400 pointer-events-none rounded-md animate-fade-in" />
      )}
    </div>
  );
};

export default EventItem;
