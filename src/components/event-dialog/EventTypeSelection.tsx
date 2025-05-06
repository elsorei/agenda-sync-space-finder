
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { EventType } from "@/types";
import { toast } from "@/hooks/use-toast";

interface EventTypeSelectionProps {
  value: EventType;
  onChange: (value: EventType) => void;
  disabled?: boolean;
  isReadOnly?: boolean;
}

export const EventTypeSelection = ({ 
  value, 
  onChange, 
  disabled = false, 
  isReadOnly = false 
}: EventTypeSelectionProps) => {
  // Funzione per gestire il cambio di valore considerando la modalità disabled/readonly
  const handleChange = (newValue: EventType) => {
    if (!disabled && !isReadOnly) {
      onChange(newValue);
    } else {
      // Se siamo in modalità disabled/readonly, mostriamo un toast informativo
      toast({
        title: "Modalità sola lettura",
        description: "Clicca su 'Modifica' per abilitare le modifiche",
        variant: "default",
      });
    }
  };

  return (
    <div className="grid grid-cols-4 items-start gap-4">
      <Label className="text-right">Tipo</Label>
      <RadioGroup
        value={value}
        onValueChange={handleChange}
        className="col-span-3 flex gap-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="impegno" id="impegno" disabled={disabled || isReadOnly} />
          <Label htmlFor="impegno" className={(disabled || isReadOnly) ? "opacity-70" : ""}>Impegno</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="appuntamento" id="appuntamento" disabled={disabled || isReadOnly} />
          <Label htmlFor="appuntamento" className={(disabled || isReadOnly) ? "opacity-70" : ""}>Appuntamento</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="promemoria" id="promemoria" disabled={disabled || isReadOnly} />
          <Label htmlFor="promemoria" className={(disabled || isReadOnly) ? "opacity-70" : ""}>Promemoria</Label>
        </div>
      </RadioGroup>
    </div>
  );
};
