"use client"

import ListPageHeader from "@/components/dashboard/ListPageHeader"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import type { ColumnDef } from "@/components/ui/data-table-types"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { handleDelete } from "@/lib/handleDelete"
import { Edit, Eye, MoreHorizontal, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback, useRef } from "react"

export default function PromotersPage() {
  const router = useRouter()
  const dataTableRef = useRef<{ refresh: () => void }>(null)

  const refreshTable = useCallback(() => {
    dataTableRef.current?.refresh()
  }, [])

  const deleteHandler = useCallback(
    (uuid: string) => {
      handleDelete({
        storeName: "promoters",
        uuid,
        onSuccess: refreshTable,
      })
    },
    [refreshTable]
  )

  const columns: ColumnDef<any, any>[] = [
    {
      accessorKey: "user.first_name",
      header: "Name",
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
      accessorKey: "market.name",
      header: "Market",
    },
    {
      accessorKey: "tpe_user",
      header: "TPE Supervisor",
      cell: ({ row }: any) => {
        const tpeUser = row.original.tpe_user
        if (!tpeUser) return <span className="text-muted-foreground">-</span>
        return <span>{`${tpeUser.first_name} ${tpeUser.last_name}`}</span>
      },
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const promoter = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() =>
                  router.push(`/dashboard/promos/promoters/${promoter.uuid}`)
                }
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() =>
                  router.push(`/dashboard/promos/promoters/${promoter.uuid}/edit`)
                }
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer text-destructive"
                onClick={() => deleteHandler(promoter.uuid)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <div>
      <ListPageHeader
        title="Promoters"
        description="Manage promoters"
        showAddButton={true}
        onAdd={() => router.push("/dashboard/promos/promoters/create")}
        addLabel="Add Promoter"
      />

      <DataTable
        ref={dataTableRef}
        columns={columns}
        searchKey="user.email"
        searchPlaceholder="Search by email, first name, or last name..."
        store="promoters"
        exportFileName="Promoters"
      />
    </div>
  )
}
