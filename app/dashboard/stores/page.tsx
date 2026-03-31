"use client"

import ListPageHeader from "@/components/dashboard/ListPageHeader"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import type { ColumnDef } from "@/components/ui/data-table-types"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { handleDelete } from "@/lib/handleDelete"
import { Edit, Eye, MoreHorizontal, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useRef, useCallback } from "react"

export default function StoresPage() {
  const router = useRouter()
  const dataTableRef = useRef<{ refresh: () => void }>(null)

  const refreshTable = useCallback(() => {
    dataTableRef.current?.refresh()
  }, [])

  const deleteHandler = useCallback((uuid: string) => {
    handleDelete({
      storeName: "stores",
      uuid,
      onSuccess: refreshTable,
    })
  }, [refreshTable])

  const columns: ColumnDef<any, any>[] = [
    {
      accessorKey: "business.name",
      header: "Business",
    },
    {
      accessorKey: "type",
      header: "Type",
    },
    {
      accessorKey: "category",
      header: "Category",
    },
    {
      accessorKey: "market.name",
      header: "Market",
    },
    {
      accessorKey: "address",
      header: "Address",
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
            <DropdownMenuItem onClick={() => router.push(`/dashboard/stores/${row.original.uuid}`)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/dashboard/stores/${row.original.uuid}/edit`)}>
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

  return (
    <div>
      <ListPageHeader
        title="Stores"
        description="Manage stores"
        showAddButton={true}
        onAdd={() => router.push("/dashboard/stores/create")}
        addLabel="Add Store"
      />

      <DataTable
        ref={dataTableRef}
        columns={columns}
        searchKey="uuid"
        searchPlaceholder="Search stores..."
        store="stores"
        exportFileName="Stores"
      />
    </div>
  )
}
