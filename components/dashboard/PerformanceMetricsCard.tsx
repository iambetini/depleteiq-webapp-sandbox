import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface PerformanceMetricsCardProps {
  title?: string;
  totalOrders?: number;
  totalOrderValue?: number;
  targetVolume?: number;
  currency?: string;
  // IME/VSS specific fields
  cummulativePerformance?: number;
  dailyTarget?: number;
  monthlyTarget?: number;
}

export default function PerformanceMetricsCard({
  title = "Performance Metrics",
  totalOrders = undefined,
  totalOrderValue = undefined,
  targetVolume = undefined,
  currency = "₦",
  cummulativePerformance,
  dailyTarget,
  monthlyTarget
}: PerformanceMetricsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-[#444444]">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {totalOrders !== undefined && (
          <>
            <div className="flex justify-between items-center">
              <span className="text-[#ababab]">Total Orders</span>
              <span className="font-bold text-[#444444]">
                {totalOrders.toLocaleString()}
              </span>
            </div>
            <Separator />
          </>
        )}
        {totalOrderValue !== undefined && (
          <>
            <div className="flex justify-between items-center">
              <span className="text-[#ababab]">Total Order Value</span>
              <span className="font-bold text-[#444444]">
                {currency}{Number(totalOrderValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <Separator />
          </>
        )}
        {targetVolume !== undefined && (
          <>
            <div className="flex justify-between items-center">
              <span className="text-[#ababab]">Annual Target</span>
              <span className="font-bold text-[#444444]">
                {currency}{Number(targetVolume).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <Separator />
          </>
        )}
        {cummulativePerformance !== undefined && (
          <>
            <div className="flex justify-between items-center">
              <span className="text-[#ababab]">Cumulative Performance</span>
              <span className="font-bold text-[#444444]">
                {cummulativePerformance.toLocaleString()}%
              </span>
            </div>
            <Separator />
          </>
        )}
        {dailyTarget !== undefined && (
          <>
            <div className="flex justify-between items-center">
              <span className="text-[#ababab]">Daily Target</span>
              <span className="font-bold text-[#444444]">
                {currency}{dailyTarget.toLocaleString()}
              </span>
            </div>
            <Separator />
          </>
        )}
        {monthlyTarget !== undefined && (
          <>
            <div className="flex justify-between items-center">
              <span className="text-[#ababab]">Monthly Target</span>
              <span className="font-bold text-[#444444]">
                {currency}{monthlyTarget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <Separator />
          </>
        )}
      </CardContent>
    </Card>
  );
}
