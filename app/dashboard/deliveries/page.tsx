"use client"

import ListPageHeader from "@/components/dashboard/ListPageHeader"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import type { ColumnDef } from "@/components/ui/data-table-types"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { StatusBadge } from "@/components/ui/status-badge"
import { toast } from "@/hooks/use-toast"
import { handleDelete } from "@/lib/handleDelete"
import { useUpdateDeliveryMutation } from "@/store/deliveries"
import type { Delivery } from "@/types/delivery"
import { ArrowLeftRight, Car, CheckCircle2, Edit, Eye, MoreHorizontal, Package, RefreshCw, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import React, { useRef, useCallback } from "react"

export default function DeliveriesPage() {
  const router = useRouter()
  const dataTableRef = useRef<{ refresh: () => void }>(null);
  const [updateDelivery] = useUpdateDeliveryMutation();

  const refreshTable = useCallback(() => {
    dataTableRef.current?.refresh()
  }, [])

  const deleteHandler = useCallback((uuid: string) => {
    handleDelete({
      storeName: "deliveries",
      uuid,
      onSuccess: refreshTable,
    })
  }, [refreshTable])

  const columns = React.useMemo(
    () => {
      const handleUpdateDelivery = (id: string, data: Partial<Delivery>) => {
        updateDelivery({ id, data }).unwrap().then(() => {
          toast({
            title: "Success",
            description: "Delivery updated successfully",
          });
          refreshTable();
        });
      };

      return getColumns(router, deleteHandler, handleUpdateDelivery);
    },
    [router, deleteHandler, refreshTable, updateDelivery]
  )

  // Filter config for deliveries
  const filters: import("@/components/ui/data-table").FilterConfig[] = []

  return (
    <div>
      <ListPageHeader
        title="Deliveries"
        description="Manage and track all deliveries in the system"
        showAddButton={true}
        onAdd={() => router.push("/dashboard/deliveries/create")}
        addLabel="Add Delivery"
      />
      <DataTable
        ref={dataTableRef}
        columns={columns as unknown as ColumnDef<unknown, unknown>[]}
        searchKey="ref"
        searchPlaceholder="Search deliveries..."
        store="deliveries"
        exportFileName="Deliveries"
        filters={filters}
      />
    </div>
  )
}

export function getColumns(router: any, handleDelete: (uuid: string) => void, handleUpdateDelivery: (id: string, data: Partial<Delivery>) => void): ColumnDef<Delivery>[] {
  return [
    {
      accessorKey: "order.ref",
      header: "Order Ref",
      width: 110,
      cell: ({ row }) => <div className="text-sm">{row.original.order?.ref}</div>,
    },
    {
      accessorKey: "total_order_volume",
      header: "Volume(m³)",
      width: 75,
      cell: ({ row }) => <div className="text-sm">{row.original.total_order_volume}</div>,
    },
    {
      accessorKey: "total_order_weight",
      header: "Weight(kg)",
      width: 75,
      cell: ({ row }) => <div className="text-sm">{row.original.total_order_weight}</div>,
    },
    {
      accessorKey: "distance",
      header: "Distance (km)",
      width: 130,
      cell: ({ row }) => <div className="text-sm">{row.original.distance}</div>,
    },
    {
      accessorKey: "cost_ratio",
      header: "Cost Ratio",
      width: 105,
      cell: ({ row }) => <div className="text-sm">{row.original.cost_ratio}</div>,
    },
    {
      accessorKey: "delivery_burn_rate",
      header: "Burn Rate (₦)",
      width: 135,
      cell: ({ row }) => <div className="text-sm">{row.original.delivery_burn_rate}</div>,
    },
    {
      accessorKey: "comment",
      header: "Comment",
      width: 125,
      showByDefault: false,
      cell: ({ row }) => <div className="text-sm">{row.original.comment}</div>,
    },
    {
      accessorKey: "created_at",
      header: "Created At",
      width: 185,
      showByDefault: false,
      cell: ({ row }) => row.original.created_at,
    },
    {
      accessorKey: "status",
      header: "Status",
      width: 115,
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "vehicle",
      header: "Recommended Vehicle",
      width: 220,
      columns: [
        {
          accessorKey: "vehicle.vehicle_number",
          header: "Vehicle No.",
          cell: ({ row }) => <div className="text-sm bg-green-50 p-2">{row.original.vehicle?.vehicle_number}</div>,
        },
        {
          accessorKey: "vehicle.type",
          header: "Type",
          cell: ({ row }) => <div className="text-sm bg-green-50 p-2">{row.original.vehicle?.type}</div>,
        },
      ],
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
            <DropdownMenuItem onClick={() => router.push(`/dashboard/deliveries/${row.original.uuid}`)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            {row.original.order?.uuid && (
              <DropdownMenuItem onClick={() => router.push(`/dashboard/orders/${row.original.order.uuid}`)}>
                <Package className="mr-2 h-4 w-4" />
                View Order
              </DropdownMenuItem>
            )}
            {row.original.status !== 'approved' && row.original.status !== 'delivered' && (
              <DropdownMenuItem onClick={() => handleUpdateDelivery(row.original.uuid, { status: 'approved' })}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Approve
              </DropdownMenuItem>
            )}
            {row.original.status !== 'update_requested' && row.original.status !== 'delivered' && (
              <DropdownMenuItem onClick={() => handleUpdateDelivery(row.original.uuid, { status: 'update_requested' })}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Request Update
              </DropdownMenuItem>
            )}
            {row.original.status !== 'approved' && (
              <DropdownMenuItem onClick={() => { }}>
                <span className="relative inline-block mr-2 h-4 w-4">
                  <Car className="h-5 w-5" />
                  <ArrowLeftRight className="h-3 w-3 absolute -right-1 -bottom-1" />
                </span>
                Change Vehicle
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => router.push(`/dashboard/deliveries/${row.original.uuid}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleDelete(row.original.uuid)}
              className="text-red-600 hidden"
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
