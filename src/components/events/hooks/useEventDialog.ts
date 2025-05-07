
import { Event, User } from "@/types";
import { useEventDialogState } from "./useEventDialogState";
import { useEventDialogActionHandlers } from "./useEventDialogActionHandlers";

interface UseEventDialogProps {
  event: Event | null;
  users: User[];
  onSave: (event: Event) => void;
  onDelete?: (eventId: string) => void;
  onClose: () => void;
}

export const useEventDialog = ({
  event,
  users,
  onSave,
  onDelete,
  onClose,
}: UseEventDialogProps) => {
  // Get all state from useEventDialogState
  const state = useEventDialogState({ event, users });
  
  // Get all action handlers
  const {
    onSaveEvent,
    onCancel,
    onDeleteEvent,
    handleAddFile,
    handleRemoveFile,
    onToggleUser,
    onToggleReserveUser
  } = useEventDialogActionHandlers({
    event,
    state,
    onSave,
    onDelete,
    onClose
  });

  // Prepare validation info
  const validation = {
    isNewEvent: !event || event.id.startsWith("new-"),
    isEventDeletable: !!event && !!event.id && !event.id.startsWith("new-") && !!onDelete,
  };

  // Combine everything for the component to use
  return {
    state: {
      title: state.title,
      description: state.description,
      startTime: state.startTime,
      endTime: state.endTime,
      selectedUserIds: state.selectedUserIds,
      eventType: state.eventType,
      attachments: state.attachments,
      showFileUpload: state.showFileUpload,
      isEditMode: state.isEditMode,
      reserveUserIds: state.reserveUserIds,
      rsvpDeadline: state.rsvpDeadline,
      availableUntil: state.availableUntil
    },
    handlers: {
      setTitle: state.setTitle,
      setDescription: state.setDescription,
      setStartTime: state.setStartTime,
      setEndTime: state.setEndTime,
      setSelectedUserIds: state.setSelectedUserIds,
      setEventType: state.setEventType,
      setShowFileUpload: state.setShowFileUpload,
      setIsEditMode: state.setIsEditMode,
      setRsvpDeadline: state.setRsvpDeadline,
      setAvailableUntil: state.setAvailableUntil,
      handleAddFile,
      handleRemoveFile,
      onToggleReserveUser,
      onSave: onSaveEvent,
      onCancel,
      onDelete: onDeleteEvent
    },
    validation
  };
};
