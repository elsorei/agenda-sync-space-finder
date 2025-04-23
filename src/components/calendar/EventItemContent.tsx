
import { Event, User } from "@/types";
import { UserAvatar } from "../UserAvatar";
import { PaperclipIcon } from "lucide-react";
import { formatTime } from "@/utils/timeUtils";

interface EventItemContentProps {
  event: Event;
  user?: User;
  height: number;
}

const EventItemContent = ({ event, user, height }: EventItemContentProps) => {
  // Modifichiamo questa logica per essere sicuri che faccia il controllo corretto
  const hasAttachments = Array.isArray(event.attachments) && event.attachments.length > 0;

  return (
    <div className="flex items-start justify-between h-full">
      <div className="overflow-hidden flex-1">
        <div className="font-medium truncate text-sm flex items-center">
          {event.title}
          <span className="ml-2 text-xs opacity-70">
            ({event.type})
          </span>
          {hasAttachments && (
            <PaperclipIcon className="h-3 w-3 ml-1 text-muted-foreground" />
          )}
        </div>
        <div className="text-xs opacity-70 truncate">
          {formatTime(event.start)} - {formatTime(event.end)}
        </div>
        {height > 60 && event.description && (
          <div className="text-xs mt-1 line-clamp-2 opacity-70">
            {event.description}
          </div>
        )}
        {hasAttachments && height > 80 && (
          <div className="text-xs mt-1 text-blue-600">
            {event.attachments.length} allegato/i
          </div>
        )}
      </div>
      {height > 50 && user && (
        <UserAvatar user={user} size="sm" />
      )}
    </div>
  );
};

export default EventItemContent;
