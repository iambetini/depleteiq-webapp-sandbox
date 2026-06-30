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

export default function PromoParticipationsPage() {
  const router = useRouter()
  const dataTableRef = useRef<{ refresh: () => void }>(null)

  const refreshTable = useCallback(() => {
    dataTableRef.current?.refresh()
  }, [])

  const deleteHandler = useCallback(
    (uuid: string) => {
      handleDelete({
        storeName: "promoParticipations",
        uuid,
        onSuccess: refreshTable,
      })
    },
    [refreshTable]
  )

  const columns: ColumnDef<any, any>[] = [
    {
      accessorKey: "participant",
      header: "Participant",
      cell: ({ row }: any) => {
        const participant = row.original.participant
        return participant ? `${participant.first_name} ${participant.last_name}` : "-"
      },
    },
    {
      accessorKey: "promo",
      header: "Promo Type",
      cell: ({ row }: any) => {
        const promo = row.original.promo
        return promo?.type || "-"
      },
    },
    {
      accessorKey: "promo_slab",
      header: "Promo Slab",
      cell: ({ row }: any) => row.original.promo_slab?.title || "-",
    },
    {
      accessorKey: "purchase_value",
      header: "Purchase Value",
      cell: ({ row }: any) => {
        const value = row.original.purchase_value
        return value !== null && value !== undefined && value !== "" ? String(value) : "-"
      },
    },
    {
      accessorKey: "store",
      header: "Store",
      cell: ({ row }: any) => {
        const store = row.original.store
        return store?.name || "-"
      },
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const participation = row.original
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
                  router.push(`/dashboard/promos/promo-participations/${participation.uuid}`)
                }
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() =>
                  router.push(`/dashboard/promos/promo-participations/${participation.uuid}`)
                }
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer text-destructive"
                onClick={() => deleteHandler(participation.uuid)}
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
        title="Promo Participations"
        description="Manage promo participations"
        showAddButton={true}
        onAdd={() => router.push("/dashboard/promos/promo-participations/create")}
        addLabel="Add Promo Participation"
      />

      <DataTable
        ref={dataTableRef}
        columns={columns}
        searchKey="uuid"
        searchPlaceholder="Search promo participations..."
        store="promoParticipations"
        exportFileName="Promo Participations"
        filters={[
          {
            type: "selectWithFetch",
            label: "Store",
            param: "store_id",
            fetchUrl: "/stores",
            valueKey: "uuid",
            labelFormatter: (item: any) => item.name || item.business?.name || "Unknown Store",
            searchParam: "search",
            placeholder: "Select Store",
          },
          {
            type: "selectWithFetch",
            label: "Promoter",
            param: "promoter_id",
            fetchUrl: "/promoters",
            valueKey: "uuid",
            labelFormatter: (item: any) => `${item.user?.first_name || ""} ${item.user?.last_name || ""}`.trim() || "Unknown Promoter",
            searchParam: "search",
            placeholder: "Select Promoter",
          },
          {
            type: "selectWithFetch",
            label: "Promo",
            param: "promo_id",
            fetchUrl: "/promos",
            valueKey: "uuid",
            labelKey: "type",
            searchParam: "search",
            placeholder: "Select Promo",
          },
          {
            type: "selectWithFetch",
            label: "Participant",
            param: "participant_id",
            fetchUrl: "/participants",
            valueKey: "uuid",
            labelFormatter: (item: any) => `${item.first_name || ""} ${item.last_name || ""}`.trim() || "Unknown Participant",
            searchParam: "search",
            placeholder: "Select Participant",
          },
        ]}
      />
    </div>
  )
}
