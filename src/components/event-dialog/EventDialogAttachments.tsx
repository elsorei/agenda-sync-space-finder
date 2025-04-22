
import { useState } from "react";
import { FileAttachment } from "@/types/files";
import { Button } from "@/components/ui/button";
import { FileUpload } from "./FileUpload";
import { FileAttachmentList } from "./FileAttachmentList";
import { PaperclipIcon } from "lucide-react";

// Props for the attachments section
interface EventDialogAttachmentsProps {
  attachments: FileAttachment[];
  onAddAttachment: (file: FileAttachment) => void;
  onRemoveAttachment: (id: string) => void;
  onViewFile: (file: FileAttachment) => void;
  isReadOnly?: boolean;
}

export const EventDialogAttachments = ({
  attachments,
  onAddAttachment,
  onRemoveAttachment,
  onViewFile,
  isReadOnly = false
}: EventDialogAttachmentsProps) => {
  const [showFileUpload, setShowFileUpload] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">Allegati</h3>
        {!showFileUpload && !isReadOnly && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFileUpload(true)}
          >
            <PaperclipIcon className="h-4 w-4 mr-2" />
            Aggiungi allegato
          </Button>
        )}
      </div>
      {showFileUpload && !isReadOnly && (
        <FileUpload
          onFileUploaded={(file) => {
            onAddAttachment(file);
            setShowFileUpload(false);
          }}
          onCancel={() => setShowFileUpload(false)}
          allowedTypes={['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.png', '.jpg', '.jpeg']}
        />
      )}
      <div className="space-y-2">
        <FileAttachmentList
          attachments={attachments}
          onRemove={onRemoveAttachment}
          onView={onViewFile}
        />
      </div>
    </div>
  );
};
