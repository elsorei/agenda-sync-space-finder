
import { useEventDialogState } from "./hooks/useEventDialogState";
import { useEventDialogActions } from "./hooks/useEventDialogActions";
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

  return {
    state,
    ...actions,
    setIsEditMode: state.setIsEditMode,
  };
};

