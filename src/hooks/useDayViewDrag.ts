
import { useState, useEffect } from "react";
import { Event } from "@/types";

export function useDayViewDrag() {
  const [draggingEvent, setDraggingEvent] = useState<{ event: Event, yOffset: number } | null>(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (dragActive) {
      document.body.style.userSelect = "none";
      document.body.style.overflow = "hidden";
      
      const handleGlobalMouseUp = () => {
        setDragActive(false);
        setDraggingEvent(null);
      };
      
      window.addEventListener("mouseup", handleGlobalMouseUp);
      window.addEventListener("touchend", handleGlobalMouseUp);
      
      return () => {
        window.removeEventListener("mouseup", handleGlobalMouseUp);
        window.removeEventListener("touchend", handleGlobalMouseUp);
      };
    } else {
      document.body.style.userSelect = "";
      document.body.style.overflow = "";
    }
  }, [dragActive]);

  return {
    draggingEvent,
    setDraggingEvent,
    dragActive,
    setDragActive
  };
}
