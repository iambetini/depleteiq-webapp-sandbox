"use client"

import ListPageHeader from "@/components/dashboard/ListPageHeader"
import { DataTable } from "@/components/ui/data-table"
import type { ColumnDef } from "@/components/ui/data-table-types"
import { VSS_ORDER_FILTERS } from "@/lib/filters/vss-orders"
import { useVssOrderColumns } from "@/hooks/useVssOrderColumns"
import { useMemo } from "react"

export default function VssOrdersPage() {
  const { columns } = useVssOrderColumns()

  const filters = useMemo(() => VSS_ORDER_FILTERS, [])

  return (
    <div>
      <ListPageHeader
        title="VSS Orders"
        description="Manage and track all VSS orders in the system"
      />
      <DataTable
        columns={columns as unknown as ColumnDef<unknown, unknown>[]}
        searchKey="reference"
        searchPlaceholder="Search VSS orders..."
        store="vssOrders"
        exportFileName="VSS_Orders"
        filters={filters}
      />
    </div>
  )
}
