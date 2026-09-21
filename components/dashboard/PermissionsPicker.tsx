"use client"

import { Checkbox } from "@/components/ui/checkbox"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import {
  formatPermissionLabel,
  groupPermissionsByCategoryWithModules,
  isAllAccessPermission,
} from "@/lib/permissions-catalog"
import { cn } from "@/lib/utils"
import type { Permission } from "@/types/permission"
import { Search, Shield } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

interface PermissionsPickerProps {
  permissions: Permission[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
  isLoading?: boolean
  className?: string
}

export default function PermissionsPicker({
  permissions,
  selectedIds,
  onChange,
  isLoading = false,
  className,
}: PermissionsPickerProps) {
  const [search, setSearch] = useState("")
  const [openCategories, setOpenCategories] = useState<string[]>([])

  const allAccess = useMemo(
    () => permissions.find((permission) => isAllAccessPermission(permission)),
    [permissions],
  )
  const hasAllAccess = Boolean(
    allAccess && selectedIds.includes(allAccess.uuid),
  )

  const filteredPermissions = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return permissions

    return permissions.filter((permission) => {
      const haystack = [permission.name, permission.module, permission.category]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      return haystack.includes(query)
    })
  }, [permissions, search])

  const categories = useMemo(
    () => groupPermissionsByCategoryWithModules(filteredPermissions),
    [filteredPermissions],
  )

  useEffect(() => {
    if (!search.trim()) return
    setOpenCategories(categories.map((group) => group.category))
  }, [search, categories])

  const togglePermission = (uuid: string, checked: boolean) => {
    if (checked) {
      if (selectedIds.includes(uuid)) return
      onChange([...selectedIds, uuid])
      return
    }
    onChange(selectedIds.filter((id) => id !== uuid))
  }

  const panelClassName = cn(
    "flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-muted",
    className,
  )

  if (isLoading) {
    return (
      <div className={cn(panelClassName, "px-3 py-3 text-sm text-[#ababab]")}>
        Loading permissions...
      </div>
    )
  }

  return (
    <div className={cn("flex h-full min-h-0 flex-1 flex-col gap-3 overflow-hidden", className)}>
      <div className="relative shrink-0">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#ababab]" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search permissions..."
          className="pl-9"
        />
      </div>

      {permissions.length === 0 ? (
        <div className="flex min-h-0 flex-1 items-start rounded-md border border-muted px-3 py-3 text-sm text-[#ababab]">
          No permissions were returned by the API.
        </div>
      ) : categories.length === 0 ? (
        <div className="flex min-h-0 flex-1 items-start rounded-md border border-muted px-3 py-3 text-sm text-[#ababab]">
          No permissions match “{search.trim()}”.
        </div>
      ) : (
        <Accordion
          type="multiple"
          value={openCategories}
          onValueChange={setOpenCategories}
          className="min-h-0 flex-1 overflow-y-auto rounded-md border border-muted"
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
                <AccordionTrigger className="px-3 py-2.5 hover:no-underline">
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
                <AccordionContent className="px-3 pb-3 pt-0">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((permission) => {
                      const checked = selectedIds.includes(permission.uuid)
                      const isAllAccess = isAllAccessPermission(permission)
                      const disabled = hasAllAccess && !isAllAccess

                      return (
                        <label
                          key={permission.uuid}
                          className={cn(
                            "flex min-h-[3.25rem] cursor-pointer items-start gap-2 rounded-md border border-[#e6e6e6] bg-white px-2.5 py-2",
                            isAllAccess &&
                              "col-span-full border-[#ff6600]/30 bg-[#ff6600]/5",
                            disabled && "cursor-not-allowed opacity-70",
                          )}
                        >
                          <Checkbox
                            checked={checked || (hasAllAccess && !isAllAccess)}
                            disabled={disabled}
                            onCheckedChange={(value) =>
                              togglePermission(permission.uuid, value === true)
                            }
                            className="mt-0.5"
                          />
                          <Shield className="mt-0.5 h-4 w-4 shrink-0 text-[#6b93f0]" />
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
      )}
    </div>
  )
}
