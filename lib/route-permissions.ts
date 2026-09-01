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
  // Businesses - Distributors
  {
    href: "/dashboard/businesses/distributors",
    pattern: /^\/dashboard\/businesses\/distributors$/,
    permissions: ["view dashboard","view distributors"],
  },
  {
    href: "/dashboard/businesses/distributors/create",
    pattern: /^\/dashboard\/businesses\/distributors\/create$/,
    permissions: ["create distributors"],
  },
  {
    href: "/dashboard/businesses/distributors/[id]",
    pattern: /^\/dashboard\/businesses\/distributors\/\d+$/,
    permissions: ["view distributors"],
  },
  {
    href: "/dashboard/businesses/distributors/[id]/manage",
    pattern: /^\/dashboard\/businesses\/distributors\/\d+\/manage$/,
    permissions: ["edit distributors"],
  },
  {
    href: "/dashboard/businesses/distributors/[id]/orders",
    pattern: /^\/dashboard\/businesses\/distributors\/\d+\/orders$/,
    permissions: ["view orders"],
  },
  {
    href: "/dashboard/businesses/distributors/[id]/target",
    pattern: /^\/dashboard\/businesses\/distributors\/\d+\/target$/,
    permissions: ["edit targets"],
  },

  // Businesses - Wholesalers
  {
    href: "/dashboard/businesses/wholesalers",
    pattern: /^\/dashboard\/businesses\/wholesalers$/,
    permissions: ["view wholesalers"],
  },
  {
    href: "/dashboard/businesses/wholesalers/create",
    pattern: /^\/dashboard\/businesses\/wholesalers\/create$/,
    permissions: ["create wholesalers"],
  },
  {
    href: "/dashboard/businesses/wholesalers/[id]",
    pattern: /^\/dashboard\/businesses\/wholesalers\/\d+$/,
    permissions: ["view wholesalers"],
  },
  {
    href: "/dashboard/businesses/wholesalers/[id]/edit",
    pattern: /^\/dashboard\/businesses\/wholesalers\/\d+\/edit$/,
    permissions: ["edit wholesalers"],
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
  {
    href: "/dashboard/change-password",
    pattern: /^\/dashboard\/change-password$/,
    permissions: [],
  },
  {
    href: "/dashboard/profile",
    pattern: /^\/dashboard\/profile$/,
    permissions: ["view dashboard"],
  },
  {
    href: "/dashboard/security",
    pattern: /^\/dashboard\/security$/,
    permissions: ["view dashboard"],
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


  // Field Teams - IME
  {
    href: "/dashboard/field-agents/ime",
    pattern: /^\/dashboard\/field-agents\/ime$/,
    permissions: ["view distributors"],
  },
  {
    href: "/dashboard/field-agents/ime/create",
    pattern: /^\/dashboard\/field-agents\/ime\/create$/,
    permissions: ["create distributors"],
  },
  {
    href: "/dashboard/field-agents/ime/[id]",
    pattern: /^\/dashboard\/field-agents\/ime\/[\w-]+$/,
    permissions: ["view distributors"],
  },
  {
    href: "/dashboard/field-agents/ime/[id]/manage",
    pattern: /^\/dashboard\/field-agents\/ime\/[\w-]+\/manage$/,
    permissions: ["edit distributors"],
  },
  {
    href: "/dashboard/field-agents/ime/[id]/distributors",
    pattern: /^\/dashboard\/field-agents\/ime\/[\w-]+\/distributors$/,
    permissions: ["view distributors"],
  },
  {
    href: "/dashboard/field-agents/ime/[id]/orders",
    pattern: /^\/dashboard\/field-agents\/ime\/[\w-]+\/orders$/,
    permissions: ["view orders"],
  },
  {
    href: "/dashboard/field-agents/vss",
    pattern: /^\/dashboard\/field-agents\/vss$/,
    permissions: ["view distributors"],
  },
  {
    href: "/dashboard/field-agents/vss/create",
    pattern: /^\/dashboard\/field-agents\/vss\/create$/,
    permissions: ["create distributors"],
  },
  {
    href: "/dashboard/field-agents/vss/[id]",
    pattern: /^\/dashboard\/field-agents\/vss\/[\w-]+$/,
    permissions: ["view distributors"],
  },
  {
    href: "/dashboard/field-agents/vss/[id]/manage",
    pattern: /^\/dashboard\/field-agents\/vss\/[\w-]+\/manage$/,
    permissions: ["edit distributors"],
  },
  {
    href: "/dashboard/field-agents/vss/[id]/distributors",
    pattern: /^\/dashboard\/field-agents\/vss\/[\w-]+\/distributors$/,
    permissions: ["view distributors"],
  },
  {
    href: "/dashboard/field-agents/vss/[id]/orders",
    pattern: /^\/dashboard\/field-agents\/vss\/[\w-]+\/orders$/,
    permissions: ["view orders"],
  },
  {
    href: "/dashboard/field-agents/tpe",
    pattern: /^\/dashboard\/field-agents\/tpe$/,
    permissions: ["view tpe"],
  },
  {
    href: "/dashboard/field-agents/tpe/create",
    pattern: /^\/dashboard\/field-agents\/tpe\/create$/,
    permissions: ["create tpe"],
  },
  {
    href: "/dashboard/field-agents/tpe/[id]",
    pattern: /^\/dashboard\/field-agents\/tpe\/\d+$/,
    permissions: ["view tpe"],
  },
  {
    href: "/dashboard/field-agents/tpe/[id]/edit",
    pattern: /^\/dashboard\/field-agents\/tpe\/\d+\/edit$/,
    permissions: ["edit tpe"],
  },
  {
    href: "/dashboard/field-agents/promoters",
    pattern: /^\/dashboard\/field-agents\/promoters$/,
    permissions: ["view promoters"],
  },
  {
    href: "/dashboard/field-agents/promoters/create",
    pattern: /^\/dashboard\/field-agents\/promoters\/create$/,
    permissions: ["create promoters"],
  },
  {
    href: "/dashboard/field-agents/promoters/[id]",
    pattern: /^\/dashboard\/field-agents\/promoters\/[a-f0-9-]+$/,
    permissions: ["view promoters"],
  },
  {
    href: "/dashboard/field-agents/promoters/[id]/edit",
    pattern: /^\/dashboard\/field-agents\/promoters\/[a-f0-9-]+\/edit$/,
    permissions: ["edit promoters"],
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

  // Participants
  {
    href: "/dashboard/promos/participants",
    pattern: /^\/dashboard\/promos\/participants$/,
    permissions: ["view participants"],
  },
  {
    href: "/dashboard/promos/participants/create",
    pattern: /^\/dashboard\/promos\/participants\/create$/,
    permissions: ["create participants"],
  },
  {
    href: "/dashboard/promos/participants/[id]",
    pattern: /^\/dashboard\/promos\/participants\/[a-f0-9-]+$/,
    permissions: ["view participants"],
  },
  {
    href: "/dashboard/promos/participants/[id]/edit",
    pattern: /^\/dashboard\/promos\/participants\/[a-f0-9-]+\/edit$/,
    permissions: ["edit participants"],
  },

  // Promo Participations
  {
    href: "/dashboard/promos/promo-participations",
    pattern: /^\/dashboard\/promos\/promo-participations$/,
    permissions: ["view promo_participations"],
  },
  {
    href: "/dashboard/promos/promo-participations/create",
    pattern: /^\/dashboard\/promos\/promo-participations\/create$/,
    permissions: ["create promo_participations"],
  },
  {
    href: "/dashboard/promos/promo-participations/[id]",
    pattern: /^\/dashboard\/promos\/promo-participations\/[a-f0-9-]+$/,
    permissions: ["view promo_participations"],
  },
  {
    href: "/dashboard/promos/promo-participations/[id]/edit",
    pattern: /^\/dashboard\/promos\/promo-participations\/[a-f0-9-]+\/edit$/,
    permissions: ["edit promo_participations"],
  },

  // Promoters
  {
    href: "/dashboard/promos/promoters",
    pattern: /^\/dashboard\/promos\/promoters$/,
    permissions: ["view promoters"],
  },
  {
    href: "/dashboard/promos/promoters/create",
    pattern: /^\/dashboard\/promos\/promoters\/create$/,
    permissions: ["create promoters"],
  },
  {
    href: "/dashboard/promos/promoters/[id]",
    pattern: /^\/dashboard\/promos\/promoters\/[a-f0-9-]+$/,
    permissions: ["view promoters"],
  },
  {
    href: "/dashboard/promos/promoters/[id]/edit",
    pattern: /^\/dashboard\/promos\/promoters\/[a-f0-9-]+\/edit$/,
    permissions: ["edit promoters"],
  },

  // Promos
  {
    href: "/dashboard/promos",
    pattern: /^\/dashboard\/promos$/,
    permissions: ["view promos"],
  },
  {
    href: "/dashboard/promos/create",
    pattern: /^\/dashboard\/promos\/create$/,
    permissions: ["create promos"],
  },
  {
    href: "/dashboard/promos/[id]",
    pattern: /^\/dashboard\/promos\/[a-f0-9-]+$/,
    permissions: ["view promos"],
  },
  {
    href: "/dashboard/promos/[id]/edit",
    pattern: /^\/dashboard\/promos\/[a-f0-9-]+\/edit$/,
    permissions: ["edit promos"],
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
    href: "/dashboard/general-settings/roles",
    pattern: /^\/dashboard\/general-settings\/roles$/,
    permissions: ["view roles"],
  },
  {
    href: "/dashboard/general-settings/roles/create",
    pattern: /^\/dashboard\/general-settings\/roles\/create$/,
    permissions: ["create roles"],
  },
  {
    href: "/dashboard/general-settings/roles/[id]",
    pattern: /^\/dashboard\/general-settings\/roles\/[a-f0-9-]+$/,
    permissions: ["view roles"],
  },
  {
    href: "/dashboard/general-settings/roles/[id]/edit",
    pattern: /^\/dashboard\/general-settings\/roles\/[a-f0-9-]+\/edit$/,
    permissions: ["edit roles"],
  },

  // Settings
  {
    href: "/dashboard/general-settings/settings",
    pattern: /^\/dashboard\/general-settings\/settings$/,
    permissions: ["all access"],
  },
  {
    href: "/dashboard/general-settings/settings/deliveries",
    pattern: /^\/dashboard\/general-settings\/settings\/deliveries$/,
    permissions: ["all access"],
  },
  {
    href: "/dashboard/general-settings/settings/orders",
    pattern: /^\/dashboard\/general-settings\/settings\/orders$/,
    permissions: ["all access"],
  },
  {
    href: "/dashboard/general-settings/settings/reports",
    pattern: /^\/dashboard\/general-settings\/settings\/reports$/,
    permissions: ["all access"],
  },

  // Targets
  {
    href: "/dashboard/targets",
    pattern: /^\/dashboard\/targets$/,
    permissions: ["view targets"],
  },
  {
    href: "/dashboard/targets/[id]",
    pattern: /^\/dashboard\/targets\/\d+$/,
    permissions: ["view targets"],
  },
  {
    href: "/dashboard/targets/[id]/manage",
    pattern: /^\/dashboard\/targets\/\d+\/manage$/,
    permissions: ["edit targets"],
  },

  // Users
  {
    href: "/dashboard/general-settings/users",
    pattern: /^\/dashboard\/general-settings\/users$/,
    permissions: ["view users"],
  },
  {
    href: "/dashboard/general-settings/users/create",
    pattern: /^\/dashboard\/general-settings\/users\/create$/,
    permissions: ["create users"],
  },
  {
    href: "/dashboard/general-settings/users/[id]",
    pattern: /^\/dashboard\/general-settings\/users\/[a-f0-9-]+$/,
    permissions: ["view users"],
  },
  {
    href: "/dashboard/general-settings/users/[id]/edit",
    pattern: /^\/dashboard\/general-settings\/users\/[a-f0-9-]+\/edit$/,
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

  return requiredPermissions.some(
    (permission) =>
      userPermissions.includes(permission) ||
      userPermissions.includes("all access"),
  );
}

// Helper function to get user permissions from session
export function getUserPermissions(user: any): string[] {
  if (!user?.role?.permissions) {
    return [];
  }

  return user.role.permissions.map((permission: any) => {
    return typeof permission === "string" ? permission : permission.name;
  });
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

export function hasPermissionForRoute(
  routePath: string,
  userPermissions: (string | { name: string })[] | undefined
): boolean {
  if (!userPermissions) {
    return false
  }

  const routeConfig = routePermissions.find((route) => route.href === routePath)

  if (!routeConfig) {
    return false
  }

  const permissionNames = userPermissions.map((p) =>
    typeof p === 'string' ? p : p.name
  )

  return routeConfig.permissions.some((permission) =>
    permissionNames.includes(permission)
  )
}
