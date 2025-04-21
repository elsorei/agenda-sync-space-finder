
import { useState } from "react";
import { User } from "@/types";
import { UserAvatar } from "./UserAvatar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface UsersListProps {
  users: User[];
  selectedUsers: string[];
  onUserSelect: (userId: string) => void;
  onSelectAll: () => void;
}

const UsersList = ({ 
  users, 
  selectedUsers, 
  onUserSelect,
  onSelectAll
}: UsersListProps) => {
  return (
    <div className="p-4 border-r h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Utenti</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onSelectAll}
          className="h-8 px-2 text-xs"
        >
          {selectedUsers.length === users.length ? "Deseleziona tutti" : "Seleziona tutti"}
        </Button>
      </div>
      
      <div className="space-y-3">
        {users.map((user) => (
          <div
            key={user.id}
            className={cn(
              "flex items-center p-2 rounded-md cursor-pointer hover:bg-secondary transition-colors",
              selectedUsers.includes(user.id) ? "bg-secondary" : ""
            )}
            onClick={() => onUserSelect(user.id)}
          >
            <UserAvatar user={user} showName={true} />
          </div>
        ))}
        
        <Button 
          variant="outline" 
          className="w-full mt-4 text-muted-foreground"
          disabled
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Aggiungi utente
        </Button>
      </div>
    </div>
  );
};

export default UsersList;
