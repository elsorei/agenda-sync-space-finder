
import { useState } from "react";
import { Event, User } from "@/types";
import { addDays, startOfWeek } from "date-fns";
import DayView from "./DayView";
import { it } from "date-fns/locale";

interface WeekViewProps {
  date: Date;
  users: User[];
  events: Event[];
  onAddEvent: (userIds: string[], start: Date, end: Date) => void;
  onEditEvent: (event: Event) => void;
}

const WeekView = ({ date, users, events, onAddEvent, onEditEvent }: WeekViewProps) => {
  const [hourHeight] = useState(70);
  const startDate = startOfWeek(date, { locale: it });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

  return (
    <div className="flex flex-1 overflow-hidden">
      {weekDays.map((day) => (
        <div key={day.toISOString()} className="flex-1">
          <DayView
            date={day}
            users={users}
            events={events.filter(event => {
              const eventDate = new Date(event.start);
              return eventDate.getDate() === day.getDate() &&
                     eventDate.getMonth() === day.getMonth() &&
                     eventDate.getFullYear() === day.getFullYear();
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
