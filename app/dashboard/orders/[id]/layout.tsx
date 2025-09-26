"use client";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { notFound } from "next/navigation";
import { use } from "react";
import { OrderProvider, useOrderContext } from "./order-context";

function OrderLayoutContent({ children }: { children: React.ReactNode }) {
  const { order, isLoading } = useOrderContext();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!order) {
    notFound();
  }

  return <>{children}</>;
}

export default function OrderLayout({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  return (
    <OrderProvider orderId={id}>
      <OrderLayoutContent>
        {children}
      </OrderLayoutContent>
    </OrderProvider>
  );
}
