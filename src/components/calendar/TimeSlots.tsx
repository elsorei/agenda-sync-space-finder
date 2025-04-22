
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface TimeSlotsProps {
  intervals: Date[];
  hourHeight: number;
  onTimeSlotClick: (e: React.MouseEvent | React.TouchEvent, timeString: string) => void;
}

const TimeSlots = ({ intervals, hourHeight, onTimeSlotClick }: TimeSlotsProps) => {
  return (
    <div className="absolute left-0 top-0 w-full h-full pointer-events-auto">
      {intervals.map((interval, index) => {
        const timeStr = format(interval, "HH:mm");
        const isFullHour = timeStr.endsWith(":00");
        return (
          <div 
            key={index} 
            className={cn(
              "absolute left-0 w-full flex items-center",
              isFullHour ? "border-t border-gray-200" : "border-t border-gray-100"
            )}
            style={{ 
              top: `${index * (hourHeight / 2)}px`,
              height: `${hourHeight / 2}px` 
            }}
          >
            {isFullHour && (
              <span className="text-xs text-gray-500 ml-2">
                {timeStr}
              </span>
            )}
            <button 
              className="absolute left-0 top-0 w-full h-full z-10 hover:bg-blue-100 hover:bg-opacity-20 transition-colors touch-manipulation"
              style={{ touchAction: "manipulation" }}
              onClick={(e) => onTimeSlotClick(e, timeStr)}
              onTouchStart={(e) => onTimeSlotClick(e, timeStr)}
              aria-label={`Seleziona orario ${timeStr}`}
            />
          </div>
        );
      })}
    </div>
  );
};

export default TimeSlots;
