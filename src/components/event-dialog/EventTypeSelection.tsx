
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { EventType } from "@/types";

interface EventTypeSelectionProps {
  value: EventType;
  onChange: (value: EventType) => void;
  disabled?: boolean;
}

export const EventTypeSelection = ({ value, onChange, disabled = false }: EventTypeSelectionProps) => {
  // Funzione per gestire il cambio di valore considerando la modalità disabled
  const handleChange = (newValue: EventType) => {
    if (!disabled) {
      onChange(newValue);
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
          <RadioGroupItem value="impegno" id="impegno" disabled={disabled} />
          <Label htmlFor="impegno" className={disabled ? "opacity-70" : ""}>Impegno</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="appuntamento" id="appuntamento" disabled={disabled} />
          <Label htmlFor="appuntamento" className={disabled ? "opacity-70" : ""}>Appuntamento</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="promemoria" id="promemoria" disabled={disabled} />
          <Label htmlFor="promemoria" className={disabled ? "opacity-70" : ""}>Promemoria</Label>
        </div>
      </RadioGroup>
    </div>
  );
};
