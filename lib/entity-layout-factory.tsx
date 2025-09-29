"use client";

import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { createEntityContext } from "@/lib/context-factory";
import { storeApis } from "@/store";
import { notFound, useParams } from "next/navigation";
import React from "react";

interface EntityLayoutFactoryOptions<T> {
  storeName?: string;
  entityName?: string;
  useGetQuery?: (id: string) => {
    data?: T;
    isLoading: boolean;
    error?: any;
    refetch: () => void;
  };
  showErrorToast?: boolean;
}

export function createEntityLayout<T>({
  storeName,
  entityName,
  useGetQuery,
  showErrorToast = true,
}: EntityLayoutFactoryOptions<T>) {
  let finalUseGetQuery = useGetQuery;
  let finalEntityName = entityName;

  // Resolve hook from store if storeName is provided
  if (storeName && !useGetQuery) {
    const store = storeApis[storeName as keyof typeof storeApis];
    if (!store) {
      throw new Error(`Unknown store: ${storeName}`);
    }
    finalUseGetQuery = store.useGetByIdQuery as any;
  }

  // Derive entity name from storeName if not provided
  if (storeName && !entityName) {
    const singularStoreName = storeName.endsWith('s') ? storeName.slice(0, -1) : storeName;
    finalEntityName = singularStoreName.charAt(0).toUpperCase() + singularStoreName.slice(1);
  }

  if (!finalUseGetQuery || !finalEntityName) {
    throw new Error('Either provide storeName or both entityName and useGetQuery');
  }

  const contextResult = createEntityContext<T>({
    entityName: finalEntityName,
    useGetQuery: finalUseGetQuery as any,
    showErrorToast,
  });

  const providerKey = `${finalEntityName}Provider`;
  const contextKey = `use${finalEntityName}Context`;
  
  const Provider = (contextResult as any)[providerKey];
  const useEntityContext = (contextResult as any)[contextKey];

  function EntityLayout({ children }: { children: React.ReactNode }) {
    const { id } = useParams();

    return (
      <Provider id={id as string}>
        <EntityLayoutContent useEntityContext={useEntityContext}>
          {children}
        </EntityLayoutContent>
      </Provider>
    );
  }

  function EntityLayoutContent({ children, useEntityContext }: { children: React.ReactNode; useEntityContext: () => any }) {
    const contextValue = useEntityContext();
    const entity = contextValue[finalEntityName!.toLowerCase()];
    const isLoading = contextValue.isLoading;

    if (isLoading) {
      return <LoadingSkeleton />;
    }

    if (!entity) {
      notFound();
    }

    return <>{children}</>;
  }

  return {
    Layout: EntityLayout,
    useContext: useEntityContext,
  };
}
