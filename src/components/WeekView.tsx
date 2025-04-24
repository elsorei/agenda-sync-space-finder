
import { useState } from "react";
import { Event, User } from "@/types";
import { addDays, format, isSameDay, startOfWeek } from "date-fns";
import { it } from "date-fns/locale";
import DayView from "./DayView";

interface WeekViewProps {
  date: Date;
  users: User[];
  events: Event[];
  onAddEvent: (userIds: string[], start: Date, end: Date) => void;
  onEditEvent: (event: Event) => void;
}

const WeekView = ({ date, users, events, onAddEvent, onEditEvent }: WeekViewProps) => {
  const [hourHeight] = useState(45); // Reduced from 70 to 45
  
  // Usa il locale italiano per iniziare la settimana da lunedì
  const startDate = startOfWeek(date, { locale: it });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

  return (
    <div className="flex flex-1 overflow-hidden">
      {weekDays.map((day) => (
        <div key={day.toISOString()} className="flex-1 border-r last:border-r-0">
          <div className="sticky top-0 text-center font-medium p-2 border-b bg-muted/20 z-10">
            <div className="text-sm text-muted-foreground">
              {format(day, 'EEEE', { locale: it })}
            </div>
            <div className="text-base">
              {format(day, 'd', { locale: it })}
            </div>
          </div>
          <DayView
            date={day}
            users={users}
            events={events.filter(event => {
              const eventDate = new Date(event.start);
              return isSameDay(eventDate, day);
            })}
            hourHeight={hourHeight}
            onAddEvent={onAddEvent}
            onEditEvent={onEditEvent}
          />
        </div>
      ))}
    </div>
  );
};

export default WeekView;
