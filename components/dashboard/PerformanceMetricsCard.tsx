import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface PerformanceMetricsCardProps {
  title?: string;
  totalOrders?: number;
  totalOrderValue?: number;
  targetVolume?: number;
  currency?: string;
  volumeUnit?: string;
}

export default function PerformanceMetricsCard({
  title = "Performance Metrics",
  totalOrders = 0,
  totalOrderValue = 0,
  targetVolume = 0,
  currency = "₦",
  volumeUnit = ""
}: PerformanceMetricsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-[#444444]">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-[#ababab]">Total Orders</span>
          <span className="font-bold text-[#444444]">{totalOrders}</span>
        </div>
        <Separator />
        <div className="flex justify-between items-center">
          <span className="text-[#ababab]">Total Value</span>
          <span className="font-bold text-[#444444]">
            {currency}{totalOrderValue.toLocaleString()}
          </span>
        </div>
        <Separator />
        <div className="flex justify-between items-center">
          <span className="text-[#ababab]">Target Volume</span>
          <span className="font-bold text-[#444444]">
            {targetVolume.toLocaleString()}{volumeUnit}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
