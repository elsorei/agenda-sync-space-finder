
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';
import { Calendar, Download, Settings } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { GoogleCalendarSetup } from './GoogleCalendarSetup';
import { addDays, subDays } from 'date-fns';

interface GoogleCalendarSyncProps {
  currentDate: Date;
  onEventsSync: (events: any[]) => void;
}

export const GoogleCalendarSync = ({ currentDate, onEventsSync }: GoogleCalendarSyncProps) => {
  const { isSignedIn, syncEvents, isLoading } = useGoogleCalendar();
  const [isOpen, setIsOpen] = useState(false);

  const handleSync = async () => {
    if (!isSignedIn) return;

    // Sincronizza eventi per una settimana prima e dopo la data corrente
    const startDate = subDays(currentDate, 7);
    const endDate = addDays(currentDate, 7);
    
    try {
      const events = await syncEvents(startDate, endDate);
      onEventsSync(events);
    } catch (error) {
      console.error('Errore nella sincronizzazione:', error);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className={isSignedIn ? 'border-green-500 text-green-600' : ''}
        >
          <Calendar className="h-4 w-4 mr-2" />
          {isSignedIn ? 'Google Calendar' : 'Connetti Google'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <GoogleCalendarSetup />
          {isSignedIn && (
            <Button 
              onClick={handleSync} 
              disabled={isLoading}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              {isLoading ? 'Sincronizzazione...' : 'Sincronizza eventi'}
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
