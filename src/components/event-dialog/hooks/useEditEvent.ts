
import { useCallback } from "react";
import { Event } from "@/types";

type UseEditEventProps = {
  onEdit: (event: Event) => void;
};

export const useEditEvent = ({ onEdit }: UseEditEventProps) => {
  const editEvent = useCallback(
    (updatedEvent: Event) => {
      // Add validation or other logic if needed
      onEdit(updatedEvent);
    },
    [onEdit]
  );
  return {
    editEvent,
  };
};
