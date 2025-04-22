
import { FileAttachment } from "@/types/files";
import { Button } from "@/components/ui/button";
import { 
  FileIcon, 
  ImageIcon, 
  FileTextIcon, 
  FileSpreadsheetIcon, 
  FileX,
  Eye
} from "lucide-react";

interface FileAttachmentListProps {
  attachments: FileAttachment[];
  onRemove: (id: string) => void;
  onView?: (file: FileAttachment) => void;
}

export const FileAttachmentList = ({ 
  attachments, 
  onRemove,
  onView 
}: FileAttachmentListProps) => {
  console.log("Rendering FileAttachmentList with attachments:", attachments);
  
  if (!attachments || attachments.length === 0) {
    return <div className="text-sm text-muted-foreground">Nessun allegato</div>;
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('image')) {
      return <ImageIcon className="h-4 w-4" />;
    } else if (fileType.includes('pdf')) {
      return <FileTextIcon className="h-4 w-4" />;
    } else if (fileType.includes('spreadsheet') || fileType.includes('excel') || fileType.includes('xlsx') || fileType.includes('xls')) {
      return <FileSpreadsheetIcon className="h-4 w-4" />;
    } else {
      return <FileIcon className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleViewFile = (file: FileAttachment) => {
    console.log("Clicking view file:", file);
    if (onView) {
      // Clone the file object to avoid reference issues
      const fileClone = { ...file };
      onView(fileClone);
    }
  };

  return (
    <div className="space-y-2">
      {attachments.map((file) => (
        <div 
          key={file.id} 
          className="flex items-center justify-between p-2 bg-muted/50 rounded-md text-sm"
        >
          <div className="flex items-center space-x-2">
            {getFileIcon(file.type)}
            <span className="hover:underline cursor-pointer" onClick={() => handleViewFile(file)}>
              {file.name}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatFileSize(file.size)}
            </span>
          </div>
          <div className="flex gap-1">
            {onView && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleViewFile(file)}
                className="h-6 w-6 text-blue-600"
                title="Visualizza file"
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onRemove(file.id)}
              className="h-6 w-6 text-destructive"
              title="Rimuovi allegato"
            >
              <FileX className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
