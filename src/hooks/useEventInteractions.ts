
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

  // Configurazione per la pressione prolungata
  const longPressHandlers = useLongPress(
    (e) => {
      if (onEventLongPress) {
        onEventLongPress(event);
      }
    },
    { delay: 500, cancelOnMove: false }
  );

  // Configurazione per il doppio tap/click
  const doubleTapHandler = useDoubleTap((e) => {
    e.stopPropagation();
    e.preventDefault();
    onEventClick(e as React.MouseEvent, event);
  });

  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    
    if (isMobile) {
      if (isSelected && onDragStart) {
        onDragStart(e, event);
      } else {
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
      longPressHandlers.onTouchEnd && longPressHandlers.onTouchEnd();
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
      longPressHandlers.onMouseUp && longPressHandlers.onMouseUp();
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
        e.stopPropagation();
      },
      onDoubleClick: (e: React.MouseEvent) => {
        e.stopPropagation();
        onEventClick(e, event);
      },
    },
    isMobile,
  };
};
