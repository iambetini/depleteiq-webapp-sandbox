"use client";

import ViewPageHeader from "@/components/dashboard/ViewPageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectWithFetch } from "@/components/ui/select";
import { canDeleteAssignment, canEditAssignment } from "@/lib/date-utils";
import { useToast } from "@/hooks/use-toast";
import { useUpdateAssignmentMutation } from "@/store/assignments";
import { Status } from "@/types/assignment";
import { format, startOfToday } from "date-fns";
import {
  Activity,
  Calendar,
  Edit,
  MapPin,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useContext } from "./layout";

function capitalizeFirstLetter(str: string) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function getVssDisplayName(assignment: {
  vss_user?: {
    full_name?: string;
    first_name?: string;
    last_name?: string;
  };
  vss_name?: string;
}) {
  const user = assignment.vss_user;
  if (user?.full_name) return user.full_name;
  if (user?.first_name || user?.last_name) {
    return `${user.first_name || ""} ${user.last_name || ""}`.trim();
  }
  return assignment.vss_name || "VSS User";
}

function getCoverageAreaName(assignment: {
  coverage_area?: { name?: string; coverage_area_name?: string };
  coverage_area_name?: string;
}) {
  return (
    assignment.coverage_area?.name ||
    assignment.coverage_area?.coverage_area_name ||
    assignment.coverage_area_name ||
    "—"
  );
}

function getStatusClass(status: string) {
  const normalized = status.toLowerCase();
  if (normalized === "active") return "status active";
  if (normalized === "inactive") return "status inactive";
  if (normalized === "completed") {
    return "bg-blue-500 text-white hover:bg-blue-600 border-transparent";
  }
  if (normalized === "expired") {
    return "bg-amber-500 text-white hover:bg-amber-600 border-transparent";
  }
  return "status inactive";
}

