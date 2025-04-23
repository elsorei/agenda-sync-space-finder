
import { useRef } from "react";

export function useDoubleTap(
  onDoubleTap: (e: React.MouseEvent | React.TouchEvent) => void,
  delay = 300
) {
  const lastTap = useRef<number | null>(null);

  function handler(e: React.MouseEvent | React.TouchEvent) {
    const now = Date.now();
    if (lastTap.current && now - lastTap.current < delay) {
      onDoubleTap(e);
      lastTap.current = null;
    } else {
      lastTap.current = now;
    }
  }

  return handler;
}
