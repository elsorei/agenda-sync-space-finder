
import { Event } from "@/types";
import { useEventInteractions } from "@/hooks/useEventInteractions";

interface UseEventInteractionHandlersProps {
  event: Event;
  isSelected: boolean;
  onEventLongPress?: (event: Event) => void;
  onEventClick: (e: React.MouseEvent, event: Event) => void;
  onDragStart?: (e: React.TouchEvent | React.MouseEvent, event: Event) => void;
  onDragMove?: (e: React.TouchEvent | React.MouseEvent) => void;
  onDragEnd?: (e: React.TouchEvent | React.MouseEvent) => void;
  onClick?: (event: Event) => void;
  onDoubleClick?: (event: Event) => void;
  onContextMenu?: (event: Event) => void;
}

export function useEventInteractionHandlers({
  event,
  isSelected,
  onEventLongPress,
  onEventClick,
  onDragStart,
  onDragMove,
  onDragEnd,
  onClick,
  onDoubleClick,
  onContextMenu,
}: UseEventInteractionHandlersProps) {
  const { 
    handlers, 
    isMobile,
    contextMenuOpen,
    contextMenuPosition,
    closeContextMenu 
  } = useEventInteractions({
    event,
    isSelected,
    onEventLongPress,
    onEventClick,
    onClick,
    onDoubleClick,
    onContextMenu,
    onDragStart,
    onDragMove,
    onDragEnd,
  });

  return {
    handlers,
    isMobile,
    contextMenuOpen,
    contextMenuPosition,
    closeContextMenu,
  };
}
