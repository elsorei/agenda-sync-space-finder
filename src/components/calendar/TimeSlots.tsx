
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useLongPress } from "@/hooks/useLongPress";
import { useDoubleTap } from "@/hooks/useDoubleTap";
import { useIsMobile } from "@/hooks/use-mobile";

interface TimeSlotsProps {
  intervals: Date[];
  hourHeight: number;
  onTimeSlotClick: (e: React.MouseEvent | React.TouchEvent, timeString: string) => void;
  onTimeSlotLongPress?: (e: React.MouseEvent | React.TouchEvent, timeString: string) => void;
}

const TimeSlots = ({
  intervals,
  hourHeight,
  onTimeSlotClick,
  onTimeSlotLongPress,
}: TimeSlotsProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="absolute left-0 top-0 w-full h-full pointer-events-auto touch-pan-y">
      {intervals.map((interval, index) => {
        const timeStr = format(interval, "HH:mm");
        const isFullHour = timeStr.endsWith(":00");
        
        // Setup double tap handler for mobile
        const doubleTapHandler = useDoubleTap((e) => {
          if (isMobile) {
            onTimeSlotClick(e, timeStr);
          }
        }, 300);

        // Only setup long press handler if we're on mobile and have the callback
        const longPressHandler = isMobile && onTimeSlotLongPress
          ? useLongPress(
              (e) => {
                if (isMobile && onTimeSlotLongPress) {
                  onTimeSlotLongPress(e, timeStr);
                }
              },
              { delay: 700, cancelOnMove: true }
            )
          : {
              onMouseDown: () => {},
              onTouchStart: () => {},
              onMouseUp: () => {},
              onMouseLeave: () => {},
              onTouchEnd: () => {},
              onTouchMove: () => {}
            };

        const handleClick = (e: React.MouseEvent) => {
          // Only allow click on desktop, not on mobile
          if (!isMobile) {
            onTimeSlotClick(e, timeStr);
          }
        };

        return (
          <div
            key={index}
            className={cn(
              "absolute left-0 w-full flex items-center",
              isFullHour ? "border-t border-gray-200" : "border-t border-gray-100"
            )}
            style={{
              top: `${index * (hourHeight / 2)}px`,
              height: `${hourHeight / 2}px`,
            }}
          >
            {isFullHour && (
              <span className="text-xs text-gray-500 ml-2">
                {timeStr}
              </span>
            )}
            <button
              className="absolute left-0 top-0 w-full h-full z-10 hover:bg-blue-100 hover:bg-opacity-20 transition-colors"
              aria-label={`Seleziona orario ${timeStr}`}
              onClick={handleClick}
              onTouchStart={longPressHandler.onTouchStart}
              onTouchEnd={(e) => {
                e.preventDefault(); // Prevent the click event from firing
                longPressHandler.onTouchEnd();
                // We don't call doubleTapHandler here to prevent accidental time slot selection
              }}
              onTouchMove={longPressHandler.onTouchMove}
              onMouseDown={longPressHandler.onMouseDown}
              onMouseUp={longPressHandler.onMouseUp}
              onMouseLeave={longPressHandler.onMouseLeave}
            />
          </div>
        );
      })}
    </div>
  );
};

export default TimeSlots;
