
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { User } from "@/types";
import { UserAvatar } from "@/components/UserAvatar";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

interface EventReservesSelectionProps {
  users: User[];
  selectedUserIds: string[];
  reserveUserIds: string[];
  onToggleUser: (userId: string, isReserve: boolean) => void;
  isReadOnly: boolean;
}

export const EventReservesSelection = ({
  users,
  selectedUserIds,
  reserveUserIds,
  onToggleUser,
  isReadOnly = false
}: EventReservesSelectionProps) => {
  const [useReserves, setUseReserves] = useState(reserveUserIds.length > 0);

  // Determina quali utenti sono disponibili per essere selezionati come riserve
  // (escludendo quelli già selezionati come invitati principali)
  const availableReserveUsers = users.filter(user => !selectedUserIds.includes(user.id));

  const handleToggleReserves = (checked: boolean) => {
    if (isReadOnly) return;
    setUseReserves(checked);
  };

  const handleToggleReserveUser = (userId: string) => {
    if (isReadOnly) return;
    onToggleUser(userId, true);
  };

  return (
    <div className="flex flex-col gap-2 mt-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="use-reserves" className="text-sm font-medium">
          Utilizza riserve per sostituzioni automatiche
        </Label>
        <Switch
          id="use-reserves"
          checked={useReserves}
          onCheckedChange={handleToggleReserves}
          disabled={isReadOnly}
        />
      </div>
      
      {useReserves && (
        <div className="mt-2">
          <p className="text-sm text-muted-foreground mb-2">
            Le riserve verranno utilizzate quando un invitato rifiuta o non risponde entro la scadenza
          </p>
          
          <div className="flex flex-wrap gap-2 mt-2">
            {availableReserveUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nessun utente disponibile come riserva
              </p>
            ) : (
              availableReserveUsers.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  className={
                    "flex items-center gap-1 border rounded-md px-2 py-1 focus:outline-none transition-all " +
                    (reserveUserIds.includes(user.id)
                      ? "bg-secondary text-secondary-foreground border-secondary font-semibold shadow-sm animate-fade-in"
                      : "bg-muted text-foreground border-muted-foreground/30 hover:bg-accent") +
                    (isReadOnly ? " cursor-default" : "")
                  }
                  onClick={() => handleToggleReserveUser(user.id)}
                  disabled={isReadOnly}
                >
                  <UserAvatar user={user} size="sm" />
                  <span className="text-xs">{user.name}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
      
      <Separator className="my-2" />
    </div>
  );
};
