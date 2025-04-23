
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { EventDialogProps } from "./types";
import { EventDialogHeader } from "./EventDialogHeader";
import { EventDialogGuests } from "./EventDialogGuests";
import { EventDialogContent } from "./EventDialogContent";
import { EventDialogAttachments } from "./EventDialogAttachments";
import { EventDialogActions } from "./EventDialogActions";
import { useEventDialogBrain } from "./EventDialogBrain";

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
      event: loadedEvent,
      users: contextUsers,
    },
    onToggleUser,
    addAttachment,
    removeAttachment,
    viewAttachment,
    handleSave,
    handleCancel,
    handleDelete,
  } = useEventDialogBrain({ event, users, onSave, onDelete, onClose });

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
        <EventDialogContent
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
