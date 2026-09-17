"use client"

import { Badge } from "@/components/ui/badge"
import {
  formatPermissionLabel,
  groupPermissionsByCategory,
  groupPermissionsByModule,
} from "@/lib/permissions-catalog"
import type { Permission } from "@/types/permission"

interface PermissionsDisplayProps {
  permissions?: Permission[] | string[] | null
}

function toPermissionList(
  permissions?: Permission[] | string[] | null,
): Permission[] {
  if (!permissions?.length) return []

  return permissions.map((permission, index) => {
    if (typeof permission === "string") {
      return {
        uuid: `${permission}-${index}`,
        name: permission,
        module: "Assigned",
        category: "General",
      }
    }
    return {
      ...permission,
      uuid: permission.uuid || `${permission.name}-${index}`,
      name: permission.name,
      module: permission.module || "Assigned",
      category: permission.category || "General",
    }
  })
}

export default function PermissionsDisplay({
  permissions,
}: PermissionsDisplayProps) {
  const list = toPermissionList(permissions)

  if (list.length === 0) {
    return <p className="text-sm text-[#ababab]">No permissions assigned</p>
  }

  const groups = groupPermissionsByModule(list)

  return (
    <div className="space-y-4">
      {groups.map((group) => {
        const categoryGroups = groupPermissionsByCategory(group.permissions)

        return (
          <div key={group.module} className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium text-[#444444]">
                {formatPermissionLabel(group.module)}
              </p>
              {group.categories.map((category) => (
                <Badge key={category} variant="secondary" className="font-normal">
                  {category}
                </Badge>
              ))}
            </div>
            {categoryGroups.map(([category, categoryPermissions]) => (
              <div key={category} className="space-y-2">
                {categoryGroups.length > 1 && (
                  <p className="text-xs font-medium uppercase tracking-wide text-[#ababab]">
                    {category}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  {categoryPermissions.map((permission) => (
                    <Badge
                      key={permission.uuid}
                      variant="outline"
                      className="font-normal"
                    >
                      {formatPermissionLabel(permission.name)}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}
