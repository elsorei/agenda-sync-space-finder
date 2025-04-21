
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
import { Event, User } from "@/types";
import { format } from "date-fns";
import { TimePickerDemo } from "./TimePicker";

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
  // Multi-selezione degli utenti invitati
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description || "");
      setStartTime(event.start);
      setEndTime(event.end);
      setSelectedUserIds(event.userIds || []);
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

  // Funzione per selezione/deselezione utenti invitati
  const handleToggleUser = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
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
