"use client"

import ListPageHeader from "@/components/dashboard/ListPageHeader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import type { ColumnDef } from "@/components/ui/data-table-types"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { handleDelete } from "@/lib/handleDelete"
import { Region } from "@/types/region"
import { Edit, Eye, MoreHorizontal, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import React, { useRef, useCallback } from "react"

function getColumns(
  router: any,
  deleteHandler: (uuid: string) => void
): ColumnDef<Region>[] {
  return [
    {
      accessorKey: "name",
      header: "Region Name",
      cell: ({ row }) => (
        <div className="font-medium text-[#444444]">{row.original.name}</div>
      ),
    },
    {
      accessorKey: "country",
      header: "Country",
      cell: ({ row }) => (
        <Badge variant="secondary">{row.original.country}</Badge>
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
            <DropdownMenuItem onClick={() => router.push(`/dashboard/locations/regions/${row.original.uuid}`)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/dashboard/locations/regions/${row.original.uuid}/edit`)}>
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

export default function RegionsPage() {
  const router = useRouter()
  const dataTableRef = useRef<{ refresh: () => void }>(null)

  const refreshTable = useCallback(() => {
    dataTableRef.current?.refresh()
  }, [])

  const deleteHandler = useCallback((uuid: string) => {
    handleDelete({
      storeName: "regions",
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
        title="Regions"
        description="Manage regions"
        showAddButton={true}
        onAdd={() => router.push("/dashboard/locations/regions/create")}
        addLabel="Add Region"
      />

      <DataTable
        ref={dataTableRef}
        columns={columns as unknown as ColumnDef<unknown, unknown>[]}
        searchKey="name"
        searchPlaceholder="Search regions..."
        store="regions"
        exportFileName="Regions"
      />
    </div>
  )
}
