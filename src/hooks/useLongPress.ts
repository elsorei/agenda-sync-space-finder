
import { useRef, useCallback, useEffect } from "react";

export type UseLongPressOptions = {
  delay?: number; // ms
  cancelOnMove?: boolean;
};

type Callback = (e: React.MouseEvent | React.TouchEvent) => void;

export function useLongPress(
  onLongPress: Callback,
  {
    delay = 500,
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
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = undefined;
    eventRef.current = null;
  }, []);

  return {
    onMouseDown: (e) => start(e),
    onMouseUp: clear,
    onMouseLeave: clear,
    onTouchStart: (e) => start(e),
    onTouchEnd: clear,
    onTouchMove: () => {
      if (cancelOnMove) movedRef.current = true;
    },
  };
}
