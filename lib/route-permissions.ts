export interface RoutePermission {
  pattern: RegExp;
  href: string;
  permissions: string[]; // Array of permission names required to access this route
}

export const routePermissions: RoutePermission[] = [
  // Audit Logs
  {
    href: "/dashboard/audit-logs",
    pattern: /^\/dashboard\/audit-logs$/,
    permissions: ["view audit logs"],
  },
  {
    href: "/dashboard/audit-logs/system",
    pattern: /^\/dashboard\/audit-logs\/system$/,
    permissions: ["view audit logs"],
  },
  {
    href: "/dashboard/audit-logs/users",
    pattern: /^\/dashboard\/audit-logs\/users$/,
    permissions: ["view audit logs"],
  },

  // Branches
  {
    href: "/dashboard/branches",
    pattern: /^\/dashboard\/branches$/,
    permissions: ["view distributors"],
  },
  {
    href: "/dashboard/branches/create",
    pattern: /^\/dashboard\/branches\/create$/,
    permissions: ["create distributors"],
  },
  {
    href: "/dashboard/branches/[id]",
    pattern: /^\/dashboard\/branches\/\d+$/,
    permissions: ["view distributors"],
  },
  {
    href: "/dashboard/branches/[id]/edit",
    pattern: /^\/dashboard\/branches\/\d+\/edit$/,
    permissions: ["edit distributors"],
  },

  // Brands
  {
    href: "/dashboard/brands",
    pattern: /^\/dashboard\/brands$/,
    permissions: ["view brands"],
  },
  {
    href: "/dashboard/brands/create",
    pattern: /^\/dashboard\/brands\/create$/,
    permissions: ["create brands"],
  },
  {
    href: "/dashboard/brands/[id]",
    pattern: /^\/dashboard\/brands\/\d+$/,
    permissions: ["view brands"],
  },
  {
    href: "/dashboard/brands/[id]/edit",
    pattern: /^\/dashboard\/brands\/\d+\/edit$/,
    permissions: ["edit brands"],
  },

  // Dashboard
  {
    href: "/dashboard",
    pattern: /^\/dashboard$/,
    permissions: ["view dashboard"],
  },
  {
    href: "/dashboard/no-permissions",
    pattern: /^\/dashboard\/no-permissions$/,
    permissions: [],
  },

  // Deliveries
  {
    href: "/dashboard/deliveries",
    pattern: /^\/dashboard\/deliveries$/,
    permissions: ["view deliveries"],
  },
  {
    href: "/dashboard/deliveries/create",
    pattern: /^\/dashboard\/deliveries\/create$/,
    permissions: ["create deliveries"],
  },
  {
    href: "/dashboard/deliveries/[id]",
    pattern: /^\/dashboard\/deliveries\/\d+$/,
    permissions: ["view deliveries"],
  },
  {
    href: "/dashboard/deliveries/[id]/edit",
    pattern: /^\/dashboard\/deliveries\/\d+\/edit$/,
    permissions: ["edit deliveries"],
  },

  // Distributors
  {
    href: "/dashboard/distributors",
    pattern: /^\/dashboard\/distributors$/,
    permissions: ["view distributors"],
  },
  {
    href: "/dashboard/distributors/create",
    pattern: /^\/dashboard\/distributors\/create$/,
    permissions: ["create distributors"],
  },
  {
    href: "/dashboard/distributors/[id]",
    pattern: /^\/dashboard\/distributors\/\d+$/,
    permissions: ["view distributors"],
  },
  {
    href: "/dashboard/distributors/[id]/edit",
    pattern: /^\/dashboard\/distributors\/\d+\/edit$/,
    permissions: ["edit distributors"],
  },

  // IME/VSS
  {
    href: "/dashboard/ime-vss",
    pattern: /^\/dashboard\/ime-vss$/,
    permissions: ["view distributors"],
  },
  {
    href: "/dashboard/ime-vss/create",
    pattern: /^\/dashboard\/ime-vss\/create$/,
    permissions: ["create distributors"],
  },
  {
    href: "/dashboard/ime-vss/[id]",
    pattern: /^\/dashboard\/ime-vss\/\d+$/,
    permissions: ["view distributors"],
  },
  {
    href: "/dashboard/ime-vss/[id]/edit",
    pattern: /^\/dashboard\/ime-vss\/\d+\/edit$/,
    permissions: ["edit distributors"],
  },

  // Locations
  {
    href: "/dashboard/locations",
    pattern: /^\/dashboard\/locations$/,
    permissions: ["view locations"],
  },
  {
    href: "/dashboard/locations/create",
    pattern: /^\/dashboard\/locations\/create$/,
    permissions: ["create locations"],
  },
  {
    href: "/dashboard/locations/[id]",
    pattern: /^\/dashboard\/locations\/\d+$/,
    permissions: ["view locations"],
  },
  {
    href: "/dashboard/locations/[id]/edit",
    pattern: /^\/dashboard\/locations\/\d+\/edit$/,
    permissions: ["edit locations"],
  },

  // Markets
  {
    href: "/dashboard/markets",
    pattern: /^\/dashboard\/markets$/,
    permissions: ["view markets"],
  },
  {
    href: "/dashboard/markets/create",
    pattern: /^\/dashboard\/markets\/create$/,
    permissions: ["create markets"],
  },
  {
    href: "/dashboard/markets/[id]",
    pattern: /^\/dashboard\/markets\/\d+$/,
    permissions: ["view markets"],
  },
  {
    href: "/dashboard/markets/[id]/edit",
    pattern: /^\/dashboard\/markets\/\d+\/edit$/,
    permissions: ["edit markets"],
  },

  // Orders
  {
    href: "/dashboard/orders",
    pattern: /^\/dashboard\/orders$/,
    permissions: ["view orders"],
  },
  {
    href: "/dashboard/orders/create",
    pattern: /^\/dashboard\/orders\/create$/,
    permissions: ["create orders"],
  },
  {
    href: "/dashboard/orders/[id]",
    pattern: /^\/dashboard\/orders\/\d+$/,
    permissions: ["view orders"],
  },
  {
    href: "/dashboard/orders/[id]/edit",
    pattern: /^\/dashboard\/orders\/\d+\/edit$/,
    permissions: ["edit orders"],
  },

  // Reports
  {
    href: "/dashboard/reports",
    pattern: /^\/dashboard\/reports$/,
    permissions: ["view reports"],
  },
  {
    href: "/dashboard/reports/inventory",
    pattern: /^\/dashboard\/reports\/inventory$/,
    permissions: ["view reports"],
  },
  {
    href: "/dashboard/reports/performance",
    pattern: /^\/dashboard\/reports\/performance$/,
    permissions: ["view reports"],
  },
  {
    href: "/dashboard/reports/sales",
    pattern: /^\/dashboard\/reports\/sales$/,
    permissions: ["view reports"],
  },

  // Roles
  {
    href: "/dashboard/roles",
    pattern: /^\/dashboard\/roles$/,
    permissions: ["view roles"],
  },
  {
    href: "/dashboard/roles/create",
    pattern: /^\/dashboard\/roles\/create$/,
    permissions: ["create roles"],
  },
  {
    href: "/dashboard/roles/[id]",
    pattern: /^\/dashboard\/roles\/\d+$/,
    permissions: ["view roles"],
  },
  {
    href: "/dashboard/roles/[id]/edit",
    pattern: /^\/dashboard\/roles\/\d+\/edit$/,
    permissions: ["edit roles"],
  },

  // Settings
  {
    href: "/dashboard/settings",
    pattern: /^\/dashboard\/settings$/,
    permissions: ["view dashboard"],
  },
  {
    href: "/dashboard/settings/preferences",
    pattern: /^\/dashboard\/settings\/preferences$/,
    permissions: ["view dashboard"],
  },
  {
    href: "/dashboard/settings/profile",
    pattern: /^\/dashboard\/settings\/profile$/,
    permissions: ["view dashboard"],
  },
  {
    href: "/dashboard/settings/system",
    pattern: /^\/dashboard\/settings\/system$/,
    permissions: ["view dashboard"],
  },

  // Targets
  {
    href: "/dashboard/target",
    pattern: /^\/dashboard\/target$/,
    permissions: ["view targets"],
  },
  {
    href: "/dashboard/target/[id]",
    pattern: /^\/dashboard\/target\/\d+$/,
    permissions: ["view targets"],
  },
  {
    href: "/dashboard/target/[id]/manage",
    pattern: /^\/dashboard\/target\/\d+\/manage$/,
    permissions: ["edit targets"],
  },

  // Users
  {
    href: "/dashboard/users",
    pattern: /^\/dashboard\/users$/,
    permissions: ["view users"],
  },
  {
    href: "/dashboard/users/create",
    pattern: /^\/dashboard\/users\/create$/,
    permissions: ["create users"],
  },
  {
    href: "/dashboard/users/[id]",
    pattern: /^\/dashboard\/users\/\d+$/,
    permissions: ["view users"],
  },
  {
    href: "/dashboard/users/[id]/edit",
    pattern: /^\/dashboard\/users\/\d+\/edit$/,
    permissions: ["edit users"],
  },

  // Vehicles
  {
    href: "/dashboard/vehicles",
    pattern: /^\/dashboard\/vehicles$/,
    permissions: ["view vehicles"],
  },
  {
    href: "/dashboard/vehicles/create",
    pattern: /^\/dashboard\/vehicles\/create$/,
    permissions: ["create vehicles"],
  },
  {
    href: "/dashboard/vehicles/[id]",
    pattern: /^\/dashboard\/vehicles\/\d+$/,
    permissions: ["view vehicles"],
  },
  {
    href: "/dashboard/vehicles/[id]/edit",
    pattern: /^\/dashboard\/vehicles\/\d+\/edit$/,
    permissions: ["edit vehicles"],
  },

  // Warehouses
  {
    href: "/dashboard/warehouses",
    pattern: /^\/dashboard\/warehouses$/,
    permissions: ["view warehouses"],
  },
  {
    href: "/dashboard/warehouses/create",
    pattern: /^\/dashboard\/warehouses\/create$/,
    permissions: ["create warehouses"],
  },
  {
    href: "/dashboard/warehouses/[id]",
    pattern: /^\/dashboard\/warehouses\/\d+$/,
    permissions: ["view warehouses"],
  },
  {
    href: "/dashboard/warehouses/[id]/edit",
    pattern: /^\/dashboard\/warehouses\/\d+\/edit$/,
    permissions: ["edit warehouses"],
  },
];

