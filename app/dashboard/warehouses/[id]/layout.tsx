"use client";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { notFound } from "next/navigation";
import { use } from "react";
import { WarehouseProvider, useWarehouseContext } from "./warehouse-context";

function WarehouseLayoutContent({ children }: { children: React.ReactNode }) {
  const { warehouse, isLoading } = useWarehouseContext();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!warehouse) {
    notFound();
  }

  return <>{children}</>;
}

export default function WarehouseLayout({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  return (
    <WarehouseProvider warehouseId={id}>
      <WarehouseLayoutContent>
        {children}
      </WarehouseLayoutContent>
    </WarehouseProvider>
  );
}
