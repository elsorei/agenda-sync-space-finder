
import { Event, User, EventType } from "@/types";
import { addDays, addHours, addMinutes, startOfDay, subHours } from "date-fns";

export const mockUsers: User[] = [
  {
    id: "user1",
    name: "Elso Rei",
    avatar: "https://i.pravatar.cc/150?img=1",
    email: "elso.rei@example.com",
    color: "#9b87f5",
  }
];

// Funzione per generare un evento simulato
export const createEvent = (
  title: string,
  start: Date,
  durationMinutes: number,
  userIds: string[],
  type: EventType = 'impegno',
  color?: string
): Event => {
  const end = addMinutes(start, durationMinutes);
  return {
    id: `event-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    title,
    start,
    end,
    userIds,
    color: color || "#9b87f5",
    type,
    attachments: [],
  };
};

// Helper per generare eventi casuali per un giorno specifico
export const generateMockEvents = (date: Date): Event[] => {
  // Restituisce un array vuoto senza eventi di esempio
  return [];
};

