
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { Event, User, EventType } from "@/types";
import { FileAttachment } from "@/types/files";

export interface EventDialogBrainProps {
  event: Event | null;
  users: User[];
  onSave: (event: Event) => void;
  onDelete?: (eventId: string) => void;
  onClose: () => void;
}

// This is the "cervello"/brain of the dialog, handling state & commands
export const useEventDialogBrain = ({
  event,
  users,
  onSave,
  onDelete,
  onClose,
}: EventDialogBrainProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState<EventType>("impegno");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);

  // Load/reset form state on event change
  useEffect(() => {
    if (event) {
      setTitle(event.title || "");
      setDescription(event.description || "");
      setEventType(event.type || "impegno");
      setSelectedUserIds(event.userIds || []);
      setStartTime(event.start ? new Date(event.start) : null);
      setEndTime(event.end ? new Date(event.end) : null);
      setAttachments(event.attachments ? event.attachments.map((a) => ({ ...a })) : []);
      setIsEditMode(event.id.startsWith("new-"));
    } else {
      setTitle("");
      setDescription("");
      setEventType("impegno");
      setSelectedUserIds([]);
      setStartTime(null);
      setEndTime(null);
      setAttachments([]);
      setIsEditMode(true); // new event is immediately editable
    }
  }, [event]);

  // Actions (commands)
  const onToggleUser = (userId: string) => {
    if (!isEditMode) {
      toast({
        title: "Modalità sola lettura",
        description: "Clicca su 'Modifica' per abilitare le modifiche",
      });
      return;
    }
    setSelectedUserIds((prev) =>
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
    setAttachments((prev) => [...prev, { ...file }]);
  };

  const removeAttachment = (id: string) => {
    if (!isEditMode) {
      toast({
        title: "Modalità sola lettura",
        description: "Clicca su 'Modifica' per abilitare le modifiche",
      });
      return;
    }
    setAttachments((prev) => prev.filter((file) => file.id !== id));
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
      start: new Date(startTime.getTime()),
      end: new Date(endTime.getTime()),
      color: event?.color || "#9b87f5",
      attachments: attachments.map((a) => ({ ...a })),
    };
    onSave(updatedEvent);
    setIsEditMode(false);
  };

  const handleCancel = () => {
    if (isEditMode) {
      // Reset to original event state
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
      users,
      event,
    },
    onToggleUser,
    addAttachment,
    removeAttachment,
    viewAttachment,
    handleSave,
    handleCancel,
    handleDelete,
    setIsEditMode,
  };
};

