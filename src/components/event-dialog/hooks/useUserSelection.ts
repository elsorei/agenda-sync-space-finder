
import { toast } from "@/hooks/use-toast";

interface UseUserSelectionProps {
  isEditMode: boolean;
  setSelectedUserIds: (f: ((prev: string[]) => string[]) | string[]) => void;
}

export const useUserSelection = ({
  isEditMode,
  setSelectedUserIds
}: UseUserSelectionProps) => {
  const onToggleUser = (userId: string) => {
    if (!isEditMode) {
      toast({
        title: "Modalità sola lettura",
        description: "Clicca su 'Modifica' per abilitare le modifiche",
      });
      return;
    }
    setSelectedUserIds(prev =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  return { onToggleUser };
};
