
import { useState } from "react";
import { Event } from "@/types";
import { toast } from "@/hooks/use-toast";
import { useEventDialogValidation } from "./useEventDialogValidation";
import { useEventDialogFileHandlers } from "./useEventDialogFileHandlers";
import { useEventDialogUserHandlers } from "./useEventDialogUserHandlers";

interface UseEventDialogActionHandlersProps {
  event: Event | null;
  state: any;
  onSave: (event: Event) => void;
  onDelete?: (eventId: string) => void;
  onClose: () => void;
}

export const useEventDialogActionHandlers = ({
  event,
  state,
  onSave,
  onDelete,
  onClose
}: UseEventDialogActionHandlersProps) => {
  const { title, startTime, endTime, selectedUserIds, isEditMode, setIsEditMode, 
    resetForm, setAttachments, setShowFileUpload, setReserveUserIds } = state;

  // Use the validation hook
  const { validateForm } = useEventDialogValidation({
    title,
    startTime,
    endTime,
    selectedUserIds
  });

  // Use the file handlers hook
  const { handleAddFile, handleRemoveFile } = useEventDialogFileHandlers({
    isEditMode,
    setAttachments,
    setShowFileUpload
  });

  // Use the user handlers hook
  const { onToggleUser, onToggleReserveUser } = useEventDialogUserHandlers({
    isEditMode,
    setSelectedUserIds: state.setSelectedUserIds,
    setReserveUserIds
  });

  const onSaveEvent = () => {
    if (!isEditMode) {
      setIsEditMode(true);
      return;
    }

    if (!validateForm()) return;

    const updatedEvent: Event = {
      id: event?.id || `new-${Date.now()}`,
      title: state.title,
      description: state.description,
      start: state.startTime!,
      end: state.endTime!,
      userIds: [...state.selectedUserIds],
      reserveUserIds: [...state.reserveUserIds],
      color: event?.color || "#9b87f5",
      type: state.eventType,
      attachments: state.attachments.map(att => ({...att}))
    };

    // Add optional fields when they are set
    if (state.rsvpDeadline) {
      updatedEvent.rsvpDeadline = state.rsvpDeadline;
    }
    
    if (state.inviteStatus) {
      updatedEvent.inviteStatus = {...state.inviteStatus};
    }

    if (state.availableUntil) {
      updatedEvent.availableUntil = state.availableUntil;
    }

    onSave(updatedEvent);
    setIsEditMode(false);
  };

  const onCancel = () => {
    if (isEditMode) {
      if (event) {
        // Reset to the original event state
        state.setTitle(event.title);
        state.setDescription(event.description || "");
        state.setStartTime(new Date(event.start));
        state.setEndTime(new Date(event.end));
        state.setSelectedUserIds([...event.userIds]);
        state.setEventType(event.type || 'impegno');
        state.setAttachments(event.attachments ? event.attachments.map((a: any) => ({ ...a })) : []);
        state.setReserveUserIds(event.reserveUserIds || []);
        state.setRsvpDeadline(event.rsvpDeadline ? new Date(event.rsvpDeadline) : undefined);
        state.setAvailableUntil(event.availableUntil ? new Date(event.availableUntil) : undefined);
      } else {
        // Reset form if there's no event
        resetForm();
      }
      setIsEditMode(false);
    } else {
      onClose();
    }
  };

  const onDeleteEvent = () => {
    if (event && onDelete) {
      onDelete(event.id);
      onClose();
    }
  };

  return {
    // Actions
    onSaveEvent,
    onCancel,
    onDeleteEvent,
    
    // File handlers
    handleAddFile,
    handleRemoveFile,
    
    // User handlers
    onToggleUser,
    onToggleReserveUser
  };
};
