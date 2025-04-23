
import { Event } from "@/types";

export function useDayViewEventHandlers() {
  const handleEventLongPress = (
    event: Event, 
    setSelectedEventId: (id: string) => void,
    setHoveredEventId: (id: string) => void
  ) => {
    setSelectedEventId(event.id);
    setHoveredEventId(event.id);
  };

  const handleEventClick = (
    e: React.MouseEvent, 
    event: Event,
    onEditEvent: ((event: Event) => void) | undefined,
    setSelectedEventId: (id: string | null) => void
  ) => {
    e.stopPropagation();
    if (onEditEvent) {
      onEditEvent(event);
      setSelectedEventId(null);
    }
  };

  return {
    handleEventLongPress,
    handleEventClick
  };
}
