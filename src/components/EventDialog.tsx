
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
import { UserAvatar } from "./UserAvatar";
import { Event, User, EventType, FileAttachment } from "@/types";
import { format } from "date-fns";
import { TimePickerDemo } from "./TimePicker";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { FileUpload } from "./event-dialog/FileUpload";
import { FileAttachmentList } from "./event-dialog/FileAttachmentList";
import { toast } from "@/hooks/use-toast";
import { PaperclipIcon, Save, X, Edit } from "lucide-react";

interface EventDialogProps {
  event: Event | null;
  users: User[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Event) => void;
  onDelete?: (eventId: string) => void;
}

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
  const [isEditMode, setIsEditMode] = useState(false);

  // Log dello stato degli allegati per debug
  useEffect(() => {
    console.log("EventDialog - Allegati correnti:", attachments?.length || 0, attachments);
  }, [attachments]);

  // Reset del form quando l'evento cambia o quando il dialog si apre/chiude
  useEffect(() => {
    if (event) {
      console.log("EventDialog - Nuovo evento caricato:", event.id, "con allegati:", event.attachments?.length || 0);
      setTitle(event.title);
      setDescription(event.description || "");
      setStartTime(new Date(event.start));
      setEndTime(new Date(event.end));
      setSelectedUserIds([...event.userIds]);
      setEventType(event.type || 'impegno');
      // Deep copy degli allegati
      setAttachments(event.attachments ? [...event.attachments.map(att => ({...att}))] : []);
      
      // Se è un nuovo evento, entra subito in modalità modifica
      setIsEditMode(event.id.startsWith("new-"));
    } else {
      resetForm();
    }
  }, [event, isOpen]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStartTime(null);
    setEndTime(null);
    setSelectedUserIds([]);
    setEventType('impegno');
    setAttachments([]);
    setIsEditMode(false);
    setShowFileUpload(false);
  };

  const handleSave = () => {
    // Se non siamo in modalità modifica, entriamo in modalità modifica
    if (!isEditMode) {
      setIsEditMode(true);
      return;
    }

    // Validazione
    if (!startTime || !endTime) {
      toast({
        title: "Errore",
        description: "Seleziona orari di inizio e fine validi",
        variant: "destructive",
      });
      return;
    }

    if (selectedUserIds.length === 0) {
      toast({
        title: "Errore",
        description: "Seleziona almeno un utente",
        variant: "destructive",
      });
      return;
    }

    if (!title.trim()) {
      toast({
        title: "Errore",
        description: "Inserisci un titolo per l'evento",
        variant: "destructive",
      });
      return;
    }

    // Creiamo una copia profonda dell'evento per evitare reference issues
    const updatedEvent: Event = {
      id: event?.id || `new-${Date.now()}`,
      title,
      description,
      start: new Date(startTime),
      end: new Date(endTime),
      userIds: [...selectedUserIds],
      color: event?.color || "#9b87f5",
      type: eventType,
      // Assicuriamoci di fare una deep copy degli allegati
      attachments: attachments.map(att => ({...att}))
    };

    console.log("Salvataggio evento con allegati:", updatedEvent.attachments.length);
    
    onSave(updatedEvent);
    setIsEditMode(false);
  };

  const handleCancel = () => {
    if (isEditMode) {
      // Se siamo in modalità modifica e annulliamo, torniamo allo stato originale
      if (event) {
        setTitle(event.title);
        setDescription(event.description || "");
        setStartTime(new Date(event.start));
        setEndTime(new Date(event.end));
        setSelectedUserIds([...event.userIds]);
        setEventType(event.type || 'impegno');
        setAttachments(event.attachments ? [...event.attachments.map(att => ({...att}))] : []);
      }
      setIsEditMode(false);
      setShowFileUpload(false);
    } else {
      // Se non siamo in modalità modifica, chiudiamo il dialog
      onClose();
    }
  };

  const handleDelete = () => {
    if (event && onDelete) {
      onDelete(event.id);
      onClose();
    }
  };

  const handleToggleUser = (userId: string) => {
    if (!isEditMode) {
      toast({
        title: "Modalità sola lettura",
        description: "Clicca su 'Modifica' per abilitare le modifiche",
      });
      return;
    }
    
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleAddFile = (file: FileAttachment) => {
    console.log("Aggiunto allegato:", file.name);
    // Deep copy dell'array esistente + nuovo file
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
    
    console.log("Rimozione allegato con ID:", fileId);
    setAttachments(prev => prev.filter(file => file.id !== fileId));
  };

  const handleViewFile = (file: FileAttachment) => {
    console.log("Visualizzazione file:", file.name, file.url);
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {!event ? "Nuovo evento" : isEditMode ? "Modifica evento" : "Dettagli evento"}
          </DialogTitle>
          <DialogDescription>
            {(event?.start || startTime) &&
              format(event?.start || startTime!, "EEEE d MMMM yyyy")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Tipo evento */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right">Tipo</Label>
            <RadioGroup
              value={eventType}
              onValueChange={(value: EventType) => {
                if (!isEditMode) {
                  toast({
                    title: "Modalità sola lettura",
                    description: "Clicca su 'Modifica' per abilitare le modifiche",
                  });
                  return;
                }
                setEventType(value);
              }}
              className="col-span-3 flex gap-4"
              disabled={!isEditMode}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="impegno" id="impegno" disabled={!isEditMode} />
                <Label htmlFor="impegno" className={!isEditMode ? "opacity-70" : ""}>Impegno</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="appuntamento" id="appuntamento" disabled={!isEditMode} />
                <Label htmlFor="appuntamento" className={!isEditMode ? "opacity-70" : ""}>Appuntamento</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="promemoria" id="promemoria" disabled={!isEditMode} />
                <Label htmlFor="promemoria" className={!isEditMode ? "opacity-70" : ""}>Promemoria</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Selezione multipla utenti */}
          <div className="flex flex-col gap-1 mb-2">
            <Label>Invitati:</Label>
            <div className="flex flex-wrap gap-2">
              {users.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  className={
                    "flex items-center gap-1 border rounded-md px-2 py-1 focus:outline-none transition-all " +
                    (selectedUserIds.includes(u.id)
                      ? "bg-primary text-primary-foreground border-primary font-semibold shadow-sm animate-fade-in"
                      : "bg-muted text-foreground border-muted-foreground/30 hover:bg-accent")
                  }
                  onClick={() => handleToggleUser(u.id)}
                  disabled={!isEditMode}
                >
                  <UserAvatar user={u} size="sm" />
                  <span className="text-xs">{u.name}</span>
                </button>
              ))}
            </div>
            {selectedUserIds.length === 0 && (
              <span className="text-xs text-destructive mt-1">Selezionare almeno un invitato</span>
            )}
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Titolo
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => {
                if (!isEditMode) {
                  toast({
                    title: "Modalità sola lettura",
                    description: "Clicca su 'Modifica' per abilitare le modifiche",
                  });
                  return;
                }
                setTitle(e.target.value);
              }}
              className="col-span-3"
              readOnly={!isEditMode}
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
                  setDate={(date) => {
                    if (!isEditMode) {
                      toast({
                        title: "Modalità sola lettura",
                        description: "Clicca su 'Modifica' per abilitare le modifiche",
                      });
                      return;
                    }
                    setStartTime(date);
                  }}
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
                  setDate={(date) => {
                    if (!isEditMode) {
                      toast({
                        title: "Modalità sola lettura",
                        description: "Clicca su 'Modifica' per abilitare le modifiche",
                      });
                      return;
                    }
                    setEndTime(date);
                  }}
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
              onChange={(e) => {
                if (!isEditMode) {
                  toast({
                    title: "Modalità sola lettura",
                    description: "Clicca su 'Modifica' per abilitare le modifiche",
                  });
                  return;
                }
                setDescription(e.target.value);
              }}
              className="col-span-3"
              rows={3}
              readOnly={!isEditMode}
            />
          </div>

          {/* Sezione allegati */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right">Allegati</Label>
            <div className="col-span-3 space-y-2">
              <div className="flex justify-between items-center">
                {!showFileUpload && isEditMode && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFileUpload(true)}
                    className="flex items-center gap-1 mb-2"
                  >
                    <PaperclipIcon className="h-4 w-4" />
                    Aggiungi allegato
                  </Button>
                )}
              </div>
              
              {showFileUpload && (
                <FileUpload
                  onFileUploaded={handleAddFile}
                  onCancel={() => setShowFileUpload(false)}
                  allowedTypes={['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.png', '.jpg', '.jpeg']}
                />
              )}
              
              <FileAttachmentList
                attachments={attachments}
                onRemove={handleRemoveFile}
                onView={handleViewFile}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          {event && !event.id.startsWith("new-") && onDelete && isEditMode && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              type="button"
            >
              Elimina
            </Button>
          )}
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={handleCancel} type="button">
              {isEditMode ? "Annulla" : "Chiudi"}
            </Button>
            <Button onClick={handleSave} type="submit" className="flex items-center gap-1">
              {isEditMode ? (
                <>
                  <Save className="h-4 w-4" />
                  Salva
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4" />
                  Modifica
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EventDialog;
