"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  formatPermissionLabel,
  groupPermissionsByCategory,
  groupPermissionsByModule,
  isAllAccessPermission,
} from "@/lib/permissions-catalog"
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
  const [search, setSearch] = useState("")

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

  const showAllAccess = Boolean(
    allAccess &&
      filteredPermissions.some((permission) => permission.uuid === allAccess.uuid),
  )

  const groups = useMemo(
    () =>
      groupPermissionsByModule(
        filteredPermissions.filter(
          (permission) => !isAllAccessPermission(permission),
        ),
      ),
    [filteredPermissions],
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

      {showAllAccess && allAccess && (
        <label className="flex items-start gap-3 rounded-md border border-[#ff6600]/30 bg-[#ff6600]/5 p-3">
          <Checkbox
            checked={hasAllAccess}
            onCheckedChange={(checked) =>
              togglePermission(allAccess.uuid, checked === true)
            }
            className="mt-0.5"
          />
          <span>
            <span className="block font-medium text-[#444444]">
              {formatPermissionLabel(allAccess.name)}
            </span>
            <span className="block text-sm text-[#ababab]">
              Grants every permission. Other checkboxes are disabled while this
              is selected.
            </span>
          </span>
        </label>
      )}

      {groups.length === 0 && !showAllAccess ? (
        <div className="rounded-md border border-muted p-4 text-sm text-[#ababab]">
          No permissions match “{search}”.
        </div>
      ) : (
        <Accordion
          type="multiple"
          className="rounded-md border border-muted px-3"
        >
          {groups.map((group) => {
            const selectedInGroup = group.permissions.filter((permission) =>
              selectedIds.includes(permission.uuid),
            ).length
            const allSelected =
              group.permissions.length > 0 &&
              selectedInGroup === group.permissions.length
            const categoryGroups = groupPermissionsByCategory(group.permissions)

            return (
              <AccordionItem key={group.module} value={group.module}>
                <div className="flex items-center gap-2">
                  <div className="min-w-0 flex-1">
                    <AccordionTrigger className="hover:no-underline">
                      <span className="flex min-w-0 flex-1 flex-wrap items-center gap-2 pr-3 text-left">
                        <span className="font-medium text-[#444444]">
                          {formatPermissionLabel(group.module)}
                        </span>
                        {group.categories.map((category) => (
                          <Badge
                            key={category}
                            variant="secondary"
                            className="font-normal"
                          >
                            {category}
                          </Badge>
                        ))}
                        <span className="text-xs text-[#ababab]">
                          {selectedInGroup}/{group.permissions.length}
                        </span>
                      </span>
                    </AccordionTrigger>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    disabled={hasAllAccess}
                    onClick={() =>
                      toggleGroup(group.permissions, !allSelected)
                    }
                  >
                    {allSelected ? "Clear" : "Select all"}
                  </Button>
                </div>
                <AccordionContent>
                  <div className="space-y-4">
                    {categoryGroups.map(([category, categoryPermissions]) => (
                      <div key={category} className="space-y-2">
                        {categoryGroups.length > 1 && (
                          <p className="text-xs font-medium uppercase tracking-wide text-[#ababab]">
                            {category}
                          </p>
                        )}
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {categoryPermissions.map((permission) => {
                            const checked = selectedIds.includes(
                              permission.uuid,
                            )
                            const disabled =
                              hasAllAccess &&
                              !isAllAccessPermission(permission)

                            return (
                              <label
                                key={permission.uuid}
                                className="flex items-start gap-2 rounded px-1 py-1"
                              >
                                <Checkbox
                                  checked={checked || hasAllAccess}
                                  disabled={disabled}
                                  onCheckedChange={(value) =>
                                    togglePermission(
                                      permission.uuid,
                                      value === true,
                                    )
                                  }
                                  className="mt-0.5"
                                />
                                <span className="text-sm text-[#444444]">
                                  {formatPermissionLabel(permission.name)}
                                </span>
                              </label>
                            )
                          })}
                        </div>
                      </div>
                    ))}
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
