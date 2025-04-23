
import React from "react";
import { Event, User } from "@/types";
import { cn } from "@/lib/utils";
import { useEventInteractionHandlers } from "./hooks/useEventInteractionHandlers";
import { PaperclipIcon } from "lucide-react";

interface EventItemProps {
  event: Event;
  mainUserId: string;
  users: User[];
  zIndex: number;
  top?: string;
  height?: string;
  style?: React.CSSProperties;
  hoveredEventId: string | null;
  hourHeight: number;
  onEventClick: (e: React.MouseEvent, event: Event) => void;
  onEventMouseEnter: (eventId: string) => void;
  onEventMouseLeave: () => void;
  onEventLongPress: (event: Event) => void;
  isSelected: boolean;
  isDragging: boolean;
  isDraggable: boolean;
  onDragStart: (e: React.TouchEvent | React.MouseEvent, event: Event) => void;
  onDragMove: (e: React.TouchEvent | React.MouseEvent) => void;
  onDragEnd: (e: React.TouchEvent | React.MouseEvent) => void;
}

const EventItem = ({
  event,
  mainUserId,
  users,
  zIndex,
  top,
  height,
  style,
  hoveredEventId,
  hourHeight,
  onEventClick,
  onEventMouseEnter,
  onEventMouseLeave,
  onEventLongPress,
  isSelected,
  isDragging,
  isDraggable,
  onDragStart,
  onDragMove,
  onDragEnd,
}: EventItemProps) => {
  const { handlers } = useEventInteractionHandlers({
    event,
    isSelected,
    onEventLongPress,
    onEventClick,
    onDragStart,
    onDragMove,
    onDragEnd,
  });

  // Find user color or fallback
  const mainUser = users.find((user) => user.id === mainUserId);
  const bgColor = event.color || (mainUser?.color ?? "#9b87f5");
  
  // Controlla se l'evento ha allegati
  const hasAttachments = Array.isArray(event.attachments) && event.attachments.length > 0;

  // Combine passed style with dynamically generated style
  const eventStyle: React.CSSProperties = {
    ...(style || {}),
    top,
    height,
    zIndex: zIndex, // Keep original z-index (events should have lower z-index than dialogs)
    backgroundColor: bgColor,
    opacity: isDragging ? 0.7 : 1,
  };

  return (
    <div
      className={cn(
        "absolute left-0 right-0 rounded-md px-2 py-1 text-white cursor-pointer select-none",
        isSelected ? "ring-2 ring-offset-1 ring-blue-500" : "",
        hoveredEventId === event.id && !isSelected ? "ring-1 ring-offset-1 ring-gray-400" : "",
        isDraggable ? "cursor-move" : ""
      )}
      style={eventStyle}
      onMouseEnter={() => onEventMouseEnter(event.id)}
      onMouseLeave={onEventMouseLeave}
      {...handlers}
    >
      <div className="flex justify-between items-center">
        <div className="font-semibold truncate flex items-center" title={event.title}>
          {event.title || "(Senza titolo)"}
          {hasAttachments && <PaperclipIcon className="h-3 w-3 ml-1" />}
        </div>
        <div className="text-xs ml-2 whitespace-nowrap">
          {new Date(event.start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} –{" "}
          {new Date(event.end).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </div>
  );
};

export default EventItem;
