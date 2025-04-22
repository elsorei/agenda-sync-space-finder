
import { EventType } from "@/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TimePickerDemo } from "@/components/TimePicker";
import { EventTypeSelection } from "./EventTypeSelection";
import { UserSelection } from "./UserSelection";
import { User } from "@/types";

// Props for the details section
interface EventDialogDetailsProps {
  eventType: EventType;
  setEventType: (type: EventType) => void;
  users: User[];
  selectedUserIds: string[];
  onToggleUser: (userId: string) => void;
  title: string;
  setTitle: (value: string) => void;
  startTime: Date | null;
  setStartTime: (date: Date) => void;
  endTime: Date | null;
  setEndTime: (date: Date) => void;
  description: string;
  setDescription: (value: string) => void;
  isReadOnly?: boolean;
}

export const EventDialogDetails = ({
  eventType,
  setEventType,
  users,
  selectedUserIds,
  onToggleUser,
  title,
  setTitle,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  description,
  setDescription,
  isReadOnly = false
}: EventDialogDetailsProps) => {
  return (
    <div className="space-y-4">
      <EventTypeSelection 
        value={eventType} 
        onChange={setEventType} 
        disabled={isReadOnly}
      />
      <UserSelection
        users={users}
        selectedUserIds={selectedUserIds}
        onToggleUser={onToggleUser}
        isReadOnly={isReadOnly}
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
          readOnly={isReadOnly}
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
              disabled={isReadOnly}
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
              disabled={isReadOnly}
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
          readOnly={isReadOnly}
        />
      </div>
    </div>
  );
};
