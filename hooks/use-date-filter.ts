import {
  calculateDateRange,
  formatCustomDateRange,
  type CustomDateRange,
  type DateFilterOption,
} from "@/lib/date-utils";
import type { RootState } from "@/store";
import { store } from "@/store";
import {
  setCustomDateRange,
  setDateRange,
  setSelectedFilter,
} from "@/store/dashboard-filters";
import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export function useDateFilter() {
  const dispatch = useDispatch();
  const selectedFilter = useSelector(
    (state: RootState) => state.dashboardFilters.selectedFilter,
  );
  const customDateRange = useSelector(
    (state: RootState) => state.dashboardFilters.customDateRange,
  );
  const dateRange = useSelector(
    (state: RootState) => state.dashboardFilters.dateRange,
  );

  // Hydrate date range on first use so consumers (e.g. footprint) match the UI default.
  // Read fresh store state inside the effect to avoid stale closures overwriting a
  // page that already set Today (or another preset) during layout.
  useEffect(() => {
    const current = store.getState().dashboardFilters;
    if (current.dateRange.start_date && current.dateRange.end_date) return;
    if (current.selectedFilter === "Custom") return;
    dispatch(setDateRange(calculateDateRange(current.selectedFilter)));
  }, [dateRange.start_date, dateRange.end_date, selectedFilter, dispatch]);

  const handleFilterChange = useCallback(
    (filter: DateFilterOption) => {
      dispatch(setSelectedFilter(filter));

      if (filter !== "Custom") {
        // Clear custom date range for non-custom filters
        dispatch(setCustomDateRange({}));
        const nextRange = calculateDateRange(filter);
        dispatch(setDateRange(nextRange));
      }
    },
    [dispatch],
  );

  const handleCustomDateChange = useCallback(
    (range: { from?: Date; to?: Date }) => {
      const customRange: CustomDateRange = {
        from: range.from?.toISOString(),
        to: range.to?.toISOString(),
      };

      dispatch(setCustomDateRange(customRange));

      if (range.from && range.to) {
        const nextRange = calculateDateRange("Custom", range);
        dispatch(setDateRange(nextRange));
      }
    },
    [dispatch],
  );

  const getDisplayText = useCallback(() => {
    if (
      selectedFilter === "Custom" &&
      customDateRange.from &&
      customDateRange.to
    ) {
      return formatCustomDateRange(customDateRange.from, customDateRange.to);
    }
    return selectedFilter;
  }, [selectedFilter, customDateRange]);

  const getCustomDateSelection = useCallback(() => {
    return {
      from: customDateRange.from ? new Date(customDateRange.from) : undefined,
      to: customDateRange.to ? new Date(customDateRange.to) : undefined,
    };
  }, [customDateRange]);

  return {
    selectedFilter,
    customDateRange,
    dateRange,
    handleFilterChange,
    handleCustomDateChange,
    getDisplayText,
    getCustomDateSelection,
  };
}
