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
import { Eye, MoreHorizontal } from "lucide-react"
import { useRouter } from "next/navigation"
import { useRef } from "react"

export default function ParticipantsPage() {
  const router = useRouter()
  const dataTableRef = useRef<{ refresh: () => void }>(null)

  const columns: ColumnDef<any, any>[] = [
    {
      accessorKey: "customer.first_name",
      header: "Customer",
      cell: ({ row }) => {
        const customer = row.original.customer
        return (
          <div>
            <div className="font-medium">
              {[customer?.first_name, customer?.last_name].filter(Boolean).join(" ") ||
                "—"}
            </div>
            {customer?.email && (
              <div className="text-sm text-muted-foreground">{customer.email}</div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "customer.phone",
      header: "Phone",
      cell: ({ row }) => row.original.customer?.phone || "—",
    },
    {
      accessorKey: "customer.phone_network",
      header: "Network",
      showByDefault: false,
      cell: ({ row }) => (
        <Badge variant="secondary" className="capitalize">
          {row.original.customer?.phone_network || "Unknown"}
        </Badge>
      ),
    },
    {
      accessorKey: "promo.title",
      header: "Promo",
      cell: ({ row }) => {
        const promo = row.original.promo
        if (!promo) return "—"
        return (
          <div>
            <div className="font-medium">{promo.title || promo.type || "—"}</div>
            {promo.title && promo.type && (
              <div className="text-sm text-muted-foreground">{promo.type}</div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "promoter.full_name",
      header: "Promoter",
      cell: ({ row }) => {
        const promoter = row.original.promoter
        if (!promoter) return "—"
        return (
          promoter.full_name ||
          [promoter.first_name, promoter.last_name].filter(Boolean).join(" ") ||
          "—"
        )
      },
    },
    {
      accessorKey: "promoter.market_assignment.name",
      header: "Market",
      cell: ({ row }) => {
        const market = row.original.promoter?.market_assignment
        return market?.full_name || market?.name || "—"
      },
    },
    {
      accessorKey: "created_at",
      header: "Signed Up",
      cell: ({ row }) =>
        row.original.created_at
          ? new Date(row.original.created_at).toLocaleString()
          : "—",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const signup = row.original
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
                  router.push(`/dashboard/promos/participants/${signup.uuid}`)
                }
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
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
        description="View customer promo sign ups"
        showAddButton={false}
      />

      <DataTable
        ref={dataTableRef}
        columns={columns as unknown as ColumnDef<unknown, unknown>[]}
        searchKey="phone"
        searchPlaceholder="Search sign ups..."
        store="participants"
        exportFileName="Sign ups"
        filters={[
          {
            type: "selectWithFetch",
            label: "Promo",
            param: "promo_id",
            fetchUrl: "/promos",
            valueKey: "uuid",
            labelKey: "title",
            searchParam: "search",
            placeholder: "Select Promo",
          },
          {
            type: "selectWithFetch",
            label: "Promoter",
            param: "promoter_id",
            fetchUrl: "/promoters",
            valueKey: "uuid",
            labelFormatter: (item: any) =>
              item.user?.full_name ||
              `${item.user?.first_name || ""} ${item.user?.last_name || ""}`.trim() ||
              item.full_name ||
              "Unknown Promoter",
            searchParam: "search",
            placeholder: "Select Promoter",
          },
          {
            type: "selectWithFetch",
            label: "Market",
            param: "market_id",
            fetchUrl: "/markets",
            valueKey: "uuid",
            labelKey: "name",
            placeholder: "All Markets",
          },
        ]}
      />
    </div>
  )
}
