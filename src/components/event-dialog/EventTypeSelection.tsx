
import { EventType } from "@/types";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface EventTypeSelectionProps {
  value: EventType;
  onChange: (value: EventType) => void;
}

export const EventTypeSelection = ({ value, onChange }: EventTypeSelectionProps) => {
  return (
    <div className="grid grid-cols-4 items-start gap-4">
      <Label className="text-right">Tipo</Label>
      <RadioGroup
        value={value}
        onValueChange={onChange}
        className="col-span-3 flex gap-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="impegno" id="impegno" />
          <Label htmlFor="impegno">Impegno</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="appuntamento" id="appuntamento" />
          <Label htmlFor="appuntamento">Appuntamento</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="promemoria" id="promemoria" />
          <Label htmlFor="promemoria">Promemoria</Label>
        </div>
      </RadioGroup>
    </div>
  );
};
