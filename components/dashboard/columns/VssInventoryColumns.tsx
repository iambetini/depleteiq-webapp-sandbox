import { Button } from "@/components/ui/button";
import type { ColumnDef } from "@/components/ui/data-table-types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { VssInventoryTransaction } from "@/types/vss-inventory-transaction";
import { Eye, MoreHorizontal } from "lucide-react";
import React from "react";

const VssCell = React.memo(({ item }: { item: VssInventoryTransaction }) => {
  const name = (item as any).vss_user_name || (item as any).vss_user?.full_name || "-";
  return <div className="text-sm">{name}</div>;
});
VssCell.displayName = "VssCell";

const DistributorCell = React.memo(({ item }: { item: VssInventoryTransaction }) => {
  const name = (item as any).distributor_name || (item as any).distributor_user?.full_name || "-";
  return <div className="text-sm">{name}</div>;
});
DistributorCell.displayName = "DistributorCell";

const BusinessCell = React.memo(({ item }: { item: VssInventoryTransaction }) => {
  const name = (item as any).business_name || (item as any).business?.name || "-";
  return <div className="text-sm">{name}</div>;
});
BusinessCell.displayName = "BusinessCell";

const BrandCell = React.memo(({ brandPackage }: { brandPackage: VssInventoryTransaction["brand_package"] }) => (
  <div>
    <div className="text-sm font-medium">{brandPackage?.brand?.name || "-"}</div>
    <div className="text-xs text-muted-foreground">{brandPackage?.brand?.category || ""}</div>
  </div>
));
BrandCell.displayName = "BrandCell";

const PackageCell = React.memo(({ brandPackage }: { brandPackage: VssInventoryTransaction["brand_package"] }) => (
  <div className="text-sm">
    <span className="capitalize">{brandPackage?.type || "-"}</span>
    <span className="text-xs text-muted-foreground ml-1">({brandPackage?.quantity ?? "-"})</span>
  </div>
));
PackageCell.displayName = "PackageCell";

const QuantityCell = React.memo(({ quantity }: { quantity: number }) => (
  <div className="text-sm">{quantity ?? "-"}</div>
));
QuantityCell.displayName = "QuantityCell";

const PriceCell = React.memo(({ price }: { price: string }) => (
  <div className="text-sm">₦{parseFloat(price || "0").toLocaleString()}</div>
));
PriceCell.displayName = "PriceCell";

const TotalCell = React.memo(({ price, quantity }: { price: string; quantity: number }) => {
  const total = parseFloat(price || "0") * (Number(quantity) || 0);
  return <div className="font-medium">₦{total.toLocaleString()}</div>;
});
TotalCell.displayName = "TotalCell";

const CreatedAtCell = React.memo(({ createdAt }: { createdAt: string }) => (
  <div className="text-sm">{createdAt}</div>
));
CreatedAtCell.displayName = "CreatedAtCell";

const ActionsCell = React.memo(
  ({ row, router }: { row: { original: VssInventoryTransaction }; router: any }) => {
    const tx = row.original;
    const detailPath =
      tx.type === "supply" ? `/dashboard/inventory/supply/${tx.uuid}` : `/dashboard/inventory/${tx.uuid}`;
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
            onClick={() => router.push(detailPath)}
          >
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
);
ActionsCell.displayName = "ActionsCell";

interface ColumnProps {
  router: any;
  variant?: "order" | "supply";
}

export function getVssInventoryColumns({ router, variant }: ColumnProps): ColumnDef<VssInventoryTransaction>[] {
  const isOrder = variant === "order";
  const isSupply = variant === "supply";

  const partyHeader = isSupply ? "Business" : isOrder ? "Distributor" : "Distributor / Business";
  const partyAccessorKey = isSupply ? "business_name" : isOrder ? "distributor_name" : "distributor_name";

  return [
    {
      accessorKey: "vss_user_name",
      header: "VSS",
      width: 160,
      cell: ({ row }) => <VssCell item={row.original} />,
      exportValue: (item) => (item as any).vss_user_name || (item as any).vss_user?.full_name || "",
    },
    {
      accessorKey: partyAccessorKey,
      header: partyHeader,
      width: 190,
      cell: ({ row }) => {
        if (isSupply) return <BusinessCell item={row.original} />;
        if (isOrder) return <DistributorCell item={row.original} />;
        const isRowSupply = row.original.type === "supply";
        return isRowSupply ? <BusinessCell item={row.original} /> : <DistributorCell item={row.original} />;
      },
      exportValue: (item) => {
        if (isSupply) return (item as any).business_name || (item as any).business?.name || "";
        if (isOrder) return (item as any).distributor_name || (item as any).distributor_user?.full_name || "";
        return item.type === "supply"
          ? (item as any).business_name || (item as any).business?.name || ""
          : (item as any).distributor_name || (item as any).distributor_user?.full_name || "";
      },
    },
    {
      accessorKey: "brand_package.brand.name",
      header: "Brand",
      width: 200,
      cell: ({ row }) => <BrandCell brandPackage={row.original.brand_package} />,
      exportValue: (item) => item.brand_package?.brand?.name || "",
    },
    {
      accessorKey: "brand_package.type",
      header: "Package",
      width: 130,
      cell: ({ row }) => <PackageCell brandPackage={row.original.brand_package} />,
      exportValue: (item) => `${item.brand_package?.type || ""} (${item.brand_package?.quantity ?? ""})`,
    },
    {
      accessorKey: "quantity",
      header: "Quantity",
      width: 90,
      cell: ({ row }) => <QuantityCell quantity={row.original.quantity} />,
      exportValue: (item) => String(item.quantity ?? ""),
    },
    {
      accessorKey: "price",
      header: "Price",
      width: 110,
      cell: ({ row }) => <PriceCell price={row.original.price} />,
      exportValue: (item) => item.price,
    },
    {
      accessorKey: "total",
      header: "Total",
      width: 120,
      cell: ({ row }) => <TotalCell price={row.original.price} quantity={row.original.quantity} />,
      exportValue: (item) => String(parseFloat(item.price || "0") * (Number(item.quantity) || 0)),
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
