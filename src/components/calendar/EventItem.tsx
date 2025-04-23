import { Event, User } from "@/types";
import { UserAvatar } from "../UserAvatar";
import { cn } from "@/lib/utils";
import { PaperclipIcon, MoveIcon, CopyIcon } from "lucide-react";
import { formatTime, getEventStyle } from "@/utils/timeUtils";
import { useLongPress } from "@/hooks/useLongPress";
import { useDoubleTap } from "@/hooks/useDoubleTap";
import { useIsMobile } from "@/hooks/use-mobile";
import React from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { toast } from "@/hooks/use-toast";

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
  const hasAttachments = event.attachments && event.attachments.length > 0;
  const isHovered = hoveredEventId === event.id;
  const effectiveZIndex = isDragging ? 100 : isHovered ? 50 : zIndex;
  const isMobile = useIsMobile();

  // Long Press per selezionare (prepara drag)
  const longPressHandlers = useLongPress(
    () => {
      if (onEventLongPress) onEventLongPress(event);
    },
    { delay: 500, cancelOnMove: false } // Cambiato a false per consentire il trascinamento
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

  // Gestione touch migliorata per il trascinamento
  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation(); // Impedisce la propagazione agli elementi sottostanti
    
    if (isMobile) {
      if (isSelected && onDragStart) {
        onDragStart(e, event);
      } else {
        doubleTapHandler(e);
        longPressHandlers.onTouchStart(e);
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (isMobile && isSelected && onDragMove) {
      onDragMove(e);
    } else if (isMobile) {
      longPressHandlers.onTouchMove && longPressHandlers.onTouchMove();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (isMobile && isSelected && onDragEnd) {
      onDragEnd(e);
    } else if (isMobile) {
      doubleTapHandler(e);
    }
  };

  // Gestione mouse migliorata per trascinamento desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation(); // Impedisce la propagazione agli elementi sottostanti
    
    if (!isMobile) {
      if (isSelected && onDragStart) {
        onDragStart(e, event);
      } else {
        longPressHandlers.onMouseDown(e);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isMobile && isSelected && onDragMove) {
      onDragMove(e);
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isMobile && isSelected && onDragEnd) {
      onDragEnd(e);
    } else if (!isMobile) {
      longPressHandlers.onMouseUp && longPressHandlers.onMouseUp();
    }
  };

  // Centralize all mouse/touch leave handlers
  const handleMouseLeave = () => {
    if (!isMobile) {
      longPressHandlers.onMouseLeave && longPressHandlers.onMouseLeave();
    }
    onEventMouseLeave();
  };

  // Gestione opzioni spostamento/copia
  // Modifica: cambia la firma della funzione per accettare il tipo Event del DOM, non React.MouseEvent/TouchEvent
  const handleMove = (e: Event) => {
    if (e && typeof e.stopPropagation === 'function') {
      e.stopPropagation();
    }
    toast({
      title: "Sposta evento",
      description: "Trascina per spostare l'evento",
    });
  };

  const handleCopy = (e: Event) => {
    if (e && typeof e.stopPropagation === 'function') {
      e.stopPropagation();
    }
    toast({
      title: "Copia evento",
      description: "Trascina per copiare l'evento",
    });
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>
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
            touchAction: "none" // Assicura che i gesti touch vengano catturati
          }}
          onClick={isMobile ? undefined : (e) => {
            e.stopPropagation();
            doubleTapHandler(e);
          }}
          onDoubleClick={isMobile ? undefined : (e) => {
            e.stopPropagation();
            doubleTapHandler(e);
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
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
          {isSelected && (
            <div className="absolute top-0 left-0 w-full h-full bg-blue-300/20 border-2 border-blue-400 pointer-events-none rounded-md animate-fade-in" />
          )}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onSelect={handleMove} className="cursor-pointer">
          <MoveIcon className="mr-2 h-4 w-4" />
          <span>Sposta</span>
        </ContextMenuItem>
        <ContextMenuItem onSelect={handleCopy} className="cursor-pointer">
          <CopyIcon className="mr-2 h-4 w-4" />
          <span>Copia</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default EventItem;
