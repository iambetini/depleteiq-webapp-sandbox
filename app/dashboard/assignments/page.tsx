"use client"

import ListPageHeader from "@/components/dashboard/ListPageHeader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import type { ColumnDef } from "@/components/ui/data-table-types"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SelectWithFetch } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { handleDelete } from "@/lib/handleDelete"
import { useToast } from "@/hooks/use-toast"
import { useCreateAssignmentMutation, useUpdateAssignmentMutation } from "@/store/assignments"
import { canDeleteAssignment, canEditAssignment } from "@/lib/date-utils"
import { Calendar, Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import React, { useRef, useCallback, useState } from "react"
import { format, startOfToday } from "date-fns"

type VssAssignment = {
  uuid: string
  assignment_date: string
  status: string
  vss_user: {
    uuid: string
    first_name: string
    last_name: string
    full_name: string
    email: string
    phone: string
    role?: { name: string }
  }
  coverage_area: {
    uuid: string
    name: string
    enable_geofence?: boolean
  } | null
  created_at: string
  updated_at: string
}

function getColumns(
  router: any,
  handleDelete: (uuid: string) => void,
  handleEdit: (assignment: VssAssignment) => void
): ColumnDef<VssAssignment>[] {
  return [
    {
      accessorKey: "vss_user",
      header: "VSS User",
      cell: ({ row }) => {
        const user = row.original.vss_user
        if (!user) return <span className="text-muted-foreground">—</span>
        return (
          <div>
            <div className="font-medium">
              {user.full_name || `${user.first_name} ${user.last_name}`}
            </div>
          </div>
        )
      },
      exportValue: (item: VssAssignment) =>
        item.vss_user?.full_name ||
        `${item.vss_user?.first_name || ""} ${item.vss_user?.last_name || ""}`.trim() ||
        item.vss_user?.email ||
        "",
    },
    {
      accessorKey: "coverage_area",
      header: "Coverage Area",
      cell: ({ row }) => {
        const area = row.original.coverage_area
        if (!area) return <span className="text-muted-foreground">—</span>
        return (
          <div>
            <div className="font-medium">{area.name}</div>
          </div>
        )
      },
      exportValue: (item: VssAssignment) => item.coverage_area?.name || "",
    },
    {
      accessorKey: "assignment_date",
      header: "Assignment Date",
      cell: ({ row }) => {
        const d = row.original.assignment_date
        try {
          // API returns "2026-09-01" or ISO; display YYYY-MM-DD
          return d?.slice(0, 10) || d
        } catch {
          return d
        }
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = (row.original.status || "").toLowerCase()
        const variant =
          status === "active"
            ? "default"
            : status === "inactive"
              ? "destructive"
              : status === "completed"
                ? "secondary"
                : status === "expired"
                  ? "destructive"
                  : "outline"
        const statusClass =
          status === "active"
            ? "status active"
            : status === "inactive"
              ? "status inactive"
              : status === "completed"
                ? "bg-blue-500 text-white hover:bg-blue-600 border-transparent"
                : status === "expired"
                  ? "bg-amber-500 text-white hover:bg-amber-600 border-transparent"
                  : "status inactive"
        return (
          <Badge variant={variant as any} className={`capitalize ${statusClass}`}>
            {status}
          </Badge>
        )
      },
    },
    {
      accessorKey: "created_at",
      header: "Created At",
      cell: ({ row }) => row.original.created_at,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const assignment = row.original
        const canEdit = canEditAssignment(assignment.assignment_date)
        const canDelete = canDeleteAssignment(assignment.assignment_date)
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() =>
                  router.push(`/dashboard/assignments/${assignment.uuid}`)
                }
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  const vssId = assignment.vss_user?.uuid
                  if (vssId) {
                    router.push(`/dashboard/field-agents/vss/${vssId}/assignment`)
                  }
                }}
              >
                <Calendar className="mr-2 h-4 w-4" />
                View VSS Calendar
              </DropdownMenuItem>
              {canEdit && (
                <DropdownMenuItem onClick={() => handleEdit(assignment)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              )}
              {canDelete && (
                <DropdownMenuItem
                  onClick={() => handleDelete(assignment.uuid)}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}

export default function AssignmentsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const dataTableRef = useRef<{ refresh: () => void }>(null)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedVss, setSelectedVss] = useState<string>("")
  const [selectedCoverageArea, setSelectedCoverageArea] = useState<string>("")
  const [assignmentDate, setAssignmentDate] = useState<string>(format(startOfToday(), "yyyy-MM-dd"))
  const [createAssignment, { isLoading: isCreating }] = useCreateAssignmentMutation()
  const [updateAssignment, { isLoading: isUpdating }] = useUpdateAssignmentMutation()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState<VssAssignment | null>(null)
  const [editSelectedVss, setEditSelectedVss] = useState<string>("")
  const [editSelectedCoverageArea, setEditSelectedCoverageArea] = useState<string>("")
  const [editAssignmentDate, setEditAssignmentDate] = useState<string>(format(startOfToday(), "yyyy-MM-dd"))

  const refreshTable = useCallback(() => {
    dataTableRef.current?.refresh()
  }, [])

  const deleteHandler = useCallback(
    (uuid: string) => {
      handleDelete({
        storeName: "assignments",
        uuid,
        entityLabel: "Assignment",
        onSuccess: refreshTable,
      })
    },
    [refreshTable]
  )

  const handleEdit = useCallback((assignment: VssAssignment) => {
    setEditingAssignment(assignment)
    setEditSelectedVss(assignment.vss_user?.uuid || "")
    setEditSelectedCoverageArea(assignment.coverage_area?.uuid || "")
    setEditAssignmentDate(assignment.assignment_date?.slice(0, 10) || format(startOfToday(), "yyyy-MM-dd"))
    setIsEditDialogOpen(true)
  }, [])

  const columns = React.useMemo(
    () => getColumns(router, deleteHandler, handleEdit),
    [router, deleteHandler, handleEdit]
  )

  const closeDialog = () => {
    setIsDialogOpen(false)
    setSelectedVss("")
    setSelectedCoverageArea("")
    setAssignmentDate(format(startOfToday(), "yyyy-MM-dd"))
  }

  const closeEditDialog = () => {
    setIsEditDialogOpen(false)
    setEditingAssignment(null)
    setEditSelectedVss("")
    setEditSelectedCoverageArea("")
    setEditAssignmentDate(format(startOfToday(), "yyyy-MM-dd"))
  }

  const handleSubmit = async () => {
    if (!selectedVss || !selectedCoverageArea || !assignmentDate) {
      toast({
        title: "Missing details",
        description: "Select VSS user, coverage area and date before saving.",
        variant: "destructive",
      })
      return
    }

    const payload = {
      vss_user_id: selectedVss,
      coverage_area_id: selectedCoverageArea,
      assignment_date: assignmentDate,
    }

    try {
      await createAssignment({ data: payload as any }).unwrap()
      toast({
        title: "Assignment created",
        description: `Scheduled for ${assignmentDate}.`,
      })
      closeDialog()
      refreshTable()
    } catch (error: any) {
      const backendMessage =
        error?.error ||
        error?.data?.[0]?.message ||
        error?.data?.message ||
        "Failed to create assignment"
      toast({
        title: "Failed to create assignment",
        description: backendMessage,
        variant: "destructive",
      })
    }
  }

  const handleUpdate = async () => {
    if (!editingAssignment || !editSelectedVss || !editSelectedCoverageArea || !editAssignmentDate) {
      toast({
        title: "Missing details",
        description: "Select VSS user, coverage area and date before saving.",
        variant: "destructive",
      })
      return
    }

    if (!canEditAssignment(editingAssignment.assignment_date)) {
      toast({
        title: "Cannot edit assignment",
        description:
          "You can only edit assignments scheduled for today or future dates.",
        variant: "destructive",
      })
      return
    }

    const payload = {
      vss_user_id: editSelectedVss,
      coverage_area_id: editSelectedCoverageArea,
      assignment_date: editAssignmentDate,
    }

    try {
      await updateAssignment({ id: editingAssignment.uuid, data: payload as any }).unwrap()
      toast({
        title: "Assignment updated",
        description: `Updated assignment for ${editAssignmentDate}.`,
      })
      closeEditDialog()
      refreshTable()
    } catch (error: any) {
      const backendMessage =
        error?.error ||
        error?.data?.[0]?.message ||
        error?.data?.message ||
        "Failed to update assignment"
      toast({
        title: "Failed to update assignment",
        description: backendMessage,
        variant: "destructive",
      })
    }
  }

  return (
    <div>
      <ListPageHeader
        title="VSS Assignments"
        description="View and filter all VSS coverage area assignments"
        showAddButton
        addLabel="Add Assignment"
        onAdd={() => setIsDialogOpen(true)}
      />

      <DataTable
        ref={dataTableRef}
        columns={columns as unknown as ColumnDef<unknown, unknown>[]}
        searchKey="assignment_date"
        searchPlaceholder="Search by date..."
        store="assignments"
        exportFileName="VSS_Assignments"
        filters={[
          { type: "disableDefaultDateRange" },
          {
            type: "selectWithFetch",
            label: "VSS User",
            param: "vss_user_id",
            fetchUrl: "/users?roles=vss",
            valueKey: "uuid",
            labelKey: "full_name",
            searchParam: "search",
            placeholder: "Select VSS user...",
            labelFormatter: (item: any) =>
              item.full_name ||
              `${item.first_name || ""} ${item.last_name || ""}`.trim() ||
              item.email ||
              item.uuid,
          },
          {
            type: "selectWithFetch",
            label: "Coverage Area",
            param: "coverage_area_id",
            fetchUrl: "/coverage-areas",
            valueKey: "uuid",
            labelKey: "name",
            searchParam: "search",
            placeholder: "Select coverage area...",
            labelFormatter: (item: any) =>
              item.name ||
              item.coverage_area_name ||
              item.title ||
              item.uuid,
          },
          {
            type: "date",
            label: "Assignment Date",
            param: "assignment_date",
          },
          {
            type: "select",
            label: "Status",
            param: "status",
            options: [
              { label: "All", value: "all" },
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
              { label: "Completed", value: "completed" },
              { label: "Expired", value: "expired" },
            ],
          },
        ]}
      />

      <Dialog open={isDialogOpen} onOpenChange={(open) => (!open ? closeDialog() : setIsDialogOpen(open))}>
        <DialogContent className="w-full sm:max-w-lg flex flex-col">
          <DialogHeader>
            <DialogTitle>Add Assignment</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>VSS User *</Label>
              <SelectWithFetch
                fetchUrl="/users?roles=vss"
                store="vss"
                value={selectedVss}
                onChange={setSelectedVss}
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
                value={selectedCoverageArea}
                onChange={setSelectedCoverageArea}
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
              <Label htmlFor="assignment_date">Assignment Date *</Label>
              <Input
                id="assignment_date"
                type="date"
                value={assignmentDate}
                onChange={(e) => setAssignmentDate(e.target.value)}
                min={format(startOfToday(), "yyyy-MM-dd")}
              />
            </div>
          </div>

          <DialogFooter className="mt-4 pt-4 flex justify-end gap-3 sm:border-t">
            <Button variant="outline" onClick={closeDialog} type="button">
              Cancel
            </Button>
            <Button
              className="bg-[#f97316] hover:bg-[#ea580c] text-white"
              onClick={handleSubmit}
              disabled={isCreating || !selectedVss || !selectedCoverageArea || !assignmentDate}
              type="button"
            >
              {isCreating ? "Creating..." : "Create Assignment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={(open) => (!open ? closeEditDialog() : setIsEditDialogOpen(open))}>
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
              disabled={isUpdating || !editSelectedVss || !editSelectedCoverageArea || !editAssignmentDate}
              type="button"
            >
              {isUpdating ? "Updating..." : "Update Assignment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
