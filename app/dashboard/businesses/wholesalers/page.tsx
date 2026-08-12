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

export default function WholesalersPage() {
  const router = useRouter()
  const dataTableRef = useRef<{ refresh: () => void }>(null)

  const refreshTable = useCallback(() => {
    dataTableRef.current?.refresh()
  }, [])

  const deleteHandler = useCallback((uuid: string) => {
    handleDelete({
      storeName: "businesses",
      uuid,
      onSuccess: refreshTable,
    })
  }, [refreshTable])

  const columns: ColumnDef<any, any>[] = [
    {
      accessorKey: "name",
      header: "Business",
    },
    {
      accessorKey: "address",
      header: "Address",
      cell: ({ row }) => (
        <div className="max-w-[250px] truncate text-sm" title={row.original.address ?? undefined}>
          {row.original.address || "Not provided"}
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.type || "—"}</span>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.email || "—"}</span>
      ),
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.phone || "—"}</span>
      ),
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
            <DropdownMenuItem onClick={() => router.push(`/dashboard/businesses/wholesalers/${row.original.uuid}`)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/dashboard/businesses/wholesalers/${row.original.uuid}/edit`)}>
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
        title="Wholesalers"
        description="Manage wholesalers"
        showAddButton={true}
        onAdd={() => router.push("/dashboard/businesses/wholesalers/create")}
        addLabel="Add Wholesaler"
      />

      <DataTable
        ref={dataTableRef}
        columns={columns as ColumnDef<unknown, unknown>[]}
        searchKey="name"
        searchPlaceholder="Search by name..."
        store="businesses"
        fixedQuery={{ type: "wholesaler" }}
        exportFileName="Wholesalers"
      />
    </div>
  )
}
