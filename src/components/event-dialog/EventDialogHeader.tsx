
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { EventType } from "@/types";

interface EventDialogHeaderProps {
  isNew: boolean;
  isEditMode: boolean;
  startTime: Date | null;
  eventType: EventType;
}

export const EventDialogHeader = ({
  isNew,
  isEditMode,
  startTime,
  eventType
}: EventDialogHeaderProps) => (
  <DialogHeader>
    <DialogTitle>
      {isNew ? "Nuovo evento" : isEditMode ? "Modifica evento" : "Dettagli evento"}
    </DialogTitle>
    <div className="mt-1 text-sm text-muted-foreground">
      {startTime && format(startTime, "EEEE d MMMM yyyy")}
    </div>
    <div className="text-xs text-accent mt-0.5 capitalize">{eventType}</div>
  </DialogHeader>
);
