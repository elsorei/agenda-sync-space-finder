
import { useState, useEffect } from "react";
import { Event, User, EventType, InviteStatus } from "@/types";
import { FileAttachment } from "@/types/files";

interface UseEventDialogStateProps {
  event: Event | null;
  users: User[];
}

export const useEventDialogState = ({
  event,
  users
}: UseEventDialogStateProps) => {
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
  const [rsvpDeadline, setRsvpDeadline] = useState<Date | undefined>(undefined);
  const [availableUntil, setAvailableUntil] = useState<Date | undefined>(undefined);
  const [inviteStatus, setInviteStatus] = useState<Record<string, InviteStatus>>({});

  // Initialize state from event when it changes
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
      setRsvpDeadline(event.rsvpDeadline ? new Date(event.rsvpDeadline) : undefined);
      setAvailableUntil(event.availableUntil ? new Date(event.availableUntil) : undefined);
      setInviteStatus(event.inviteStatus || {});
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
    setRsvpDeadline(undefined);
    setAvailableUntil(undefined);
    setInviteStatus({});
  };

  return {
    // Form state
    title,
    setTitle,
    description,
    setDescription,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    selectedUserIds,
    setSelectedUserIds,
    eventType,
    setEventType,
    attachments, 
    setAttachments,
    showFileUpload,
    setShowFileUpload,
    isEditMode,
    setIsEditMode,
    reserveUserIds,
    setReserveUserIds,
    rsvpDeadline,
    setRsvpDeadline,
    availableUntil,
    setAvailableUntil,
    inviteStatus,
    setInviteStatus,

    // Form utilities
    resetForm
  };
};
