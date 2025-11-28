import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { ColumnDef } from "@/components/ui/data-table-types"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Target } from "@/types/target"
import { Edit, Eye, MoreHorizontal } from "lucide-react"
import React from "react"

// Types
interface ColumnProps {
  router: any
  refreshTable: () => void
}

// Reusable cell components
const UserCell = React.memo(({ target }: { target: Target }) => (
  <div>
    <div className="font-medium">
      {target.user?.first_name} {target.user?.last_name}
    </div>
    <div className="text-sm text-muted-foreground">{target.user?.email}</div>
  </div>
))
UserCell.displayName = "UserCell"

const TypeCell = React.memo(({ type }: { type: string }) => (
  <Badge variant="outline" className="capitalize">
    {type}
  </Badge>
))
TypeCell.displayName = "TypeCell"

const GoalTypeCell = React.memo(({ goalType }: { goalType: string }) => (
  <Badge variant="secondary" className="capitalize">
    {goalType}
  </Badge>
))
GoalTypeCell.displayName = "GoalTypeCell"

const AmountCell = React.memo(({ amount }: { amount: number }) => {
  const numAmount = Number(amount)
  return (
    <div className="font-medium">₦{!isNaN(numAmount) ? numAmount.toLocaleString() : "0"}</div>
  )
})
AmountCell.displayName = "AmountCell"

const VolumeCell = React.memo(({ volume }: { volume?: number }) => {
  if (!volume) return <div className="text-sm">-</div>
  const numVolume = Number(volume)
  return (
    <div className="text-sm">{!isNaN(numVolume) ? numVolume.toLocaleString() : "-"}</div>
  )
})
VolumeCell.displayName = "VolumeCell"

const DateRangeCell = React.memo(({ startDate, endDate }: { startDate?: string; endDate?: string }) => (
  <div className="text-sm">
    <div>{startDate || "-"}</div>
    <div className="text-muted-foreground">{endDate || "-"}</div>
  </div>
))
DateRangeCell.displayName = "DateRangeCell"

const CreatedAtCell = React.memo(({ createdAt }: { createdAt?: string }) => (
  <div className="text-sm">{createdAt || "-"}</div>
))
CreatedAtCell.displayName = "CreatedAtCell"

// Actions cell component
const ActionsCell = React.memo((
  {
    row,
    router,
    handleDelete
  }: {
    row: { original: Target }
    router: any
    handleDelete: (uuid: string) => void
  }) => {
  const target = row.original

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => router.push(`/dashboard/targets/${target.uuid}`)}>
          <Eye className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push(`/dashboard/targets/${target.uuid}/manage`)}>
          <Edit className="mr-2 h-4 w-4" />
          Manage
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
})
ActionsCell.displayName = "ActionsCell"

export function getTargetColumns({ router, handleDelete }: { router: any; handleDelete: (uuid: string) => void }): ColumnDef<Target>[] {
  return [
    {
      accessorKey: "user",
      header: "User",
      cell: ({ row }) => <UserCell target={row.original} />,
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => <TypeCell type={row.original.type} />,
    },
    {
      accessorKey: "goal_type",
      header: "Goal Type",
      cell: ({ row }) => <GoalTypeCell goalType={row.original.goal_type} />,
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => <AmountCell amount={row.original.amount} />,
    },
    {
      accessorKey: "start_date",
      header: "Date Range",
      cell: ({ row }) => (
        <DateRangeCell
          startDate={row.original.start_date}
          endDate={row.original.end_date}
        />
      ),
    },
    {
      accessorKey: "created_at",
      header: "Created",
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
