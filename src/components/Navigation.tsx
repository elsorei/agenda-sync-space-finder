
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  CalendarDays, 
  LayoutDashboard, 
  ListTodo, 
  MessageSquare,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

type NavItem = {
  name: string;
  path: string;
  icon: React.ElementType;
};

const navItems: NavItem[] = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Agenda",
    path: "/",
    icon: CalendarDays,
  },
  {
    name: "Todo List",
    path: "/todo",
    icon: ListTodo,
  },
  {
    name: "Blackboard",
    path: "/blackboard",
    icon: MessageSquare,
  },
  {
    name: "Utenti",
    path: "/users",
    icon: Users,
  }
];

export const Navigation = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleMobileToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <>
      {/* Mobile Navigation */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b">
        <h1 className="text-xl font-bold">Agenda Sync</h1>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleMobileToggle}
          aria-label="Menu"
        >
          Menu
        </Button>
      </div>
      
      {/* Mobile Navigation Menu */}
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
              <span>{item.name}</span>
            </Link>
          ))}
        </div>
      )}
      
      {/* Desktop Navigation */}
      <div className="hidden lg:flex h-screen w-64 flex-col fixed left-0 top-0 bg-background border-r">
        <div className="p-4">
          <h1 className="text-2xl font-bold">Agenda Sync</h1>
        </div>
        
        <Separator />
        
        <div className="p-4 space-y-2 flex-1">
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
              <span>{item.name}</span>
            </Link>
          ))}
        </div>
        
        <Separator />
        
        <div className="p-4">
          <p className="text-sm text-muted-foreground">
            Agenda Sync v1.0
          </p>
        </div>
      </div>
    </>
  );
};
