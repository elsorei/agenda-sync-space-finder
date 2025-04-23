
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
  onEventLongPress: (event: Event) => void;
  isSelected: boolean;
  isDragging: boolean;
  onDragStart: (e: React.TouchEvent | React.MouseEvent) => void;
  onDragMove: (e: React.TouchEvent | React.MouseEvent) => void;
  onDragEnd: (e: React.TouchEvent | React.MouseEvent) => void;
}

const RemindersList = ({
  reminders,
  users,
  hoveredEventId,
  hourHeight,
  onEventClick,
  onEventMouseEnter,
  onEventMouseLeave,
  onEventLongPress,
  isSelected,
  isDragging,
  onDragStart,
  onDragMove,
  onDragEnd,
}: RemindersListProps) => {
  if (reminders.length === 0) return null;

  return (
    <div className="border-b p-2 space-y-1">
      {reminders.map((event, index) =>
        event.userIds.map(userId => {
          const user = users.find((u) => u.id === userId);
          if (!user) return null;

          return (
            <EventItem
              key={`${event.id}-${userId}`}
              event={event}
              mainUserId={userId}
              users={users}
              zIndex={1000 + index}
              style={{ height: `${hourHeight/2}px` }}
              hourHeight={hourHeight}
              hoveredEventId={hoveredEventId}
              onEventClick={onEventClick}
              onEventMouseEnter={onEventMouseEnter}
              onEventMouseLeave={onEventMouseLeave}
              onEventLongPress={onEventLongPress}
              isSelected={isSelected}
              isDragging={isDragging}
              isDraggable={false}
              onDragStart={onDragStart}
              onDragMove={onDragMove}
              onDragEnd={onDragEnd}
            />
          );
        })
      )}
    </div>
  );
};

export default RemindersList;
