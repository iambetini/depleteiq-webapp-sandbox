"use client";

import { toast } from "@/hooks/use-toast";
import React, { createContext, useCallback, useContext } from "react";

interface EntityContextValue<T> {
  [key: string]: T | null | boolean | (() => void);
  isLoading: boolean;
  fetchEntity: () => void;
  refetch: () => void;
}

interface ContextFactoryOptions<T> {
  entityName: string;
  useGetQuery: (id: string) => {
    data?: T;
    isLoading: boolean;
    error?: any;
    refetch: () => void;
  };
  showErrorToast?: boolean;
}

export function createEntityContext<T>({
  entityName,
  useGetQuery,
  showErrorToast = true,
}: ContextFactoryOptions<T>) {
  const EntityContext = createContext<EntityContextValue<T> | undefined>(undefined);

  // Convert PascalCase to camelCase (e.g., "PromoParticipation" -> "promoParticipation")
  const camelCaseEntityName = entityName.charAt(0).toLowerCase() + entityName.slice(1);

  function EntityProvider({ id, children }: { id: string; children: React.ReactNode }) {
    const {
      data: entity,
      isLoading,
      error,
      refetch,
    } = useGetQuery({ id });

    React.useEffect(() => {
      if (error && showErrorToast) {
        toast({
          title: "Error",
          description: (error as any)?.message || `Failed to fetch ${entityName} details`,
          variant: "destructive",
        });
      }
    }, [error]);

    const fetchEntity = useCallback(() => {
      refetch();
    }, [refetch]);

    const contextValue = {
      [camelCaseEntityName]: entity ?? null,
      [entityName.toLowerCase()]: entity ?? null, // Support old lowercase format for backward compatibility
      isLoading,
      fetchEntity,
      refetch,
    };

    return (
      <EntityContext.Provider value={contextValue}>
        {children}
      </EntityContext.Provider>
    );
  }

  function useEntityContext() {
    const ctx = useContext(EntityContext);
    if (!ctx) {
      throw new Error(`use${entityName}Context must be used within a ${entityName}Provider`);
    }
    return ctx;
  }

  return {
    [`${entityName}Provider`]: EntityProvider,
    [`use${entityName}Context`]: useEntityContext,
  };
}
