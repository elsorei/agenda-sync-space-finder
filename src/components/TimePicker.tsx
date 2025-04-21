
import * as React from "react"
import { format } from "date-fns"
import { it } from "date-fns/locale"
import { Clock } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TimePickerProps {
  date: Date
  setDate: (date: Date) => void
}

export function TimePickerDemo({
  date,
  setDate,
}: TimePickerProps) {
  const minuteOptions = Array.from({ length: 4 }, (_, i) => i * 15)
  const hourOptions = Array.from({ length: 24 }, (_, i) => i)

  const handleHourChange = (hour: string) => {
    const newDate = new Date(date)
    newDate.setHours(parseInt(hour))
    setDate(newDate)
  }

  const handleMinuteChange = (minute: string) => {
    const newDate = new Date(date)
    newDate.setMinutes(parseInt(minute))
    setDate(newDate)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {format(date, "HH:mm", { locale: it })}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start">
        <div className="flex gap-2">
          <Select
            value={date.getHours().toString()}
            onValueChange={handleHourChange}
          >
            <SelectTrigger className="w-[70px]">
              <SelectValue placeholder="Ora" />
            </SelectTrigger>
            <SelectContent>
              {hourOptions.map((hour) => (
                <SelectItem key={hour} value={hour.toString()}>
                  {hour.toString().padStart(2, "0")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="flex items-center">:</span>
          <Select
            value={date.getMinutes().toString()}
            onValueChange={handleMinuteChange}
          >
            <SelectTrigger className="w-[70px]">
              <SelectValue placeholder="Min" />
            </SelectTrigger>
            <SelectContent>
              {minuteOptions.map((minute) => (
                <SelectItem key={minute} value={minute.toString()}>
                  {minute.toString().padStart(2, "0")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </PopoverContent>
    </Popover>
  )
}
