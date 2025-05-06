
import { FileAttachment } from "@/types/files";
import { toast } from "@/hooks/use-toast";

interface UseEventDialogFileHandlersProps {
  isEditMode: boolean;
  setAttachments: React.Dispatch<React.SetStateAction<FileAttachment[]>>;
  setShowFileUpload: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useEventDialogFileHandlers = ({
  isEditMode,
  setAttachments,
  setShowFileUpload
}: UseEventDialogFileHandlersProps) => {
  const handleAddFile = (file: FileAttachment) => {
    if (!isEditMode) {
      toast({
        title: "Modalità sola lettura",
        description: "Clicca su 'Modifica' per abilitare le modifiche",
      });
      return;
    }
    setAttachments(prev => [...prev.map(att => ({...att})), {...file}]);
    setShowFileUpload(false);
  };

  const handleRemoveFile = (fileId: string) => {
    if (!isEditMode) {
      toast({
        title: "Modalità sola lettura",
        description: "Clicca su 'Modifica' per abilitare le modifiche",
      });
      return;
    }
    setAttachments(prev => prev.filter(file => file.id !== fileId));
  };

  return {
    handleAddFile,
    handleRemoveFile
  };
};
