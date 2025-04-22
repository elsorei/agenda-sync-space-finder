
// Aggiorna il tipo Event per includere gli allegati
import { FileAttachment } from './files';

export type EventType = 'impegno' | 'appuntamento' | 'promemoria';

export interface Event {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  userIds: string[];
  color: string;
  type: EventType;
  attachments?: FileAttachment[];
}

export interface User {
  id: string;
  name: string;
  avatarUrl?: string;
  email: string;
  role?: string;
}
