
import { toast } from "@/hooks/use-toast";

interface UseEventValidationProps {
  title: string;
  startTime: Date | null;
  endTime: Date | null;
  selectedUserIds: string[];
  rsvpDeadline?: Date;
  availableUntil?: Date;
}

export const useEventValidation = ({
  title,
  startTime,
  endTime,
  selectedUserIds,
  rsvpDeadline,
  availableUntil
}: UseEventValidationProps) => {
  const validateEvent = () => {
    // Validare il titolo
    if (!title.trim()) {
      toast({
        title: "Errore di validazione",
        description: "Il titolo dell'evento è obbligatorio",
        variant: "destructive"
      });
      return false;
    }

    // Validare l'ora di inizio e fine
    if (!startTime || !endTime) {
      toast({
        title: "Errore di validazione",
        description: "Le date di inizio e fine sono obbligatorie",
        variant: "destructive"
      });
      return false;
    }

    // Validare che l'ora di inizio sia prima dell'ora di fine
    if (startTime >= endTime) {
      toast({
        title: "Errore di validazione",
        description: "L'ora di inizio deve essere precedente all'ora di fine",
        variant: "destructive"
      });
      return false;
    }

    // Validare che gli utenti siano selezionati
    if (selectedUserIds.length === 0) {
      toast({
        title: "Errore di validazione",
        description: "Devi selezionare almeno un partecipante",
        variant: "destructive"
      });
      return false;
    }

    // Validare la scadenza RSVP se presente
    if (rsvpDeadline && startTime && rsvpDeadline >= startTime) {
      toast({
        title: "Errore di validazione",
        description: "La scadenza per le risposte deve essere prima dell'inizio dell'evento",
        variant: "destructive"
      });
      return false;
    }

    // Validare la scadenza della disponibilità se presente
    if (availableUntil && startTime && availableUntil >= startTime) {
      toast({
        title: "Errore di validazione",
        description: "La disponibilità deve scadere prima dell'inizio dell'evento",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  return {
    validateEvent
  };
};
