
import { User } from "@/types";

interface UserSidebarProps {
  users: User[];
  selectedUsers: string[];
  onUserSelect: (userId: string) => void;
}

const UserSidebar = ({ users, selectedUsers, onUserSelect }: UserSidebarProps) => {
  return (
    <div className="w-64 border-r p-4">
      <h2 className="font-semibold mb-4">Utenti</h2>
      <div className="space-y-2">
        {users.map(user => (
          <button
            key={user.id}
            onClick={() => onUserSelect(user.id)}
            className={`w-full text-left px-3 py-2 rounded ${
              selectedUsers.includes(user.id) 
                ? 'bg-primary text-primary-foreground' 
                : 'hover:bg-accent'
            }`}
          >
            {user.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default UserSidebar;
