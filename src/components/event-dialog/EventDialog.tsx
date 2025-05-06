
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { EventDialogProps } from "./types";
import { EventDialogHeader } from "./EventDialogHeader";
import { EventDialogContent } from "./EventDialogContent";
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
  console.log("EventDialog rendering with event:", event?.id, "isOpen:", isOpen);
  
  const {
    state: {
      title,
      setTitle,
      description,
      setDescription,
      eventType,
      setEventType,
      selectedUserIds,
      startTime,
      setStartTime,
      endTime,
      setEndTime,
      attachments,
      rsvpDeadline,
      setRsvpDeadline,
      inviteStatus,
      isEditMode,
      reserveUserIds,
      availableUntil,
      setAvailableUntil,
    },
    onToggleUser,
    onToggleReserveUser,
    addAttachment,
    removeAttachment,
    viewAttachment,
    handleSave,
    handleCancel,
    handleDelete,
    setIsEditMode
  } = useEventDialogBrain({ 
    event, 
    users, 
    onSave, 
    onDelete, 
    onClose 
  });

  // Determina se l'evento è nuovo basandosi sull'ID
  const isNewEvent = !event || event.id.startsWith("new-");
  console.log("isNewEvent:", isNewEvent, "isEditMode:", isEditMode);
  
  // Determina se l'evento può essere eliminato
  const isEventDeletable = !!event && !!event.id && !isNewEvent && !!onDelete;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-background">
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
          reserveUserIds={reserveUserIds || []}
          onToggleReserveUser={onToggleReserveUser}
          title={title}
          setTitle={setTitle}
          startTime={startTime}
          setStartTime={setStartTime}
          endTime={endTime}
          setEndTime={setEndTime}
          description={description}
          setDescription={setDescription}
          isReadOnly={!isEditMode && !!event}
          rsvpDeadline={rsvpDeadline}
          setRsvpDeadline={setRsvpDeadline}
          availableUntil={availableUntil}
          setAvailableUntil={setAvailableUntil}
          inviteStatus={inviteStatus}
          attachments={attachments}
          onAddAttachment={addAttachment}
          onRemoveAttachment={removeAttachment}
          onViewAttachment={viewAttachment}
        />
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
