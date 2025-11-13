"use client"

import ListPageHeader from "@/components/dashboard/ListPageHeader"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import type { ColumnDef } from "@/components/ui/data-table-types"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Modal } from "@/components/ui/modal"
import { StatusBadge } from "@/components/ui/status-badge"
import { Label } from "@/components/ui/label"
import { CommandWithFetch } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { handleDelete } from "@/lib/handleDelete"
import { catchError } from "@/lib/utils"
import { useUpdateDeliveryMutation } from "@/store/deliveries"
import type { Delivery, deliveryStatus } from "@/types/delivery"
import type { Vehicle } from "@/types/vehicle"
import { ArrowLeftRight, Car, CheckCircle2, Eye, MoreHorizontal, Package, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { useRef, useCallback, useState, useMemo } from "react"

// Constants
const DELIVERY_STATUS = {
  PENDING_APPROVAL: "pending_approval",
  UPDATE_REQUESTED: "update_requested",
  APPROVED: "approved",
  DELIVERED: "delivered",
} as const

const TOAST_MESSAGES = {
  ASSIGN_SUCCESS: "Vehicle assigned successfully.",
  CHANGE_SUCCESS: "Vehicle changed successfully. Delivery status reset to pending approval.",
  UPDATE_SUCCESS: "Delivery updated successfully",
  ASSIGN_ERROR: "Failed to assign vehicle",
  CHANGE_ERROR: "Failed to change vehicle",
} as const

// Types
interface VehicleModalState {
  isOpen: boolean
  delivery: Delivery | null
  selectedVehicleId: string
  isAssigning: boolean
  error: string
  isLoading: boolean
}

// Helper functions
const canApprove = (delivery: Delivery): boolean => {
  return !!delivery.vehicle && delivery.status === DELIVERY_STATUS.PENDING_APPROVAL
}

const canRequestUpdate = (status: deliveryStatus): boolean => {
  // Don't show "Request Update" for final states or when already requested
  return status !== DELIVERY_STATUS.UPDATE_REQUESTED &&
    status !== DELIVERY_STATUS.DELIVERED
}

const canChangeVehicle = (status: deliveryStatus, hasVehicle: boolean): boolean => {
  return status === DELIVERY_STATUS.UPDATE_REQUESTED ||
    (status === DELIVERY_STATUS.PENDING_APPROVAL && hasVehicle)
}

const canAssignVehicle = (status: deliveryStatus, hasVehicle: boolean): boolean => {
  return status === DELIVERY_STATUS.PENDING_APPROVAL && !hasVehicle
}

// Vehicle Modal Component
interface VehicleModalProps {
  state: VehicleModalState
  onClose: () => void
  onVehicleChange: (vehicleId: string) => void
  onVehicleIdChange: (vehicleId: string) => void
}

function VehicleModal({ state, onClose, onVehicleChange, onVehicleIdChange }: VehicleModalProps) {
  const handleSubmit = () => {
    if (!state.selectedVehicleId) {
      return
    }
    onVehicleChange(state.selectedVehicleId)
  }

  const modalTitle = state.isAssigning ? "Assign Vehicle" : "Change Vehicle"
  const modalDescription = state.isAssigning
    ? "Select a vehicle to assign to this delivery."
    : "Select a new vehicle for this delivery. The delivery status will be reset to pending approval."

  const buttonText = state.isLoading
    ? (state.isAssigning ? "Assigning..." : "Changing...")
    : (state.isAssigning ? "Assign Vehicle" : "Change Vehicle")

  return (
    <Modal
      open={state.isOpen}
      onClose={onClose}
      size="sm-center"
      title={modalTitle}
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-600">{modalDescription}</p>
        <div className="space-y-2">
          <Label htmlFor="vehicle">Vehicle *</Label>
          <CommandWithFetch
            fetchUrl="/vehicles"
            value={state.selectedVehicleId}
            onChange={onVehicleIdChange}
            valueKey="uuid"
            labelFormatter={(item: Vehicle) => `${item.vehicle_number} (${item.type})`}
            placeholder="Select vehicle"
          />
          {state.error && <p className="text-sm text-red-500">{state.error}</p>}
        </div>
        <div className="flex items-center justify-end space-x-4 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={state.isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={state.isLoading || !state.selectedVehicleId}
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default function DeliveriesPage() {
  const router = useRouter()
  const dataTableRef = useRef<{ refresh: () => void }>(null)
  const [updateDelivery] = useUpdateDeliveryMutation()

  const [modalState, setModalState] = useState<VehicleModalState>({
    isOpen: false,
    delivery: null,
    selectedVehicleId: "",
    isAssigning: false,
    error: "",
    isLoading: false,
  })

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

  const openVehicleModal = useCallback((delivery: Delivery, isAssigning: boolean = false) => {
    setModalState({
      isOpen: true,
      delivery,
      selectedVehicleId: delivery.vehicle?.uuid || "",
      isAssigning,
      error: "",
      isLoading: false,
    })
  }, [])

  const closeVehicleModal = useCallback(() => {
    setModalState({
      isOpen: false,
      delivery: null,
      selectedVehicleId: "",
      isAssigning: false,
      error: "",
      isLoading: false,
    })
  }, [])

  const handleVehicleIdChange = useCallback((vehicleId: string) => {
    setModalState(prev => ({ ...prev, selectedVehicleId: vehicleId, error: "" }))
  }, [])

  const handleVehicleChange = useCallback(async (vehicleId: string) => {
    const currentDelivery = modalState.delivery
    const isAssigning = modalState.isAssigning
    
    if (!currentDelivery) return

    setModalState(prev => ({ ...prev, isLoading: true, error: "" }))

    try {
      await updateDelivery({
        id: currentDelivery.uuid,
        data: { vehicle_id: vehicleId } as Partial<Delivery>
      }).unwrap()

      toast({
        title: "Success",
        description: isAssigning
          ? TOAST_MESSAGES.ASSIGN_SUCCESS
          : TOAST_MESSAGES.CHANGE_SUCCESS,
      })
      refreshTable()
      closeVehicleModal()
    } catch (error: unknown) {
      catchError(error, (field, message) => {
        setModalState(prev => ({
          ...prev,
          error: message || (isAssigning ? TOAST_MESSAGES.ASSIGN_ERROR : TOAST_MESSAGES.CHANGE_ERROR),
        }))
      })
    } finally {
      setModalState(prev => ({ ...prev, isLoading: false }))
    }
  }, [modalState.delivery, modalState.isAssigning, updateDelivery, refreshTable, closeVehicleModal])

  const handleUpdateDelivery = useCallback(async (id: string, data: Partial<Delivery>) => {
    try {
      await updateDelivery({ id, data }).unwrap()
      toast({
        title: "Success",
        description: TOAST_MESSAGES.UPDATE_SUCCESS,
      })
      refreshTable()
    } catch {
      toast({
        title: "Error",
        description: "Failed to update delivery",
        variant: "destructive",
      })
    }
  }, [updateDelivery, refreshTable])

  const columns = useMemo(
    () => getColumns(router, handleUpdateDelivery, openVehicleModal),
    [router, handleUpdateDelivery, openVehicleModal]
  )

  const filters: import("@/components/ui/data-table").FilterConfig[] = useMemo(() => [], [])

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
      <VehicleModal
        state={modalState}
        onClose={closeVehicleModal}
        onVehicleChange={handleVehicleChange}
        onVehicleIdChange={handleVehicleIdChange}
      />
    </div>
  )
}

// Column Definitions
function getColumns(
  router: ReturnType<typeof useRouter>,
  handleUpdateDelivery: (id: string, data: Partial<Delivery>) => Promise<void>,
  openVehicleModal: (delivery: Delivery, isAssigning?: boolean) => void
): ColumnDef<Delivery>[] {
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
      id: "location",
      header: "Location",
      showByDefault: false,
      width: 320,
      columns: [
        {
          accessorKey: "from.full_location",
          header: "From",
          cell: ({ row }) => (
            <div className="text-sm bg-blue-50 p-2 text-center">
              {row.original.from?.full_location || "-"}
            </div>
          ),
        },
        {
          accessorKey: "to.full_location",
          header: "To",
          cell: ({ row }) => (
            <div className="text-sm bg-blue-50 p-2 text-center">
              {row.original.to?.full_location || "-"}
            </div>
          ),
        },
      ],
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
          cell: ({ row }) => (
            <div className="text-sm bg-green-50 p-2">
              {row.original.vehicle?.vehicle_number || "-"}
            </div>
          ),
        },
        {
          accessorKey: "vehicle.type",
          header: "Type",
          cell: ({ row }) => (
            <div className="text-sm bg-green-50 p-2">
              {row.original.vehicle?.type || "-"}
            </div>
          ),
        },
      ],
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <ActionsMenu
          delivery={row.original}
          router={router}
          handleUpdateDelivery={handleUpdateDelivery}
          openVehicleModal={openVehicleModal}
        />
      ),
    },
  ]
}

