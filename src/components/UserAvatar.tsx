
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/types";

interface UserAvatarProps {
  user: User;
  size?: "sm" | "md" | "lg";
  showStatus?: boolean;
  showName?: boolean;
}

export const UserAvatar = ({
  user,
  size = "md",
  showStatus = false,
  showName = false,
}: UserAvatarProps) => {
  const sizeClass = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Avatar className={sizeClass[size]} style={{ borderColor: user.color || '#6E56CF', borderWidth: '2px' }}>
          <AvatarImage src={user.avatar || user.avatarUrl} alt={user.name} />
          <AvatarFallback style={{ backgroundColor: (user.color || '#6E56CF')+'20', color: user.color || '#6E56CF' }}>
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
        {showStatus && (
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white" />
        )}
      </div>
      {showName && <span className="text-sm font-medium">{user.name}</span>}
    </div>
  );
};
