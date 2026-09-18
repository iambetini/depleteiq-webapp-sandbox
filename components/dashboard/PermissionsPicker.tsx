"use client"

import { Checkbox } from "@/components/ui/checkbox"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  formatPermissionLabel,
  groupPermissionsByCategoryWithModules,
  isAllAccessPermission,
} from "@/lib/permissions-catalog"
import { cn } from "@/lib/utils"
import type { Permission } from "@/types/permission"
import { useMemo, useState } from "react"

interface PermissionsPickerProps {
  permissions: Permission[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
  isLoading?: boolean
}

export default function PermissionsPicker({
  permissions,
  selectedIds,
  onChange,
  isLoading = false,
}: PermissionsPickerProps) {
  const [openCategories, setOpenCategories] = useState<string[]>([])

  const allAccess = useMemo(
    () => permissions.find((permission) => isAllAccessPermission(permission)),
    [permissions],
  )
  const hasAllAccess = Boolean(
    allAccess && selectedIds.includes(allAccess.uuid),
  )

  const categories = useMemo(
    () => groupPermissionsByCategoryWithModules(permissions),
    [permissions],
  )

  const togglePermission = (uuid: string, checked: boolean) => {
    if (checked) {
      if (selectedIds.includes(uuid)) return
      onChange([...selectedIds, uuid])
      return
    }
    onChange(selectedIds.filter((id) => id !== uuid))
  }

  if (isLoading) {
    return (
      <div className="rounded-md border border-muted px-3 py-2 text-sm text-[#ababab]">
        Loading permissions...
      </div>
    )
  }

  if (permissions.length === 0) {
    return (
      <div className="rounded-md border border-muted px-3 py-2 text-sm text-[#ababab]">
        No permissions were returned by the API.
      </div>
    )
  }

  return (
    <Accordion
      type="multiple"
      value={openCategories}
      onValueChange={setOpenCategories}
      className="rounded-md border border-muted"
    >
      {categories.map((group, index) => {
        const items = [...group.permissions].sort((a, b) => {
          const aAll = isAllAccessPermission(a)
          const bAll = isAllAccessPermission(b)
          if (aAll && !bAll) return -1
          if (!aAll && bAll) return 1
          return a.name.localeCompare(b.name)
        })
        const count = items.length

        return (
          <AccordionItem
            key={group.category}
            value={group.category}
            className={cn(index === categories.length - 1 && "border-b-0")}
          >
            <AccordionTrigger className="px-3 py-2 hover:no-underline">
              <span className="flex min-w-0 flex-1 items-center justify-between gap-3 pr-2 text-left">
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-[#333333]">
                    {group.category}
                  </span>
                  <span className="block text-xs text-[#9a9a9a]">
                    {count} {count === 1 ? "permission" : "permissions"}
                  </span>
                </span>
                <span className="flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-[#f3f3f3] px-1.5 text-xs font-semibold text-[#666666]">
                  {count}
                </span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-2 pt-0">
              <div className="grid grid-cols-1 gap-x-3 gap-y-0.5 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((permission) => {
                  const checked = selectedIds.includes(permission.uuid)
                  const isAllAccess = isAllAccessPermission(permission)
                  const disabled = hasAllAccess && !isAllAccess

                  return (
                    <label
                      key={permission.uuid}
                      className={cn(
                        "flex items-center gap-2 rounded px-0.5 py-0.5",
                        isAllAccess &&
                          "col-span-full border border-[#ff6600]/30 bg-[#ff6600]/5 px-2 py-1.5",
                      )}
                    >
                      <Checkbox
                        checked={checked || (hasAllAccess && !isAllAccess)}
                        disabled={disabled}
                        onCheckedChange={(value) =>
                          togglePermission(permission.uuid, value === true)
                        }
                      />
                      <span className="text-sm leading-5 text-[#444444]">
                        {formatPermissionLabel(permission.name)}
                      </span>
                    </label>
                  )
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        )
      })}
    </Accordion>
  )
}
