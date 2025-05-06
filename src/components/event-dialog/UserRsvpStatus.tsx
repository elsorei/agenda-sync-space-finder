
import { UserAvatar } from "@/components/UserAvatar";
import { User, InviteStatus } from "@/types";
import { CheckIcon, XIcon, ClockIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface UserRsvpStatusProps {
  users: User[];
  selectedUserIds: string[];
  inviteStatus?: Record<string, InviteStatus>;
  isReadOnly: boolean;
}

export const UserRsvpStatus = ({
  users,
  selectedUserIds,
  inviteStatus = {},
  isReadOnly
}: UserRsvpStatusProps) => {
  const getStatusIcon = (userId: string) => {
    const status = inviteStatus[userId] || 'pending';
    
    switch (status) {
      case 'accepted':
        return <CheckIcon className="h-4 w-4 text-green-500" />;
      case 'declined':
        return <XIcon className="h-4 w-4 text-red-500" />;
      case 'pending':
      default:
        return <ClockIcon className="h-4 w-4 text-amber-500" />;
    }
  };
  
  const getStatusText = (status: InviteStatus) => {
    switch (status) {
      case 'accepted':
        return "Accettato";
      case 'declined':
        return "Rifiutato";
      case 'pending':
      default:
        return "In attesa";
    }
  };

  if (selectedUserIds.length === 0) return null;
  
  const selectedUsers = users.filter(u => selectedUserIds.includes(u.id));
  
  return (
    <div className="mt-4">
      <h4 className="text-sm font-medium mb-2">Stato risposte:</h4>
      <div className="flex flex-wrap gap-2">
        {selectedUsers.map((user) => (
          <TooltipProvider key={user.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 border rounded-md px-2 py-1 bg-muted/30">
                  <UserAvatar user={user} size="sm" />
                  <span className="text-xs">{user.name}</span>
                  {getStatusIcon(user.id)}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <Badge variant={
                  inviteStatus[user.id] === 'accepted' ? "outline" :
                  inviteStatus[user.id] === 'declined' ? "destructive" : "secondary"
                }>
                  {getStatusText(inviteStatus[user.id] || 'pending')}
                </Badge>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    </div>
  );
};
