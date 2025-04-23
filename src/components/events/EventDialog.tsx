
import { useMediaQuery } from "@/hooks/use-media-query";
import { Dialog } from "@/components/ui/dialog";
import { Sheet } from "@/components/ui/sheet";
import { Event } from "@/types";
import { useEventDialog } from "./hooks/useEventDialog";
import { EventDialogContent } from "./components/EventDialogContent";
import { User } from "@/types";

interface EventDialogProps {
  event: Event | null;
  users: User[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Event) => void;
  onDelete?: (eventId: string) => void;
}

const EventDialog = ({
  event,
  users,
  isOpen,
  onClose,
  onSave,
  onDelete,
}: EventDialogProps) => {
  const {
    state,
    handlers,
    validation
  } = useEventDialog({
    event,
    users,
    onSave,
    onDelete,
    onClose
  });

  const isMobile = useMediaQuery("(max-width: 768px)");

  // Su dispositivi mobili, usa uno Sheet invece di un Dialog
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <EventDialogContent 
          state={state}
          handlers={handlers}
          validation={validation}
          users={users}
        />
      </Sheet>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <EventDialogContent 
        state={state}
        handlers={handlers}
        validation={validation}
        users={users}
      />
    </Dialog>
  );
};

export default EventDialog;
