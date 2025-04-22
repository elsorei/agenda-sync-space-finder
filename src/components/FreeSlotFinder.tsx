
import { useState, useEffect } from "react";
import { TimeSlotFinderProps, TimeSlot } from "@/types";
import { findCommonFreeSlots, formatTime } from "@/utils/timeUtils";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { UserAvatar } from "./UserAvatar";
import { cn } from "@/lib/utils";

const FreeSlotFinder = ({
  users,
  events,
  selectedUsers,
  date,
  onSlotSelect
}: TimeSlotFinderProps) => {
  const [freeSlots, setFreeSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  
  useEffect(() => {
    if (selectedUsers.length === 0) {
      setFreeSlots([]);
      return;
    }
    
    const slots = findCommonFreeSlots(users, events, date, selectedUsers);
    // Filter for business hours (8am-7pm)
    const businessHoursSlots = slots.filter(slot => {
      const hour = slot.start.getHours();
      return hour >= 8 && hour < 19;
    });
    
    setFreeSlots(businessHoursSlots);
    setSelectedSlot(null);
  }, [selectedUsers, events, date, users]);
  
  const handleSlotClick = (slot: TimeSlot) => {
    setSelectedSlot(slot);
  };
  
  const handleCreateEvent = () => {
    if (selectedSlot && onSlotSelect) {
      onSlotSelect(
        selectedSlot.start,
        selectedSlot.end,
        selectedUsers
      );
    }
  };
  
  // Get the selected users' data
  const selectedUsersData = users.filter(user => 
    selectedUsers.includes(user.id)
  );
  
  const slotDuration = (slot: TimeSlot) => {
    const durationMs = slot.end.getTime() - slot.start.getTime();
    const durationMinutes = durationMs / (1000 * 60);
    
    if (durationMinutes < 60) {
      return `${durationMinutes} min`;
    }
    
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    
    if (minutes === 0) {
      return `${hours} ${hours === 1 ? 'ora' : 'ore'}`;
    }
    
    return `${hours} ${hours === 1 ? 'ora' : 'ore'} e ${minutes} min`;
  };
  
  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white">
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">
          Trova spazi liberi comuni
        </h2>
        <p className="text-sm text-muted-foreground">
          {selectedUsers.length === 0 
            ? "Seleziona almeno un utente per trovare spazi liberi." 
            : `Spazi liberi comuni per ${selectedUsersData.length} ${selectedUsersData.length === 1 ? 'utente' : 'utenti'}`}
        </p>
        
        {selectedUsersData.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {selectedUsersData.map(user => (
              <UserAvatar key={user.id} user={user} size="sm" showName />
            ))}
          </div>
        )}
      </div>
      
      <Separator className="my-4" />
      
      {selectedUsers.length > 0 && (
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
          {freeSlots.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              Nessuno spazio libero comune trovato per oggi.
            </p>
          ) : (
            freeSlots.map((slot, index) => (
              <div
                key={index}
                className={cn(
                  "p-3 rounded-md cursor-pointer transition-colors free-slot",
                  selectedSlot === slot ? "bg-calendar-selected/20 border-calendar-selected border-solid" : ""
                )}
                onClick={() => handleSlotClick(slot)}
              >
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-primary" />
                  <span className="font-medium">
                    {formatTime(slot.start)} - {formatTime(slot.end)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground ml-6">
                  Durata: {slotDuration(slot)}
                </p>
              </div>
            ))
          )}
        </div>
      )}
      
      {selectedSlot && (
        <div className="mt-4 pt-4 border-t">
          <Button 
            onClick={handleCreateEvent}
            className="w-full"
          >
            Crea evento in questo spazio
          </Button>
        </div>
      )}
    </div>
  );
};

export default FreeSlotFinder;
