import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { ColumnDef } from "@/components/ui/data-table-types"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Distributor } from "@/types/distributor"
import { Edit, Eye, MoreHorizontal, Trash2, TrendingUp } from "lucide-react"
import React from "react"

// Types
interface ColumnProps {
  router: any
  refreshTable: () => void
}

// Reusable cell components
const BusinessNameCell = React.memo(({ distributor }: { distributor: Distributor }) => (
  <div>
    <div className="font-medium">{distributor.business_name}</div>
    <div className="text-sm text-muted-foreground">
      {distributor.user.first_name} {distributor.user.last_name}
    </div>
  </div>
))
BusinessNameCell.displayName = "BusinessNameCell"

const ContactCell = React.memo(({ distributor }: { distributor: Distributor }) => (
  <div>
    <div className="text-sm">{distributor.user.email}</div>
    <div className="text-sm text-muted-foreground">{distributor.user.phone}</div>
  </div>
))
ContactCell.displayName = "ContactCell"

const AddressCell = React.memo(({ address }: { address: string }) => (
  <div className="max-w-[200px] truncate" title={address}>
    {address}
  </div>
))
AddressCell.displayName = "AddressCell"

const PerformanceCell = React.memo(({ performance }: { performance?: Distributor["performance"] }) => {
  if (!performance) return <span className="text-muted-foreground">No data</span>
  return (
    <div className="text-sm">
      <div className="font-medium">₦{performance.total_value.toLocaleString()}</div>
      <div className="text-muted-foreground">{performance.total_orders} orders</div>
      <div className="flex items-center text-green-600">
        <TrendingUp className="h-3 w-3 mr-1" />
        {performance.growth_rate}%
      </div>
    </div>
  )
})
PerformanceCell.displayName = "PerformanceCell"

const StatusCell = React.memo(({ status }: { status: string }) => (
  <Badge
    variant={status === "active" ? "default" : "destructive"}
    className={`status ${status === "active" ? "active" : "inactive"}`}
  >
    {status}
  </Badge>
))
StatusCell.displayName = "StatusCell"

const CreatedAtCell = React.memo(({ createdAt }: { createdAt: string }) => (
  <div className="text-sm">{createdAt}</div>
))
CreatedAtCell.displayName = "CreatedAtCell"

// Actions cell component
const ActionsCell = React.memo(({
  row,
  router,
  handleDelete
}: {
  row: { original: Distributor }
  router: any
  handleDelete: (uuid: string) => void
}) => {
  const distributor = row.original

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => router.push(`/dashboard/distributors/${distributor.uuid}`)}>
          <Eye className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push(`/dashboard/distributors/${distributor.uuid}/manage`)}>
          <Edit className="mr-2 h-4 w-4" />
          Manage
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push(`/dashboard/distributors/${distributor.uuid}/orders`)}>
          <Eye className="mr-2 h-4 w-4" />
          View Orders
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleDelete(distributor.uuid)}
          className="text-red-600"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
})
ActionsCell.displayName = "ActionsCell"

export function getDistributorColumns({ router, handleDelete }: { router: any; handleDelete: (uuid: string) => void }): ColumnDef<Distributor>[] {
  return [
    {
      accessorKey: "business_name",
      header: "Business",
      cell: ({ row }) => <BusinessNameCell distributor={row.original} />,
    },
    {
      accessorKey: "user.email",
      header: "Contact",
      cell: ({ row }) => <ContactCell distributor={row.original} />,
    },
    {
      accessorKey: "address",
      header: "Address",
      cell: ({ row }) => <AddressCell address={row.original.address} />,
    },
    {
      accessorKey: "user.status",
      header: "Status",
      cell: ({ row }) => <StatusCell status={row.original.user.status} />,
    },
    {
      accessorKey: "created_at",
      header: "Joined",
      width: 185,
      cell: ({ row }) => <CreatedAtCell createdAt={row.original.created_at} />,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <ActionsCell
          row={row}
          router={router}
          handleDelete={handleDelete}
        />
      ),
    },
  ]
}
