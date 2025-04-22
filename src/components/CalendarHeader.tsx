
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Calendar, ChevronLeft, ChevronRight, Users, RefreshCw } from "lucide-react";
import { format, subDays, addDays } from "date-fns";
import { it } from "date-fns/locale";

interface CalendarHeaderProps {
  date: Date;
  onDateChange: (date: Date) => void;
  view: 'day' | 'week' | 'month';
  onViewChange: (view: 'day' | 'week' | 'month') => void;
  onFindFreeSlots: () => void;
  onRefresh?: () => void; // Aggiungiamo la proprietà opzionale
}

const CalendarHeader = ({
  date,
  onDateChange,
  view,
  onViewChange,
  onFindFreeSlots,
  onRefresh
}: CalendarHeaderProps) => {
  const goToPrevious = () => {
    const newDate = subDays(date, 1);
    onDateChange(newDate);
  };

  const goToNext = () => {
    const newDate = addDays(date, 1);
    onDateChange(newDate);
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border-b gap-4">
      <div className="flex items-center gap-2">
        <Calendar className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-bold">Agenda Sync</h1>
      </div>
      
      <div className="flex items-center gap-2">
        <Button onClick={goToPrevious} size="icon" variant="outline">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button onClick={goToToday} variant="outline" className="hidden sm:flex">
          Oggi
        </Button>
        <div className="text-lg font-semibold px-2 min-w-[150px] text-center">
          {format(date, "EEEE d MMMM", { locale: it })}
        </div>
        <Button onClick={goToNext} size="icon" variant="outline">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex items-center gap-2">
        <Select value={view} onValueChange={(v) => onViewChange(v as any)}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Vista" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Giorno</SelectItem>
            <SelectItem value="week">Settimana</SelectItem>
            <SelectItem value="month">Mese</SelectItem>
          </SelectContent>
        </Select>
        
        {onRefresh && (
          <Button onClick={onRefresh} variant="outline" size="icon" title="Aggiorna eventi">
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
        
        <Button onClick={onFindFreeSlots} variant="outline" className="gap-2">
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">Trova spazi liberi</span>
        </Button>
      </div>
    </div>
  );
};

export default CalendarHeader;
