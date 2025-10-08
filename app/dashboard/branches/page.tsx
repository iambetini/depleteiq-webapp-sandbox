"use client";
import ListPageHeader from "@/components/dashboard/ListPageHeader";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@/components/ui/data-table-types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { handleDelete } from "@/lib/handleDelete";
import type { Branch } from "@/types/branch";
import { Edit, Eye, MoreHorizontal, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useRef, useCallback } from "react";


export default function BranchesPage() {
  const router = useRouter()
  const dataTableRef = useRef<{ refresh: () => void }>(null);

  const refreshTable = useCallback(() => {
    dataTableRef.current?.refresh()
  }, [])

  const deleteHandler = useCallback((uuid: string) => {
    handleDelete({
      storeName: "branches",
      uuid,
      onSuccess: refreshTable,
    })
  }, [refreshTable])

  const columns = React.useMemo(
    () => getColumns(router, deleteHandler),
    [router, deleteHandler]
  )

  // Filter config for branches
  const filters: import("@/components/ui/data-table").FilterConfig[] = []

  return (
    <div>
      <ListPageHeader
        title="Branches"
        description="Manage and track all branches in the system"
        showAddButton={true}
        onAdd={() => router.push("/dashboard/branches/create")}
        addLabel="Add Branch"
      />
      <DataTable
        ref={dataTableRef}
        columns={columns as unknown as ColumnDef<unknown, unknown>[]}
        searchKey="ref"
        searchPlaceholder="Search branches..."
        store="branches"
        exportFileName="Branches"
        filters={filters}
      />
    </div>
  )
}

export function getColumns(router: any, handleDelete: (uuid: string) => void): ColumnDef<Branch>[] {
  return [
    {
      accessorKey: "branch_name",
      header: "Branch Name",
      cell: ({ row }) => <div className="text-sm">{row.original.branch_name}</div>,
    },
    {
      accessorKey: "branch_code",
      header: "Branch Code",
      cell: ({ row }) => <div className="text-sm">{row.original.branch_code}</div>,
    },
    {
      accessorKey: "location.name",
      header: "Location",
      cell: ({ row }) => <div className="text-sm">{row.original.location?.full_location}</div>,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push(`/dashboard/branches/${row.original.uuid}`)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/dashboard/branches/${row.original.uuid}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleDelete(row.original.uuid)}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]
}
