
import { addMinutes } from "date-fns";

// Helper to calculate time based on vertical position
export function getEventTimeByOffset(date: Date, y: number, hourHeight: number) {
  const clickedHour = 7 + y / hourHeight;
  const hour = Math.floor(clickedHour);
  const minutes = Math.round((clickedHour - hour) * 60 / 30) * 30;
  const newEventStart = new Date(date);
  newEventStart.setHours(hour, minutes, 0, 0);
  const newEventEnd = addMinutes(newEventStart, 30);
  return { newEventStart, newEventEnd };
}

export function useDayViewTimeSlots() {
  const handleTimeSlotClick = (
    date: Date,
    users: any[],
    onAddEvent: ((userIds: string[], start: Date, end: Date) => void) | undefined,
    isMobile: boolean,
    selectedEventId: string | null,
    timeString: string,
    e: React.MouseEvent | React.TouchEvent
  ) => {
    if (isMobile || selectedEventId !== null) return;
    if (!onAddEvent) return;
    e.stopPropagation();
    e.preventDefault();

    const [hours, minutes] = timeString.split(':').map(Number);
    const newEventStart = new Date(date);
    newEventStart.setHours(hours, minutes, 0, 0);
    const newEventEnd = addMinutes(newEventStart, 30);
    if (users.length > 0) {
      onAddEvent([users[0].id], newEventStart, newEventEnd);
    }
  };

  const handleTimeSlotLongPress = (
    date: Date,
    users: any[],
    onAddEvent: ((userIds: string[], start: Date, end: Date) => void) | undefined,
    isMobile: boolean,
    selectedEventId: string | null,
    timeString: string,
    e: React.MouseEvent | React.TouchEvent
  ) => {
    if (!onAddEvent || !isMobile || selectedEventId !== null) return;
    e.stopPropagation();
    e.preventDefault();

    const [hours, minutes] = timeString.split(':').map(Number);
    const newEventStart = new Date(date);
    newEventStart.setHours(hours, minutes, 0, 0);
    const newEventEnd = addMinutes(newEventStart, 30);
    if (users.length > 0) {
      onAddEvent([users[0].id], newEventStart, newEventEnd);
    }
  };

  return {
    handleTimeSlotClick,
    handleTimeSlotLongPress,
    getEventTimeByOffset
  };
}
