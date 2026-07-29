"use client"

import ListPageHeader from "@/components/dashboard/ListPageHeader"
import { DataTable } from "@/components/ui/data-table"
import React, { useState } from "react"
import { useContext } from "../layout"
import { useStoreColumns } from "@/components/tables/storeColumns"
import AssignStoreModal from "./AssignStoreModal"
import { assignStoresToPromoter } from "@/lib/promoter-assign"
import { useToast } from "@/hooks/use-toast"
import { useDispatch } from "react-redux"
import { storeApis } from "@/store"
import { ColumnDef } from "@tanstack/react-table"

export default function PromoterStoresPage() {
  const { promoter } = useContext()
  const promoterId = promoter?.uuid as string
  const fixedQuery = React.useMemo(() => ({ promoter_id: promoterId }), [promoterId])
  const [modalOpen, setModalOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const { toast } = useToast()
  const dispatch = useDispatch()

  const columns = useStoreColumns(() => setRefreshKey((k) => k + 1))

  const handleAssign = async (storeUuids: string[]) => {
    if (!promoterId || storeUuids.length === 0) return
    try {
      await assignStoresToPromoter(promoterId, storeUuids)
      setModalOpen(false)
      setRefreshKey((k) => k + 1)
      toast({
        title: "Success",
        description: "Stores assigned successfully",
      })
      dispatch(storeApis.stores.util.invalidateTags(["Store"] as any))
      dispatch(storeApis.promoters.util.invalidateTags(["Promoter"] as any))
    } catch (e: any) {
      toast({
        title: "Error",
        description:
          e?.response?.data?.message || e?.message || "Failed to assign stores",
        variant: "destructive",
      })
      // eslint-disable-next-line no-console
      console.error(e)
    }
  }

  return (
    <div>
      <ListPageHeader
        title="Stores"
        description="Stores assigned to this promoter"
        showAddButton={true}
        onAdd={() => setModalOpen(true)}
        addLabel="Assign Stores"
      />
      <DataTable
        key={refreshKey}
        columns={columns as ColumnDef<unknown, unknown>[]}
        searchPlaceholder="Search stores..."
        store="stores"
        exportFileName="Stores"
        fixedQuery={fixedQuery}
      />
      <AssignStoreModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAssign={handleAssign}
      />
    </div>
  )
}
