import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";
import { useFriendships } from "@/hooks/useFriendships";
import {
  CalendarDays,
  LayoutDashboard,
  ListTodo,
  Contact,
  UserCheck,
  User,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type NavItem = {
  name: string;
  path: string;
  icon: React.ElementType;
  badge?: number;
};

export const Navigation = () => {
  const location = useLocation();
  const { profile } = useAuth();
  const { unreadCount } = useNotifications();
  const { pendingRequests } = useFriendships();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems: NavItem[] = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Agenda", path: "/", icon: CalendarDays },
    { name: "Todo List", path: "/todos", icon: ListTodo },
    {
      name: "Rubrica",
      path: "/contacts",
      icon: Contact,
      badge: pendingRequests.length || undefined,
    },
    { name: "Amicizie", path: "/friendships", icon: UserCheck },
    { name: "Profilo", path: "/profile", icon: User },
  ];

  const initials = profile?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "??";

  return (
    <>
      {/* Mobile Navigation */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b">
        <h1 className="text-xl font-bold">Agenda Sync</h1>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {unreadCount}
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden flex flex-col p-4 space-y-2 bg-background border-b">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-2 p-3 rounded-lg transition-colors",
                location.pathname === item.path
                  ? "bg-secondary font-medium"
                  : "hover:bg-secondary/50"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="flex-1">{item.name}</span>
              {item.badge && (
                <Badge variant="destructive" className="text-xs">
                  {item.badge}
                </Badge>
              )}
            </Link>
          ))}
        </div>
      )}

      {/* Desktop Navigation */}
      <div className="hidden lg:flex h-screen w-64 flex-col fixed left-0 top-0 bg-background border-r z-50">
        <div className="p-4">
          <h1 className="text-2xl font-bold">Agenda Sync</h1>
        </div>

        <Separator />

        {/* User info */}
        <div className="p-4">
          <Link
            to="/profile"
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
          >
            <Avatar className="w-10 h-10">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback
                className="text-sm font-bold text-white"
                style={{ backgroundColor: profile?.color || "#9b87f5" }}
              >
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{profile?.full_name}</p>
              <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
            </div>
          </Link>
        </div>

        <Separator />

        <div className="p-4 space-y-1 flex-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-2 p-3 rounded-lg transition-colors",
                location.pathname === item.path
                  ? "bg-secondary font-medium"
                  : "hover:bg-secondary/50"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="flex-1">{item.name}</span>
              {item.badge && (
                <Badge variant="destructive" className="text-xs px-1.5 py-0">
                  {item.badge}
                </Badge>
              )}
            </Link>
          ))}
        </div>

        <Separator />

        <div className="p-4">
          <p className="text-sm text-muted-foreground">Agenda Sync v2.0</p>
        </div>
      </div>
    </>
  );
};

export default Navigation;
