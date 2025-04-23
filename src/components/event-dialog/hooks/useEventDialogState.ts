
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { Event, User, EventType } from "@/types";
import { FileAttachment } from "@/types/files";

export interface UseEventDialogStateProps {
  event: Event | null;
  users: User[];
  onSave: (event: Event) => void;
  onDelete?: (eventId: string) => void;
  onClose: () => void;
}

export const useEventDialogState = ({
  event,
  users,
  onSave,
  onDelete,
  onClose,
}: UseEventDialogStateProps) => {
  // Stato locale
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState<EventType>("impegno");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);

  // Ricarica local da evento
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
      setIsEditMode(true); // nuovo evento in edit mode
    }
  }, [event]);

  // Toggle invitato
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

  // Allegati (aggiungi/rimuovi)
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

  // Salva/Modifica
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

  // Annulla
  const handleCancel = () => {
    if (isEditMode) {
      // Reset a evento originale
      if (event) {
        setTitle(event.title || "");
        setDescription(event.description || "");
        setEventType(event.type || "impegno");
        setSelectedUserIds(event.userIds || []);
        setStartTime(event.start ? new Date(event.start) : null);
        setEndTime(event.end ? new Date(event.end) : null);
        setAttachments(event.attachments ? event.attachments.map((a) => ({ ...a })) : []);
      } else {
        setTitle("");
        setDescription("");
        setEventType("impegno");
        setSelectedUserIds([]);
        setStartTime(null);
        setEndTime(null);
        setAttachments([]);
      }
      setIsEditMode(event ? false : true);
      toast({
        title: "Modifiche annullate",
        description: "Le modifiche sono state annullate.",
      });
    } else {
      onClose();
    }
  };

  // Elimina
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
