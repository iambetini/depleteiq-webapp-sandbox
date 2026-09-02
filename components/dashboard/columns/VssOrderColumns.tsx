import { Button } from "@/components/ui/button";
import type { ColumnDef } from "@/components/ui/data-table-types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { VssOrder } from "@/types/vss-order";
import { Eye, MoreHorizontal } from "lucide-react";
import React from "react";

// Reusable cell components
const ReferenceCell = React.memo(({ reference }: { reference: string }) => (
  <div className="text-sm font-medium">{reference}</div>
));
ReferenceCell.displayName = "ReferenceCell";

const VssUserCell = React.memo(({ vssUser }: { vssUser: VssOrder["vss_user"] }) => (
  <div className="text-sm">{vssUser?.full_name || "-"}</div>
));
VssUserCell.displayName = "VssUserCell";

const DistributorCell = React.memo(
  ({ distributor }: { distributor: VssOrder["distributor_user"] }) => (
    <div className="text-sm">{distributor?.full_name || "-"}</div>
  )
);
DistributorCell.displayName = "DistributorCell";

const BrandsCell = React.memo(({ brands }: { brands: VssOrder["brands"] }) => {
  return <div className="text-sm">{brands?.length ?? 0}</div>;
});
BrandsCell.displayName = "BrandsCell";

const QuantityCell = React.memo(({ brands }: { brands: VssOrder["brands"] }) => {
  const totalQty = brands?.reduce((sum, b) => sum + (Number(b.quantity) || 0), 0) ?? 0;
  return <div className="text-sm">{totalQty}</div>;
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
  ({
    row,
    router,
  }: {
    row: { original: VssOrder };
    router: any;
  }) => {
    const order = row.original;
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
            onClick={() => router.push(`/dashboard/orders/vss-orders/${order.uuid}`)}
          >
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
          {order.vss_user?.uuid && (
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => router.push(`/dashboard/field-agents/vss/${order.vss_user.uuid}`)}
            >
              <Eye className="mr-2 h-4 w-4" />
              View VSS
            </DropdownMenuItem>
          )}
          {order.distributor_user?.distributor_details?.uuid && (
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() =>
                router.push(
                  `/dashboard/businesses/distributors/${order.distributor_user.distributor_details.uuid}`
                )
              }
            >
              <Eye className="mr-2 h-4 w-4" />
              View Distributor
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

export function getVssOrderColumns({ router }: ColumnProps): ColumnDef<VssOrder>[] {
  return [
    {
      accessorKey: "reference",
      header: "Reference",
      width: 140,
      cell: ({ row }) => <ReferenceCell reference={row.original.reference} />,
      exportValue: (item) => item.reference,
    },
    {
      accessorKey: "vss_user.full_name",
      header: "VSS",
      width: 180,
      cell: ({ row }) => <VssUserCell vssUser={row.original.vss_user} />,
      exportValue: (item) => item.vss_user?.full_name || "",
    },
    {
      accessorKey: "distributor_user.full_name",
      header: "Distributor",
      width: 190,
      cell: ({ row }) => <DistributorCell distributor={row.original.distributor_user} />,
      exportValue: (item) => item.distributor_user?.full_name || "",
    },
    {
      accessorKey: "brands",
      header: "Brands",
      width: 100,
      cell: ({ row }) => <BrandsCell brands={row.original.brands} />,
      exportValue: (item) => String(item.brands?.length ?? 0),
    },
    {
      accessorKey: "quantity",
      header: "Quantity",
      width: 90,
      cell: ({ row }) => <QuantityCell brands={row.original.brands} />,
      exportValue: (item) => String(item.brands?.reduce((sum, b) => sum + (Number(b.quantity) || 0), 0) ?? 0),
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