export default function AssignmentDetailPage() {
  const router = useRouter();
  const { toast } = useToast();
  const context = useContext();
  const assignment = context?.assignment;

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editSelectedVss, setEditSelectedVss] = useState("");
  const [editSelectedCoverageArea, setEditSelectedCoverageArea] = useState("");
  const [editAssignmentDate, setEditAssignmentDate] = useState(
    format(startOfToday(), "yyyy-MM-dd")
  );
  const [updateAssignment, { isLoading: isUpdating }] =
    useUpdateAssignmentMutation();

  if (!assignment) {
    return null;
  }

  const vssName = getVssDisplayName(assignment);
  const coverageAreaName = getCoverageAreaName(assignment);
  const assignmentDateDisplay =
    assignment.assignment_date?.slice(0, 10) || assignment.assignment_date;
  const canEdit = canEditAssignment(assignment.assignment_date);
  const canDelete = canDeleteAssignment(assignment.assignment_date);
  const status = (assignment.status || "").toLowerCase();

  const openEditDialog = () => {
    setEditSelectedVss(assignment.vss_user?.uuid || String(assignment.vss_user_id || ""));
    setEditSelectedCoverageArea(
      assignment.coverage_area?.uuid || String(assignment.coverage_area_id || "")
    );
    setEditAssignmentDate(
      assignment.assignment_date?.slice(0, 10) ||
        format(startOfToday(), "yyyy-MM-dd")
    );
    setIsEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setIsEditDialogOpen(false);
  };

  const handleUpdate = async () => {
    if (!editSelectedVss || !editSelectedCoverageArea || !editAssignmentDate) {
      toast({
        title: "Missing details",
        description: "Select VSS user, coverage area and date before saving.",
        variant: "destructive",
      });
      return;
    }

    if (!canEditAssignment(assignment.assignment_date)) {
      toast({
        title: "Cannot edit assignment",
        description:
          "You can only edit assignments scheduled for today or future dates.",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateAssignment({
        id: assignment.uuid,
        data: {
          vss_user_id: editSelectedVss,
          coverage_area_id: editSelectedCoverageArea,
          assignment_date: editAssignmentDate,
        },
      }).unwrap();
      toast({
        title: "Assignment updated",
        description: `Updated assignment for ${editAssignmentDate}.`,
      });
      closeEditDialog();
      router.refresh();
    } catch (error: any) {
      const backendMessage =
        error?.data?.[0]?.message ||
        error?.errors?.[0]?.message ||
        error?.data?.message ||
        error?.error ||
        "Failed to update assignment";
      toast({
        title: "Failed to update assignment",
        description: backendMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <ViewPageHeader
        title={`Assignment - ${vssName}`}
        description={
          canEdit
            ? `Scheduled assignment for ${vssName} on ${assignmentDateDisplay}`
            : `Assignment for ${vssName} on ${assignmentDateDisplay}`
        }
        showDeleteButton={canDelete}
        deleteOptions={
          canDelete
            ? {
                storeName: "assignments",
                uuid: assignment.uuid,
                redirectPath: "/dashboard/assignments",
              }
            : undefined
        }
        actions={
          canEdit ? (
            <Button variant="outline" onClick={openEditDialog}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-[#444444] flex items-center">
              <Activity className="mr-2 h-5 w-5" />
              Assignment Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Activity className="h-5 w-5 text-[#ababab]" />
                <div>
                  <p className="text-sm text-[#ababab]">Status</p>
                  <Badge
                    className={`capitalize ${getStatusClass(status)}`}
                  >
                    {capitalizeFirstLetter(assignment.status || Status.inactive)}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-[#ababab]" />
                <div>
                  <p className="text-sm text-[#ababab]">Assignment Date</p>
                  <p className="font-medium text-[#444444]">
                    {assignmentDateDisplay}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-[#ababab]" />
                <div>
                  <p className="text-sm text-[#ababab]">Created At</p>
                  <p className="font-medium text-[#444444]">
                    {assignment.created_at || "—"}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-[#ababab]" />
                <div>
                  <p className="text-sm text-[#ababab]">Updated At</p>
                  <p className="font-medium text-[#444444]">
                    {assignment.updated_at || "—"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-[#444444] flex items-center">
              <User className="mr-2 h-5 w-5" />
              VSS & Coverage Area
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-[#ababab]" />
                <div>
                  <p className="text-sm text-[#ababab]">VSS User</p>
                  <p className="font-medium text-[#444444]">{vssName}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-[#ababab]" />
                <div>
                  <p className="text-sm text-[#ababab]">Coverage Area</p>
                  <p className="font-medium text-[#444444]">
                    {coverageAreaName}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => (!open ? closeEditDialog() : setIsEditDialogOpen(open))}
      >
        <DialogContent className="w-full sm:max-w-lg flex flex-col">
          <DialogHeader>
            <DialogTitle>Edit Assignment</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>VSS User *</Label>
              <SelectWithFetch
                fetchUrl="/users?roles=vss"
                store="vss"
                value={editSelectedVss}
                onChange={setEditSelectedVss}
                valueKey="uuid"
                labelKey="full_name"
                placeholder="Select VSS user"
                params={{ roles: "vss", per_page: 1000 }}
                labelFormatter={(item: any) =>
                  item.full_name ||
                  `${item.first_name || ""} ${item.last_name || ""}`.trim() ||
                  item.email ||
                  item.uuid
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Coverage Area *</Label>
              <SelectWithFetch
                fetchUrl="/coverage-areas"
                store="coverageAreas"
                value={editSelectedCoverageArea}
                onChange={setEditSelectedCoverageArea}
                valueKey="uuid"
                labelKey="name"
                placeholder="Select coverage area"
                params={{ per_page: 1000 }}
                labelFormatter={(item: any) =>
                  item.name ||
                  item.coverage_area_name ||
                  item.title ||
                  item.uuid
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_assignment_date">Assignment Date *</Label>
              <Input
                id="edit_assignment_date"
                type="date"
                value={editAssignmentDate}
                onChange={(e) => setEditAssignmentDate(e.target.value)}
                min={format(startOfToday(), "yyyy-MM-dd")}
              />
            </div>
          </div>

          <DialogFooter className="mt-4 pt-4 flex justify-end gap-3 sm:border-t">
            <Button variant="outline" onClick={closeEditDialog} type="button">
              Cancel
            </Button>
            <Button
              className="bg-[#f97316] hover:bg-[#ea580c] text-white"
              onClick={handleUpdate}
              disabled={
                isUpdating ||
                !editSelectedVss ||
                !editSelectedCoverageArea ||
                !editAssignmentDate
              }
              type="button"
            >
              {isUpdating ? "Updating..." : "Update Assignment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
