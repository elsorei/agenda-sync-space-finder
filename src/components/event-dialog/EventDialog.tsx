// GRANULAR & HOOK-BASED EVENT DIALOG COMPONENT

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { EventDialogProps } from "./types";
import { EventDialogHeader } from "./EventDialogHeader";
import { EventDialogDetails } from "./EventDialogDetails";
import { EventDialogGuests } from "./EventDialogGuests";
import { EventDialogAttachments } from "./EventDialogAttachments";
import { EventDialogActions } from "./EventDialogActions";
import { useEventDialogState } from "./hooks/useEventDialogState";

export const EventDialog = ({
  event,
  users,
  isOpen,
  onClose,
  onSave,
  onDelete,
}: EventDialogProps) => {
  const {
    state: {
      title,
      setTitle,
      description,
      setDescription,
      eventType,
      setEventType,
      selectedUserIds,
      setSelectedUserIds,
      startTime,
      setStartTime,
      endTime,
      setEndTime,
      attachments,
      isEditMode,
    },
    onToggleUser,
    addAttachment,
    removeAttachment,
    viewAttachment,
    handleSave,
    handleCancel,
    handleDelete,
  } = useEventDialogState({ event, users, onSave, onDelete, onClose });

  const isNewEvent = !event || event.id.startsWith("new-");
  const isEventDeletable = !!event && !!event.id && !isNewEvent && !!onDelete;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <EventDialogHeader
          isNew={isNewEvent}
          isEditMode={isEditMode}
          startTime={startTime}
          eventType={eventType}
        />

        <EventDialogDetails
          eventType={eventType}
          setEventType={setEventType}
          users={users}
          selectedUserIds={selectedUserIds}
          onToggleUser={onToggleUser}
          title={title}
          setTitle={setTitle}
          startTime={startTime}
          setStartTime={setStartTime}
          endTime={endTime}
          setEndTime={setEndTime}
          description={description}
          setDescription={setDescription}
          isReadOnly={!isEditMode && !!event}
        />

        {/* Invited users selector (modulare per granità) */}
        {/* <EventDialogGuests
          users={users}
          selectedUserIds={selectedUserIds}
          onToggleUser={onToggleUser}
          isReadOnly={!isEditMode && !!event}
        /> */}

        <div className="mt-4">
          <EventDialogAttachments
            attachments={attachments}
            onAddAttachment={addAttachment}
            onRemoveAttachment={removeAttachment}
            onViewFile={viewAttachment}
            isReadOnly={!isEditMode && !!event}
          />
        </div>

        <EventDialogActions
          isEditMode={isEditMode}
          isEventDeletable={isEventDeletable}
          onCancel={handleCancel}
          onSave={handleSave}
          onDelete={isEventDeletable ? handleDelete : undefined}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EventDialog;
