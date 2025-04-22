
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Event, EventType } from "@/types";
import { FileAttachment } from "@/types/files";
import { format } from "date-fns";
import { TimePickerDemo } from "@/components/TimePicker";
import { UserSelection } from "./UserSelection";
import { EventTypeSelection } from "./EventTypeSelection";
import { EventDialogProps } from "./types";
import { FileUpload } from "./FileUpload";
import { FileAttachmentList } from "./FileAttachmentList";
import { PaperclipIcon } from "lucide-react";

const EventDialog = ({
  event,
  users,
  isOpen,
  onClose,
  onSave,
  onDelete,
}: EventDialogProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [eventType, setEventType] = useState<EventType>('impegno');
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [showFileUpload, setShowFileUpload] = useState(false);

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description || "");
      setStartTime(event.start);
      setEndTime(event.end);
      setSelectedUserIds(event.userIds || []);
      setEventType(event.type || 'impegno');
      setAttachments(event.attachments || []);
    } else {
      resetForm();
    }
  }, [event]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStartTime(null);
    setEndTime(null);
    setSelectedUserIds([]);
    setEventType('impegno');
    setAttachments([]);
  };

  const handleSave = () => {
    if (!startTime || !endTime || selectedUserIds.length === 0) return;

    const updatedEvent: Event = {
      id: event?.id || `new-${Date.now()}`,
      title,
      description,
      start: startTime,
      end: endTime,
      userIds: selectedUserIds,
      color: event?.color || "#9b87f5",
      type: eventType,
      attachments: attachments,
    };

    onSave(updatedEvent);
    onClose();
  };

  const handleDelete = () => {
    if (event && onDelete) {
      onDelete(event.id);
      onClose();
    }
  };

  const handleToggleUser = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleAddAttachment = (file: FileAttachment) => {
    setAttachments(prev => [...prev, file]);
  };

  const handleRemoveAttachment = (fileId: string) => {
    setAttachments(prev => prev.filter(file => file.id !== fileId));
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {event?.id?.startsWith("new-") ? "Nuovo evento" : "Modifica evento"}
          </DialogTitle>
          <DialogDescription>
            {(event?.start || startTime) &&
              format(event?.start || startTime!, "EEEE d MMMM yyyy")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <EventTypeSelection value={eventType} onChange={(value: EventType) => setEventType(value)} />
          
          <UserSelection
            users={users}
            selectedUserIds={selectedUserIds}
            onToggleUser={handleToggleUser}
          />

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Titolo
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="start" className="text-right">
              Inizio
            </Label>
            <div className="col-span-3">
              {startTime && (
                <TimePickerDemo
                  date={startTime}
                  setDate={setStartTime}
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="end" className="text-right">
              Fine
            </Label>
            <div className="col-span-3">
              {endTime && (
                <TimePickerDemo
                  date={endTime}
                  setDate={setEndTime}
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="description" className="text-right">
              Descrizione
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              rows={3}
            />
          </div>

          {/* File attachments section */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right">
              Allegati
            </Label>
            <div className="col-span-3">
              {/* List of attached files */}
              <FileAttachmentList 
                attachments={attachments} 
                onRemove={handleRemoveAttachment} 
              />
              
              {/* File upload button */}
              {!showFileUpload ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2" 
                  onClick={() => setShowFileUpload(true)}
                >
                  <PaperclipIcon className="h-4 w-4 mr-2" />
                  Aggiungi allegato
                </Button>
              ) : (
                <FileUpload 
                  onFileUploaded={handleAddAttachment}
                  onCancel={() => setShowFileUpload(false)}
                  allowedTypes={['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.png', '.jpg', '.jpeg']}
                />
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          {event && !event.id.startsWith("new-") && onDelete && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              type="button"
            >
              Elimina
            </Button>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} type="button">
              Annulla
            </Button>
            <Button onClick={handleSave} type="submit">
              Salva
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EventDialog;
