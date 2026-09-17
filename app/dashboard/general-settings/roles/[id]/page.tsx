"use client";
import PermissionsDisplay from "@/components/dashboard/PermissionsDisplay";
import ViewPageHeader from "@/components/dashboard/ViewPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useContext } from "./layout";
import { Calendar, FileText, Laptop, Smartphone } from "lucide-react";
import type { Permission } from "@/types/permission";

export default function RoleDetailPage() {
  const { role } = useContext()

  if (!role) { return null; }

  return (
    <div>
      <ViewPageHeader
        title={role.name}
        description="Role Details"
        showEditButton={true}
        editHref={`/dashboard/general-settings/roles/${role.uuid}/edit`}
        showDeleteButton={true}
        deleteOptions={{
          storeName: "roles",
          uuid: role.uuid,
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-[#444444]">Role Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-[#ababab]" />
              <div>
                <p className="text-sm text-[#ababab]">Description</p>
                <p className="font-medium text-[#444444]">{role.description}</p>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[#ababab]">Access Type</span>
              <div className="flex items-center space-x-2">
                {role.access_type === "web" ? (
                  <>
                    <Laptop className="h-4 w-4 text-[#444444]" />
                    <span className="font-medium text-[#444444]">Web</span>
                  </>
                ) : role.access_type === "mobile" ? (
                  <>
                    <Smartphone className="h-4 w-4 text-[#444444]" />
                    <span className="font-medium text-[#444444]">Mobile</span>
                  </>
                ) : (
                  <span className="font-medium text-[#444444]">{role.access_type || "N/A"}</span>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-[#ababab]" />
              <div>
                <p className="text-sm text-[#ababab]">Created</p>
                <p className="font-medium text-[#444444]">{role.created_at}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-[#444444]">Permissions</CardTitle>
          </CardHeader>
          <CardContent>
            <PermissionsDisplay
              permissions={role.permissions as Permission[] | string[] | undefined}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
