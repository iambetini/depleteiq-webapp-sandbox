import { Button } from "@/components/ui/button";
import type { ColumnDef } from "@/components/ui/data-table-types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { VssSupply } from "@/types/vss-supply";
import { Eye, MoreHorizontal } from "lucide-react";
import React from "react";

const VssUserCell = React.memo(({ vssUser }: { vssUser: VssSupply["vss_user"] }) => (
  <div className="text-sm">{vssUser?.full_name || "-"}</div>
));
VssUserCell.displayName = "VssUserCell";

const BusinessCell = React.memo(({ business }: { business: VssSupply["business"] }) => (
  <div className="text-sm">{business?.name || "-"}</div>
));
BusinessCell.displayName = "BusinessCell";

const BrandsCountCell = React.memo(({ brands }: { brands: VssSupply["supplied_brands"] }) => (
  <div className="text-sm">{brands?.length ?? 0}</div>
));
BrandsCountCell.displayName = "BrandsCountCell";

const QuantityCell = React.memo(({ brands }: { brands: VssSupply["supplied_brands"] }) => {
  const total = brands?.reduce((sum, b) => sum + (Number(b.quantity) || 0), 0) ?? 0;
  return <div className="text-sm">{total}</div>;
});
QuantityCell.displayName = "QuantityCell";

const ValueCell = React.memo(({ totalAmount }: { totalAmount: string }) => (
  <div className="font-medium">₦{parseFloat(totalAmount || "0").toLocaleString()}</div>
));
ValueCell.displayName = "ValueCell";

const CreatedAtCell = React.memo(({ createdAt }: { createdAt: string }) => (
  <div className="text-sm">{createdAt}</div>
));
CreatedAtCell.displayName = "CreatedAtCell";

const ActionsCell = React.memo(
  ({ row, router }: { row: { original: VssSupply }; router: any }) => {
    const supply = row.original;
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => router.push(`/dashboard/supplies/${supply.uuid}`)}
          >
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
          {supply.vss_user?.uuid && (
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => router.push(`/dashboard/field-agents/vss/${supply.vss_user.uuid}`)}
            >
              <Eye className="mr-2 h-4 w-4" />
              View VSS
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
);
ActionsCell.displayName = "ActionsCell";

interface ColumnProps {
  router: any;
}

export function getVssSupplyColumns({ router }: ColumnProps): ColumnDef<VssSupply>[] {
  return [
    {
      accessorKey: "vss_user.full_name",
      header: "VSS",
      width: 160,
      cell: ({ row }) => <VssUserCell vssUser={row.original.vss_user} />,
      exportValue: (item) => item.vss_user?.full_name || "",
    },
    {
      accessorKey: "business.name",
      header: "Business",
      width: 200,
      cell: ({ row }) => <BusinessCell business={row.original.business} />,
      exportValue: (item) => item.business?.name || "",
    },
    {
      accessorKey: "supplied_brands",
      header: "Brands",
      width: 90,
      cell: ({ row }) => <BrandsCountCell brands={row.original.supplied_brands} />,
      exportValue: (item) => String(item.supplied_brands?.length ?? 0),
    },
    {
      accessorKey: "quantity",
      header: "Quantity",
      width: 90,
      cell: ({ row }) => <QuantityCell brands={row.original.supplied_brands} />,
      exportValue: (item) => String(item.supplied_brands?.reduce((sum, b) => sum + (Number(b.quantity) || 0), 0) ?? 0),
    },
    {
      accessorKey: "total_amount",
      header: "Total Amount",
      width: 130,
      cell: ({ row }) => <ValueCell totalAmount={row.original.total_amount} />,
      exportValue: (item) => item.total_amount,
    },
    {
      accessorKey: "created_at",
      header: "Created At",
      width: 170,
      cell: ({ row }) => <CreatedAtCell createdAt={row.original.created_at} />,
      exportValue: (item) => item.created_at,
    },
    {
      id: "actions",
      header: "Actions",
      width: 80,
      cell: ({ row }) => <ActionsCell row={row} router={router} />,
    },
  ];
}
