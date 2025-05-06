
import { EventType, User } from "@/types";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { UserSelection } from "./UserSelection";
import { EventTypeSelection } from "./EventTypeSelection";
import { TimePicker } from "@/components/TimePicker";
import { RsvpDeadlineField } from "./RsvpDeadlineField";
import { UserRsvpStatus } from "./UserRsvpStatus";

interface EventDialogDetailsProps {
  title: string;
  setTitle: (title: string) => void;
  description: string;
  setDescription: (desc: string) => void;
  startTime: Date | null;
  setStartTime: (time: Date | null) => void;
  endTime: Date | null;
  setEndTime: (time: Date | null) => void;
  eventType: EventType;
  setEventType: (type: EventType) => void;
  users: User[];
  selectedUserIds: string[];
  onToggleUser: (userId: string) => void;
  isReadOnly: boolean;
  rsvpDeadline?: Date;
  setRsvpDeadline?: (deadline: Date | undefined) => void;
  inviteStatus?: Record<string, string>;
}

export const EventDialogDetails = ({
  title,
  setTitle,
  description,
  setDescription,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  eventType,
  setEventType,
  users,
  selectedUserIds,
  onToggleUser,
  isReadOnly,
  rsvpDeadline,
  setRsvpDeadline,
  inviteStatus
}: EventDialogDetailsProps) => {
  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="title">Titolo</Label>
        <Input
          id="title"
          placeholder="Inserisci un titolo"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          readOnly={isReadOnly}
          className={isReadOnly ? "bg-muted cursor-default" : ""}
        />
      </div>
      
      <EventTypeSelection 
        value={eventType} 
        onChange={setEventType} 
        isReadOnly={isReadOnly} 
      />

      <div className="grid gap-2">
        <Label>Data e ora</Label>
        <div className="flex flex-col md:flex-row md:items-center gap-2">
          <TimePicker 
            value={startTime} 
            onChange={setStartTime} 
            disabled={isReadOnly} 
            label="Inizio" 
          />
          <TimePicker 
            value={endTime} 
            onChange={setEndTime} 
            disabled={isReadOnly} 
            label="Fine" 
          />
        </div>
      </div>

      <UserSelection
        users={users}
        selectedUserIds={selectedUserIds}
        onToggleUser={onToggleUser}
        isReadOnly={isReadOnly}
      />

      {/* Nuovo campo per la scadenza RSVP */}
      {setRsvpDeadline && (
        <RsvpDeadlineField
          rsvpDeadline={rsvpDeadline}
          onDeadlineChange={setRsvpDeadline}
          eventDate={startTime}
          isReadOnly={isReadOnly}
        />
      )}

      {/* Mostra lo stato delle risposte se non siamo in modalità di creazione */}
      {!isReadOnly && inviteStatus && (
        <UserRsvpStatus
          users={users}
          selectedUserIds={selectedUserIds}
          inviteStatus={inviteStatus}
          isReadOnly={isReadOnly}
        />
      )}

      <div className="grid gap-2">
        <Label htmlFor="description">Descrizione</Label>
        <Textarea
          id="description"
          placeholder="Aggiungi una descrizione"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          readOnly={isReadOnly}
          className={isReadOnly ? "bg-muted cursor-default" : ""}
        />
      </div>

      <Separator className="my-2" />
    </div>
  );
};
