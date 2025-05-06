
import { useState, useEffect } from "react";
import { Event, User, EventType } from "@/types";
import { FileAttachment } from "@/types/files";
import { toast } from "@/hooks/use-toast";

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
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [eventType, setEventType] = useState<EventType>('impegno');
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [reserveUserIds, setReserveUserIds] = useState<string[]>([]);

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description || "");
      setStartTime(new Date(event.start));
      setEndTime(new Date(event.end));
      setSelectedUserIds([...event.userIds]);
      setEventType(event.type || 'impegno');
      setAttachments(event.attachments ? [...event.attachments.map(att => ({...att}))] : []);
      setIsEditMode(event.id.startsWith("new-"));
      setReserveUserIds(event.reserveUserIds || []);
    } else {
      resetForm();
    }
  }, [event]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStartTime(null);
    setEndTime(null);
    setSelectedUserIds([]);
    setEventType('impegno');
    setAttachments([]);
    setIsEditMode(false);
    setShowFileUpload(false);
    setReserveUserIds([]);
  };

  const validateForm = () => {
    if (!startTime || !endTime) {
      toast({
        title: "Errore",
        description: "Seleziona orari di inizio e fine validi",
        variant: "destructive",
      });
      return false;
    }

    if (selectedUserIds.length === 0) {
      toast({
        title: "Errore",
        description: "Seleziona almeno un utente",
        variant: "destructive",
      });
      return false;
    }

    if (!title.trim()) {
      toast({
        title: "Errore",
        description: "Inserisci un titolo per l'evento",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleAddFile = (file: FileAttachment) => {
    setAttachments(prev => [...prev.map(att => ({...att})), {...file}]);
    setShowFileUpload(false);
  };

  const handleRemoveFile = (fileId: string) => {
    if (!isEditMode) {
      toast({
        title: "Modalità sola lettura",
        description: "Clicca su 'Modifica' per abilitare le modifiche",
      });
      return;
    }
    setAttachments(prev => prev.filter(file => file.id !== fileId));
  };

  const onToggleReserveUser = (userId: string, isReserve: boolean) => {
    if (!isEditMode) {
      toast({
        title: "Modalità sola lettura",
        description: "Clicca su 'Modifica' per abilitare le modifiche",
      });
      return;
    }
    
    if (isReserve) {
      // Adding to reserves: remove from primary guests if present
      if (selectedUserIds.includes(userId)) {
        setSelectedUserIds(prev => prev.filter(id => id !== userId));
      }
      // Add to reserves if not already there
      if (!reserveUserIds.includes(userId)) {
        setReserveUserIds(prev => [...prev, userId]);
      }
    } else {
      // Remove from reserves
      setReserveUserIds(prev => prev.filter(id => id !== userId));
    }
  };

  const state = {
    title,
    description,
    startTime,
    endTime,
    selectedUserIds,
    eventType,
    attachments,
    showFileUpload,
    isEditMode,
    reserveUserIds,
  };

  const handlers = {
    setTitle,
    setDescription,
    setStartTime,
    setEndTime,
    setSelectedUserIds,
    setEventType,
    setShowFileUpload,
    setIsEditMode,
    handleAddFile,
    handleRemoveFile,
    onToggleReserveUser,
    onSave: () => {
      if (!isEditMode) {
        setIsEditMode(true);
        return;
      }

      if (!validateForm()) return;

      const updatedEvent: Event = {
        id: event?.id || `new-${Date.now()}`,
        title,
        description,
        start: startTime!,
        end: endTime!,
        userIds: [...selectedUserIds],
        reserveUserIds: [...reserveUserIds],
        color: event?.color || "#9b87f5",
        type: eventType,
        attachments: attachments.map(att => ({...att}))
      };

      onSave(updatedEvent);
      setIsEditMode(false);
    },
    onCancel: () => {
      if (isEditMode) {
        if (event) {
          setTitle(event.title);
          setDescription(event.description || "");
          setStartTime(new Date(event.start));
          setEndTime(new Date(event.end));
          setSelectedUserIds([...event.userIds]);
          setEventType(event.type || 'impegno');
          setAttachments(event.attachments ? [...event.attachments.map(att => ({...att}))] : []);
          setReserveUserIds(event.reserveUserIds || []);
        }
        setIsEditMode(false);
        setShowFileUpload(false);
      } else {
        onClose();
      }
    },
    onDelete: () => {
      if (event && onDelete) {
        onDelete(event.id);
        onClose();
      }
    }
  };

  const validation = {
    isNewEvent: !event || event.id.startsWith("new-"),
    isEventDeletable: !!event && !!event.id && !event.id.startsWith("new-") && !!onDelete,
  };

  return {
    state,
    handlers,
    validation
  };
};
