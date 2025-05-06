
import { EventType } from "@/types";
import { EventDialogDetails } from "./EventDialogDetails";
import { EventDialogAttachments } from "./EventDialogAttachments";

interface EventDialogContentProps {
  eventType: EventType;
  setEventType: (type: EventType) => void;
  users: any[];
  selectedUserIds: string[];
  onToggleUser: (userId: string) => void;
  title: string;
  setTitle: (title: string) => void;
  startTime: Date | null;
  setStartTime: (time: Date | null) => void;
  endTime: Date | null;
  setEndTime: (time: Date | null) => void;
  description: string;
  setDescription: (desc: string) => void;
  isReadOnly: boolean;
  rsvpDeadline?: Date;
  setRsvpDeadline?: (deadline: Date | undefined) => void;
  inviteStatus?: Record<string, string>;
}

export const EventDialogContent = ({
  eventType,
  setEventType,
  users,
  selectedUserIds,
  onToggleUser,
  title,
  setTitle,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  description,
  setDescription,
  isReadOnly,
  rsvpDeadline,
  setRsvpDeadline,
  inviteStatus
}: EventDialogContentProps) => {
  return (
    <div className="flex flex-col w-full">
      <EventDialogDetails
        title={title}
        setTitle={setTitle}
        description={description}
        setDescription={setDescription}
        startTime={startTime}
        setStartTime={setStartTime}
        endTime={endTime}
        setEndTime={setEndTime}
        eventType={eventType}
        setEventType={setEventType}
        users={users}
        selectedUserIds={selectedUserIds}
        onToggleUser={onToggleUser}
        isReadOnly={isReadOnly}
        rsvpDeadline={rsvpDeadline}
        setRsvpDeadline={setRsvpDeadline}
        inviteStatus={inviteStatus}
      />
    </div>
  );
};
