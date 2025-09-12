"use client"

import ListPageHeader from "@/components/dashboard/ListPageHeader"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import type { ColumnDef } from "@/components/ui/data-table-types"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { StatusBadge } from "@/components/ui/status-badge"
import { toast } from "@/hooks/use-toast"
import { handleDelete } from "@/lib/handleDelete"
import { useUpdateVehicleMutation } from "@/store/vehicles"
import type { Delivery } from "@/types/delivery"
import { ArrowLeftRight, Car, CheckCircle2, Edit, Eye, MoreHorizontal, RefreshCw, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import React, { useRef, useCallback } from "react"

export default function DeliveriesPage() {
  const router = useRouter()
  const dataTableRef = useRef<{ refresh: () => void }>(null);
  const [updateVehicle] = useUpdateVehicleMutation();

  const refreshTable = useCallback(() => {
    dataTableRef.current?.refresh()
  }, [])

  const columns = React.useMemo(
    () => {
      const handleUpdateVehicle = (id: string, data: Partial<Delivery>) => {
        updateVehicle({ id, data }).unwrap().then(() => {
          toast({
            title: "Success",
            description: "Vehicle updated successfully",
          });
          refreshTable();
        });
      };

      return getColumns(router, refreshTable, handleUpdateVehicle);
    },
    [router, refreshTable, updateVehicle]
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

export function getColumns(router: any, refreshTable: () => void, handleUpdateVehicle: (id: string, data: Partial<Delivery>) => void): ColumnDef<Delivery>[] {
  return [
    {
      accessorKey: "order.ref",
      header: "Order Ref",
      width: 125,
      cell: ({ row }) => <div className="text-sm">{row.original.order?.ref}</div>,
    },
    {
      accessorKey: "total_order_volume",
      header: "Volume(m³)",
      width: 110,
      cell: ({ row }) => <div className="text-sm">{row.original.total_order_volume}</div>,
    },
    {
      accessorKey: "total_order_weight",
      header: "Weight(kg)",
      width: 110,
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
      width: 125,
      cell: ({ row }) => <div className="text-sm">{row.original.cost_ratio}</div>,
    },
    {
      accessorKey: "delivery_burn_rate",
      header: "Burn Rate",
      width: 125,
      cell: ({ row }) => <div className="text-sm">{row.original.delivery_burn_rate}</div>,
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
      width: 150,
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "vehicle",
      header: "Recommended Vehicle",
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
            <DropdownMenuItem onClick={() => handleUpdateVehicle(row.original.vehicle?.uuid, { status: 'approved' })}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Approve
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleUpdateVehicle(row.original.vehicle?.uuid, { status: 'update_requested' })}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Request Update
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { }}>
              <span className="relative inline-block mr-2 h-4 w-4">
                <Car className="h-5 w-5" />
                <ArrowLeftRight className="h-3 w-3 absolute -right-1 -bottom-1" />
              </span>
              Change Vehicle
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/dashboard/deliveries/${row.original.uuid}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                handleDelete({
                  storeName: "deliveries",
                  uuid: row.original.uuid,
                  onSuccess: refreshTable,
                })
              }
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
