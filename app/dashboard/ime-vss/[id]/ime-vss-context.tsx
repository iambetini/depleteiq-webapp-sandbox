"use client";
import { toast } from "@/hooks/use-toast";
import { useGetIMEVSSQuery } from "@/store/ime-vss";
import { apiClient } from "@/lib/api-client";
import type { User } from "@/types/user";
import React, { createContext, useCallback, useContext, useMemo, useState, useEffect } from "react";

interface ImeVssContextValue {
  imeVss: User | null;
  isLoading: boolean;
  fetchImeVss: () => void;
  refetch: () => void;
  performance: any | null;
}

const ImeVssContext = createContext<ImeVssContextValue | undefined>(undefined);

export function ImeVssProvider({ imeVssId, children }: { imeVssId: string; children: React.ReactNode }) {

  const {
    data: imeVss,
    isLoading,
    error,
    refetch
  } = useGetIMEVSSQuery(imeVssId);

  const [performance, setPerformance] = useState<any>(null);

  const fetchPerformance = useCallback(async () => {
    try {
      const { data } = await apiClient.get(`/ime_vss/${imeVssId}/performance`);
      setPerformance(data?.item || null);
    } catch (error) {
      console.error('Failed to fetch IME-VSS performance:', error);
    }
  }, [imeVssId]);

  useEffect(() => {
    if (imeVssId) {
      fetchPerformance();
    }
  }, [imeVssId, fetchPerformance]);


  React.useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: (error as any)?.message || "Failed to fetch IME-VSS details",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const fetchImeVss = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <ImeVssContext.Provider value={{ imeVss: imeVss ?? null, isLoading, fetchImeVss, refetch, performance }}>
      {children}
    </ImeVssContext.Provider>
  );
}

export function useImeVssContext() {
  const ctx = useContext(ImeVssContext);
  if (!ctx) throw new Error("useImeVssContext must be used within an ImeVssProvider");
  return ctx;
}

// Custom hooks for specific IME-VSS data
export function useImeVss() {
  const { imeVss } = useImeVssContext();
  return useMemo(() => imeVss, [imeVss]);
}

export function useImeVssInfo() {
  const { imeVss } = useImeVssContext();
  return useMemo(() => ({
    id: imeVss?.id,
    uuid: imeVss?.uuid,
    full_name: imeVss?.full_name,
    email: imeVss?.email,
    phone: imeVss?.phone,
    status: imeVss?.status,
  }), [imeVss]);
}

export function useImeVssPerformance() {
  const { performance } = useImeVssContext();
  return useMemo(() => performance, [performance]);
}
