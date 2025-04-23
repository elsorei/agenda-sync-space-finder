
import { useState, useEffect } from "react";
import { Event, User, EventType } from "@/types";
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
  const [eventType, setEventType] = useState<EventType>("impegno");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (event) {
      setTitle(event.title || "");
      setDescription(event.description || "");
      setEventType(event.type || "impegno");
      setSelectedUserIds(event.userIds || []);
      setStartTime(event.start ? new Date(event.start) : null);
      setEndTime(event.end ? new Date(event.end) : null);
      setAttachments(event.attachments ? [...event.attachments.map(a => ({...a}))] : []);
      setIsEditMode(event.id.startsWith("new-"));
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
    users,
    event
  };
};
