
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
}

export function useEventInteractionHandlers({
  event,
  isSelected,
  onEventLongPress,
  onEventClick,
  onDragStart,
  onDragMove,
  onDragEnd,
}: UseEventInteractionHandlersProps) {
  const { handlers, isMobile } = useEventInteractions({
    event,
    isSelected,
    onEventLongPress,
    onEventClick,
    onDragStart,
    onDragMove,
    onDragEnd,
  });

  return {
    handlers,
    isMobile,
  };
}
