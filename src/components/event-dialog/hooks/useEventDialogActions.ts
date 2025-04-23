
import { toast } from "@/hooks/use-toast";
import { Event, User, EventType } from "@/types";
import { FileAttachment } from "@/types/files";

interface UseEventDialogActionsProps {
  state: {
    title: string;
    setTitle: (t: string) => void;
    description: string;
    setDescription: (d: string) => void;
    eventType: EventType;
    setEventType: (et: EventType) => void;
    selectedUserIds: string[];
    setSelectedUserIds: (f: (prev: string[]) => string[]) => void;
    startTime: Date | null;
    setStartTime: (date: Date | null) => void;
    endTime: Date | null;
    setEndTime: (date: Date | null) => void;
    attachments: FileAttachment[];
    setAttachments: (f: (prev: FileAttachment[]) => FileAttachment[]) => void;
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
  const {
    title, setTitle, description, setDescription,
    eventType, setEventType, selectedUserIds, setSelectedUserIds,
    startTime, setStartTime, endTime, setEndTime,
    attachments, setAttachments, isEditMode, setIsEditMode,
    users, event
  } = state;

  const onToggleUser = (userId: string) => {
    if (!isEditMode) {
      toast({
        title: "Modalità sola lettura",
        description: "Clicca su 'Modifica' per abilitare le modifiche",
      });
      return;
    }
    setSelectedUserIds(prev =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const addAttachment = (file: FileAttachment) => {
    if (!isEditMode) {
      toast({
        title: "Modalità sola lettura",
        description: "Clicca su 'Modifica' per abilitare le modifiche",
      });
      return;
    }
    setAttachments(prev => [...prev, { ...file }]);
  };

  const removeAttachment = (id: string) => {
    if (!isEditMode) {
      toast({
        title: "Modalità sola lettura",
        description: "Clicca su 'Modifica' per abilitare le modifiche",
      });
      return;
    }
    setAttachments(prev => prev.filter((file) => file.id !== id));
  };

  const viewAttachment = (file: FileAttachment) => {
    if (file.url) {
      window.open(file.url, "_blank");
    } else {
      toast({
        title: "Errore",
        description: "URL del file non disponibile",
        variant: "destructive",
      });
    }
  };

  const handleSave = () => {
    if (!isEditMode) {
      setIsEditMode(true);
      toast({
        title: "Modalità modifica",
        description: "Ora puoi modificare l'evento",
      });
      return;
    }

    if (!startTime || !endTime) {
      toast({
        title: "Errore",
        description: "Devi selezionare un orario di inizio e fine valido.",
        variant: "destructive",
      });
      return;
    }
    if (selectedUserIds.length === 0) {
      toast({
        title: "Errore",
        description: "Devi selezionare almeno un utente invitato.",
        variant: "destructive",
      });
      return;
    }
    if (title.trim() === "") {
      toast({
        title: "Errore",
        description: "Il titolo dell'evento non può essere vuoto.",
        variant: "destructive",
      });
      return;
    }

    const updatedEvent: Event = {
      ...event,
      id: event?.id || `new-${Date.now()}`,
      title,
      description,
      type: eventType,
      userIds: [...selectedUserIds],
      start: startTime ? new Date(startTime.getTime()) : new Date(),
      end: endTime ? new Date(endTime.getTime()) : new Date(),
      color: event?.color || "#9b87f5",
      attachments: attachments.map((a) => ({ ...a })),
    };

    onSave(updatedEvent);
    setIsEditMode(false);
  };

  const handleCancel = () => {
    if (isEditMode) {
      if (event) {
        setTitle(event.title || "");
        setDescription(event.description || "");
        setEventType(event.type || "impegno");
        setSelectedUserIds(event.userIds || []);
        setStartTime(event.start ? new Date(event.start) : null);
        setEndTime(event.end ? new Date(event.end) : null);
        setAttachments(event.attachments ? event.attachments.map((a) => ({ ...a })) : []);
        setIsEditMode(false);
      } else {
        setTitle("");
        setDescription("");
        setEventType("impegno");
        setSelectedUserIds([]);
        setStartTime(null);
        setEndTime(null);
        setAttachments([]);
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
    onToggleUser,
    addAttachment,
    removeAttachment,
    viewAttachment,
    handleSave,
    handleCancel,
    handleDelete,
  };
};
