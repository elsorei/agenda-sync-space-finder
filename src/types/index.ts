
export interface User {
  id: string;
  name: string;
  avatar: string;
  color: string;
}

export interface Event {
  id: string;
  userId: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  color?: string;
}

export interface TimeSlot {
  start: Date;
  end: Date;
  users: string[];
  isFree: boolean;
}

export interface CalendarViewProps {
  date: Date;
  users: User[];
  events: Event[];
  onAddEvent?: (userId: string, start: Date, end: Date) => void;
  onEditEvent?: (event: Event) => void;
  onDeleteEvent?: (eventId: string) => void;
}

export interface DayViewProps extends CalendarViewProps {
  hourHeight: number;
}

export interface TimeSlotFinderProps {
  users: User[];
  events: Event[];
  selectedUsers: string[];
  date: Date;
  onSlotSelect?: (start: Date, end: Date, users: string[]) => void;
}
