import { formatLabelToTitleCase } from "@/lib/label-formatters";
import type { Permission, PermissionsCatalogItems } from "@/types/permission";

export interface PermissionModuleGroup {
  module: string;
  categories: string[];
  permissions: Permission[];
}

const ALL_ACCESS_MODULE = "all access";

export function isAllAccessPermission(permission: Pick<Permission, "name">) {
  return permission.name?.trim().toLowerCase() === ALL_ACCESS_MODULE;
}

export function formatPermissionLabel(value?: string | null) {
  return formatLabelToTitleCase(value || "");
}

function asPermission(value: unknown, fallbackModule?: string): Permission | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Permission;
  const uuid = item.uuid || (item as { id?: string }).id;
  const name = item.name;
  if (!uuid || !name) return null;

  return {
    ...item,
    uuid,
    name,
    module: item.module || fallbackModule || "general",
    category: item.category || "General",
  };
}

function flattenCatalogItems(items: PermissionsCatalogItems | unknown): Permission[] {
  if (!items) return [];

  if (Array.isArray(items)) {
    return items.flatMap((entry) => {
      if (Array.isArray(entry)) {
        return entry
          .map((permission) => asPermission(permission))
          .filter((permission): permission is Permission => Boolean(permission));
      }
      const permission = asPermission(entry);
      return permission ? [permission] : [];
    });
  }

  if (typeof items === "object") {
    return Object.entries(items as Record<string, unknown>).flatMap(
      ([module, group]) => {
        if (!Array.isArray(group)) return [];
        return group
          .map((permission) => asPermission(permission, module))
          .filter((permission): permission is Permission => Boolean(permission));
      },
    );
  }

  return [];
}

export function normalizePermissionsCatalog(
  items: PermissionsCatalogItems | unknown,
): Permission[] {
  const seen = new Set<string>();
  return flattenCatalogItems(items).filter((permission) => {
    if (seen.has(permission.uuid)) return false;
    seen.add(permission.uuid);
    return true;
  });
}

export function groupPermissionsByModule(
  permissions: Permission[],
): PermissionModuleGroup[] {
  const grouped = new Map<string, Permission[]>();

  for (const permission of permissions) {
    const module = permission.module || "general";
    const list = grouped.get(module) ?? [];
    list.push(permission);
    grouped.set(module, list);
  }

  return Array.from(grouped.entries())
    .map(([module, modulePermissions]) => {
      const sorted = [...modulePermissions].sort((a, b) =>
        a.name.localeCompare(b.name),
      );
      const categories = Array.from(
        new Set(
          sorted
            .map((permission) => permission.category)
            .filter((category): category is string => Boolean(category)),
        ),
      );

      return {
        module,
        categories,
        permissions: sorted,
      };
    })
    .sort((a, b) => {
      if (a.module === ALL_ACCESS_MODULE) return -1;
      if (b.module === ALL_ACCESS_MODULE) return 1;
      return a.module.localeCompare(b.module);
    });
}

export function groupPermissionsByCategory(permissions: Permission[]) {
  const grouped = new Map<string, Permission[]>();

  for (const permission of permissions) {
    const category = permission.category || "General";
    const list = grouped.get(category) ?? [];
    list.push(permission);
    grouped.set(category, list);
  }

  return Array.from(grouped.entries()).sort(([a], [b]) => a.localeCompare(b));
}
