
import { User } from "@/types";
import { UserAvatar } from "@/components/UserAvatar";
import { Label } from "@/components/ui/label";

interface UserSelectionProps {
  users: User[];
  selectedUserIds: string[];
  onToggleUser: (userId: string) => void;
}

export const UserSelection = ({ users, selectedUserIds, onToggleUser }: UserSelectionProps) => {
  return (
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
            onClick={() => onToggleUser(u.id)}
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
  );
};
