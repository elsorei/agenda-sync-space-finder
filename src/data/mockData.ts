
import { User, Event } from '../types';
import { addHours, setHours, setMinutes, startOfDay } from 'date-fns';

// Mock users
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Mario Rossi',
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=1',
    color: '#3498db',
  },
  {
    id: '2',
    name: 'Giulia Bianchi',
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=2',
    color: '#e74c3c',
  },
  {
    id: '3',
    name: 'Luca Verdi',
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=3',
    color: '#2ecc71',
  },
  {
    id: '4',
    name: 'Sofia Ferrari',
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=4',
    color: '#f39c12',
  },
];

// Helper function to create a date at a specific hour/minute
const createTime = (date: Date, hour: number, minute: number = 0): Date => {
  const newDate = new Date(date);
  return setMinutes(setHours(newDate, hour), minute);
};

// Generate mock events for today
export const generateMockEvents = (date: Date): Event[] => {
  const baseDate = startOfDay(date);
  
  return [
    {
      id: '1',
      userIds: ['1'],
      title: 'Riunione di team',
      description: 'Discussione su nuovi progetti',
      start: createTime(baseDate, 9),
      end: createTime(baseDate, 10, 30),
      color: '#3498db',
    },
    {
      id: '2',
      userIds: ['1'],
      title: 'Pranzo con cliente',
      start: createTime(baseDate, 12, 30),
      end: createTime(baseDate, 14),
      color: '#3498db',
    },
    {
      id: '3',
      userIds: ['1'],
      title: 'Call con partner',
      start: createTime(baseDate, 16),
      end: createTime(baseDate, 17),
      color: '#3498db',
    },
    {
      id: '4',
      userIds: ['2'],
      title: 'Sessione di formazione',
      start: createTime(baseDate, 10),
      end: createTime(baseDate, 11, 30),
      color: '#e74c3c',
    },
    {
      id: '5',
      userIds: ['2'],
      title: 'Revisione documenti',
      start: createTime(baseDate, 14),
      end: createTime(baseDate, 16),
      color: '#e74c3c',
    },
    {
      id: '6',
      userIds: ['3'],
      title: 'Progettazione UI',
      start: createTime(baseDate, 9, 30),
      end: createTime(baseDate, 12),
      color: '#2ecc71',
    },
    {
      id: '7',
      userIds: ['3'],
      title: 'Sviluppo frontend',
      start: createTime(baseDate, 15),
      end: createTime(baseDate, 18),
      color: '#2ecc71',
    },
    {
      id: '8',
      userIds: ['4'],
      title: 'Analisi dati',
      start: createTime(baseDate, 11),
      end: createTime(baseDate, 13),
      color: '#f39c12',
    },
    {
      id: '9',
      userIds: ['4'],
      title: 'Piano marketing',
      start: createTime(baseDate, 14, 30),
      end: createTime(baseDate, 15, 45),
      color: '#f39c12',
    },
  ];
};

// Create a new event
export const createEvent = (
  userIds: string[],
  title: string,
  start: Date,
  end: Date
): Event => {
  const user = mockUsers.find(u => u.id === userIds[0]);
  return {
    id: `event-${Date.now()}`,
    userIds,
    title,
    start,
    end,
    color: user?.color,
  };
};
