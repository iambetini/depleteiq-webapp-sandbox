"use client";

import { useParams } from "next/navigation";
import { useGetDistributorQuery } from "@/store/distributors";
import { useGetIMEVSSQuery } from "@/store/ime-vss";
import { useGetReportQuery } from "@/store/reports";
import { useMemo } from "react";

interface PerformanceData {
  target: number;
  total_order_count: number;
  total_order_value: string | number;
  total_orders?: number;
  target_volume?: number;
  // IME/VSS specific fields
  cummulative_performance?: number;
  daily_target?: number;
  monthly_target?: number;
}

interface DistributorPerformanceResponse {
  distributor_id: string;
  start_date: string | null;
  end_date: string | null;
  total_order_value: number;
  target_volume: number;
  performance: any | null;
}

interface EntityContextValue<T> {
  entity: T | null;
  isLoading: boolean;
  error: string | null;
  performance: PerformanceData | null;
  refetch: () => void;
}

// Distributor-specific hook
export function useDistributorData(enabled: boolean = true) {
  const params = useParams();
  const distributorId = params.id as string;

  const {
    data: distributor,
    isLoading,
    error,
    refetch,
  } = useGetDistributorQuery(distributorId, { skip: !enabled });

  // Fetch distributor performance data using the distributor store with extraPath
  const { data: performanceData } = useGetDistributorQuery(
    {
      id: distributorId,
      extraPath: "performance",
    } as any,
    { skip: !enabled }
  );

  // Extract performance data for the specific distributor
  const performance = useMemo(() => {
    if (!performanceData || !distributor) return null;

    // Due to different handlers, the response might be the raw ApiResponse
    // or the data payload directly. Normalize to the item shape provided.
    const apiLike: any = performanceData as any;
    const payload: any = apiLike?.data || performanceData;
    const perfData = (payload as unknown) as DistributorPerformanceResponse;

    // Map the API response to the expected PerformanceData format
    return {
      target: perfData?.target_volume || 0,
      total_order_count: 0,
      total_order_value: perfData?.total_order_value || 0,
      total_orders: 0,
      target_volume: perfData?.target_volume || 0,
    };
  }, [performanceData, distributor]);

  return {
    entity: distributor || null,
    isLoading,
    error: error ? String(error) : null,
    performance,
    refetch,
  };
}

// IME-VSS-specific hook
export function useImeVssData(enabled: boolean = true) {
  const params = useParams();
  const imeVssId = params.id as string;

  const {
    data: imeVss,
    isLoading,
    error,
    refetch,
  } = useGetIMEVSSQuery(imeVssId, { skip: !enabled });

  // Fetch IME-VSS performance data using reports store with extraPath
  const { data: performanceData } = useGetReportQuery(
    {
      id: imeVssId,
      extraPath: `ime_vss_performance/${imeVssId}`,
    } as any,
    { skip: !enabled }
  );

  // Extract performance data for the specific IME-VSS
  const performance = useMemo(() => {
    if (!performanceData || !imeVss) return null;

    // Map the API response to the expected PerformanceData format
    return {
      target: performanceData.monthly_target || 0,
      total_order_count: 0, // This might need to be calculated differently
      total_order_value: performanceData.cummulative_performance || 0,
      total_orders: 0, // This might need to be calculated differently
      target_volume: performanceData.monthly_target || 0,
      // Add the new fields for IME/VSS specific metrics
      cummulative_performance: performanceData.cummulative_performance || 0,
      daily_target: performanceData.daily_target || 0,
      monthly_target: performanceData.monthly_target || 0,
    };
  }, [performanceData, imeVss]);

  return {
    entity: imeVss || null,
    isLoading,
    error: error ? String(error) : null,
    performance,
    refetch,
  };
}
