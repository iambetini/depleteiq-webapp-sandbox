import { format, parse } from "date-fns";

export type DateFilterOption =
  | "Today"
  | "This week"
  | "This month"
  | "This quarter"
  | "All time"
  | "Custom";

/** Mirrors preset keys sent as `period` to `/dashboard/operations` (plus `custom`, `all_time`). */
export type DateRangePeriodType =
  | "today"
  | "week"
  | "month"
  | "quarter"
  | "all_time"
  | "custom";

export interface DateRange {
  start_date: string;
  end_date: string;
  period_type?: DateRangePeriodType;
}

export interface CustomDateRange {
  from?: string;
  to?: string;
}

/**
 * Calculate date range based on filter option
 */
export function calculateDateRange(
  filter: DateFilterOption,
  customRange?: { from?: Date; to?: Date },
): DateRange {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (filter) {
    case "Today":
      return { ...getTodayRange(today), period_type: "today" };
    case "This week":
      return { ...getWeekRange(today), period_type: "week" };
    case "This month":
      return { ...getMonthRange(now), period_type: "month" };
    case "This quarter":
      return { ...getQuarterRange(now), period_type: "quarter" };
    case "All time":
      return { ...getAllTimeRange(today), period_type: "all_time" };
    case "Custom":
      return getCustomRange(customRange);
    default:
      return { ...getWeekRange(today), period_type: "week" };
  }
}

function getTodayRange(today: Date): DateRange {
  return {
    start_date: format(today, "yyyy-MM-dd"),
    end_date: format(today, "yyyy-MM-dd"),
  };
}

function getWeekRange(today: Date): DateRange {
  const startOfWeek = new Date(today);
  const dayOfWeek = startOfWeek.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  startOfWeek.setDate(startOfWeek.getDate() + diff);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6);

  return {
    start_date: format(startOfWeek, "yyyy-MM-dd"),
    end_date: format(endOfWeek, "yyyy-MM-dd"),
  };
}

function getMonthRange(now: Date): DateRange {
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return {
    start_date: format(startOfMonth, "yyyy-MM-dd"),
    end_date: format(endOfMonth, "yyyy-MM-dd"),
  };
}

function getQuarterRange(now: Date): DateRange {
  const quarter = Math.floor(now.getMonth() / 3);
  const startOfQuarter = new Date(now.getFullYear(), quarter * 3, 1);
  const endOfQuarter = new Date(now.getFullYear(), quarter * 3 + 3, 0);

  return {
    start_date: format(startOfQuarter, "yyyy-MM-dd"),
    end_date: format(endOfQuarter, "yyyy-MM-dd"),
  };
}

function getAllTimeRange(today: Date): DateRange {
  return {
    start_date: "2020-01-01",
    end_date: format(today, "yyyy-MM-dd"),
  };
}

/**
 * Ensures `from` / `to` (yyyy-MM-dd) are not after local calendar today
 * (API: "to must be a date before or equal to today").
 */
export function clampDateRangeToToday(from: string, to: string): { from: string; to: string } {
  const today = format(new Date(), "yyyy-MM-dd");
  let end = to > today ? today : to;
  let start = from > end ? end : from;
  if (start > today) start = today;
  return { from: start, to: end };
}

function getCustomRange(customRange?: { from?: Date; to?: Date }): DateRange {
  if (customRange?.from && customRange?.to) {
    const start_date = format(customRange.from, "yyyy-MM-dd");
    const end_date = format(customRange.to, "yyyy-MM-dd");
    const clamped = clampDateRangeToToday(start_date, end_date);
    return {
      start_date: clamped.from,
      end_date: clamped.to,
      period_type: "custom",
    };
  }
  // Fallback to current week if custom range is incomplete
  return { ...getWeekRange(new Date()), period_type: "week" };
}

/**
 * Format custom date range for display
 */
export function formatCustomDateRange(from: string, to: string): string {
  const fromDate = parseCalendarDate(from);
  const toDate = parseCalendarDate(to);
  return `${format(fromDate, "MMM dd")} - ${format(toDate, "MMM dd, yyyy")}`;
}

/** Parse `yyyy-MM-dd` or fall back to `Date` parsing (legacy ISO strings). */
export function parseCalendarDate(value: string): Date {
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return parse(trimmed, "yyyy-MM-dd", new Date());
  }
  return new Date(trimmed);
}

/**
 * Get all available filter options
 */
export const DATE_FILTER_OPTIONS: DateFilterOption[] = [
  "Today",
  "This week",
  "This month",
  "This quarter",
  "All time",
  "Custom",
];

/**
 * Check if assignment date is today or in the future (can be edited)
 */
export function canEditAssignment(dateString: string): boolean {
  if (!dateString) return false;

  try {
    const assignmentDate = new Date(dateString);
    const today = new Date();

    assignmentDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    return assignmentDate >= today;
  } catch {
    return false;
  }
}

/**
 * Check if assignment date is strictly in the future (can be deleted)
 */
export function canDeleteAssignment(dateString: string): boolean {
  if (!dateString) return false;

  try {
    const assignmentDate = new Date(dateString);
    const today = new Date();

    assignmentDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    return assignmentDate > today;
  } catch {
    return false;
  }
}
