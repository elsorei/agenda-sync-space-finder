
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format, addDays, addHours } from "date-fns";
import { it } from "date-fns/locale";
import { Clock } from "lucide-react";

interface RsvpDeadlineFieldProps {
  rsvpDeadline: Date | undefined;
  onDeadlineChange: (deadline: Date | undefined) => void;
  eventDate: Date | null;
  isReadOnly: boolean;
}

export const RsvpDeadlineField = ({
  rsvpDeadline,
  onDeadlineChange,
  eventDate,
  isReadOnly,
}: RsvpDeadlineFieldProps) => {
  const [isEnabled, setIsEnabled] = useState(!!rsvpDeadline);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    rsvpDeadline || (eventDate ? addDays(new Date(eventDate), -1) : addDays(new Date(), 1))
  );

  const handleToggle = (checked: boolean) => {
    if (isReadOnly) return;
    
    setIsEnabled(checked);
    if (checked) {
      const newDate = eventDate 
        ? addDays(new Date(eventDate), -1) 
        : addDays(new Date(), 1);
      setSelectedDate(newDate);
      onDeadlineChange(newDate);
    } else {
      onDeadlineChange(undefined);
    }
  };

  const handleDateChange = (date: Date | undefined) => {
    if (isReadOnly || !date) return;
    
    setSelectedDate(date);
    onDeadlineChange(date);
  };

  // Imposta le date predefinite per la selezione rapida
  const setQuickDate = (hours: number) => {
    if (isReadOnly) return;

    const newDate = addHours(new Date(), hours);
    setSelectedDate(newDate);
    onDeadlineChange(newDate);
  };

  return (
    <div className="flex flex-col gap-2 mt-4 mb-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="rsvp-deadline" className="text-sm font-medium">
          Termine per risposta
        </Label>
        <Switch
          id="rsvp-deadline"
          checked={isEnabled}
          onCheckedChange={handleToggle}
          disabled={isReadOnly}
        />
      </div>
      
      {isEnabled && (
        <div className="flex flex-col gap-2">
          {!isReadOnly && (
            <div className="flex gap-2 my-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setQuickDate(6)}
                type="button"
              >
                6 ore
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setQuickDate(24)}
                type="button"
              >
                24 ore
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setQuickDate(48)}
                type="button"
              >
                48 ore
              </Button>
            </div>
          )}
          
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={
                  "justify-start text-left font-normal " +
                  (isReadOnly ? "cursor-default" : "")
                }
                disabled={isReadOnly}
              >
                <Clock className="mr-2 h-4 w-4" />
                {selectedDate
                  ? format(selectedDate, "PPP '-' HH:mm", { locale: it })
                  : "Seleziona una data"}
              </Button>
            </PopoverTrigger>
            {!isReadOnly && (
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateChange}
                  initialFocus
                  locale={it}
                />
              </PopoverContent>
            )}
          </Popover>
          
          {selectedDate && eventDate && selectedDate > new Date(eventDate) && (
            <p className="text-destructive text-sm">
              La scadenza non può essere dopo l'inizio dell'evento.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
