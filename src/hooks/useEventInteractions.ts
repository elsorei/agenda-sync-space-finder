
import { Event } from "@/types";
import { toast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLongPress } from "@/hooks/useLongPress";
import { useDoubleTap } from "@/hooks/useDoubleTap";
import { useState } from "react";

interface EventInteractionsProps {
  event: Event;
  isSelected?: boolean;
  onEventLongPress?: (event: Event) => void;
  onEventClick?: (e: React.MouseEvent, event: Event) => void;
  onClick?: (event: Event) => void;
  onDoubleClick?: (event: Event) => void;
  onContextMenu?: (event: Event) => void;
  onDragStart?: (e: React.TouchEvent | React.MouseEvent, event: Event) => void;
  onDragMove?: (e: React.TouchEvent | React.MouseEvent) => void;
  onDragEnd?: (e: React.TouchEvent | React.MouseEvent) => void;
}

export const useEventInteractions = ({
  event,
  isSelected = false,
  onEventLongPress,
  onEventClick,
  onClick,
  onDoubleClick,
  onContextMenu,
  onDragStart,
  onDragMove,
  onDragEnd,
}: EventInteractionsProps) => {
  const isMobile = useIsMobile();
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });

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
    if (onEventClick) {
      onEventClick(e as React.MouseEvent, event);
    }
  }, 300);

  const closeContextMenu = () => {
    setContextMenuOpen(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) {
      onClick(event);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDoubleClick) {
      onDoubleClick(event);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onContextMenu) {
      setContextMenuPosition({ x: e.clientX, y: e.clientY });
      setContextMenuOpen(true);
      onContextMenu(event);
    }
  };

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
      onClick: handleClick,
      onDoubleClick: handleDoubleClick,
      onContextMenu: handleContextMenu,
    },
    isMobile,
    handleClick,
    handleDoubleClick,
    handleContextMenu,
    contextMenuOpen,
    contextMenuPosition,
    closeContextMenu
  };
};
