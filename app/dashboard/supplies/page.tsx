"use client";

import ListPageHeader from "@/components/dashboard/ListPageHeader";
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@/components/ui/data-table-types";
import { VSS_SUPPLY_FILTERS } from "@/lib/filters/vss-supplies";
import { useVssSupplyColumns } from "@/hooks/useVssSupplyColumns";
import { useMemo } from "react";

export default function VssSuppliesPage() {
  const { columns } = useVssSupplyColumns();
  const filters = useMemo(() => VSS_SUPPLY_FILTERS, []);

  return (
    <div>
      <ListPageHeader
        title="Supplies"
        description="Manage and track all supplies in the system"
      />
      <DataTable
        columns={columns as unknown as ColumnDef<unknown, unknown>[]}
        searchKey="business.name"
        searchPlaceholder="Search supplies..."
        store="vssSupplies"
        exportFileName="Supplies"
        filters={filters}
      />
    </div>
  );
}
