import { Event, User, EventType } from "@/types";
import { addDays, addHours, addMinutes, startOfDay, subHours } from "date-fns";

export const mockUsers: User[] = [
  {
    id: "user1",
    name: "Mario Rossi",
    avatar: "https://i.pravatar.cc/150?img=1",
    email: "mario.rossi@example.com",
    color: "#9b87f5",
  },
  {
    id: "user2",
    name: "Giulia Bianchi",
    avatar: "https://i.pravatar.cc/150?img=2",
    email: "giulia.bianchi@example.com",
    color: "#7E69AB",
  },
  {
    id: "user3",
    name: "Antonio Verdi",
    avatar: "https://i.pravatar.cc/150?img=3",
    email: "antonio.verdi@example.com",
    color: "#33C3F0",
  },
  {
    id: "user4",
    name: "Francesca Neri",
    avatar: "https://i.pravatar.cc/150?img=4",
    email: "francesca.neri@example.com",
    color: "#F97316",
  },
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
    attachments: [], // Manteniamo l'array vuoto di default
  };
};

// Helper per generare eventi casuali per un giorno specifico
export const generateMockEvents = (date: Date): Event[] => {
  const startDay = startOfDay(date);
  const events: Event[] = [];

  // Manteniamo solo un evento di esempio
  events.push(
    createEvent(
      "Riunione di team",
      addHours(startDay, 10),
      60,
      ["user1", "user2", "user3"],
      'appuntamento'
    )
  );

  return events;
};
