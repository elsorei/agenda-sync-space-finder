
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Save, Edit, Trash2, X } from "lucide-react";

interface EventDialogActionsProps {
  isEditMode: boolean;
  isEventDeletable: boolean;
  onCancel: () => void;
  onSave: () => void;
  onDelete?: () => void;
}

export const EventDialogActions = ({
  isEditMode,
  isEventDeletable,
  onCancel,
  onSave,
  onDelete
}: EventDialogActionsProps) => (
  <DialogFooter className="flex justify-between">
    {isEventDeletable && (
      <Button
        variant="destructive"
        onClick={onDelete}
        type="button"
        className="flex items-center gap-1"
      >
        <Trash2 className="h-4 w-4" />
        Elimina
      </Button>
    )}
    <div className="flex gap-2 ml-auto">
      <Button variant="outline" onClick={onCancel} type="button">
        {isEditMode ? (
          <>
            <X className="h-4 w-4" />
            Annulla
          </>
        ) : (
          <>
            <X className="h-4 w-4" />
            Chiudi
          </>
        )}
      </Button>
      <Button onClick={onSave} type="submit" className="flex items-center gap-1">
        {isEditMode ? (
          <>
            <Save className="h-4 w-4" />
            Salva
          </>
        ) : (
          <>
            <Edit className="h-4 w-4" />
            Modifica
          </>
        )}
      </Button>
    </div>
  </DialogFooter>
);

