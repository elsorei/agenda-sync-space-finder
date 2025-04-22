
import { addMinutes, areIntervalsOverlapping, format, isSameDay, isWithinInterval, setHours, setMinutes } from "date-fns";
import { Event, TimeSlot, User } from "@/types";

// Genera intervalli di mezzora per la vista giornaliera
export const getDayViewHalfHourIntervals = (date: Date): Date[] => {
  const intervals: Date[] = [];
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  for (let i = 0; i < 48; i++) {
    intervals.push(addMinutes(startOfDay, i * 30));
  }

  return intervals;
};

// Calcola lo stile per un evento nella vista giornaliera
export const getEventStyle = (event: Event, hourHeight: number): React.CSSProperties => {
  // Assicurati che le date siano oggetti Date validi, non stringhe
  const startDate = event.start instanceof Date ? event.start : new Date(event.start);
  const endDate = event.end instanceof Date ? event.end : new Date(event.end);

  const startHour = startDate.getHours();
  const startMinute = startDate.getMinutes();
  const endHour = endDate.getHours();
  const endMinute = endDate.getMinutes();

  const top = (startHour * 60 + startMinute) * (hourHeight / 60);
  const height = (endHour * 60 + endMinute - startHour * 60 - startMinute) * (hourHeight / 60);

  return {
    top: `${top}px`,
    height: `${height}px`,
    backgroundColor: event.color ? `${event.color}20` : "#9b87f520", // Versione più leggera del colore dell'evento
    borderLeft: `3px solid ${event.color || "#9b87f5"}`,
  };
};

// Verifica se un evento si sovrappone a un'ora specifica
export const eventOverlapsHour = (event: Event, hourDate: Date): boolean => {
  // Assicurati che le date siano oggetti Date validi
  const startDate = event.start instanceof Date ? event.start : new Date(event.start);
  const endDate = event.end instanceof Date ? event.end : new Date(event.end);
  
  const hourStart = hourDate;
  const hourEnd = addMinutes(hourDate, 59);

  return areIntervalsOverlapping(
    { start: startDate, end: endDate },
    { start: hourStart, end: hourEnd }
  );
};

// Utility per trovare slot liberi comuni per un gruppo di utenti
export const findFreeSlots = (
  users: User[],
  events: Event[],
  date: Date,
  selectedUsers: string[]
): TimeSlot[] => {
  if (selectedUsers.length === 0) return [];

  // Filtra solo gli eventi per gli utenti selezionati
  const relevantEvents = events.filter((event) =>
    event.userIds.some((userId) => selectedUsers.includes(userId))
  );

  // Genera slot di 30 minuti per l'intera giornata
  const dayStart = new Date(date);
  dayStart.setHours(8, 0, 0, 0); // Inizia alle 8:00
  const dayEnd = new Date(date);
  dayEnd.setHours(18, 0, 0, 0); // Finisce alle 18:00

  const slots: TimeSlot[] = [];
  let currentTime = new Date(dayStart);

  // Crea slot di 30 minuti
  while (currentTime < dayEnd) {
    const slotEnd = addMinutes(currentTime, 30);
    
    // Controlla se questo slot si sovrappone a qualsiasi evento esistente
    const overlapsWithEvent = relevantEvents.some((event) => {
      // Assicurati che le date dell'evento siano oggetti Date validi
      const eventStart = event.start instanceof Date ? event.start : new Date(event.start);
      const eventEnd = event.end instanceof Date ? event.end : new Date(event.end);
      
      return areIntervalsOverlapping(
        { start: currentTime, end: slotEnd },
        { start: eventStart, end: eventEnd }
      );
    });

    if (!overlapsWithEvent) {
      slots.push({
        start: new Date(currentTime),
        end: new Date(slotEnd),
        userIds: selectedUsers,
      });
    }

    currentTime = new Date(slotEnd);
  }

  return slots;
};

// Alias per compatibilità con i componenti esistenti
export const findCommonFreeSlots = findFreeSlots;

// Formatta l'ora in formato leggibile
export const formatTime = (date: Date): string => {
  return format(date, "HH:mm");
};
