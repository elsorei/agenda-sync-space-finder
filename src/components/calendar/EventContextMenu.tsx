
import { Event } from "@/types";
import { toast } from "@/hooks/use-toast";
import { MoveIcon, CopyIcon } from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

interface EventContextMenuProps {
  children: React.ReactNode;
}

const EventContextMenu = ({ children }: EventContextMenuProps) => {
  const handleMove = () => {
    toast({
      title: "Sposta evento",
      description: "Trascina per spostare l'evento",
    });
  };

  const handleCopy = () => {
    toast({
      title: "Copia evento",
      description: "Trascina per copiare l'evento",
    });
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onSelect={handleMove} className="cursor-pointer">
          <MoveIcon className="mr-2 h-4 w-4" />
          <span>Sposta</span>
        </ContextMenuItem>
        <ContextMenuItem onSelect={handleCopy} className="cursor-pointer">
          <CopyIcon className="mr-2 h-4 w-4" />
          <span>Copia</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default EventContextMenu;
