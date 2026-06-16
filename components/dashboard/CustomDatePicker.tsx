"use client";

import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "lucide-react";
import { isAfter, startOfDay } from "date-fns";
import { useEffect, useRef } from "react";
import type { DateRange } from "react-day-picker";

interface CustomDatePickerProps {
  panelOpen: boolean;
  onPanelOpenChange: (open: boolean) => void;
  selectedRange: { from?: Date; to?: Date };
  onDateChange: (range: { from?: Date; to?: Date }) => void;
}

export function CustomDatePicker({
  panelOpen,
  onPanelOpenChange,
  selectedRange,
  onDateChange,
}: CustomDatePickerProps) {
  const ignoreOutsideDismissRef = useRef(false);

  useEffect(() => {
    if (!panelOpen) return;
    ignoreOutsideDismissRef.current = true;
    const timer = setTimeout(() => {
      ignoreOutsideDismissRef.current = false;
    }, 300);
    return () => clearTimeout(timer);
  }, [panelOpen]);

  const handleDateSelect = (range: DateRange | undefined) => {
    if (range) {
      onDateChange(range);
    }
  };

  return (
    <Popover open={panelOpen} onOpenChange={onPanelOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-expanded={panelOpen}
        >
          <Calendar className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0"
        align="end"
        side="bottom"
        sideOffset={8}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={(e) => {
          if (ignoreOutsideDismissRef.current) {
            e.preventDefault();
          }
        }}
        onFocusOutside={(e) => {
          if (ignoreOutsideDismissRef.current) {
            e.preventDefault();
          }
        }}
      >
        <CalendarComponent
          mode="range"
          selected={
            selectedRange.from || selectedRange.to
              ? (selectedRange as DateRange)
              : undefined
          }
          onSelect={handleDateSelect}
          numberOfMonths={2}
          disabled={(date) =>
            isAfter(startOfDay(date), startOfDay(new Date()))
          }
        />
        <div className="flex items-center justify-end border-t p-2">
          <Button
            type="button"
            size="sm"
            onClick={() => onPanelOpenChange(false)}
          >
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
