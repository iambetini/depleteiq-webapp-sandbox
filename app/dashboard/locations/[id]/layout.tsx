"use client";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { notFound } from "next/navigation";
import { use } from "react";
import { LocationProvider, useLocationContext } from "./location-context";

function LocationLayoutContent({ children }: { children: React.ReactNode }) {
  const { location, isLoading } = useLocationContext();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!location) {
    notFound();
  }

  return <>{children}</>;
}

export default function LocationLayout({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  return (
    <LocationProvider locationId={id}>
      <LocationLayoutContent>
        {children}
      </LocationLayoutContent>
    </LocationProvider>
  );
}
