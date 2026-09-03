"use client";
import ViewPageHeader from "@/components/dashboard/ViewPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import type { VssSupply } from "@/types/vss-supply";
import Link from "next/link";
import { useContext } from "./layout";

export default function VssSupplyDetailPage() {
  const { vssSupply: supply } = useContext() as { vssSupply: VssSupply };

  if (!supply) return null;

  const totalQuantity = supply.supplied_brands?.reduce((sum, b) => sum + (Number(b.quantity) || 0), 0) ?? 0;

  return (
    <div>
      <ViewPageHeader
        title="Supply Details"
        description={`#${supply.uuid.slice(0, 8)}`}
      />
      <Card className="w-full max-w-3xl">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div>
              <p className="text-medium font-semibold text-[#333333] mb-1">Supply Date</p>
              <p className="font-sm text-sm text-[#666666]">{supply.created_at ?? "N/A"}</p>
            </div>
            <div>
              <p className="text-medium font-semibold text-[#333333] mb-1">VSS User</p>
              <p className="font-sm text-sm text-[#666666]">{supply.vss_user?.full_name || "N/A"}</p>
              <p className="text-xs text-[#999]">{supply.vss_user?.email || ""}</p>
              <p className="text-xs text-[#999]">{supply.vss_user?.phone || ""}</p>
            </div>
            <div>
              <p className="text-medium font-semibold text-[#333333] mb-1">Business</p>
              <p className="font-sm text-sm text-[#666666]">{supply.business?.name || "N/A"}</p>
            </div>
            <div>
              <p className="text-medium font-semibold text-[#333333] mb-1">Store</p>
              <p className="font-sm text-sm text-[#666666]">{supply.store?.uuid ? `Store ${supply.store.uuid.slice(0, 8)}` : "N/A"}</p>
              <p className="text-xs text-[#999]">{supply.store?.promo_class ? `Class: ${supply.store.promo_class}` : ""}</p>
            </div>
            <div>
              <p className="text-medium font-semibold text-[#333333] mb-1">Total Amount</p>
              <p className="font-sm text-sm text-[#666666] font-medium">₦{parseFloat(supply.total_amount || "0").toLocaleString()}</p>
            </div>
            <div>
              <p className="text-medium font-semibold text-[#333333] mb-1">Category</p>
              <p className="font-sm text-sm text-[#666666]">{supply.store?.category?.join(", ") || "-"}</p>
            </div>
          </div>

          <div className="mb-2">
            <h3 className="text-lg font-semibold text-[#333333] mb-3">
              Supplied Brands ({supply.supplied_brands?.length ?? 0})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-medium font-medium text-[#333333]">Brand</th>
                    <th className="text-left py-3 px-4 text-medium font-medium text-[#333333]">Package</th>
                    <th className="text-left py-3 px-4 text-medium font-medium text-[#333333]">Quantity</th>
                    <th className="text-left py-3 px-4 text-medium font-medium text-[#333333]">Price</th>
                    <th className="text-left py-3 px-4 text-medium font-medium text-[#333333]">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {supply.supplied_brands?.length ? (
                    supply.supplied_brands.map((item, idx) => {
                      const brandName = item.brand_package?.brand?.name || "N/A";
                      const category = item.brand_package?.brand?.category || "";
                      const type = item.brand_package?.type || "-";
                      const pkgQty = item.brand_package?.quantity || "-";
                      const price = parseFloat(item.price || "0");
                      const qty = Number(item.quantity) || 0;
                      return (
                        <tr
                          key={item.uuid || idx}
                          className="border-b border-gray-100"
                          style={{ backgroundColor: idx % 2 === 0 ? "#F8F8F8" : undefined }}
                        >
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium text-[#666666]">{brandName}</p>
                              <p className="text-sm font-light text-[#666666]">{category}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-light text-[#333333]">
                            <span className="capitalize">{type}</span>
                            <span className="text-xs text-muted-foreground ml-1">({pkgQty})</span>
                          </td>
                          <td className="py-3 px-4 font-light text-[#333333]">{qty}</td>
                          <td className="py-3 px-4 font-light text-[#333333]">₦{price.toLocaleString()}</td>
                          <td className="py-3 px-4 font-light text-[#333333]">₦{(price * qty).toLocaleString()}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-sm text-muted-foreground">
                        No supplied brands.
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-300">
                    <td className="py-3 px-4 font-semibold text-[#333333]">Grand Total</td>
                    <td className="py-3 px-4"></td>
                    <td className="py-3 px-4 font-semibold text-[#333333]">{totalQuantity}</td>
                    <td className="py-3 px-4"></td>
                    <td className="py-3 px-4 font-semibold text-[#333333]">
                      ₦{supply.total_amount ? parseFloat(supply.total_amount).toLocaleString() : "0"}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