// Helper function to check if user has any of the required permissions
export function hasRequiredPermissions(
  userPermissions: string[],
  requiredPermissions: string[],
): boolean {
  if (requiredPermissions.length === 0) {
    return true; // No permissions required, accessible to all
  }

  return requiredPermissions.some((permission) =>
    userPermissions.includes(permission),
  );
}

// Helper function to get user permissions from session
export function getUserPermissions(user: any): string[] {
  if (!user?.role?.permissions) {
    return [];
  }

  return user.role.permissions.map((permission: any) => permission.name);
}

// Helper function to find the appropriate permissions for a given path
export function getPermissionsForPath(pathname: string): string[] {
  // First, try to find exact match
  const exactMatch = routePermissions.find((route) =>
    route.pattern.test(pathname),
  );
  if (exactMatch) {
    return exactMatch.permissions;
  }

  // If no exact match, find the closest parent route
  const pathSegments = pathname.split("/").filter(Boolean);
  let closestParent: RoutePermission | null = null;
  let maxMatchLength = 0;

  for (const route of routePermissions) {
    const routeSegments = route.href.split("/").filter(Boolean);

    // Check if this route is a parent of the current path
    if (pathSegments.length > routeSegments.length) {
      const isParent = routeSegments.every(
        (segment, index) => pathSegments[index] === segment,
      );

      if (isParent && routeSegments.length > maxMatchLength) {
        closestParent = route;
        maxMatchLength = routeSegments.length;
      }
    }
  }

  return closestParent ? closestParent.permissions : [];
}
