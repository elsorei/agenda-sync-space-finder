
import { useCallback } from "react";
import { Event } from "@/types";

type UseCreateEventProps = {
  onCreate: (event: Event) => void;
};

export const useCreateEvent = ({ onCreate }: UseCreateEventProps) => {
  const createEvent = useCallback(
    (event: Event) => {
      // Do any additional validation or enrichment here if needed in the future
      onCreate(event);
    },
    [onCreate]
  );

  return {
    createEvent,
  };
};
