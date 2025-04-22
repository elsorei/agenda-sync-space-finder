
import React, { useState, useEffect } from "react";
import { EventDialogProps } from "./types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EventDialogDetails } from "./EventDialogDetails";
import { EventDialogAttachments } from "./EventDialogAttachments";
import { toast } from "@/hooks/use-toast";

export const EventDialog = ({ event, users, isOpen, onClose, onSave, onDelete }: EventDialogProps) => {
  // Stato locale per form di evento
  const [title, setTitle] = useState(event?.title || "");
  const [description, setDescription] = useState(event?.description || "");
  const [eventType, setEventType] = useState(event?.type || "impegno");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>(event?.userIds || []);
  const [startTime, setStartTime] = useState<Date | null>(event?.start || null);
  const [endTime, setEndTime] = useState<Date | null>(event?.end || null);
  const [attachments, setAttachments] = useState(event?.attachments || []);

  // Sincronizza stati locali se l'evento cambia
  useEffect(() => {
    setTitle(event?.title || "");
    setDescription(event?.description || "");
    setEventType(event?.type || "impegno");
    setSelectedUserIds(event?.userIds || []);
    setStartTime(event?.start || null);
    setEndTime(event?.end || null);
    setAttachments(event?.attachments || []);
  }, [event]);

  const onToggleUser = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleAddAttachment = (file: typeof attachments[number]) => {
    setAttachments((prev) => [...prev, file]);
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((file) => file.id !== id));
  };

  const handleViewFile = (file: typeof attachments[number]) => {
    // Apri il file in una nuova finestra o scheda
    window.open(file.url, "_blank");
  };

  const handleSave = () => {
    if (!startTime || !endTime) {
      toast({
        title: "Errore",
        description: "Devi selezionare un orario di inizio e fine valido.",
        variant: "destructive",
      });
      return;
    }
    if (selectedUserIds.length === 0) {
      toast({
        title: "Errore",
        description: "Devi selezionare almeno un utente invitato.",
        variant: "destructive",
      });
      return;
    }

    if (title.trim() === "") {
      toast({
        title: "Errore",
        description: "Il titolo dell'evento non può essere vuoto.",
        variant: "destructive",
      });
      return;
    }

    const updatedEvent = {
      ...event,
      title,
      description,
      type: eventType,
      userIds: selectedUserIds,
      start: startTime,
      end: endTime,
      attachments,
    };

    onSave(updatedEvent);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{event ? "Modifica evento" : "Nuovo evento"}</DialogTitle>
        </DialogHeader>

        <EventDialogDetails
          eventType={eventType}
          setEventType={setEventType}
          users={users}
          selectedUserIds={selectedUserIds}
          onToggleUser={onToggleUser}
          title={title}
          setTitle={setTitle}
          startTime={startTime}
          setStartTime={setStartTime}
          endTime={endTime}
          setEndTime={setEndTime}
          description={description}
          setDescription={setDescription}
        />

        <div className="mt-4">
          <EventDialogAttachments
            attachments={attachments}
            onAddAttachment={handleAddAttachment}
            onRemoveAttachment={handleRemoveAttachment}
            onViewFile={handleViewFile}
          />
        </div>

        <DialogFooter className="flex justify-between">
          {event && onDelete && (
            <Button variant="destructive" onClick={() => onDelete(event.id)}>
              Elimina
            </Button>
          )}

          <div className="ml-auto flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Annulla
            </Button>
            <Button onClick={handleSave}>Salva</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EventDialog;

