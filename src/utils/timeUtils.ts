
import { Event, TimeSlot, User } from "@/types";
import {
  addHours,
  addMinutes,
  differenceInMinutes,
  eachHourOfInterval,
  endOfDay,
  format,
  formatDuration,
  getHours,
  getMinutes,
  isAfter,
  isBefore,
  isSameDay,
  isWithinInterval,
  startOfDay,
} from "date-fns";
import { it } from "date-fns/locale";

export const HOURS_IN_DAY = 24;
export const MINUTES_IN_HOUR = 60;
export const WORKING_HOURS_START = 8; // 8:00
export const WORKING_HOURS_END = 19; // 19:00

// Formattazione della durata dell'evento (es. "1 ora 30 minuti")
export const formatEventDuration = (start: Date, end: Date) => {
  const durationInMinutes = differenceInMinutes(end, start);
  
  const hours = Math.floor(durationInMinutes / 60);
  const minutes = durationInMinutes % 60;
  
  let result = "";
  if (hours > 0) {
    result += `${hours} ${hours === 1 ? "ora" : "ore"}`;
  }
  
  if (minutes > 0) {
    if (result.length > 0) result += " ";
    result += `${minutes} ${minutes === 1 ? "minuto" : "minuti"}`;
  }
  
  return result || "Meno di un minuto";
};

// Formatta un'ora (ad es. "9:30" o "14:00")
export const formatTime = (date: Date) => {
  return format(date, "HH:mm");
};

// Formatta il tempo in formato relativo (es. "Oggi alle 14:30")
export const formatTimeRelative = (date: Date) => {
  if (isSameDay(date, new Date())) {
    return `Oggi alle ${format(date, "HH:mm")}`;
  }
  return format(date, "EEEE d MMMM 'alle' HH:mm", { locale: it });
};

// Calcola la posizione verticale basata sull'ora
export const getPositionFromTime = (
  date: Date,
  hourHeight: number
): number => {
  const hours = getHours(date);
  const minutes = getMinutes(date);
  return (hours + minutes / MINUTES_IN_HOUR) * hourHeight;
};

// Trova slot liberi per un insieme di utenti e eventi
export const findFreeSlots = (
  users: User[],
  events: Event[],
  date: Date,
  selectedUserIds: string[] = []
): TimeSlot[] => {
  // Se non sono selezionati utenti, non calcolare
  if (selectedUserIds.length === 0) {
    return [];
  }

  const startTime = startOfDay(date);
  const endTime = endOfDay(date);
  
  // Crea slot per ogni ora della giornata
  const slots: TimeSlot[] = [];
  const hourIntervals = eachHourOfInterval({ start: startTime, end: endTime });
  
  for (let i = 0; i < hourIntervals.length - 1; i++) {
    slots.push({
      start: hourIntervals[i],
      end: hourIntervals[i + 1],
      userIds: [...selectedUserIds],
    });
  }
  
  // Filtra eventi per gli utenti selezionati e per il giorno specificato
  const relevantEvents = events.filter((event) => {
    // Verifica se l'evento coinvolge almeno uno degli utenti selezionati
    const hasSelectedUser = event.userIds.some((userId) =>
      selectedUserIds.includes(userId)
    );
    
    // Verifica se l'evento è nello stesso giorno
    const isSameDate = isSameDay(event.start, date);
    
    return hasSelectedUser && isSameDate;
  });
  
  // Rimuovi utenti dagli slot in base agli eventi
  for (const event of relevantEvents) {
    for (const slot of slots) {
      // Se c'è sovrapposizione, rimuovi gli utenti dell'evento dallo slot
      if (
        (isWithinInterval(event.start, { start: slot.start, end: slot.end }) ||
         isWithinInterval(event.end, { start: slot.start, end: slot.end }) ||
         (isBefore(event.start, slot.start) && isAfter(event.end, slot.end)))
      ) {
        // Rimuovi gli utenti dell'evento da questo slot
        slot.userIds = slot.userIds.filter(
          (userId) => !event.userIds.includes(userId)
        );
      }
    }
  }
  
  return slots;
};

// Funzione per ottenere slot di tempo consigliati per una durata specificata
export const getRecommendedSlots = (
  slots: TimeSlot[],
  durationInMinutes: number = 60,
  startHour: number = WORKING_HOURS_START,
  endHour: number = WORKING_HOURS_END
): TimeSlot[] => {
  // Filtriamo prima gli slot all'interno dell'orario di lavoro
  const workingSlots = slots.filter((slot) => {
    const slotHour = getHours(slot.start);
    return slotHour >= startHour && slotHour < endHour;
  });
  
  const recommendedSlots: TimeSlot[] = [];
  
  // Raggruppa slot consecutivi con gli stessi utenti liberi
  let currentGroup: TimeSlot[] = [];
  let currentUserIds: string[] = [];
  
  for (let i = 0; i < workingSlots.length; i++) {
    const slot = workingSlots[i];
    
    // Se è il primo slot o gli utenti sono gli stessi del gruppo corrente
    if (
      currentGroup.length === 0 ||
      (
        slot.userIds.length === currentUserIds.length &&
        slot.userIds.every(id => currentUserIds.includes(id)) &&
        currentUserIds.every(id => slot.userIds.includes(id))
      )
    ) {
      currentGroup.push(slot);
      currentUserIds = [...slot.userIds];
    } else {
      // Elabora il gruppo attuale se abbastanza lungo
      const totalMinutes = differenceInMinutes(
        currentGroup[currentGroup.length - 1].end,
        currentGroup[0].start
      );
      
      if (totalMinutes >= durationInMinutes && currentUserIds.length > 0) {
        recommendedSlots.push({
          start: currentGroup[0].start,
          end: addMinutes(currentGroup[0].start, durationInMinutes),
          userIds: currentUserIds,
        });
      }
      
      // Inizia un nuovo gruppo
      currentGroup = [slot];
      currentUserIds = [...slot.userIds];
    }
  }
  
  // Elabora l'ultimo gruppo
  if (currentGroup.length > 0) {
    const totalMinutes = differenceInMinutes(
      currentGroup[currentGroup.length - 1].end,
      currentGroup[0].start
    );
    
    if (totalMinutes >= durationInMinutes && currentUserIds.length > 0) {
      recommendedSlots.push({
        start: currentGroup[0].start,
        end: addMinutes(currentGroup[0].start, durationInMinutes),
        userIds: currentUserIds,
      });
    }
  }
  
  return recommendedSlots;
};

// Crea un esempio di evento per uno slot di tempo
export const createEventFromSlot = (slot: TimeSlot): Event => {
  return {
    id: `new-${Date.now()}`,
    title: "Nuovo evento",
    start: slot.start,
    end: slot.end,
    userIds: slot.userIds,
    color: "#9b87f5",
    type: "impegno",
  };
};
