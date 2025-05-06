
import { EventType, InviteStatus } from "@/types";
import { EventDialogDetails } from "./EventDialogDetails";
import { EventDialogAttachments } from "./EventDialogAttachments";

interface EventDialogContentProps {
  eventType: EventType;
  setEventType: (type: EventType) => void;
  users: any[];
  selectedUserIds: string[];
  onToggleUser: (userId: string) => void;
  reserveUserIds: string[];
  onToggleReserveUser: (userId: string, isReserve: boolean) => void;
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
  availableUntil?: Date;
  setAvailableUntil?: (until: Date | undefined) => void;
  inviteStatus?: Record<string, InviteStatus>;
  attachments?: any[];
  onAddAttachment?: (file: any) => void;
  onRemoveAttachment?: (fileId: string) => void;
  onViewAttachment?: (file: any) => void;
}

export const EventDialogContent = ({
  eventType,
  setEventType,
  users,
  selectedUserIds,
  onToggleUser,
  reserveUserIds = [],
  onToggleReserveUser,
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
  availableUntil,
  setAvailableUntil,
  inviteStatus,
  attachments = [],
  onAddAttachment,
  onRemoveAttachment,
  onViewAttachment
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
        reserveUserIds={reserveUserIds}
        onToggleReserveUser={onToggleReserveUser}
        isReadOnly={isReadOnly}
        rsvpDeadline={rsvpDeadline}
        setRsvpDeadline={setRsvpDeadline}
        availableUntil={availableUntil}
        setAvailableUntil={setAvailableUntil}
        inviteStatus={inviteStatus}
      />
      
      {onAddAttachment && onRemoveAttachment && (
        <EventDialogAttachments 
          attachments={attachments}
          onAddAttachment={onAddAttachment}
          onRemoveAttachment={onRemoveAttachment}
          onViewFile={onViewAttachment || ((file) => {})}
          isReadOnly={isReadOnly}
        />
      )}
    </div>
  );
};
