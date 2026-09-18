"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  formatPermissionLabel,
  groupPermissionsByCategoryWithModules,
  isAllAccessPermission,
} from "@/lib/permissions-catalog"
import { cn } from "@/lib/utils"
import type { Permission } from "@/types/permission"
import { useEffect, useMemo, useState } from "react"

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
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState<string>("")

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
      const haystack = [
        permission.name,
        permission.module,
        permission.category,
        permission.description,
      ]
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
    if (categories.length === 0) {
      setActiveCategory("")
      return
    }
    if (!categories.some((group) => group.category === activeCategory)) {
      setActiveCategory(categories[0].category)
    }
  }, [categories, activeCategory])

  const activeGroup = categories.find(
    (group) => group.category === activeCategory,
  )

  const selectedCount = selectedIds.length
  const totalCount = permissions.length

  const togglePermission = (uuid: string, checked: boolean) => {
    if (checked) {
      if (selectedIds.includes(uuid)) return
      onChange([...selectedIds, uuid])
      return
    }
    onChange(selectedIds.filter((id) => id !== uuid))
  }

  const toggleGroup = (groupPermissions: Permission[], selectAll: boolean) => {
    const ids = groupPermissions.map((permission) => permission.uuid)
    if (selectAll) {
      onChange(Array.from(new Set([...selectedIds, ...ids])))
      return
    }
    onChange(selectedIds.filter((id) => !ids.includes(id)))
  }

  if (isLoading) {
    return (
      <div className="rounded-md border border-muted p-4 text-sm text-[#ababab]">
        Loading permissions...
      </div>
    )
  }

  if (permissions.length === 0) {
    return (
      <div className="rounded-md border border-muted p-4 text-sm text-[#ababab]">
        No permissions were returned by the API.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search permissions, modules, or categories"
          className="sm:max-w-sm"
        />
        <p className="text-sm text-[#ababab]">
          {selectedCount} of {totalCount} selected
        </p>
      </div>

      <div className="border-b border-gray-200">
        <nav
          className="-mb-px flex flex-wrap gap-x-6 gap-y-1 overflow-x-auto"
          aria-label="Permission categories"
        >
          {groupPermissionsByCategoryWithModules(permissions).map((group) => {
            const isActive = group.category === activeCategory
            const selectedInCategory = group.permissions.filter((permission) =>
              selectedIds.includes(permission.uuid),
            ).length

            return (
              <button
                key={group.category}
                type="button"
                onClick={() => {
                  setSearch("")
                  setActiveCategory(group.category)
                }}
                className={cn(
                  "whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200",
                  isActive
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {group.category}
                <span className={cn("ml-1.5 text-xs", isActive ? "text-orange-500" : "text-[#ababab]")}>
                  {selectedInCategory}/{group.permissions.length}
                </span>
              </button>
            )
          })}
        </nav>
      </div>

      {hasAllAccess && activeGroup && allAccess?.category !== activeGroup.category && (
        <p className="rounded-md border border-[#ff6600]/30 bg-[#ff6600]/5 px-3 py-2 text-sm text-[#444444]">
          All Access is selected under General. Other permissions are included.
        </p>
      )}

      {!activeGroup ? (
        <div className="rounded-md border border-muted p-4 text-sm text-[#ababab]">
          {search
            ? `No permissions match “${search}” in this category.`
            : "Select a category to view permissions."}
        </div>
      ) : (
        <div className="space-y-5">
          {activeGroup.modules.map((moduleGroup) => {
            const modulePermissions = moduleGroup.permissions
            const selectedInModule = modulePermissions.filter((permission) =>
              selectedIds.includes(permission.uuid),
            ).length
            const allSelected =
              modulePermissions.length > 0 &&
              selectedInModule === modulePermissions.length
            const isAllAccessModule = modulePermissions.every(isAllAccessPermission)

            return (
              <div key={moduleGroup.module} className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="font-medium text-[#444444]">
                    {formatPermissionLabel(moduleGroup.module)}
                  </h4>
                  {!isAllAccessModule && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={hasAllAccess}
                      onClick={() => toggleGroup(modulePermissions, !allSelected)}
                    >
                      {allSelected ? "Clear" : "Select all"}
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {modulePermissions.map((permission) => {
                    const checked = selectedIds.includes(permission.uuid)
                    const isAllAccess = isAllAccessPermission(permission)
                    const disabled = hasAllAccess && !isAllAccess

                    return (
                      <label
                        key={permission.uuid}
                        className={cn(
                          "flex items-start gap-2 rounded px-1 py-1",
                          isAllAccess && "col-span-full rounded-md border border-[#ff6600]/30 bg-[#ff6600]/5 p-3",
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
                        <span>
                          <span className="block text-sm text-[#444444]">
                            {formatPermissionLabel(permission.name)}
                          </span>
                          {isAllAccess && (
                            <span className="block text-sm text-[#ababab]">
                              Grants every permission. Other checkboxes are
                              disabled while this is selected.
                            </span>
                          )}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
