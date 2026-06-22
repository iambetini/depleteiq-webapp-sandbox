"use client"

import ListPageHeader from "@/components/dashboard/ListPageHeader"
import { Badge } from "@/components/ui/badge"
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

export default function ParticipantsPage() {
  const router = useRouter()
  const dataTableRef = useRef<{ refresh: () => void }>(null)

  const refreshTable = useCallback(() => {
    dataTableRef.current?.refresh()
  }, [])

  const deleteHandler = useCallback(
    (uuid: string) => {
      handleDelete({
        storeName: "participants",
        uuid,
        onSuccess: refreshTable,
      })
    },
    [refreshTable]
  )

  const columns: ColumnDef<any, any>[] = [
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
      accessorKey: "phone_network",
      header: "Network",
      cell: ({ row }) => (
        <Badge variant="secondary" className="capitalize">
          {row.original.phone_network || "Unknown"}
        </Badge>
      ),
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const participant = row.original
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
                  router.push(`/dashboard/promos/participants/${participant.uuid}`)
                }
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() =>
                  router.push(`/dashboard/promos/participants/${participant.uuid}/edit`)
                }
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer text-destructive"
                onClick={() => deleteHandler(participant.uuid)}
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
        title="Sign ups"
        description="Manage sign ups"
        showAddButton={false}
      />

      <DataTable
        ref={dataTableRef}
        columns={columns}
        searchKey="phone"
        searchPlaceholder="Search sign ups..."
        store="participants"
        exportFileName="Sign ups"
        filters={[{
          type: "selectWithFetch",
          label: "Market",
          param: "market_id",
          fetchUrl: "/markets",
          valueKey: "uuid",
          labelKey: "name",
          placeholder: "All Markets"
        }]}
      />
    </div>
  )
}