// Actions Menu Component
interface ActionsMenuProps {
  delivery: Delivery
  router: ReturnType<typeof useRouter>
  handleUpdateDelivery: (id: string, data: Partial<Delivery>) => void
  openVehicleModal: (delivery: Delivery, isAssigning?: boolean) => void
}

function ActionsMenu({
  delivery,
  router,
  handleUpdateDelivery,
  openVehicleModal
}: ActionsMenuProps) {
  const hasVehicle = !!delivery.vehicle

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => router.push(`/dashboard/deliveries/${delivery.uuid}`)}>
          <Eye className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>

        {delivery.order?.uuid && (
          <DropdownMenuItem onClick={() => router.push(`/dashboard/orders/${delivery.order.uuid}`)}>
            <Package className="mr-2 h-4 w-4" />
            View Order
          </DropdownMenuItem>
        )}

        {canApprove(delivery) && (
          <DropdownMenuItem onClick={() => handleUpdateDelivery(delivery.uuid, { status: DELIVERY_STATUS.APPROVED })}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Approve
          </DropdownMenuItem>
        )}

        {canRequestUpdate(delivery.status) && (
          <DropdownMenuItem onClick={() => handleUpdateDelivery(delivery.uuid, { status: DELIVERY_STATUS.UPDATE_REQUESTED })}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Request Update
          </DropdownMenuItem>
        )}

        {canChangeVehicle(delivery.status, hasVehicle) && (
          <DropdownMenuItem onClick={() => openVehicleModal(delivery, false)}>
            <span className="relative inline-block mr-2 h-4 w-4">
              <Car className="h-5 w-5" />
              <ArrowLeftRight className="h-3 w-3 absolute -right-1 -bottom-1" />
            </span>
            Change Vehicle
          </DropdownMenuItem>
        )}

        {canAssignVehicle(delivery.status, hasVehicle) && (
          <DropdownMenuItem onClick={() => openVehicleModal(delivery, true)}>
            <Car className="mr-2 h-4 w-4" />
            Assign Vehicle
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
