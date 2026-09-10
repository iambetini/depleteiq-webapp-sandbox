"use client"

import { DateFilter } from "@/components/dashboard/DateFilter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@/components/ui/data-table-types";
import { formatLabelToTitleCase } from "@/lib/label-formatters";
import type { RootState } from "@/store";
import { useGetDashboardQuery } from "@/store/dashboard-api";
import { RevenueWithDay } from "@/types/dashboard";
import { Package, ShoppingCart, UserRound, Users } from "lucide-react";
import Link from "next/link";
import { useMemo, useRef, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useOrderColumns } from "@/hooks/useOrderColumns";
import { useSession } from "next-auth/react";
import { Skeleton } from "@/components/ui/skeleton";

function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-label="Loading dashboard">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-9 w-44" />
          <Skeleton className="h-4 w-72 max-w-[70vw]" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        <Card className="h-full">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="relative h-[400px] border-b border-l border-border">
              <div className="absolute inset-0 flex items-end justify-around gap-3 px-6 pb-1">
                {[42, 68, 50, 82, 61, 74, 55].map((height, index) => (
                  <Skeleton
                    key={index}
                    className="w-full max-w-10 rounded-b-none"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {Array.from({ length: 8 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-8 w-24" />
                    {index > 0 && index < 4 && (
                      <Skeleton className="h-4 w-20" />
                    )}
                  </div>
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-4 w-14" />
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="grid grid-cols-5 gap-4 border-y px-6 py-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-4 w-20 max-w-full" />
            ))}
          </div>
          {Array.from({ length: 5 }).map((_, rowIndex) => (
            <div
              key={rowIndex}
              className="grid grid-cols-5 gap-4 border-b px-6 py-4 last:border-b-0"
            >
              {Array.from({ length: 5 }).map((_, columnIndex) => (
                <Skeleton
                  key={columnIndex}
                  className="h-4 w-24 max-w-full"
                />
              ))}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const dateRange = useSelector((state: RootState) => state.dashboardFilters.dateRange);
  const selectedFilter = useSelector((state: RootState) => state.dashboardFilters.selectedFilter);

  const { data: dashboardData, isLoading } = useGetDashboardQuery(
    selectedFilter === "Custom" && dateRange.start_date && dateRange.end_date
      ? { start_date: dateRange.start_date, end_date: dateRange.end_date }
      : dateRange && dateRange.period_type
        ? { period: dateRange.period_type }
        : undefined
  );
  const dataTableRef = useRef<{ refresh: () => void }>(null)
  const [periodType, setPeriodType] = useState('');
  const { columns } = useOrderColumns();
  // Memoized callback for period type update
  const updatePeriodType = useCallback((period_type: string) => {
    const formattedType = formatLabelToTitleCase(
      ['week', 'month', 'quarter'].includes(period_type) 
        ? `${period_type}ly` 
        : period_type
    );
    setPeriodType(formattedType);
  }, []);

  const sortedRevenue: RevenueWithDay[] = useMemo(() => {
    if (!dashboardData?.revenue) return [];
    
    const { labels = [], data = [], period_type } = dashboardData.revenue;
    updatePeriodType(period_type);
    
    return labels.map((label, idx) => ({
      date: label,
      total: typeof data[idx] === "string" ? Number(data[idx]) : data[idx] ?? 0,
      dayOfWeek: label.slice(0, 3),
      formattedDate: label,
    }));
  }, [dashboardData, updatePeriodType]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!dashboardData) {
    return null;
  }
  const filters: import("@/components/ui/data-table").FilterConfig[] = [{ type: "disableDefaultDateRange" }]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#444444]">Dashboard</h1>
          <p className="text-[#ababab]">
            Welcome back, {session?.user?.first_name || "User"}! Here&apos;s what&apos;s happening with your business.
          </p>
        </div>
        <div className="flex items-center">
          <DateFilter />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full dashboard-charts">
        {/* Revenue Trend Chart */}
        <div className="flex flex-col justify-between w-full">
          <Card className="h-full card-hover">
            <CardHeader>
              <CardTitle className="text-[#444444]">{periodType} Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={sortedRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eeeeee" />
                  <XAxis dataKey="formattedDate" stroke="#ababab" tick={{ fontSize: 10 }} />
                  <YAxis
                    stroke="#ababab"
                    tick={{ fontSize: 10 }}
                    tickFormatter={value => {
                      const n = Number(value) / 1_000_000;
                      return n === 0 ? "0" : `${n}${n === 1 ? "m" : "m"}`;
                    }}
                  />
                  <Tooltip
                    formatter={(value) => [
                      `₦${Number(value ?? 0).toLocaleString()}`,
                      "Total",
                    ]}
                  />
                  <Bar dataKey="total" fill="#ff6600" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#ababab]">Total Revenue</p>
                  <p className="text-2xl font-semibold text-[#444444]">₦{Number(dashboardData.total_revenue || 0).toLocaleString()}</p>
                </div>
                <span className="h-8 w-8 text-[#12b636] flex items-center justify-center text-3xl font-bold">₦</span>
              </div>
            </CardContent>
          </Card>
          {["FnB", "PC", "Pharma"].map((category) => {
            const cat = (dashboardData.brand_category_price_data ?? []).find(
              (c) => c.category === category
            ) || {
              category,
              total_price: "0",
              volume: 0,
            };
            return (
              <Card className="card-hover" key={cat.category}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#ababab]">{cat.category} Revenue</p>
                      <p className="text-2xl font-semibold text-[#444444]">₦{Number(cat.total_price).toLocaleString()}</p>
                    </div>
                    <Package className="h-8 w-8 text-[#1cd344]" />
                  </div>
                  <div className="flex items-center mt-2">
                    <span className="text-sm text-[#12b636]">Volume: {cat.volume}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#ababab]">Total Brand Volume</p>
                  <p className="text-2xl font-semibold text-[#444444]">{dashboardData.total_volume || 0}</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-[#ff6600]" />
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#ababab]">Total Order Volume</p>
                  <p className="text-2xl font-semibold text-[#444444]">{dashboardData.total_order_volume || 0}</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-[#ff6600]" />
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#ababab]">Total TPE</p>
                  <p className="text-2xl font-semibold text-[#444444]">{dashboardData.total_tpe || 0}</p>
                </div>
                <Users className="h-8 w-8 text-[#5b8cff]" />
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#ababab]">Total Promoters</p>
                  <p className="text-2xl font-semibold text-[#444444]">{dashboardData.total_promoters || 0}</p>
                </div>
                <UserRound className="h-8 w-8 text-[#12b636]" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-[#444444]">Recent Orders</CardTitle>
          <Link
            href="/dashboard/orders"
            className="text-sm text-[#ff6600] hover:underline font-medium"
            aria-label="See all orders"
          >
            See All
          </Link>
        </CardHeader>
        <CardContent>
          <div style={{ margin: "-1.5rem -1.5rem 0 -1.5rem" }}>
            <style>{`
              .dashboard-hide-header .flex.items-center.justify-between.py-4 {
                display: none !important;
              }
            `}</style>
            <div className="dashboard-hide-header">
              <DataTable className="no-card"
                ref={dataTableRef}
                columns={columns as unknown as ColumnDef<unknown, unknown>[]}
                store="orders"
                per_page={5}
                syncPaginationWithUrl={false}
                exportFileName="Recent-Orders"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
