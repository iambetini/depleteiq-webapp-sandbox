"use client";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { notFound } from "next/navigation";
import { use } from "react";
import { RoleProvider, useRoleContext } from "./role-context";

function RoleLayoutContent({ children }: { children: React.ReactNode }) {
  const { role, isLoading } = useRoleContext();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!role) {
    notFound();
  }

  return <>{children}</>;
}

export default function RoleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  return (
    <RoleProvider roleId={id}>
      <RoleLayoutContent>
        {children}
      </RoleLayoutContent>
    </RoleProvider>
  );
}
