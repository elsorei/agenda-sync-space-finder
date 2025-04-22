
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
  const [isEditMode, setIsEditMode] = useState(false);

  // Sincronizza stati locali se l'evento cambia
  useEffect(() => {
    if (event) {
      console.log("EventDialog ricevuto evento:", event.id, "con allegati:", event.attachments?.length || 0);
      setTitle(event.title || "");
      setDescription(event.description || "");
      setEventType(event.type || "impegno");
      setSelectedUserIds(event.userIds || []);
      setStartTime(event.start || null);
      setEndTime(event.end || null);
      setAttachments(event.attachments || []);
      setIsEditMode(false); // Inizia in modalità visualizzazione
    } else {
      // Se è un nuovo evento, impostiamo automaticamente la modalità modifica
      setIsEditMode(true);
    }
  }, [event]);

  const onToggleUser = (userId: string) => {
    if (!isEditMode) {
      toast({
        title: "Modalità sola lettura",
        description: "Clicca su 'Modifica' per abilitare le modifiche",
        variant: "default",
      });
      return;
    }
    
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleAddAttachment = (file: typeof attachments[number]) => {
    if (!isEditMode) {
      toast({
        title: "Modalità sola lettura",
        description: "Clicca su 'Modifica' per abilitare le modifiche",
        variant: "default",
      });
      return;
    }
    
    setAttachments((prev) => [...prev, file]);
  };

  const handleRemoveAttachment = (id: string) => {
    if (!isEditMode) {
      toast({
        title: "Modalità sola lettura",
        description: "Clicca su 'Modifica' per abilitare le modifiche",
        variant: "default",
      });
      return;
    }
    
    setAttachments((prev) => prev.filter((file) => file.id !== id));
  };

  const handleViewFile = (file: typeof attachments[number]) => {
    // Apri il file in una nuova finestra o scheda - possiamo permetterlo anche in modalità sola lettura
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

  const handleSave = () => {
    if (!isEditMode) {
      // Abilitiamo la modalità modifica se non lo è già
      setIsEditMode(true);
      toast({
        title: "Modalità modifica",
        description: "Ora puoi modificare l'evento",
      });
      return;
    }

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

    // Creazione di una copia profonda di tutti i dati, per evitare riferimenti
    const updatedEvent = {
      ...event,
      id: event?.id || `new-${Date.now()}`,
      title,
      description,
      type: eventType,
      userIds: [...selectedUserIds],
      start: new Date(startTime.getTime()),
      end: new Date(endTime.getTime()),
      attachments: attachments.map(att => ({...att})), // Deep copy degli allegati
    };

    console.log("Salvataggio evento con allegati:", updatedEvent.attachments);
    
    onSave(updatedEvent);
    setIsEditMode(false);
  };

  const handleCancel = () => {
    if (isEditMode) {
      // Ricarica i dati originali dell'evento
      if (event) {
        setTitle(event.title || "");
        setDescription(event.description || "");
        setEventType(event.type || "impegno");
        setSelectedUserIds(event.userIds || []);
        setStartTime(event.start || null);
        setEndTime(event.end || null);
        setAttachments(event.attachments || []);
      }
      setIsEditMode(false);
      toast({
        title: "Modifiche annullate",
        description: "Le modifiche sono state annullate",
      });
    } else {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {!event ? "Nuovo evento" : isEditMode ? "Modifica evento" : "Dettagli evento"}
          </DialogTitle>
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
          isReadOnly={!isEditMode && !!event}
        />

        <div className="mt-4">
          <EventDialogAttachments
            attachments={attachments}
            onAddAttachment={handleAddAttachment}
            onRemoveAttachment={handleRemoveAttachment}
            onViewFile={handleViewFile}
            isReadOnly={!isEditMode && !!event}
          />
        </div>

        <DialogFooter className="flex justify-between">
          {event && !event.id.startsWith("new-") && onDelete && isEditMode && (
            <Button variant="destructive" onClick={() => onDelete(event.id)}>
              Elimina
            </Button>
          )}

          <div className="ml-auto flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              {isEditMode ? "Annulla" : "Chiudi"}
            </Button>
            <Button onClick={handleSave}>
              {isEditMode ? "Salva" : "Modifica"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EventDialog;
