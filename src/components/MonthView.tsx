
import { Event, User } from "@/types";
import { addDays, endOfMonth, format, isSameDay, startOfMonth, startOfWeek } from "date-fns";
import { it } from "date-fns/locale";

interface MonthViewProps {
  date: Date;
  users: User[];
  events: Event[];
  onAddEvent: (userIds: string[], start: Date, end: Date) => void;
  onEditEvent: (event: Event) => void;
}

const MonthView = ({ date, users, events, onAddEvent, onEditEvent }: MonthViewProps) => {
  const startDate = startOfWeek(startOfMonth(date), { locale: it });
  const endDate = endOfMonth(date);
  const days = [];
  let currentDate = startDate;

  while (currentDate <= endDate || days.length % 7 !== 0) {
    days.push(currentDate);
    currentDate = addDays(currentDate, 1);
  }

  const getDayEvents = (day: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start);
      return isSameDay(eventDate, day);
    });
  };

  return (
    <div className="flex-1 grid grid-cols-7 gap-1 p-2">
      {['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'].map(day => (
        <div key={day} className="text-center font-semibold p-2">
          {day}
        </div>
      ))}
      {days.map((day, index) => {
        const dayEvents = getDayEvents(day);
        const isCurrentMonth = day.getMonth() === date.getMonth();

        return (
          <div
            key={day.toISOString()}
            className={`min-h-[100px] border p-1 ${
              isCurrentMonth ? 'bg-background' : 'bg-muted/30'
            }`}
            onClick={() => {
              const now = new Date();
              const newEventStart = new Date(day);
              newEventStart.setHours(now.getHours());
              newEventStart.setMinutes(0);
              const newEventEnd = new Date(newEventStart);
              newEventEnd.setHours(newEventStart.getHours() + 1);
              
              if (users.length > 0) {
                onAddEvent([users[0].id], newEventStart, newEventEnd);
              }
            }}
          >
            <div className="text-right text-sm">
              {format(day, 'd')}
            </div>
            <div className="space-y-1 mt-1">
              {dayEvents.slice(0, 3).map(event => (
                <div
                  key={event.id}
                  className="text-xs p-1 rounded truncate cursor-pointer"
                  style={{ backgroundColor: event.color }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditEvent(event);
                  }}
                >
                  {event.title || "(Senza titolo)"}
                </div>
              ))}
              {dayEvents.length > 3 && (
                <div className="text-xs text-muted-foreground text-center">
                  +{dayEvents.length - 3} altri
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MonthView;
