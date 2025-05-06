
import React from 'react';
import EventItemContent from './EventItemContent';
import EventContextMenu from './EventContextMenu';
import { Event, User } from '@/types';
import { cn } from '@/lib/utils';
import { useEventInteractions } from '@/hooks/useEventInteractions';
import { Clock } from 'lucide-react';

interface EventItemProps {
  event: Event;
  users: User[];
  mainUserId?: string; // Added mainUserId property
  onClick: (event: Event) => void;
  onDoubleClick?: (event: Event) => void;
  onContextMenu?: (event: Event) => void;
  isSelected?: boolean;
  showTime?: boolean;
  displayMode?: 'block' | 'line' | 'compact';
  className?: string;
}

export const EventItem = React.forwardRef<HTMLDivElement, EventItemProps>(({ 
  event, 
  users, 
  mainUserId,
  onClick, 
  onDoubleClick, 
  onContextMenu,
  isSelected = false,
  showTime = true,
  displayMode = 'block',
  className = '',
}, ref) => {
  const {
    handlers,
    isMobile,
    contextMenuOpen,
    contextMenuPosition,
    closeContextMenu
  } = useEventInteractions({
    event,
    isSelected,
    onClick,
    onDoubleClick,
    onContextMenu
  });

  // Ottieni gli utenti associati all'evento
  const eventUsers = users.filter(user => event.userIds.includes(user.id));
  
  // Determina se ci sono invitati che non hanno confermato
  const hasPendingInvites = event.inviteStatus && 
    Object.values(event.inviteStatus).some(status => status === 'pending');
  
  // Determina se l'evento ha una scadenza per le risposte
  const hasDeadline = !!event.rsvpDeadline;
  
  // Determina se l'evento ha una data di disponibilità
  const hasAvailableUntil = !!event.availableUntil;

  // Classe per il bordo tratteggiato se c'è una scadenza
  const borderClass = hasDeadline || hasAvailableUntil ? 'border-dashed' : 'border-solid';

  return (
    <div
      ref={ref}
      className={cn(
        'group relative rounded-md border p-2 text-sm overflow-hidden transition-shadow cursor-pointer',
        borderClass,
        isSelected ? 'ring-2 ring-primary' : 'hover:shadow-md',
        `bg-${event.color || 'primary'}/20 border-${event.color || 'primary'}/30`,
        className
      )}
      style={{ 
        backgroundColor: `${event.color}20`,
        borderColor: `${event.color}30`
      }}
      {...handlers}
    >
      {(hasDeadline || hasAvailableUntil) && (
        <div className="absolute top-1 right-1">
          <Clock className="h-3 w-3 text-muted-foreground" aria-label="Scadenza impostata" />
        </div>
      )}
      
      <EventItemContent 
        event={event} 
        user={eventUsers[0]}
        height={70}
      />
      
      {contextMenuOpen && onContextMenu && (
        <EventContextMenu
          event={event}
          position={contextMenuPosition}
          onClose={closeContextMenu}
          onSelect={onContextMenu}
        >
          <div></div>
        </EventContextMenu>
      )}
    </div>
  );
});

EventItem.displayName = 'EventItem';

export default EventItem;
