"use client"

import ListPageHeader from "@/components/dashboard/ListPageHeader";
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@/components/ui/data-table-types";
import { STORE_CATEGORIES } from "@/types/store";
import { useRef } from "react";
import { useStoreColumns } from "@/components/tables/storeColumns";
import { useRouter } from "next/navigation";

export default function StoresPage() {
  const router = useRouter()
  const dataTableRef = useRef<{ refresh: () => void }>(null)
  const columns = useStoreColumns(() => dataTableRef.current?.refresh())

  return (
    <div>
      <ListPageHeader
        title="Stores"
        description="Manage stores"
        showAddButton={true}
        onAdd={() => router.push("/dashboard/stores/create")}
        addLabel="Add Store"
      />

      <DataTable
        ref={dataTableRef}
        columns={columns as unknown as ColumnDef<unknown, unknown>[]}
        searchKey="uuid"
        searchPlaceholder="Search stores..."
        store="stores"
        exportFileName="Stores"
        filters={[
          {
            type: "select",
            label: "Category",
            param: "category",
            options: STORE_CATEGORIES.map((category) => ({
              label: category,
              value: category,
            })),
          },
          {
            type: "selectWithFetch",
            label: "Market",
            param: "market_id",
            fetchUrl: "/markets",
            valueKey: "uuid",
            labelKey: "name",
            searchParam: "search",
            placeholder: "Select market",
          },
          {
            type: "selectWithFetch",
            label: "Coverage Area",
            param: "coverage_area_id",
            fetchUrl: "/coverage-areas",
            valueKey: "uuid",
            labelKey: "name",
            searchParam: "search",
            placeholder: "Select coverage area",
          },
          {
            type: "select",
            label: "Market Status",
            param: "in_market",
            options: [
              { label: "All", value: "all" },
              { label: "In Market", value: "true" },
              { label: "Out Market", value: "false" },
            ],
          },
        ]}
      />
    </div>
  )
}
