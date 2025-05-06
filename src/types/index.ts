
// Aggiorna il tipo Event per includere gli allegati
import { FileAttachment } from './files';

export type EventType = 'impegno' | 'appuntamento' | 'promemoria';
export type InviteStatus = 'pending' | 'accepted' | 'declined';

export interface Event {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  userIds: string[];
  color: string;
  type: EventType;
  attachments: FileAttachment[];
  // Nuovi campi per la gestione delle adesioni
  rsvpDeadline?: Date;
  inviteStatus?: Record<string, InviteStatus>; // Mappa userId -> stato invito
}

export interface User {
  id: string;
  name: string;
  avatarUrl?: string;
  avatar?: string; // per compatibilità con il codice esistente
  email: string;
  role?: string;
  color?: string; // Aggiungiamo questa proprietà per compatibilità
}

// Tipi necessari per DayView e FreeSlotFinder
export interface TimeSlot {
  start: Date;
  end: Date;
  userIds: string[];
}

export interface DayViewProps {
  date: Date;
  users: User[];
  events: Event[];
  hourHeight: number;
  onAddEvent: (userIds: string[], start: Date, end: Date) => void;
  onEditEvent: (event: Event) => void;
}

export interface TimeSlotFinderProps {
  users: User[];
  events: Event[];
  selectedUsers: string[];
  date: Date;
  onSlotSelect: (start: Date, end: Date, userIds: string[]) => void;
}
