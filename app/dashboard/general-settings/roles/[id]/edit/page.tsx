"use client"

import RoleForm, { RoleFormValues } from "@/components/dashboard/RoleForm";
import ViewPageHeader from "@/components/dashboard/ViewPageHeader";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { useRouter } from "next/navigation";
import { useContext } from "../layout";

export default function EditRolePage() {
  const router = useRouter();
  const { role, isLoading } = useContext();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!role) { return null; }

  const initialValues: RoleFormValues = {
    name: role?.name || "",
    description: role?.description || "",
    access_type: role?.access_type || "web",
    permissions: role?.permissions?.map((p: any) => p.uuid || p.id) || [],
  };

  return (
    <div className="flex min-h-0 flex-col overflow-hidden lg:h-[calc(100dvh-16.5rem)]">
      <ViewPageHeader
        title="Edit Role"
        description="Update role information"
      />
      <div className="min-h-0 flex-1">
        <RoleForm
          initialValues={initialValues}
          isEdit={true}
          roleId={role.uuid}
          title="Edit Role"
          description="Update role information"
          submitButtonText="Update Role"
          onSuccess={() => router.push(`/dashboard/general-settings/roles/${role.uuid}`)}
        />
      </div>
    </div>
  );
}
