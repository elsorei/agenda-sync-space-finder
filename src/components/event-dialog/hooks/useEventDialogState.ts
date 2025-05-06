
import { useState, useEffect } from "react";
import { Event, User, EventType, InviteStatus } from "@/types";
import { FileAttachment } from "@/types/files";

interface UseEventDialogStateProps {
  event: Event | null;
  users: User[];
}

// Hook per la gestione dello stato del dialog dell'evento
export const useEventDialogState = ({
  event,
  users
}: UseEventDialogStateProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState<EventType>("impegno");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [rsvpDeadline, setRsvpDeadline] = useState<Date | undefined>(undefined);
  const [inviteStatus, setInviteStatus] = useState<Record<string, InviteStatus>>({});

  // Inizializzazione dello stato quando cambia l'evento
  useEffect(() => {
    if (event) {
      console.log("Caricamento evento:", event.id, "titolo:", event.title, "tipo:", event.type);
      setTitle(event.title || "");
      setDescription(event.description || "");
      setEventType(event.type || "impegno");
      setSelectedUserIds(event.userIds || []);
      setStartTime(event.start ? new Date(event.start) : null);
      setEndTime(event.end ? new Date(event.end) : null);
      setAttachments(event.attachments ? [...event.attachments.map(a => ({...a}))] : []);
      setRsvpDeadline(event.rsvpDeadline ? new Date(event.rsvpDeadline) : undefined);
      
      // Assicuriamoci che inviteStatus abbia il tipo corretto
      const typedInviteStatus: Record<string, InviteStatus> = {};
      if (event.inviteStatus) {
        Object.keys(event.inviteStatus).forEach(key => {
          const status = event.inviteStatus?.[key];
          if (status === 'accepted' || status === 'declined' || status === 'pending') {
            typedInviteStatus[key] = status;
          } else {
            typedInviteStatus[key] = 'pending';
          }
        });
      }
      setInviteStatus(typedInviteStatus);
      
      // Se è un nuovo evento (ID inizia con "new-"), entra subito in modalità modifica
      const isNewEvent = event.id.startsWith("new-");
      console.log("Modalità editing:", isNewEvent ? "attiva (nuovo evento)" : "disattivata");
      setIsEditMode(isNewEvent);
    } else {
      // Reset dello stato se non c'è un evento
      setTitle("");
      setDescription("");
      setEventType("impegno");
      setSelectedUserIds([]);
      setStartTime(null);
      setEndTime(null);
      setAttachments([]);
      setRsvpDeadline(undefined);
      setInviteStatus({});
      setIsEditMode(true);
    }
  }, [event]);

  return {
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
    setAttachments,
    isEditMode,
    setIsEditMode,
    rsvpDeadline,
    setRsvpDeadline,
    inviteStatus,
    setInviteStatus,
    users,
    event
  };
};
