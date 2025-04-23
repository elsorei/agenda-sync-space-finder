
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
  const eventRef = useRef<any>(null);
  const movedRef = useRef(false);

  const start = useCallback(
    (event: any) => {
      event.persist?.();
      event.preventDefault?.();
      
      movedRef.current = false;
      eventRef.current = event;
      timerRef.current = setTimeout(() => {
        if (!movedRef.current) {
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
    onTouchStart: (e) => {
      e.preventDefault();
      start(e);
    },
    onTouchEnd: clear,
    onTouchMove: handleMove,
  };
}
