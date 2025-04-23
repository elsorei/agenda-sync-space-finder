
import { useRef, useCallback } from "react";

export type UseLongPressOptions = {
  delay?: number;
  cancelOnMove?: boolean;
};

type Callback = (e: React.MouseEvent | React.TouchEvent) => void;

export function useLongPress(
  onLongPress: Callback,
  {
    delay = 700,
    cancelOnMove = true,
  }: UseLongPressOptions = {}
): {
  onMouseDown: (e: React.MouseEvent) => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
  onTouchEnd: () => void;
  onTouchMove: () => void;
} {
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const eventRef = useRef<React.MouseEvent | React.TouchEvent | null>(null);
  const movedRef = useRef(false);

  const start = useCallback(
    (event: React.MouseEvent | React.TouchEvent) => {
      // Don't prevent default on touch events immediately to allow scrolling
      // Only make sure the event is stored for later use
      movedRef.current = false;
      eventRef.current = event;
      
      // Cancel any existing timeout
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      
      // Start a new timeout for long press
      timerRef.current = setTimeout(() => {
        if (!movedRef.current && eventRef.current) {
          // Only now prevent default to avoid triggering other events
          eventRef.current.preventDefault?.();
          onLongPress(eventRef.current);
        }
      }, delay);
    },
    [onLongPress, delay]
  );

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }
    eventRef.current = null;
  }, []);

  const handleMove = useCallback(() => {
    if (cancelOnMove) {
      movedRef.current = true;
      clear();
    }
  }, [cancelOnMove, clear]);

  return {
    onMouseDown: (e) => start(e),
    onMouseUp: clear,
    onMouseLeave: clear,
    onTouchStart: (e) => start(e),
    onTouchEnd: clear,
    onTouchMove: handleMove,
  };
}
