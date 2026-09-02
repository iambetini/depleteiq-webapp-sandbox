"use client";

import { useMemo, useState } from "react";
import {
  addMonths,
  endOfMonth,
  format,
  isAfter,
  isBefore,
  isSunday,
  isSameDay,
  startOfMonth,
  startOfToday,
} from "date-fns";
import { useParams } from "next/navigation";
import type {
  DateAfter,
  DateBefore,
  DateInterval,
  DateRange,
  DayOfWeek,
  Matcher,
} from "react-day-picker";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SelectWithFetch } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { Assignment } from "@/types/assignment";
import type { CoverageArea } from "@/types/coverage-area";
import { cn } from "@/lib/utils";
import { canDeleteAssignment, canEditAssignment } from "@/lib/date-utils";
import {
  useCreateAssignmentMutation,
  useGetAssignmentsQuery,
  useUpdateAssignmentMutation,
  useDeleteAssignmentMutation,
} from "@/store/assignments";
import { useGetVSSQuery } from "@/store/vss";
import { MapPin, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type AssignmentSummary = {
  uuid: string;
  assignment_date: string;
  coverage_area_id: string | number;
  coverage_area_name?: string;
  status?: string;
};

const today = startOfToday();
const currentMonthStart = startOfMonth(today);
const nextMonthEnd = endOfMonth(addMonths(today, 1));

export default function AssignmentPage() {
  const params = useParams();
  const vssId = params.id as string;
  const { toast } = useToast();

  const [month, setMonth] = useState<Date>(currentMonthStart);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(today);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCoverageArea, setSelectedCoverageArea] = useState<string>("");
  const [coverageLoading, setCoverageLoading] = useState<boolean>(false);
  const [editingAssignment, setEditingAssignment] =
    useState<AssignmentSummary | null>(null);

  const { data: vssUser } = useGetVSSQuery(vssId);

  const vssDisplayName = useMemo(() => {
    if (!vssUser) return "";
    const u: any = vssUser;
    // API may return { data: { item: ... } } via getById handler => actual user is u.data.item or u
    const actual = u?.first_name ? u : u?.data?.item || u;
    if (actual.full_name) return actual.full_name;
    if (actual.first_name || actual.last_name)
      return `${actual.first_name || ""} ${actual.last_name || ""}`.trim();
    return actual.email || vssId;
  }, [vssUser, vssId]);

  const vssNumericId = useMemo(() => {
    const u: any = vssUser;
    const actual = u?.id ? u : u?.data?.item || u;
    // Prefer numeric id if exists, otherwise fallback to uuid param
    return actual?.id ?? vssId;
  }, [vssUser, vssId]);

  const [createAssignment, { isLoading: isCreating }] =
    useCreateAssignmentMutation();
  const [updateAssignment, { isLoading: isUpdating }] =
    useUpdateAssignmentMutation();
  const [deleteAssignment, { isLoading: isDeleting }] =
    useDeleteAssignmentMutation();

  const { data: assignmentsResult } = useGetAssignmentsQuery({
    params: {
      vss_user_id: vssNumericId,
      start_date: format(currentMonthStart, "yyyy-MM-01"),
      end_date: format(nextMonthEnd, "yyyy-MM-dd"),
    },
  });

  const assignments = useMemo(
    () => ensureArray<Assignment>(assignmentsResult),
    [assignmentsResult]
  );

  const assignmentSummaries = useMemo(() => {
    if (!assignments || assignments.length === 0)
      return [] as AssignmentSummary[];
    return assignments.map((assignment: any) => {
      const coverageName =
        assignment.coverage_area_name ||
        assignment.coverage_area?.name ||
        assignment.coverage_area?.coverage_area_name ||
        "Coverage area";
      return {
        uuid: assignment.uuid,
        assignment_date: assignment.assignment_date,
        coverage_area_id: assignment.coverage_area_id,
        coverage_area_name: coverageName,
        status: assignment.status,
      };
    });
  }, [assignments]);

  const assignmentsByDate = useMemo(() => {
    return assignmentSummaries.reduce((acc, assignment) => {
      const assignmentDate = new Date(assignment.assignment_date);
      const dayKey = format(assignmentDate, "yyyy-MM-dd");
      acc.set(dayKey, [...(acc.get(dayKey) || []), assignment]);
      return acc;
    }, new Map<string, AssignmentSummary[]>());
  }, [assignmentSummaries]);

  const disabledMatcher = useMemo<Matcher[]>(
    () => [
      {
        before: today,
      },
      (date: Date) =>
        isSunday(date) || isBefore(date, today) || isAfter(date, nextMonthEnd),
    ],
    []
  );

  const handleMonthChange = (next: Date) => {
    if (isBefore(next, currentMonthStart)) {
      setMonth(currentMonthStart);
      return;
    }
    if (isAfter(next, nextMonthEnd)) {
      setMonth(startOfMonth(nextMonthEnd));
      return;
    }
    setMonth(startOfMonth(next));
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    if (
      isSunday(date) ||
      isBefore(date, today) ||
      isAfter(date, nextMonthEnd)
    ) {
      return;
    }
    setSelectedDate(date);

    const dayKey = format(date, "yyyy-MM-dd");
    const existingAssignments = assignmentsByDate.get(dayKey);

    if (existingAssignments && existingAssignments.length > 0) {
      const assignment = existingAssignments[0];
      const fullAssignment: any = assignments.find(
        (a: any) => a.uuid === assignment.uuid
      );

      if (fullAssignment) {
        setEditingAssignment(assignment);
        const coverageId = fullAssignment.coverage_area_id
          ? String(fullAssignment.coverage_area_id)
          : "";
        if (coverageId) {
          setSelectedCoverageArea(coverageId);
          setCoverageLoading(false);
        } else if (fullAssignment.coverage_area?.uuid) {
          setSelectedCoverageArea(String(fullAssignment.coverage_area.uuid));
          setCoverageLoading(false);
        } else {
          // fallback: try to search coverage area by name
          const coverageName = assignment.coverage_area_name;
          if (coverageName && coverageName !== "Coverage area") {
            setCoverageLoading(true);
            import("@/lib/api-client").then(({ apiClient }) => {
              apiClient
                .get<{ items: CoverageArea[] }>(
                  `/coverage-areas?search=${encodeURIComponent(coverageName)}&per_page=10`
                )
                .then(({ data }) => {
                  const items = (data as any).items || [];
                  const found = items.find(
                    (c: any) =>
                      c.name === coverageName ||
                      c.coverage_area_name === coverageName
                  );
                  if (found) {
                    setSelectedCoverageArea(String(found.uuid || found.id));
                  } else {
                    setSelectedCoverageArea("");
                  }
                  setCoverageLoading(false);
                })
                .catch(() => {
                  setSelectedCoverageArea("");
                  setCoverageLoading(false);
                });
            });
          } else {
            setSelectedCoverageArea("");
            setCoverageLoading(false);
          }
        }
      }
    } else {
      setEditingAssignment(null);
      setSelectedCoverageArea("");
      setCoverageLoading(false);
    }

    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedCoverageArea("");
    setCoverageLoading(false);
    setEditingAssignment(null);
  };

  const handleDeleteAssignment = async () => {
    if (!editingAssignment) return;

    if (!canDeleteAssignment(editingAssignment.assignment_date)) {
      toast({
        title: "Cannot delete assignment",
        description:
          "You can only delete assignments scheduled for future dates.",
        variant: "destructive",
      });
      return;
    }

    try {
      await deleteAssignment(editingAssignment.uuid).unwrap();
      toast({
        title: "Assignment deleted",
        description: `Assignment removed successfully.`,
      });
      closeDialog();
    } catch (error: any) {
      toast({
        title: "Failed to delete assignment",
        description: error?.data?.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubmitAssignment = async () => {
    if (!selectedDate || !selectedCoverageArea) {
      toast({
        title: "Missing details",
        description: "Select a coverage area before saving the assignment.",
        variant: "destructive",
      });
      return;
    }

    if (
      editingAssignment &&
      !canEditAssignment(editingAssignment.assignment_date)
    ) {
      toast({
        title: "Cannot edit assignment",
        description:
          "You can only edit assignments scheduled for today or future dates.",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      vss_user_id: vssNumericId,
      coverage_area_id: selectedCoverageArea,
      assignment_date: format(selectedDate, "yyyy-MM-dd"),
    };

    try {
      if (editingAssignment) {
        await updateAssignment({
          id: editingAssignment.uuid,
          data: payload as any,
        }).unwrap();
        toast({
          title: "Assignment updated",
          description: `Updated assignment for ${format(selectedDate, "PPP")}.`,
        });
      } else {
        await createAssignment({ data: payload as any }).unwrap();
        toast({
          title: "Assignment created",
          description: `Scheduled for ${format(selectedDate, "PPP")}.`,
        });
      }
      closeDialog();
    } catch (error: any) {
      const action = editingAssignment ? "update" : "create";
      const backendMessage =
        error?.error ||
        error?.data?.[0]?.message ||
        error?.data?.message ||
        `Failed to ${action} assignment`;

      toast({
        title: `Failed to ${action} assignment`,
        description: backendMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>VSS Assignments Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <AssignmentTable
            month={month}
            onMonthChange={handleMonthChange}
            onDaySelect={handleDateSelect}
            selectedDate={selectedDate}
            disabledMatcher={disabledMatcher}
            assignmentsByDate={assignmentsByDate}
          />
        </CardContent>
      </Card>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => (!open ? closeDialog() : setIsDialogOpen(open))}
      >
        <DialogContent className="w-full sm:max-w-lg flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {editingAssignment ? "Update" : "Schedule"} assignment for{" "}
              {selectedDate ? format(selectedDate, "PPP") : "selected day"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="vss_user">VSS User</Label>
              <Input
                id="vss_user"
                value={vssDisplayName || "Loading..."}
                readOnly
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverage_area">Coverage Area *</Label>
              <div className="relative">
                <SelectWithFetch
                  fetchUrl="/coverage-areas"
                  store="coverageAreas"
                  value={selectedCoverageArea}
                  onChange={setSelectedCoverageArea}
                  valueKey="uuid"
                  labelKey="name"
                  labelFormatter={(item: any) =>
                    item.name ||
                    item.coverage_area_name ||
                    item.title ||
                    item.label ||
                    item.uuid
                  }
                  placeholder={
                    coverageLoading ? "Loading..." : "Select coverage area"
                  }
                  params={{ per_page: 1000 }}
                />
                {coverageLoading && (
                  <div className="absolute right-10 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                    <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignment_date">Assignment Date</Label>
              <Input
                id="assignment_date"
                value={
                  selectedDate ? format(selectedDate, "yyyy-MM-dd") : ""
                }
                readOnly
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Date is set from the calendar selection.
              </p>
            </div>
          </div>

          <DialogFooter className="mt-4 pt-4 flex justify-between gap-3 sm:border-t">
            <div className="flex gap-3">
              {editingAssignment &&
                canDeleteAssignment(editingAssignment.assignment_date) && (
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAssignment}
                    disabled={isDeleting || isCreating || isUpdating}
                    type="button"
                  >
                    {isDeleting ? "Deleting..." : "Delete Assignment"}
                  </Button>
                )}
            </div>
            <div className="flex gap-3 ml-auto">
              <Button variant="outline" onClick={closeDialog} type="button">
                Cancel
              </Button>
              {(!editingAssignment ||
                canEditAssignment(editingAssignment.assignment_date)) && (
                <Button
                  className="bg-[#f97316] hover:bg-[#ea580c] text-white"
                  onClick={handleSubmitAssignment}
                  disabled={
                    isCreating || isUpdating || isDeleting || !selectedCoverageArea
                  }
                  type="button"
                >
                  {isCreating || isUpdating
                    ? editingAssignment
                      ? "Updating..."
                      : "Scheduling..."
                    : editingAssignment
                      ? "Update Assignment"
                      : "Schedule Assignment"}
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

type AssignmentTableProps = {
  month: Date;
  onMonthChange: (date: Date) => void;
  onDaySelect: (date: Date) => void;
  selectedDate?: Date;
  disabledMatcher: Matcher[];
  assignmentsByDate: Map<string, AssignmentSummary[]>;
};

function AssignmentTable({
  month,
  onMonthChange,
  onDaySelect,
  selectedDate,
  disabledMatcher,
  assignmentsByDate,
}: AssignmentTableProps) {
  const weeks = useMemo(() => generateWeeks(month), [month]);
  const isDisabled = (date: Date) => isDateDisabled(date, disabledMatcher);

  return (
    <div className="rounded-md border">
      <div className="flex items-center justify-between border-b bg-muted px-4 py-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onMonthChange(addMonths(month, -1))}
        >
          Prev
        </Button>
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase">
            {format(month, "MMMM yyyy")}
          </h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onMonthChange(addMonths(month, 1))}
        >
          Next
        </Button>
      </div>
      <div className="overflow-hidden">
        <table className="w-full table-fixed border-collapse text-sm">
          <thead>
            <tr className="bg-muted/60">
              {"Sun Mon Tue Wed Thu Fri Sat".split(" ").map((weekday) => (
                <th
                  key={weekday}
                  className="w-[14.285%] border-r px-3 py-2 text-left font-medium text-muted-foreground last:border-r-0"
                >
                  {weekday}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week, weekIndex) => (
              <tr key={weekIndex} className="border-t">
                {week.map((date, dayIndex) => {
                  if (!date) {
                    return (
                      <td
                        key={dayIndex}
                        className="h-28 border-r bg-muted/30 last:border-r-0"
                      />
                    );
                  }
                  const dayKey = format(date, "yyyy-MM-dd");
                  const summary = assignmentsByDate.get(dayKey);

                  const disabled = isDisabled(date);
                  const isToday = isSameDay(date, today);
                  const isSelected = selectedDate
                    ? isSameDay(date, selectedDate)
                    : false;

                  return (
                    <td
                      key={dayIndex}
                      className={cn(
                        "h-32 border-r align-top last:border-r-0 relative",
                        disabled && "bg-muted/40"
                      )}
                    >
                      {isSelected && (
                        <div className="absolute inset-0 ring-2 ring-primary ring-inset pointer-events-none z-10" />
                      )}
                      <button
                        type="button"
                        className={cn(
                          "flex h-full w-full flex-col gap-2 p-3 text-left",
                          disabled
                            ? "cursor-not-allowed opacity-60"
                            : "hover:bg-muted/70"
                        )}
                        onClick={() => !disabled && onDaySelect(date)}
                        disabled={disabled}
                      >
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span>{format(date, "d")}</span>
                          {isToday && (
                            <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
                              Today
                            </span>
                          )}
                        </div>
                        {summary && summary.length > 0 ? (
                          <div className="space-y-1.5">
                            {summary.map((item) => (
                              <div
                                key={item.uuid}
                                className="rounded-lg border bg-background p-2 space-y-1.5 shadow-sm"
                              >
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                                  <span className="truncate font-bold">
                                    {item.coverage_area_name || "Coverage area"}
                                  </span>
                                </div>
                                {item.status && (
                                  <Badge
                                    variant={
                                      item.status === "active"
                                        ? "default"
                                        : item.status === "inactive"
                                          ? "destructive"
                                          : "outline"
                                    }
                                    className={cn(
                                      "text-[10px] px-1.5 py-0 h-5 capitalize font-medium",
                                      item.status === "active" && "status active",
                                      item.status === "inactive" && "status inactive",
                                      item.status === "completed" && "bg-blue-500 text-white border-transparent hover:bg-blue-600",
                                      item.status === "expired" && "bg-amber-500 text-white border-transparent hover:bg-amber-600"
                                    )}
                                  >
                                    <span
                                      className={cn(
                                        "inline-flex items-center justify-center rounded-full border mr-1",
                                        item.status === "active" &&
                                        "bg-green-500 border-black",
                                        item.status === "completed" &&
                                        "bg-red-500 border-black"
                                      )}
                                    >
                                      <CheckCircle2 className="w-3 h-3 text-white" />
                                    </span>
                                    {item.status.toLowerCase()}
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex h-full items-center justify-center text-[11px] text-muted-foreground">
                            {disabled ? "Locked" : "Click to schedule"}
                          </div>
                        )}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function generateWeeks(month: Date) {
  const start = startOfMonth(month);
  const end = endOfMonth(month);
  const weeks: (Date | null)[][] = [];
  let currentWeek: (Date | null)[] = new Array(start.getDay()).fill(null);
  for (let day = start.getDate(); day <= end.getDate(); day++) {
    const currentDate = new Date(month.getFullYear(), month.getMonth(), day);
    currentWeek.push(currentDate);
    if (currentDate.getDay() === 6) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }
  return weeks;
}

type MatcherObject =
  | DateRange
  | DateBefore
  | DateAfter
  | DateInterval
  | DayOfWeek;

function isDisabledByObject(matcher: MatcherObject, date: Date): boolean {
  if ("before" in matcher && matcher.before) {
    if (isBefore(date, matcher.before)) return true;
  }
  if ("after" in matcher && matcher.after) {
    if (isAfter(date, matcher.after)) return true;
  }
  if ("from" in matcher && "to" in matcher) {
    const { from, to } = matcher;
    if (from && to) {
      if (isBefore(date, from) || isAfter(date, to)) return true;
    }
  }
  if ("dayOfWeek" in matcher && matcher.dayOfWeek) {
    return Array.isArray(matcher.dayOfWeek)
      ? matcher.dayOfWeek.includes(date.getDay())
      : matcher.dayOfWeek === date.getDay();
  }
  return false;
}

function isDateDisabled(date: Date, matchers: Matcher[]): boolean {
  return matchers.some((matcher) => matchesMatcher(matcher, date));
}

function matchesMatcher(matcher: Matcher, date: Date): boolean {
  if (typeof matcher === "function") {
    return matcher(date);
  }
  if (Array.isArray(matcher)) {
    return matcher.some((single) => matchesMatcher(single, date));
  }
  if (matcher instanceof Date) {
    return isSameDay(matcher, date);
  }
  return isDisabledByObject(matcher as MatcherObject, date);
}

function ensureArray<T>(value: T[] | { data?: any } | null | undefined): T[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;

  const typedValue = value as any;

  if (typedValue.data && Array.isArray(typedValue.data.items)) {
    return typedValue.data.items;
  }

  if (Array.isArray(typedValue.data)) {
    return typedValue.data;
  }

  if (
    typedValue.data &&
    typeof typedValue.data === "object" &&
    Array.isArray(typedValue.data.data)
  ) {
    return typedValue.data.data;
  }

  return [];
}
