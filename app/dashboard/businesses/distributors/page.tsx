"use client"

import BulkUploadModal from "@/components/dashboard/BulkUploadModal"
import ListPageHeader from "@/components/dashboard/ListPageHeader"
import { DataTable } from "@/components/ui/data-table"
import type { ColumnDef } from "@/components/ui/data-table-types"
import { useDistributorColumns } from "@/hooks/useDistributorColumns"
import { DISTRIBUTOR_FILTERS } from "@/lib/filters/distributors"
import { useRouter } from "next/navigation"
import { useRef, useState } from "react"

export default function DistributorsPage() {
  const router = useRouter()
  const dataTableRef = useRef<{ refresh: () => void }>(null)

  const refreshTable = () => {
    dataTableRef.current?.refresh()
  }

  const { columns } = useDistributorColumns(refreshTable)

  const [bulkModalOpen, setBulkModalOpen] = useState(false);

  return (
    <div>
      <ListPageHeader
        title="Distributors"
        description="Manage distributors and their business information"
        showAddButton={true}
        onAdd={() => router.push("/dashboard/businesses/distributors/create")}
        addLabel="Add Distributor"
        showBulkAddButton={true}
        onBulkAdd={() => setBulkModalOpen(true)}
        bulkAddLabel="Add Bulk Distributors"
      />

      <DataTable
        ref={dataTableRef}
        columns={columns as unknown as ColumnDef<unknown, unknown>[]}
        searchKey="business_name"
        searchPlaceholder="Search distributors..."
        store="distributors"
        exportFileName="Distributors"
        filters={DISTRIBUTOR_FILTERS}
      />

      <BulkUploadModal
        open={bulkModalOpen}
        onClose={() => setBulkModalOpen(false)}
        sampleUrl="/sample-distributors.xlsx"
        apiUrl="/distributors/bulk-store"
        onSuccess={refreshTable}
        title="Bulk Distributors Upload"
        label="Upload Bulk Distributors (.xlsx)"
      />
    </div>
  )
}
