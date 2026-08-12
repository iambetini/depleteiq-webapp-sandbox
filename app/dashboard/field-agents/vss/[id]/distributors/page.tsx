"use client"

import { DataTable } from "@/components/ui/data-table"
import type { ColumnDef } from "@/components/ui/data-table-types"
import { useDistributorColumns } from "@/hooks/useDistributorColumns"
import { DISTRIBUTOR_FILTERS } from "@/lib/filters/distributors"
import { useParams } from "next/navigation"
import React, { useRef } from "react"

export default function VssDistributorsPage() {
  const routeParams = useParams()
  const vssId = routeParams?.id as string
  const dataTableRef = useRef<{ refresh: () => void }>(null)

  const refreshTable = () => {
    dataTableRef.current?.refresh()
  }

  const { columns } = useDistributorColumns(refreshTable)

  const fixedQuery = React.useMemo(() => ({ ime_vss: vssId }), [vssId])

  return (
    <div>
      <DataTable
        ref={dataTableRef}
        columns={columns as unknown as ColumnDef<unknown, unknown>[]}
        searchKey="business_name"
        searchPlaceholder="Search distributors..."
        store="distributors"
        fixedQuery={fixedQuery}
        exportFileName="VSS-Distributors"
        filters={DISTRIBUTOR_FILTERS}
      />
    </div>
  )
}


