"use client"

import ListPageHeader from "@/components/dashboard/ListPageHeader"
import { DataTable } from "@/components/ui/data-table"
import React, { useState } from "react"
import { useContext } from "../layout"
import { useStoreColumns } from "@/components/tables/storeColumns"
import AssignStoreModal from "./AssignStoreModal"
import { assignStoresToPromoter } from "@/lib/promoter-assign"
import { unassignStoresFromPromoter } from "@/lib/promoter-unassign"
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
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  const dispatch = useDispatch()

  const columns = useStoreColumns(() => setRefreshKey((k) => k + 1))

  const handleSave = async ({
    toAssign,
    toUnassign,
  }: {
    toAssign: string[]
    toUnassign: string[]
  }) => {
    if (!promoterId || (toAssign.length === 0 && toUnassign.length === 0)) return

    setIsSaving(true)
    try {
      if (toAssign.length > 0) {
        await assignStoresToPromoter(promoterId, toAssign)
      }
      if (toUnassign.length > 0) {
        await unassignStoresFromPromoter(promoterId, toUnassign)
      }

      setModalOpen(false)
      setRefreshKey((k) => k + 1)

      const parts = [
        toAssign.length > 0 ? `${toAssign.length} assigned` : null,
        toUnassign.length > 0 ? `${toUnassign.length} unassigned` : null,
      ].filter(Boolean)

      toast({
        title: "Success",
        description: `Stores updated (${parts.join(", ")})`,
      })
      dispatch(storeApis.stores.util.invalidateTags(["Store"] as any))
      dispatch(storeApis.promoters.util.invalidateTags(["Promoter"] as any))
    } catch (e: any) {
      toast({
        title: "Error",
        description:
          e?.response?.data?.message || e?.message || "Failed to update store assignments",
        variant: "destructive",
      })
      // eslint-disable-next-line no-console
      console.error(e)
    } finally {
      setIsSaving(false)
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
        onSave={handleSave}
        isSaving={isSaving}
      />
    </div>
  )
}
