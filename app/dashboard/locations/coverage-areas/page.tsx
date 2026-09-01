"use client"

import ListPageHeader from "@/components/dashboard/ListPageHeader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import type { ColumnDef } from "@/components/ui/data-table-types"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { handleDelete } from "@/lib/handleDelete"
import { CoverageArea } from "@/types/coverage-area"
import { Edit, Eye, MoreHorizontal, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import React, { useRef, useCallback } from "react"

function getColumns(
  router: any,
  deleteHandler: (uuid: string) => void
): ColumnDef<CoverageArea>[] {
  return [
    {
      accessorKey: "name",
      header: "Coverage Area Name",
      cell: ({ row }) => (
        <div className="font-medium text-[#444444]">{row.original.name}</div>
      ),
    },
    {
      accessorKey: "lga.name",
      header: "LGA",
      cell: ({ row }) => (
        <Badge variant="secondary">{row.original.lga?.name}</Badge>
      ),
    },
    {
      accessorKey: "enable_geofence",
      header: "Geofence",
      cell: ({ row }) => (
        row.original.enable_geofence ? (
          <Badge className="status active">Enabled</Badge>
        ) : (
          <Badge variant="secondary">Disabled</Badge>
        )
      ),
    },
    {
      accessorKey: "geofence.name",
      header: "Geofence Name",
      cell: ({ row }) => (
        <div className="text-[#444444]">{row.original.geofence?.name || "—"}</div>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Created At",
      cell: ({ row }) => <div className="text-[#444444]">{row.original.created_at}</div>,
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
            <DropdownMenuItem onClick={() => router.push(`/dashboard/locations/coverage-areas/${row.original.uuid}`)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/dashboard/locations/coverage-areas/${row.original.uuid}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => deleteHandler(row.original.uuid)}
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

export default function CoverageAreasPage() {
  const router = useRouter()
  const dataTableRef = useRef<{ refresh: () => void }>(null)

  const refreshTable = useCallback(() => {
    dataTableRef.current?.refresh()
  }, [])

  const deleteHandler = useCallback((uuid: string) => {
    handleDelete({
      storeName: "coverageAreas",
      uuid,
      onSuccess: refreshTable,
    })
  }, [refreshTable])

  const columns = React.useMemo(
    () => getColumns(router, deleteHandler),
    [router, deleteHandler]
  )

  return (
    <div>
      <ListPageHeader
        title="Coverage Areas"
        description="Manage coverage areas for locations"
        showAddButton={true}
        onAdd={() => router.push("/dashboard/locations/coverage-areas/create")}
        addLabel="Add Coverage Area"
      />

      <DataTable
        ref={dataTableRef}
        columns={columns as unknown as ColumnDef<unknown, unknown>[]}
        searchKey="name"
        searchPlaceholder="Search coverage areas..."
        store="coverageAreas"
        exportFileName="CoverageAreas"
        filters={[
          {
            type: "selectWithFetch",
            label: "LGA",
            param: "lga_id",
            fetchUrl: "/lgas",
            valueKey: "uuid",
            labelKey: "name",
            searchParam: "search",
            placeholder: "Select LGA",
          },
          {
            type: "select",
            label: "Geofence",
            param: "enable_geofence",
            options: [
              { label: "Enabled", value: "1" },
              { label: "Disabled", value: "0" },
            ],
          },
        ]}
      />
    </div>
  )
}
