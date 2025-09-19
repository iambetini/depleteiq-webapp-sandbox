"use client"

import { useParams } from "next/navigation";
import { useGetDistributorQuery } from "@/store/distributors";
import { useGetIMEVSSQuery } from "@/store/ime-vss";
import { useGetIMEVSSsPerformanceQuery } from "@/store/ime-vss-performance";
import { useMemo } from "react";

interface PerformanceData {
  target: number
  total_order_count: number
  total_order_value: string | number
  total_orders?: number
  target_volume?: number
}

interface DistributorPerformanceResponse {
  distributor_id: string
  start_date: string | null
  end_date: string | null
  total_order_value: number
  target_volume: number
  performance: any | null
}

interface EntityContextValue<T> {
  entity: T | null
  isLoading: boolean
  error: string | null
  performance: PerformanceData | null
  refetch: () => void
}


// Distributor-specific hook
export function useDistributorData() {
  const params = useParams()
  const distributorId = params.id as string
  
  const { data: distributor, isLoading, error, refetch } = useGetDistributorQuery(distributorId)
  
  // Fetch distributor performance data using the distributor store with extraPath
  const { data: performanceData } = useGetDistributorQuery({
    id: distributorId,
    extraPath: "performance"
  })

  // Extract performance data for the specific distributor
  const performance = useMemo(() => {
    if (!performanceData || !distributor) return null
    
    const perfData = performanceData as unknown as DistributorPerformanceResponse
    
    // Map the API response to the expected PerformanceData format
    return {
      target: perfData.target_volume || 0,
      total_order_count: 0, // API doesn't provide order count
      total_order_value: perfData.total_order_value || 0,
      total_orders: 0, // API doesn't provide order count
      target_volume: perfData.target_volume || 0,
    }
  }, [performanceData, distributor])
  
  return {
    entity: distributor || null,
    isLoading,
    error: error ? String(error) : null,
    performance,
    refetch,
  }
}

// IME-VSS-specific hook
export function useImeVssData() {
  const params = useParams()
  const imeVssId = params.id as string
  
  const { data: imeVss, isLoading, error, refetch } = useGetIMEVSSQuery(imeVssId)
  
  // Fetch IME-VSS performance data separately
  const { data: performanceData } = useGetIMEVSSsPerformanceQuery({})
  
  // Extract performance data for the specific IME-VSS
  const performance = useMemo(() => {
    if (!performanceData || !imeVss) return null
    
    const performanceItems = (performanceData as any)?.data?.items || []
    const userPerformance = performanceItems.find((item: any) => 
      item.user?.uuid === imeVss.uuid
    )
    
    if (!userPerformance) return null
    
    // Map IMEVSSPerformance to the expected PerformanceData format
    return {
      target: userPerformance.monthly_target || 0,
      total_order_count: 0, // This might need to be calculated differently
      total_order_value: userPerformance.cummulative_performance || 0,
      total_orders: 0, // This might need to be calculated differently
      target_volume: userPerformance.monthly_target || 0,
    }
  }, [performanceData, imeVss])
  
  return {
    entity: imeVss || null,
    isLoading,
    error: error ? String(error) : null,
    performance,
    refetch,
  }
}

