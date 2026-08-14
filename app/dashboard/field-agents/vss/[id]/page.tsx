"use client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Mail, MapPin, Phone, Shield, User } from "lucide-react";
import { useVssData } from "@/hooks/use-entity-data";
import PerformanceMetricsCard from "@/components/dashboard/PerformanceMetricsCard";

export default function VssDetailPage() {
  const { entity: vss, performance } = useVssData();

  if (!vss) { return null; }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle className="text-[#444444]">VSS Details</CardTitle>
            </div>
            <Badge
              variant={vss?.status === "active" ? "default" : "destructive"}
              className={`status ${vss?.status === "active" ? "active" : "inactive"} mt-1`}
            >
              {vss?.status}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-[#ababab]" />
                <div>
                  <p className="text-sm text-[#ababab]">Full Name</p>
                  <p className="font-medium text-[#444444]">
                    {vss?.first_name} {vss?.last_name}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-[#ababab]" />
                <div>
                  <p className="text-sm text-[#ababab]">Email</p>
                  <p className="font-medium text-[#444444]">{vss?.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-[#ababab]" />
                <div>
                  <p className="text-sm text-[#ababab]">Phone</p>
                  <p className="font-medium text-[#444444]">{vss?.phone}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-[#ababab]" />
                <div>
                  <p className="text-sm text-[#ababab]">Market</p>
                  <p className="font-medium text-[#444444]">{vss?.market?.name || "No Market"}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-[#ababab]" />
                <div>
                  <p className="text-sm text-[#ababab]">Role</p>
                  <p className="font-medium text-[#444444]">{vss?.role?.name || "No Role"}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-[#ababab]" />
                <div>
                  <p className="text-sm text-[#ababab]">Created</p>
                  <p className="font-medium text-[#444444]">{vss?.created_at}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <PerformanceMetricsCard
          cummulativePerformance={performance?.cummulative_performance || 0}
          dailyTarget={performance?.daily_target || 0}
          monthlyTarget={performance?.monthly_target || 0}
        />
      </div>
    </div>
  )
}
