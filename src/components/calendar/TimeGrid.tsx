
import React from "react";
import { format } from "date-fns";

interface TimeGridProps {
  timeSlots: Date[];
  hourHeight: number;
  onTimeSlotClick: (e: React.MouseEvent | React.TouchEvent, timeString: string) => void;
  onTimeSlotLongPress: (e: React.MouseEvent | React.TouchEvent, timeString: string) => void;
  isDialogOpen: boolean;
}

const TimeGrid = ({
  timeSlots,
  hourHeight,
  onTimeSlotClick,
  onTimeSlotLongPress,
  isDialogOpen
}: TimeGridProps) => {
  return (
    <>
      {timeSlots.map((timeSlot, index) => {
        const timeString = format(timeSlot, 'HH:mm');
        
        return (
          <div
            key={index}
            className="relative border-t border-border"
            style={{
              gridRowStart: index + 1,
              height: hourHeight,
            }}
          >
            <div className="absolute left-2 top-0.5 text-xs text-muted-foreground">
              {timeString}
            </div>
            <button
              className="absolute inset-0 w-full h-full opacity-0 hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 disabled:cursor-not-allowed data-[disabled=true]:pointer-events-none"
              onClick={(e) => onTimeSlotClick(e, timeString)}
              onTouchStart={(e) => onTimeSlotLongPress(e, timeString)}
              onMouseDown={(e) => {
                if (!('touches' in e)) {
                  onTimeSlotClick(e, timeString);
                }
              }}
              onContextMenu={(e) => e.preventDefault()}
              disabled={isDialogOpen}
            />
          </div>
        );
      })}
    </>
  );
};

export default TimeGrid;
