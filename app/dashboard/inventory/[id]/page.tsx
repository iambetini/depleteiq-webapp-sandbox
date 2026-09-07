"use client";
import ViewPageHeader from "@/components/dashboard/ViewPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import type { VssInventoryTransaction } from "@/types/vss-inventory-transaction";
import Image from "next/image";
import Link from "next/link";
import { useContext } from "./layout";

export default function InventoryTransactionDetailPage() {
  const { vssInventoryTransaction } = useContext() as {
    vssInventoryTransaction: VssInventoryTransaction | null;
  };

  const tx = vssInventoryTransaction;
  if (!tx) return null;

  const brand = tx.brand_package?.brand;
  const pkg = tx.brand_package;
  const qty = Number(tx.quantity) || 0;
  const price = parseFloat(tx.price || "0");
  const total = price * qty;

  const vssName = (tx as any).vss_user_name || (tx as any).vss_user?.full_name || "N/A";
  const distributorName = (tx as any).distributor_name || (tx as any).distributor_user?.full_name || "N/A";
  const distributorPhone = (tx as any).distributor_phone || "";

  return (
    <div>
      <ViewPageHeader
        title="Order Details"
        description="View details of order."
      />
      <Card className="w-full max-w-3xl">
        <CardContent className="p-6">
          {/* Transaction info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div>
              <p className="text-medium font-semibold text-[#333333] mb-1">Type</p>
              <StatusBadge status={tx.type as any} />
            </div>
            <div>
              <p className="text-medium font-semibold text-[#333333] mb-1">VSS User</p>
              <p className="font-sm text-sm text-[#666666]">{vssName}</p>
            </div>
            <div>
              <p className="text-medium font-semibold text-[#333333] mb-1">Distributor</p>
              <p className="font-sm text-sm text-[#666666]">{distributorName}</p>
              {distributorPhone && <p className="text-xs text-[#999]">{distributorPhone}</p>}
            </div>
            <div>
              <p className="text-medium font-semibold text-[#333333] mb-1">Quantity</p>
              <p className="font-sm text-sm text-[#666666]">{tx.quantity}</p>
            </div>
            <div>
              <p className="text-medium font-semibold text-[#333333] mb-1">Price</p>
              <p className="font-sm text-sm text-[#666666]">₦{price.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-medium font-semibold text-[#333333] mb-1">Total</p>
              <p className="font-sm text-sm text-[#666666]">₦{total.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-medium font-semibold text-[#333333] mb-1">Created At</p>
              <p className="font-sm text-sm text-[#666666]">{tx.created_at || "N/A"}</p>
            </div>
            <div>
              <p className="text-medium font-semibold text-[#333333] mb-1">Note</p>
              <p className="font-sm text-sm text-[#666666]">{tx.note || "-"}</p>
            </div>
          </div>

          {/* Brand */}
          <div className="mb-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-[#333333] mb-3">Brand</h3>
            {!brand ? (
              <p className="text-sm text-muted-foreground">No brand information.</p>
            ) : (
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <h3 className="font-medium text-[#333333]">
                    {brand.name}
                  </h3>
                  <p className="text-sm text-[#666666]">{brand.category}</p>
                  <p className="text-xs text-[#999]">PCS per carton: {brand.pcs_per_carton ?? "-"}</p>
                  {brand.is_group_brand && <p className="text-xs text-[#999]">Group brand</p>}
                </div>
              </div>
            )}
          </div>

          {/* Package */}
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-[#333333] mb-3">Package</h3>
            {!pkg ? (
              <p className="text-sm text-muted-foreground">No package information.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-medium font-semibold text-[#333333] mb-1">Type</p>
                  <p className="font-sm text-sm text-[#666666] capitalize">{pkg.type}</p>
                </div>
                <div>
                  <p className="text-medium font-semibold text-[#333333] mb-1">Quantity</p>
                  <p className="font-sm text-sm text-[#666666]">{pkg.quantity}</p>
                </div>
                <div>
                  <p className="text-medium font-semibold text-[#333333] mb-1">Original Price</p>
                  <p className="font-sm text-sm text-[#666666]">₦{Number(pkg.og_price).toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
