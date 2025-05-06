
import { toast } from "@/hooks/use-toast";

interface UseEventDialogUserHandlersProps {
  isEditMode: boolean;
  setSelectedUserIds: React.Dispatch<React.SetStateAction<string[]>>;
  setReserveUserIds: React.Dispatch<React.SetStateAction<string[]>>;
}

export const useEventDialogUserHandlers = ({
  isEditMode,
  setSelectedUserIds,
  setReserveUserIds
}: UseEventDialogUserHandlersProps) => {
  // Toggle a user in the primary guest list
  const onToggleUser = (userId: string) => {
    if (!isEditMode) {
      toast({
        title: "Modalità sola lettura",
        description: "Clicca su 'Modifica' per abilitare le modifiche",
      });
      return;
    }

    setSelectedUserIds(prev => {
      const isSelected = prev.includes(userId);
      // If adding to main users, remove from reserves if present
      if (!isSelected) {
        setReserveUserIds(reserves => reserves.filter(id => id !== userId));
      }
      return isSelected 
        ? prev.filter(id => id !== userId) 
        : [...prev, userId];
    });
  };

  // Toggle a user in the reserves list
  const onToggleReserveUser = (userId: string, isReserve: boolean) => {
    if (!isEditMode) {
      toast({
        title: "Modalità sola lettura",
        description: "Clicca su 'Modifica' per abilitare le modifiche",
      });
      return;
    }
    
    if (isReserve) {
      // Adding to reserves: remove from primary guests if present
      setSelectedUserIds(prev => prev.filter(id => id !== userId));
      // Add to reserves if not already there
      setReserveUserIds(prev => {
        if (prev.includes(userId)) {
          return prev;
        }
        return [...prev, userId];
      });
    } else {
      // Remove from reserves
      setReserveUserIds(prev => prev.filter(id => id !== userId));
    }
  };

  return {
    onToggleUser,
    onToggleReserveUser
  };
};
