
import { toast } from "@/hooks/use-toast";

interface UseEventValidationProps {
  title: string;
  startTime: Date | null;
  endTime: Date | null;
  selectedUserIds: string[];
}

export const useEventValidation = ({
  title,
  startTime,
  endTime,
  selectedUserIds
}: UseEventValidationProps) => {
  const validateEvent = () => {
    if (!startTime || !endTime) {
      toast({
        title: "Errore",
        description: "Devi selezionare un orario di inizio e fine valido.",
        variant: "destructive",
      });
      return false;
    }
    if (selectedUserIds.length === 0) {
      toast({
        title: "Errore",
        description: "Devi selezionare almeno un utente invitato.",
        variant: "destructive",
      });
      return false;
    }
    if (title.trim() === "") {
      toast({
        title: "Errore",
        description: "Il titolo dell'evento non può essere vuoto.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  return { validateEvent };
};
