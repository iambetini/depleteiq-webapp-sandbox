import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface PerformanceMetricsCardProps {
  title?: string;
  totalOrders?: number;
  totalOrderValue?: number;
  targetVolume?: number;
  currency?: string;
  volumeUnit?: string;
  // IME/VSS specific fields
  cummulativePerformance?: number;
  dailyTarget?: number;
  monthlyTarget?: number;
}

export default function PerformanceMetricsCard({
  title = "Performance Metrics",
  totalOrders = 0,
  totalOrderValue = 0,
  targetVolume = 0,
  currency = "₦",
  volumeUnit = "",
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
                {currency}{monthlyTarget.toLocaleString()}
              </span>
            </div>
            <Separator />
          </>
        )}
      </CardContent>
    </Card>
  );
}
