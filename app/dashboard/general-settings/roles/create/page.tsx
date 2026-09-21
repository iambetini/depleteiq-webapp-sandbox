"use client";

import RoleForm, { RoleFormValues } from "@/components/dashboard/RoleForm";
import ViewPageHeader from "@/components/dashboard/ViewPageHeader";
import { useRouter } from "next/navigation";

export default function CreateRolePage() {
  const router = useRouter()

  const initialValues: RoleFormValues = {
    name: "",
    description: "",
    access_type: "web",
    permissions: [],
  }

  return (
    <div className="flex min-h-0 flex-col overflow-hidden lg:h-[calc(100dvh-16.5rem)]">
      <ViewPageHeader title="Create Role" />
      <div className="min-h-0 flex-1">
        <RoleForm
          initialValues={initialValues}
          isEdit={false}
          onSuccess={() => router.push("/dashboard/general-settings/roles")}
          title="Role Information"
          description="Enter the details for the role"
          submitButtonText="Create Role"
        />
      </div>
    </div>
  )
}
