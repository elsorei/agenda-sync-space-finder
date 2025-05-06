
import { toast } from "@/hooks/use-toast";

interface UseEventDialogValidationProps {
  title: string;
  startTime: Date | null;
  endTime: Date | null;
  selectedUserIds: string[];
}

export const useEventDialogValidation = ({
  title,
  startTime,
  endTime,
  selectedUserIds
}: UseEventDialogValidationProps) => {
  const validateForm = () => {
    if (!startTime || !endTime) {
      toast({
        title: "Errore",
        description: "Seleziona orari di inizio e fine validi",
        variant: "destructive",
      });
      return false;
    }

    if (selectedUserIds.length === 0) {
      toast({
        title: "Errore",
        description: "Seleziona almeno un utente",
        variant: "destructive",
      });
      return false;
    }

    if (!title.trim()) {
      toast({
        title: "Errore",
        description: "Inserisci un titolo per l'evento",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  return {
    validateForm
  };
};
