"use client";

import { useDateFilter } from "@/hooks/use-date-filter";
import type { DateFilterOption } from "@/lib/date-utils";
import { useCallback, useState } from "react";
import { CustomDatePicker } from "./CustomDatePicker";
import { DateFilterDropdown } from "./DateFilterDropdown";

export function DateFilter() {
  const {
    selectedFilter,
    handleFilterChange,
    handleCustomDateChange,
    getDisplayText,
    getCustomDateSelection,
  } = useDateFilter();

  const [customPanelOpen, setCustomPanelOpen] = useState(false);

  const onFilterChange = useCallback(
    (filter: DateFilterOption) => {
      handleFilterChange(filter);
      if (filter === "Custom") {
        setCustomPanelOpen(true);
      } else {
        setCustomPanelOpen(false);
      }
    },
    [handleFilterChange],
  );

  return (
    <div className="relative flex items-center gap-2">
      <DateFilterDropdown
        selectedFilter={selectedFilter}
        displayText={getDisplayText()}
        onFilterChange={onFilterChange}
      />

      {selectedFilter === "Custom" && (
        <CustomDatePicker
          panelOpen={customPanelOpen}
          onPanelOpenChange={setCustomPanelOpen}
          selectedRange={getCustomDateSelection()}
          onDateChange={handleCustomDateChange}
        />
      )}
    </div>
  );
}
