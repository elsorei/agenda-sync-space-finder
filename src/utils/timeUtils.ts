
import { Event, TimeSlot, User } from '../types';
import { 
  addMinutes, 
  areIntervalsOverlapping, 
  compareAsc, 
  eachMinuteOfInterval, 
  endOfDay, 
  format, 
  isSameDay, 
  startOfDay 
} from 'date-fns';

// Format time as HH:MM
export const formatTime = (date: Date): string => {
  return format(date, 'HH:mm');
};

// Format date as DD/MM/YYYY
export const formatDate = (date: Date): string => {
  return format(date, 'dd/MM/yyyy');
};

// Get hours for day view (typically 8:00 to 20:00)
export const getDayViewHours = (): string[] => {
  return Array.from({ length: 16 }, (_, i) => {
    const hour = i + 7; // Start from 7:00
    return `${hour.toString().padStart(2, '0')}:00`;
  });
};

// Filter events for a specific date
export const filterEventsForDate = (events: Event[], date: Date): Event[] => {
  return events.filter(event => isSameDay(event.start, date));
};

// Filter events for a specific user
export const filterEventsForUser = (events: Event[], userId: string): Event[] => {
  return events.filter(event => event.userIds.includes(userId));
};

// Check if a time is occupied for a user
export const isTimeOccupied = (
  time: Date,
  userId: string,
  events: Event[]
): boolean => {
  const userEvents = filterEventsForUser(events, userId);
  return userEvents.some(event => time >= event.start && time < event.end);
};

// Find common free slots for multiple users
export const findCommonFreeSlots = (
  users: string[],
  events: Event[],
  date: Date,
  slotDuration: number = 30 // in minutes
): TimeSlot[] => {
  const startTime = startOfDay(date);
  const endTime = endOfDay(date);
  
  // Create 30-minute intervals for the day
  const timeIntervals = eachMinuteOfInterval(
    { start: startTime, end: endTime },
    { step: slotDuration }
  );
  
  // Initialize all slots as free
  let slots: TimeSlot[] = timeIntervals
    .slice(0, -1) // Exclude the last interval endpoint
    .map((start, index) => ({
      start,
      end: timeIntervals[index + 1],
      users: [],
      isFree: true
    }));
  
  // Mark slots as busy based on user events
  users.forEach(userId => {
    const userEvents = filterEventsForUser(events, userId);
    
    slots = slots.map(slot => {
      const slotInterval = { start: slot.start, end: slot.end };
      
      const isBusy = userEvents.some(event => 
        areIntervalsOverlapping(
          slotInterval, 
          { start: event.start, end: event.end }
        )
      );
      
      if (isBusy) {
        return {
          ...slot,
          users: [...slot.users, userId],
          isFree: false
        };
      }
      
      return slot;
    });
  });
  
  // Find free slots for all selected users
  const freeSlots = slots.filter(slot => {
    // Is this time slot free for all selected users?
    return slot.users.length === 0;
  });
  
  // Merge consecutive free slots
  const mergedFreeSlots: TimeSlot[] = [];
  let currentSlot: TimeSlot | null = null;
  
  freeSlots.forEach(slot => {
    if (!currentSlot) {
      currentSlot = { ...slot };
    } else if (currentSlot.end.getTime() === slot.start.getTime()) {
      // Merge with previous slot
      currentSlot.end = slot.end;
    } else {
      // Push the current slot and start a new one
      mergedFreeSlots.push(currentSlot);
      currentSlot = { ...slot };
    }
  });
  
  // Don't forget the last slot
  if (currentSlot) {
    mergedFreeSlots.push(currentSlot);
  }
  
  return mergedFreeSlots;
};

// Get position and height for an event in the day view
export const getEventStyle = (
  event: Event, 
  hourHeight: number, 
  dayStart: Date = startOfDay(event.start)
) => {
  const dayStartHours = dayStart.getHours();
  const eventStartHours = event.start.getHours() + event.start.getMinutes() / 60;
  const eventEndHours = event.end.getHours() + event.end.getMinutes() / 60;
  
  const top = (eventStartHours - dayStartHours) * hourHeight;
  const height = (eventEndHours - eventStartHours) * hourHeight;
  
  return { top, height };
};

// Create a new empty event
export const createEmptyEvent = (
  userIds: string[],
  start: Date,
  durationMinutes: number = 60
): Event => {
  const end = addMinutes(start, durationMinutes);
  
  return {
    id: `new-event-${Date.now()}`,
    userIds,
    title: 'Nuovo evento',
    start,
    end,
  };
};
