"use client"

import { Badge } from "@/components/ui/badge"
import {
  formatPermissionLabel,
  groupPermissionsByCategoryWithModules,
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

  const categories = groupPermissionsByCategoryWithModules(list)

  return (
    <div className="space-y-5">
      {categories.map((categoryGroup) => (
        <div key={categoryGroup.category} className="space-y-3">
          <p className="font-medium text-orange-600">{categoryGroup.category}</p>
          {categoryGroup.modules.map((moduleGroup) => (
            <div key={moduleGroup.module} className="space-y-2">
              <p className="text-sm font-medium text-[#444444]">
                {formatPermissionLabel(moduleGroup.module)}
              </p>
              <div className="flex flex-wrap gap-2">
                {moduleGroup.permissions.map((permission) => (
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
      ))}
    </div>
  )
}
