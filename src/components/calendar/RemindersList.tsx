
import { Event, User } from "@/types";
import EventItem from "./EventItem";

interface RemindersListProps {
  reminders: Event[];
  users: User[];
  hoveredEventId: string | null;
  hourHeight: number;
  onEventClick: (e: React.MouseEvent, event: Event) => void;
  onEventMouseEnter: (eventId: string) => void;
  onEventMouseLeave: () => void;
  // Add missing props that EventItem needs
  onEventLongPress: (event: Event) => void;
}

const RemindersList = ({
  reminders,
  users,
  hoveredEventId,
  hourHeight,
  onEventClick,
  onEventMouseEnter,
  onEventMouseLeave,
  onEventLongPress
}: RemindersListProps) => {
  if (reminders.length === 0) return null;

  return (
    <div className="sticky top-0 z-50 bg-yellow-50/90 backdrop-blur-sm border-b p-2">
      <h3 className="text-sm font-medium mb-2">Promemoria del giorno</h3>
      <div className="space-y-2">
        {reminders.map((reminder, index) => 
          reminder.userIds.map(userId => (
            <EventItem
              key={`${reminder.id}-${userId}`}
              event={reminder}
              mainUserId={userId}
              users={users}
              zIndex={1000 + index}
              hoveredEventId={hoveredEventId}
              hourHeight={hourHeight}
              onEventClick={onEventClick}
              onEventMouseEnter={onEventMouseEnter}
              onEventMouseLeave={onEventMouseLeave}
              onEventLongPress={onEventLongPress}
              isSelected={false}
              isDragging={false}
              onDragStart={() => {}}
              onDragMove={() => {}}
              onDragEnd={() => {}}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default RemindersList;
