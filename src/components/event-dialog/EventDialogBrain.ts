
import { useState, useEffect } from "react";
import { Event, User, EventType, InviteStatus } from "@/types";
import { FileAttachment } from "@/types/files";
import { toast } from "@/hooks/use-toast";

interface UseEventDialogBrainProps {
  event: Event | null;
  users: User[];
  onSave: (event: Event) => void;
  onDelete?: (eventId: string) => void;
  onClose: () => void;
}

export const useEventDialogBrain = ({
  event,
  users,
  onSave,
  onDelete,
  onClose,
}: UseEventDialogBrainProps) => {
  // Basic state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [eventType, setEventType] = useState<EventType>('impegno');
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [rsvpDeadline, setRsvpDeadline] = useState<Date | undefined>(undefined);
  const [inviteStatus, setInviteStatus] = useState<Record<string, InviteStatus> | undefined>(undefined);
  const [reserveUserIds, setReserveUserIds] = useState<string[]>([]);
  const [availableUntil, setAvailableUntil] = useState<Date | undefined>(undefined);

  // Initialize state from the event when it changes
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
      setRsvpDeadline(event.rsvpDeadline ? new Date(event.rsvpDeadline) : undefined);
      setInviteStatus(event.inviteStatus ? {...event.inviteStatus} : undefined);
      setReserveUserIds(event.reserveUserIds ? [...event.reserveUserIds] : []);
      setAvailableUntil(event.availableUntil ? new Date(event.availableUntil) : undefined);
    }
  }, [event]);

  // Toggle a user in the primary guest list
  const onToggleUser = (userId: string) => {
    if (!isEditMode) {
      toast({
        title: "Modalità sola lettura",
        description: "Clicca su 'Modifica' per abilitare le modifiche",
      });
      return;
    }

    // Remove from reserves if being added to primary guests
    let newReserves = [...reserveUserIds];
    if (!selectedUserIds.includes(userId) && newReserves.includes(userId)) {
      newReserves = newReserves.filter(id => id !== userId);
      setReserveUserIds(newReserves);
    }

    // Toggle in primary guests
    setSelectedUserIds(prev => {
      const isSelected = prev.includes(userId);
      return isSelected 
        ? prev.filter(id => id !== userId) 
        : [...prev, userId];
    });
  };

  // Toggle a user in the reserves list
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

  // Handle file attachments
  const addAttachment = (file: FileAttachment) => {
    if (!isEditMode) {
      toast({
        title: "Modalità sola lettura",
        description: "Clicca su 'Modifica' per abilitare le modifiche",
      });
      return;
    }
    setAttachments(prev => [...prev.map(att => ({...att})), {...file}]);
  };

  const removeAttachment = (fileId: string) => {
    if (!isEditMode) {
      toast({
        title: "Modalità sola lettura",
        description: "Clicca su 'Modifica' per abilitare le modifiche",
      });
      return;
    }
    setAttachments(prev => prev.filter(file => file.id !== fileId));
  };

  const viewAttachment = (file: FileAttachment) => {
    // Open the file in a new window or tab
    window.open(file.url, "_blank");
  };

  // Form validation
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

  // Event handlers
  const handleSave = () => {
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

    // Add optional fields when they are set
    if (rsvpDeadline) {
      updatedEvent.rsvpDeadline = rsvpDeadline;
    }
    
    if (inviteStatus) {
      updatedEvent.inviteStatus = {...inviteStatus};
    }

    if (availableUntil) {
      updatedEvent.availableUntil = availableUntil;
    }

    onSave(updatedEvent);
    setIsEditMode(false);
  };

  const handleCancel = () => {
    if (isEditMode) {
      // Reset form to original state
      if (event) {
        setTitle(event.title);
        setDescription(event.description || "");
        setStartTime(new Date(event.start));
        setEndTime(new Date(event.end));
        setSelectedUserIds([...event.userIds]);
        setEventType(event.type || 'impegno');
        setAttachments(event.attachments ? [...event.attachments.map(att => ({...att}))] : []);
        setRsvpDeadline(event.rsvpDeadline ? new Date(event.rsvpDeadline) : null);
        setInviteStatus(event.inviteStatus ? {...event.inviteStatus} : undefined);
        setReserveUserIds(event.reserveUserIds ? [...event.reserveUserIds] : []);
        setAvailableUntil(event.availableUntil ? new Date(event.availableUntil) : null);
      }
      setIsEditMode(false);
    } else {
      onClose();
    }
  };

  const handleDelete = () => {
    if (!event || !onDelete) return;
    
    onDelete(event.id);
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
  };
};

export default useEventDialogBrain;
