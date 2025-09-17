"use client";
import { useGetIMEVSSQuery } from "@/store/ime-vss";
import { apiClient } from "@/lib/api-client";
import type { User } from "@/types/user";
import React, { createContext, useContext, useState, useEffect } from "react";

interface PerformanceApiResponse {
  target: number;
  total_order_count: number;
  total_order_value: string;
}

interface ImeVssContextValue {
  imeVss: User | null;
  isLoading: boolean;
  performance: PerformanceApiResponse | null;
}

const ImeVssContext = createContext<ImeVssContextValue | undefined>(undefined);

export function ImeVssProvider({ imeVssId, children }: { imeVssId: string; children: React.ReactNode }) {
  const {
    data: imeVss,
    isLoading,
  } = useGetIMEVSSQuery(imeVssId);

  const [performance, setPerformance] = useState<PerformanceApiResponse | null>(null);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const { data: { item: performance } } = await apiClient.get(`/ime_vss/${imeVssId}/performance`) as any;
        setPerformance(performance || null);
      } catch (error) {
        console.error('Failed to fetch IME-VSS performance:', error);
        setPerformance(null);
      }
    };

    if (imeVssId) {
      fetchPerformance();
    }
  }, [imeVssId]);

  return (
    <ImeVssContext.Provider value={{
      imeVss: imeVss ?? null,
      isLoading,
      performance
    }}>
      {children}
    </ImeVssContext.Provider>
  );
}

export function useImeVssContext() {
  const ctx = useContext(ImeVssContext);
  if (!ctx) throw new Error("useImeVssContext must be used within an ImeVssProvider");
  return ctx;
}
