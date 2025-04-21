
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
  
  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description || "");
      setStartTime(event.start);
      setEndTime(event.end);
    } else {
      resetForm();
    }
  }, [event]);
  
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStartTime(null);
    setEndTime(null);
  };
  
  const handleSave = () => {
    if (!event || !startTime || !endTime) return;
    
    const updatedEvent: Event = {
      ...event,
      title,
      description,
      start: startTime,
      end: endTime,
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
  
  const user = users.find(u => event?.userId === u.id);
  
  if (!event || !startTime || !endTime) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {event.id.startsWith("new-") ? "Nuovo evento" : "Modifica evento"}
          </DialogTitle>
          <DialogDescription>
            {format(event.start, "EEEE d MMMM yyyy")}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {user && (
            <div className="flex items-center gap-2 mb-2">
              <Label>Utente:</Label>
              <UserAvatar user={user} showName />
            </div>
          )}
          
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
              <TimePickerDemo 
                date={startTime} 
                setDate={setStartTime} 
              />
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="end" className="text-right">
              Fine
            </Label>
            <div className="col-span-3">
              <TimePickerDemo 
                date={endTime} 
                setDate={setEndTime} 
              />
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
          {!event.id.startsWith("new-") && onDelete && (
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
