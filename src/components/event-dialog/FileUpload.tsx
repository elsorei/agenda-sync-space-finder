
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { FileAttachment } from "@/types/files";
import { toast } from "@/hooks/use-toast";
import { X } from "lucide-react";

interface FileUploadProps {
  onFileUploaded: (file: FileAttachment) => void;
  onCancel: () => void;
  allowedTypes?: string[];
}

export const FileUpload = ({ onFileUploaded, onCancel, allowedTypes = [] }: FileUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Verifica il tipo di file, se sono specificati i tipi consentiti
    if (allowedTypes.length > 0) {
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!allowedTypes.includes(fileExtension)) {
        toast({
          title: "Tipo di file non supportato",
          description: `I tipi di file supportati sono: ${allowedTypes.join(', ')}`,
          variant: "destructive",
        });
        return;
      }
    }

    setSelectedFile(file);
  };

  const uploadFile = () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setProgress(0);

    // Simuliamo un caricamento progressivo
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          
          // Create mock file attachment
          // In produzione, questo sarà sostituito con l'integrazione effettiva di Supabase Storage
          const newAttachment: FileAttachment = {
            id: `file-${Date.now()}`,
            name: selectedFile.name,
            type: selectedFile.type,
            size: selectedFile.size,
            url: URL.createObjectURL(selectedFile), // URL temporaneo del file
            uploadedAt: new Date(),
          };
          
          onFileUploaded(newAttachment);
          onCancel();
          
          toast({
            title: "File caricato",
            description: `${selectedFile.name} è stato caricato con successo`,
          });
          
          return 0;
        }
        return prevProgress + 10;
      });
    }, 200);
  };

  return (
    <div className="space-y-4 mt-2 p-4 border rounded-md">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">Carica un file</span>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onCancel}
          disabled={isUploading}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <Input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        disabled={isUploading}
      />
      
      {isUploading && (
        <div className="space-y-2">
          <div className="text-sm">{progress}% completato</div>
          <Progress value={progress} className="h-2" />
        </div>
      )}
      
      <div className="flex justify-end gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onCancel}
          disabled={isUploading}
        >
          Annulla
        </Button>
        <Button 
          size="sm" 
          onClick={uploadFile}
          disabled={isUploading || !selectedFile}
        >
          Carica
        </Button>
      </div>
    </div>
  );
};
