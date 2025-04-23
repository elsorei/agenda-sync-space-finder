
import { Dialog } from "@/components/ui/dialog";
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
