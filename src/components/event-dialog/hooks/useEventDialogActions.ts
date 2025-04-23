
import { toast } from "@/hooks/use-toast";
import { Event, User, EventType } from "@/types";
import { FileAttachment } from "@/types/files";
import { useAttachmentActions } from "./useAttachmentActions";
import { useUserSelection } from "./useUserSelection";
import { useEventValidation } from "./useEventValidation";

interface UseEventDialogActionsProps {
  state: {
    title: string;
    setTitle: (t: string) => void;
    description: string;
    setDescription: (d: string) => void;
    eventType: EventType;
    setEventType: (et: EventType) => void;
    selectedUserIds: string[];
    setSelectedUserIds: (f: ((prev: string[]) => string[]) | string[]) => void;
    startTime: Date | null;
    setStartTime: (date: Date | null) => void;
    endTime: Date | null;
    setEndTime: (date: Date | null) => void;
    attachments: FileAttachment[];
    setAttachments: (f: ((prev: FileAttachment[]) => FileAttachment[]) | FileAttachment[]) => void;
    isEditMode: boolean;
    setIsEditMode: (val: boolean) => void;
    users: User[];
    event: Event | null;
  },
  onSave: (event: Event) => void;
  onDelete?: (eventId: string) => void;
  onClose: () => void;
}

export const useEventDialogActions = ({
  state,
  onSave,
  onDelete,
  onClose
}: UseEventDialogActionsProps) => {
  const { isEditMode, setIsEditMode, event } = state;

  const attachmentActions = useAttachmentActions({
    isEditMode,
    setAttachments: state.setAttachments
  });

  const userSelectionActions = useUserSelection({
    isEditMode,
    setSelectedUserIds: state.setSelectedUserIds
  });

  const validation = useEventValidation({
    title: state.title,
    startTime: state.startTime,
    endTime: state.endTime,
    selectedUserIds: state.selectedUserIds
  });

  const handleSave = () => {
    if (!isEditMode) {
      setIsEditMode(true);
      toast({
        title: "Modalità modifica",
        description: "Ora puoi modificare l'evento",
      });
      return;
    }

    if (!validation.validateEvent()) return;

    const updatedEvent: Event = {
      ...event,
      id: event?.id || `new-${Date.now()}`,
      title: state.title,
      description: state.description,
      type: state.eventType,
      userIds: [...state.selectedUserIds],
      start: state.startTime ? new Date(state.startTime.getTime()) : new Date(),
      end: state.endTime ? new Date(state.endTime.getTime()) : new Date(),
      color: event?.color || "#9b87f5",
      attachments: state.attachments.map((a) => ({ ...a })),
    };

    onSave(updatedEvent);
    setIsEditMode(false);
  };

  const handleCancel = () => {
    if (isEditMode) {
      if (event) {
        state.setTitle(event.title || "");
        state.setDescription(event.description || "");
        state.setEventType(event.type || "impegno");
        state.setSelectedUserIds(event.userIds || []);
        state.setStartTime(event.start ? new Date(event.start) : null);
        state.setEndTime(event.end ? new Date(event.end) : null);
        state.setAttachments(event.attachments ? event.attachments.map((a) => ({ ...a })) : []);
        setIsEditMode(false);
      } else {
        state.setTitle("");
        state.setDescription("");
        state.setEventType("impegno");
        state.setSelectedUserIds([]);
        state.setStartTime(null);
        state.setEndTime(null);
        state.setAttachments([]);
        setIsEditMode(true);
      }
      toast({
        title: "Modifiche annullate",
        description: "Le modifiche sono state annullate.",
      });
    } else {
      onClose();
    }
  };

  const handleDelete = () => {
    if (event && onDelete) {
      onDelete(event.id);
    }
    onClose();
  };

  return {
    ...attachmentActions,
    ...userSelectionActions,
    handleSave,
    handleCancel,
    handleDelete,
  };
};
