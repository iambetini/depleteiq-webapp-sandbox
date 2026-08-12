"use client"

import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@/components/ui/data-table-types";
import { ORDER_FILTERS } from "@/lib/filters/orders";
import { useOrderColumns } from "@/hooks/useOrderColumns";
import { useParams } from "next/navigation";
import React from "react";

export default function ImeOrdersPage() {
  const { columns } = useOrderColumns();
  const routeParams = useParams();
  const imeId = routeParams?.id as string;
  const fixedQuery = React.useMemo(() => ({ ime_vss: imeId }), [imeId]);

  return (
    <div>
      <DataTable
        columns={columns as unknown as ColumnDef<unknown, unknown>[]}
        searchKey="ref"
        searchPlaceholder="Search orders..."
        store="orders"
        fixedQuery={fixedQuery}
        exportFileName="IME-Orders"
        filters={ORDER_FILTERS}
      />
    </div>
  );
}
