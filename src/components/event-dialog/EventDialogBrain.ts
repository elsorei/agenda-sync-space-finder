
import { useEventDialogState } from "./hooks/useEventDialogState";
import { useEventDialogActions } from "./hooks/useEventDialogActions";
import { useCreateEvent } from "./hooks/useCreateEvent";
import { useEditEvent } from "./hooks/useEditEvent";
import { useDeleteEvent } from "./hooks/useDeleteEvent";
import { Event, User } from "@/types";

export interface EventDialogBrainProps {
  event: Event | null;
  users: User[];
  onSave: (event: Event) => void;
  onDelete?: (eventId: string) => void;
  onClose: () => void;
}

// The composition root for dialog state and actions
export const useEventDialogBrain = ({
  event,
  users,
  onSave,
  onDelete,
  onClose,
}: EventDialogBrainProps) => {
  const state = useEventDialogState({ event, users });
  const actions = useEventDialogActions({ state, onSave, onDelete, onClose });
  const { createEvent } = useCreateEvent({ onCreate: onSave });
  const { editEvent } = useEditEvent({ onEdit: onSave });
  const { deleteEvent } = useDeleteEvent({ onDelete: onDelete ? onDelete : () => {} });

  // You can now use createEvent, editEvent, deleteEvent throughout the app for clarity
  return {
    state,
    ...actions,
    setIsEditMode: state.setIsEditMode,
    createEvent,
    editEvent,
    deleteEvent,
  };
};
