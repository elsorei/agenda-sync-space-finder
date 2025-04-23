
import { User } from "@/types";
import { UserAvatar } from "../UserAvatar";

interface UserSidebarProps {
  users: User[];
}

const UserSidebar = ({ users }: UserSidebarProps) => {
  return (
    <div className="w-[100px] flex-shrink-0 border-r pt-[40px]">
      <div className="flex flex-col items-center gap-2 p-2">
        {users.map((user) => (
          <div key={user.id} className="flex flex-col items-center">
            <UserAvatar user={user} size="sm" />
            <span className="text-xs mt-1 font-medium text-center">
              {user.name.split(' ')[0]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserSidebar;
