"use client"

import BulkUploadModal from "@/components/dashboard/BulkUploadModal"
import ListPageHeader from "@/components/dashboard/ListPageHeader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import type { ColumnDef } from "@/components/ui/data-table-types"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { handleDelete } from "@/lib/handleDelete"
import { User } from "@/types/user"
import { Calendar, Edit, Eye, MoreHorizontal, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import React, { useRef, useState, useCallback } from "react"

interface Vss extends User { }

const roles = "vss"

function getColumns(
  router: any,
  handleDelete: (uuid: string) => void
): ColumnDef<Vss>[] {
  return [
    {
      accessorKey: "first_name",
      header: "Name",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">
            {row.original.first_name} {row.original.last_name}
          </div>
          <div className="text-sm text-muted-foreground">{row.original.email}</div>
        </div>
      ),
    },
    {
      accessorKey: "phone",
      header: "Phone",
    },
    {
      accessorKey: "market",
      header: "Market",
      cell: ({ row }) => row.original.market?.name || "No Market",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          variant={row.original.status === "active" ? "default" : "destructive"}
          className={`status ${row.original.status === "active" ? "active" : "inactive"}`}
        >
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Created At",
      cell: ({ row }) => row.original.created_at,
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
            <DropdownMenuItem onClick={() => router.push(`/dashboard/field-agents/vss/${row.original.uuid}`)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                router.push(`/dashboard/field-agents/vss/${row.original.uuid}/assignment`)
              }
            >
              <Calendar className="mr-2 h-4 w-4" />
              Assignment
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/dashboard/field-agents/user-footprint/${row.original.uuid}`)}>
              <Eye className="mr-2 h-4 w-4" />
              View Footprint
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/dashboard/field-agents/vss/${row.original.uuid}/manage`)}>
              <Edit className="mr-2 h-4 w-4" />
              Manage
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

export default function VssPage() {
  const router = useRouter()
  const dataTableRef = useRef<{ refresh: () => void }>(null)

  const refreshTable = useCallback(() => {
    dataTableRef.current?.refresh()
  }, [])

  const deleteHandler = useCallback((uuid: string) => {
    handleDelete({
      storeName: "vss",
      uuid,
      entityLabel: "VSS",
      onSuccess: refreshTable,
    })
  }, [refreshTable])

  const columns = React.useMemo(
    () => getColumns(router, deleteHandler),
    [router, deleteHandler]
  )

  const [bulkModalOpen, setBulkModalOpen] = useState(false);

  return (
    <div>
      <ListPageHeader
        title="VSS"
        description="Manage VSS(s) and their permissions"
        showAddButton={true}
        onAdd={() => router.push("/dashboard/field-agents/vss/create")}
        addLabel="Add VSS"
        showBulkAddButton={true}
        onBulkAdd={() => setBulkModalOpen(true)}
        bulkAddLabel="Add Bulk VSS"
      />

      <DataTable
        ref={dataTableRef}
        columns={columns as unknown as ColumnDef<unknown, unknown>[]}
        searchKey="first_name"
        searchPlaceholder="Search VSS(s)..."
        store="vss"
        fixedQuery={{ roles }}
        filters={[
          {
            type: "selectWithFetch",
            label: "Market",
            param: "market_id",
            fetchUrl: "/markets",
            valueKey: "uuid",
            labelKey: "full_name",
            searchParam: "search",
            placeholder: "Select market...",
            labelFormatter: (item: any) => `${item.full_name}`,
          },
        ]}
        exportFileName="VSS"
      />

      <BulkUploadModal
        open={bulkModalOpen}
        onClose={() => setBulkModalOpen(false)}
        sampleUrl="/sample-vss.xlsx"
        apiUrl="/users/bulk-store"
        onSuccess={refreshTable}
        title="Bulk VSS Upload"
        label="Upload Bulk VSS (.xlsx)"
      />
    </div>
  )
}
