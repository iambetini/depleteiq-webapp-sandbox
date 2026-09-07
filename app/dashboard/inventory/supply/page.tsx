"use client";

import ListPageHeader from "@/components/dashboard/ListPageHeader";
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@/components/ui/data-table-types";
import { VSS_INVENTORY_FILTERS } from "@/lib/filters/vss-inventory-transactions";
import { useVssInventoryColumns } from "@/hooks/useVssInventoryColumns";
import { useMemo } from "react";

export default function InventorySupplyPage() {
  const { columns } = useVssInventoryColumns("supply");
  const filters = useMemo(() => VSS_INVENTORY_FILTERS, []);

  return (
    <div>
      <ListPageHeader
        title="Vss Supply"
        description="Track all inventory supply transactions"
      />
      <DataTable
        columns={columns as unknown as ColumnDef<unknown, unknown>[]}
        searchKey="brand_package.brand.name"
        searchPlaceholder="Search inventory..."
        store="vssInventoryTransactions"
        exportFileName="Inventory_Supply"
        filters={filters}
        fixedQuery={{ type: "supply" }}
      />
    </div>
  );
}
