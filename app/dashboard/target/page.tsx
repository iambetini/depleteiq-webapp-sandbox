"use client";

import ListPageHeader from "@/components/dashboard/ListPageHeader";
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@/components/ui/data-table-types";
import { useTargetColumns } from "@/hooks/useTargetColumns";
import { useRef } from "react";

export default function TargetPage() {
  const dataTableRef = useRef<{ refresh: () => void }>(null);

  const refreshTable = () => {
    dataTableRef.current?.refresh();
  };

  const { columns } = useTargetColumns(refreshTable);

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
        searchKey="search"
        searchPlaceholder="Search targets..."
        store="targets"
        exportFileName="Targets"
        fixedQuery={{ roles: "distributor" }}
        filters={[
          { type: "disableDefaultDateRange" },
          { type: "date", label: "Start Date", param: "start_date" },
          { type: "date", label: "End Date", param: "end_date" },
          {
            type: "select",
            label: "Type",
            param: "type",
            options: [
              { label: "All", value: "all" },
              { label: "Sales", value: "sales" },
              { value: "monthly_orders", label: "Monthly Orders" },
              { value: "quarterly_orders", label: "Quarterly Orders" },
              { value: "yearly_orders", label: "Yearly Orders" },
            ],
          },
          {
            type: "select",
            label: "Goal Type",
            param: "goal_type",
            options: [
              { label: "All", value: "all" },
              { label: "Amount", value: "amount" },
              { label: "Volume", value: "volume" },
            ],
          },
        ]}
      />
    </div>
  );
}
