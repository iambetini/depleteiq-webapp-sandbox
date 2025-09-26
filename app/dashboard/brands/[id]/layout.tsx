"use client";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { notFound } from "next/navigation";
import { use } from "react";
import { BrandProvider, useBrandContext } from "./brand-context";

function BrandLayoutContent({ children }: { children: React.ReactNode }) {
  const { brand, isLoading } = useBrandContext();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!brand) {
    notFound();
  }

  return <>{children}</>;
}

export default function BrandLayout({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  return (
    <BrandProvider brandId={id}>
      <BrandLayoutContent>
        {children}
      </BrandLayoutContent>
    </BrandProvider>
  );
}
