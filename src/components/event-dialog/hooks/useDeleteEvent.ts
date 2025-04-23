
import { useCallback } from "react";

type UseDeleteEventProps = {
  onDelete: (eventId: string) => void;
};

export const useDeleteEvent = ({ onDelete }: UseDeleteEventProps) => {
  const deleteEvent = useCallback(
    (eventId: string) => {
      onDelete(eventId);
    },
    [onDelete]
  );

  return {
    deleteEvent,
  };
};
