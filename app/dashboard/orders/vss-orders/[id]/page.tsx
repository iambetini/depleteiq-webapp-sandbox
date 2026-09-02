"use client";
import ViewPageHeader from "@/components/dashboard/ViewPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import type { VssOrder } from "@/types/vss-order";
import { useContext } from "./layout";

export default function VssOrderDetailPage() {
  const { vssOrder: order } = useContext() as { vssOrder: VssOrder; isLoading: boolean; fetchEntity: () => void };

  if (!order) return null;

  const totalQuantity = order.brands?.reduce((sum, b) => sum + (Number(b.quantity) || 0), 0) ?? 0;

  return (
    <div>
      <ViewPageHeader
        title="VSS Order Details"
        description={order.reference ? `#${order.reference}` : ""}
      />
      <Card className="w-full max-w-3xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-[#FF6600] font-bold text-lg">#{order.reference}</div>
          </div>

          {/* Order Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div>
              <p className="text-medium font-semibold text-[#333333] mb-1">Order Date</p>
              <p className="font-sm text-sm text-[#666666]">{order.created_at ?? "N/A"}</p>
            </div>
            <div>
              <p className="text-medium font-semibold text-[#333333] mb-1">VSS User</p>
              <p className="font-sm text-sm text-[#666666]">{order.vss_user?.full_name || "N/A"}</p>
              <p className="text-xs text-[#999]">{order.vss_user?.email || ""}</p>
            </div>
            <div>
              <p className="text-medium font-semibold text-[#333333] mb-1">Distributor</p>
              <p className="font-sm text-sm text-[#666666]">{order.distributor_user?.full_name || "N/A"}</p>
              <p className="text-xs text-[#999]">{order.distributor_user?.distributor_details?.business_name || ""}</p>
            </div>
            <div>
              <p className="text-medium font-semibold text-[#333333] mb-1">Distributor Business</p>
              <p className="font-sm text-sm text-[#666666]">{order.distributor_user?.distributor_details?.business_name || "N/A"}</p>
              <p className="text-xs text-[#999]">{order.distributor_user?.distributor_details?.address || ""}</p>
            </div>
            <div>
              <p className="text-medium font-semibold text-[#333333] mb-1">Total Amount</p>
              <p className="font-sm text-sm text-[#666666] font-medium">₦{parseFloat(order.total_amount || "0").toLocaleString()}</p>
            </div>
          </div>

          {/* Brands Table */}
          <div className="mb-2">
            <h3 className="text-lg font-semibold text-[#333333] mb-3">Brands ({order.brands?.length ?? 0})</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-medium font-medium text-[#333333]">Brand</th>
                    <th className="text-left py-3 px-4 text-medium font-medium text-[#333333]">Package</th>
                    <th className="text-left py-3 px-4 text-medium font-medium text-[#333333]">Quantity</th>
                    <th className="text-left py-3 px-4 text-medium font-medium text-[#333333]">Negotiated Price</th>
                    <th className="text-left py-3 px-4 text-medium font-medium text-[#333333]">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.brands?.length ? (
                    order.brands.map((brand, idx) => {
                      const brandName = brand.brand_package?.brand?.name || "N/A";
                      const category = brand.brand_package?.brand?.category || "";
                      const type = brand.brand_package?.type || "-";
                      const pkgQty = brand.brand_package?.quantity || "-";
                      const negotiated = parseFloat(brand.negotiated_price || "0");
                      const qty = Number(brand.quantity) || 0;
                      return (
                        <tr
                          key={brand.uuid || idx}
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
                          <td className="py-3 px-4 font-light text-[#333333]">
                            {qty}
                            {brand.quantity_remaining !== undefined && (
                              <span className="text-xs text-muted-foreground ml-1">({brand.quantity_remaining} remaining)</span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-light text-[#333333]">₦{negotiated.toLocaleString()}</td>
                          <td className="py-3 px-4 font-light text-[#333333]">₦{(negotiated * qty).toLocaleString()}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-sm text-muted-foreground">
                        No brands found for this order.
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
                      ₦{order.total_amount ? parseFloat(order.total_amount).toLocaleString() : "0"}
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
