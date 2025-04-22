
import { Event, User, EventType } from "@/types";

export interface EventDialogProps {
  event: Event | null;
  users: User[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Event) => void;
  onDelete?: (eventId: string) => void;
}
