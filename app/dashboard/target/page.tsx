"use client"

import ListPageHeader from "@/components/dashboard/ListPageHeader"
import { DataTable } from "@/components/ui/data-table"
import type { ColumnDef } from "@/components/ui/data-table-types"
import { useTargetColumns } from "@/hooks/useTargetColumns"
import { useRouter } from "next/navigation"
import { useRef } from "react"

export default function TargetPage() {
  const router = useRouter()
  const dataTableRef = useRef<{ refresh: () => void }>(null)

  const refreshTable = () => {
    dataTableRef.current?.refresh()
  }

  const { columns } = useTargetColumns(refreshTable)

  return (
    <div>
      <ListPageHeader
        title="Targets"
        description="Manage user targets and performance goals"
        showAddButton={false}
        onAdd={() => {}}
        addLabel="Add Target"
      />

      <DataTable
        ref={dataTableRef}
        columns={columns as unknown as ColumnDef<unknown, unknown>[]}
        searchKey="user.email"
        searchPlaceholder="Search targets by user email..."
        store="targets"
        exportFileName="Targets"
        fixedQuery={{ roles: "distributor" }}
      />
    </div>
  )
}
