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
      storeName: "wholesalers",
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
      accessorKey: "user.first_name",
      header: "Contact Person",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">
            {row.original.user?.first_name} {row.original.user?.last_name}
          </div>
          <div className="text-sm text-muted-foreground">{row.original.user?.email}</div>
        </div>
      ),
    },
    {
      accessorKey: "business.address",
      header: "Address",
      cell: ({ row }) => (
        <div className="max-w-[250px] truncate text-sm" title={row.original.business?.address}>
          {row.original.business?.address || "Not provided"}
        </div>
      ),
    },
    {
      accessorKey: "tpe_user.first_name",
      header: "TPE",
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.tpe_user ? (
              <div className="font-medium">
                {row.original.tpe_user.first_name} {row.original.tpe_user.last_name}
              </div>
          ) : (
            <span className="text-muted-foreground">Not assigned</span>
          )}
        </div>
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
            <DropdownMenuItem onClick={() => router.push(`/dashboard/wholesalers/${row.original.uuid}`)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/dashboard/wholesalers/${row.original.uuid}/edit`)}>
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
        onAdd={() => router.push("/dashboard/wholesalers/create")}
        addLabel="Add Wholesaler"
      />

      <DataTable
        ref={dataTableRef}
        columns={columns}
        searchKey="user.email"
        searchPlaceholder="Search by email, name..."
        store="wholesalers"
        exportFileName="Wholesalers"
      />
    </div>
  )
}
