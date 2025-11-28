"use client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Calendar, Target as TargetIcon, Package, Banknote  } from "lucide-react";
import { useParams } from "next/navigation";
import { memo } from "react";
import { useGetTargetQuery } from "@/store/targets";

const TargetDetailsCard = memo(() => {
  const params = useParams();
  const id = params.id as string;
  const { data, isLoading } = useGetTargetQuery(id);
  const target = (data as any)?.data || data;

  if (isLoading) return <div>Loading...</div>;
  if (!target) return <div>Target not found</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-[#444444]">Target Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <User className="h-5 w-5 text-[#ababab]" />
            <div>
              <p className="text-sm text-[#ababab]">User</p>
              <p className="font-medium text-[#444444]">
                {target.user?.first_name} {target.user?.last_name}
              </p>
              <p className="text-sm text-[#ababab]">{target.user?.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <TargetIcon className="h-5 w-5 text-[#ababab]" />
            <div>
              <p className="text-sm text-[#ababab]">Type</p>
              <Badge variant="outline" className="capitalize">
                {target.type}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <TargetIcon className="h-5 w-5 text-[#ababab]" />
            <div>
              <p className="text-sm text-[#ababab]">Goal Type</p>
              <Badge variant="secondary" className="capitalize">
                {target.goal_type}
              </Badge>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Banknote className="h-5 w-5 text-[#ababab]" />
            <div>
              <p className="text-sm text-[#ababab]">Amount</p>
              <p className="font-medium text-[#444444]">
                ₦{Number(target.amount).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {target.volume && (
            <div className="flex items-center space-x-3">
              <Package className="h-5 w-5 text-[#ababab]" />
              <div>
                <p className="text-sm text-[#ababab]">Volume</p>
                <p className="font-medium text-[#444444]">
                  {Number(target.volume).toLocaleString()}
                </p>
              </div>
            </div>
          )}
          <div className="flex items-center space-x-3">
            <Calendar className="h-5 w-5 text-[#ababab]" />
            <div>
              <p className="text-sm text-[#ababab]">Date Range</p>
              <p className="font-medium text-[#444444]">
                {target.start_date || "N/A"} - {target.end_date || "N/A"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <Calendar className="h-5 w-5 text-[#ababab]" />
            <div>
              <p className="text-sm text-[#ababab]">Created</p>
              <p className="font-medium text-[#444444]">{target.created_at || "N/A"}</p>
            </div>
          </div>
          {target.updated_at && (
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-[#ababab]" />
              <div>
                <p className="text-sm text-[#ababab]">Last Updated</p>
                <p className="font-medium text-[#444444]">{target.updated_at}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});
TargetDetailsCard.displayName = "TargetDetailsCard";

export default function TargetDetailPage() {
  return (
    <div>
      <div className="grid grid-cols-1 gap-6">
        <TargetDetailsCard />
      </div>
    </div>
  );
}
