
import { useRef } from "react";
import { Event, User } from "@/types";
import { getDayViewHalfHourIntervals } from "@/utils/timeUtils";
import { format } from "date-fns";

interface UseCalendarGridProps {
  events: Event[];
  users: User[];
  date: Date;
  selectedEventId: string | null;
  dragActive: boolean;
  draggingEvent: { event: Event; yOffset: number } | null;
}

export const useCalendarGrid = ({
  events,
  users,
  date,
  selectedEventId,
  dragActive,
  draggingEvent
}: UseCalendarGridProps) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const timeSlots = getDayViewHalfHourIntervals(date);

  const getEventTop = (event: Event) => {
    const start = new Date(event.start);
    const hours = start.getHours();
    const minutes = start.getMinutes();
    return (hours + minutes / 60 - 7) * 70; // hourHeight is fixed to 70
  };

  const getEventHeight = (event: Event) => {
    const start = new Date(event.start);
    const end = new Date(event.end);
    const duration = end.getTime() - start.getTime();
    return (duration / (60 * 60 * 1000)) * 70; // hourHeight is fixed to 70
  };

  const formatTimeSlot = (timeSlot: Date) => format(timeSlot, 'HH:mm');

  const reminders = events.filter(event => event.type === 'promemoria');
  const appointments = events.filter(event => 
    event.type === 'appuntamento' || event.type === 'impegno'
  );

  const isEventVisible = (eventId: string) => {
    if (!selectedEventId) return true;
    if (dragActive) return true;
    return selectedEventId === eventId;
  };

  return {
    gridRef,
    timeSlots,
    formatTimeSlot,
    reminders,
    appointments,
    isEventVisible
  };
};
