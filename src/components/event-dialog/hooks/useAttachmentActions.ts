
import { FileAttachment } from "@/types/files";
import { toast } from "@/hooks/use-toast";

interface UseAttachmentActionsProps {
  isEditMode: boolean;
  setAttachments: (f: ((prev: FileAttachment[]) => FileAttachment[]) | FileAttachment[]) => void;
}

export const useAttachmentActions = ({
  isEditMode,
  setAttachments
}: UseAttachmentActionsProps) => {
  const addAttachment = (file: FileAttachment) => {
    if (!isEditMode) {
      toast({
        title: "Modalità sola lettura",
        description: "Clicca su 'Modifica' per abilitare le modifiche",
      });
      return;
    }
    setAttachments(prev => [...prev, { ...file }]);
  };

  const removeAttachment = (id: string) => {
    if (!isEditMode) {
      toast({
        title: "Modalità sola lettura",
        description: "Clicca su 'Modifica' per abilitare le modifiche",
      });
      return;
    }
    setAttachments(prev => prev.filter((file) => file.id !== id));
  };

  const viewAttachment = (file: FileAttachment) => {
    if (file.url) {
      window.open(file.url, "_blank");
    } else {
      toast({
        title: "Errore",
        description: "URL del file non disponibile",
        variant: "destructive",
      });
    }
  };

  return {
    addAttachment,
    removeAttachment,
    viewAttachment
  };
};
