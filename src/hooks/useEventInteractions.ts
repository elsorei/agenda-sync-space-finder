
import { Event } from "@/types";
import { toast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLongPress } from "@/hooks/useLongPress";
import { useDoubleTap } from "@/hooks/useDoubleTap";

interface EventInteractionsProps {
  event: Event;
  isSelected: boolean;
  onEventLongPress?: (event: Event) => void;
  onEventClick: (e: React.MouseEvent, event: Event) => void;
  onDragStart?: (e: React.TouchEvent | React.MouseEvent, event: Event) => void;
  onDragMove?: (e: React.TouchEvent | React.MouseEvent) => void;
  onDragEnd?: (e: React.TouchEvent | React.MouseEvent) => void;
}

export const useEventInteractions = ({
  event,
  isSelected,
  onEventLongPress,
  onEventClick,
  onDragStart,
  onDragMove,
  onDragEnd,
}: EventInteractionsProps) => {
  const isMobile = useIsMobile();

  // Configuration for long press handling
  const longPressHandlers = useLongPress(
    (e) => {
      if (onEventLongPress) {
        onEventLongPress(event);
      }
    },
    { delay: 700, cancelOnMove: true }
  );

  // Configuration for double tap/click
  const doubleTapHandler = useDoubleTap((e) => {
    e.stopPropagation();
    e.preventDefault();
    onEventClick(e as React.MouseEvent, event);
  }, 300);

  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    
    if (isMobile) {
      if (isSelected && onDragStart) {
        onDragStart(e, event);
      } else {
        // Only initiate long press, no immediate action
        longPressHandlers.onTouchStart(e);
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (isMobile && isSelected && onDragMove) {
      onDragMove(e);
    } else if (isMobile) {
      longPressHandlers.onTouchMove();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (isMobile && isSelected && onDragEnd) {
      onDragEnd(e);
    } else if (isMobile) {
      longPressHandlers.onTouchEnd();
      // Handle double tap separately from regular touch
      doubleTapHandler(e);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    
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
      longPressHandlers.onMouseUp();
    }
  };

  return {
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onClick: (e: React.MouseEvent) => {
        // Prevent regular click from creating events
        e.stopPropagation();
      },
      onDoubleClick: (e: React.MouseEvent) => {
        // Only handle double click on non-mobile
        e.stopPropagation();
        if (!isMobile) {
          onEventClick(e, event);
        }
      },
    },
    isMobile,
  };
};
