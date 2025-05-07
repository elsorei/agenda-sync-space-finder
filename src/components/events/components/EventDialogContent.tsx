
import { DialogContent } from "@/components/ui/dialog";
import { SheetContent } from "@/components/ui/sheet";
import { EventDialogHeader } from "@/components/event-dialog/EventDialogHeader";
import { EventDialogDetails } from "@/components/event-dialog/EventDialogDetails";
import { EventDialogAttachments } from "@/components/event-dialog/EventDialogAttachments";
import { EventDialogActions } from "@/components/event-dialog/EventDialogActions";
import { Event, User, EventType } from "@/types";
import { FileAttachment } from "@/types/files";
import { useMediaQuery } from "@/hooks/use-media-query";

interface EventDialogContentProps {
  state: {
    title: string;
    description: string;
    startTime: Date | null;
    endTime: Date | null;
    selectedUserIds: string[];
    eventType: EventType;
    attachments: FileAttachment[];
    showFileUpload: boolean;
    isEditMode: boolean;
    reserveUserIds: string[];
    rsvpDeadline?: Date;
    availableUntil?: Date;
  };
  handlers: {
    setTitle: (t: string) => void;
    setDescription: (d: string) => void;
    setStartTime: (d: Date | null) => void;
    setEndTime: (d: Date | null) => void;
    setSelectedUserIds: (ids: string[]) => void;
    setEventType: (t: EventType) => void;
    setShowFileUpload: (s: boolean) => void;
    setRsvpDeadline?: (d: Date | undefined) => void;
    setAvailableUntil?: (d: Date | undefined) => void;
    handleAddFile: (f: FileAttachment) => void;
    handleRemoveFile: (id: string) => void;
    onToggleReserveUser: (userId: string, isReserve: boolean) => void;
    onSave: () => void;
    onCancel: () => void;
    onDelete: () => void;
  };
  validation: {
    isNewEvent: boolean;
    isEventDeletable: boolean;
  };
  users: User[];
}

export const EventDialogContent = ({
  state,
  handlers,
  validation,
  users
}: EventDialogContentProps) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  const content = (
    <>
      <EventDialogHeader
        isNew={validation.isNewEvent}
        isEditMode={state.isEditMode}
        startTime={state.startTime}
        eventType={state.eventType}
      />
      <div className={isMobile ? "max-h-[60vh] overflow-y-auto" : ""}>
        <EventDialogDetails
          eventType={state.eventType}
          setEventType={handlers.setEventType}
          users={users}
          selectedUserIds={state.selectedUserIds}
          onToggleUser={(userId) => {
            const newIds = state.selectedUserIds.includes(userId)
              ? state.selectedUserIds.filter(id => id !== userId)
              : [...state.selectedUserIds, userId];
            handlers.setSelectedUserIds(newIds);
          }}
          reserveUserIds={state.reserveUserIds || []}
          onToggleReserveUser={handlers.onToggleReserveUser}
          title={state.title}
          setTitle={handlers.setTitle}
          startTime={state.startTime}
          setStartTime={handlers.setStartTime}
          endTime={state.endTime}
          setEndTime={handlers.setEndTime}
          description={state.description}
          setDescription={handlers.setDescription}
          isReadOnly={!state.isEditMode}
          rsvpDeadline={state.rsvpDeadline}
          setRsvpDeadline={handlers.setRsvpDeadline}
          availableUntil={state.availableUntil}
          setAvailableUntil={handlers.setAvailableUntil}
        />
        <div className="mt-4">
          <EventDialogAttachments
            attachments={state.attachments}
            onAddAttachment={handlers.handleAddFile}
            onRemoveAttachment={handlers.handleRemoveFile}
            onViewFile={(file) => window.open(file.url, "_blank")}
            isReadOnly={!state.isEditMode}
          />
        </div>
      </div>
      <EventDialogActions
        isEditMode={state.isEditMode}
        isEventDeletable={validation.isEventDeletable}
        onCancel={handlers.onCancel}
        onSave={handlers.onSave}
        onDelete={validation.isEventDeletable ? handlers.onDelete : undefined}
      />
    </>
  );
  
  if (isMobile) {
    return (
      <SheetContent side="bottom" className="h-[85vh] pt-10 bg-background overflow-hidden flex flex-col">
        {content}
      </SheetContent>
    );
  }
  
  return <DialogContent className="max-w-3xl bg-background">{content}</DialogContent>;
};
