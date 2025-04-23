
import { DialogContent } from "@/components/ui/dialog";
import { EventDialogHeader } from "@/components/event-dialog/EventDialogHeader";
import { EventDialogDetails } from "@/components/event-dialog/EventDialogDetails";
import { EventDialogAttachments } from "@/components/event-dialog/EventDialogAttachments";
import { EventDialogActions } from "@/components/event-dialog/EventDialogActions";
import { Event, User, EventType } from "@/types";
import { FileAttachment } from "@/types/files";

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
  };
  handlers: {
    setTitle: (t: string) => void;
    setDescription: (d: string) => void;
    setStartTime: (d: Date | null) => void;
    setEndTime: (d: Date | null) => void;
    setSelectedUserIds: (ids: string[]) => void;
    setEventType: (t: EventType) => void;
    setShowFileUpload: (s: boolean) => void;
    handleAddFile: (f: FileAttachment) => void;
    handleRemoveFile: (id: string) => void;
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
  return (
    <DialogContent className="max-w-3xl bg-background">
      <EventDialogHeader
        isNew={validation.isNewEvent}
        isEditMode={state.isEditMode}
        startTime={state.startTime}
        eventType={state.eventType}
      />
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
        title={state.title}
        setTitle={handlers.setTitle}
        startTime={state.startTime}
        setStartTime={handlers.setStartTime}
        endTime={state.endTime}
        setEndTime={handlers.setEndTime}
        description={state.description}
        setDescription={handlers.setDescription}
        isReadOnly={!state.isEditMode}
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
      <EventDialogActions
        isEditMode={state.isEditMode}
        isEventDeletable={validation.isEventDeletable}
        onCancel={handlers.onCancel}
        onSave={handlers.onSave}
        onDelete={validation.isEventDeletable ? handlers.onDelete : undefined}
      />
    </DialogContent>
  );
};
