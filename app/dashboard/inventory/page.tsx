"use client";

import ListPageHeader from "@/components/dashboard/ListPageHeader";
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@/components/ui/data-table-types";
import { VSS_INVENTORY_FILTERS } from "@/lib/filters/vss-inventory-transactions";
import { useVssInventoryColumns } from "@/hooks/useVssInventoryColumns";
import { useMemo } from "react";

export default function InventoryPage() {
  const { columns } = useVssInventoryColumns();
  const filters = useMemo(() => VSS_INVENTORY_FILTERS, []);

  return (
    <div>
      <ListPageHeader
        title="Inventory"
        description="Track all inventory transactions"
      />
      <DataTable
        columns={columns as unknown as ColumnDef<unknown, unknown>[]}
        searchKey="brand_package.brand.name"
        searchPlaceholder="Search inventory..."
        store="vssInventoryTransactions"
        exportFileName="Inventory"
        filters={filters}
      />
    </div>
  );
}
