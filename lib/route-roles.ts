export interface RouteRole {
  pattern: RegExp;
  href: string;
  roles: string[];
  title: string;
  icon?: any;
}

export const routeRoles: RouteRole[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    pattern: /^\/dashboard$/,
    roles: ["everybody"],
  },
  {
    title: "Orders",
    href: "/dashboard/orders",
    pattern: /^\/dashboard\/orders(\/.*)?$/,
    roles: ["everybody"],
  },
  {
    title: "Distributors",
    href: "/dashboard/distributors",
    pattern: /^\/dashboard\/distributors(\/.*)?$/,
    roles: ["super-admin", "system-admin", "operations"],
  },
  {
    title: "IME/VSS",
    href: "/dashboard/ime-vss",
    pattern: /^\/dashboard\/ime-vss(\/.*)?$/,
    roles: ["super-admin", "system-admin", "operations"],
  },
    {
    title: "Target",
    href: "/dashboard/target",
    pattern: /^\/dashboard\/target(\/.*)?$/,
    roles: ["super-admin", "system-admin", "operations"],
  },
  {
    title: "Brands",
    href: "/dashboard/brands",
    pattern: /^\/dashboard\/brands(\/.*)?$/,
    roles: ["super-admin", "system-admin", "operations"],
  },
  {
    title: "Branches",
    href: "/dashboard/branches",
    pattern: /^\/dashboard\/branches(\/.*)?$/,
    roles: ["super-admin", "system-admin", "operations"],
  },
  {
    title: "Markets",
    href: "/dashboard/markets",
    pattern: /^\/dashboard\/markets(\/.*)?$/,
    roles: ["super-admin", "system-admin", "operations"],
  },
  {
    title: "Locations",
    href: "/dashboard/locations",
    pattern: /^\/dashboard\/locations(\/.*)?$/,
    roles: ["super-admin", "system-admin", "operations"],
  },
  {
    title: "Deliveries",
    href: "/dashboard/deliveries",
    pattern: /^\/dashboard\/deliveries(\/.*)?$/,
    roles: ["super-admin", "system-admin", "operations"],
  },
  {
    title: "Vehicles",
    href: "/dashboard/vehicles",
    pattern: /^\/dashboard\/vehicles(\/.*)?$/,
    roles: ["super-admin", "system-admin", "operations"],
  },
  {
    title: "Warehouses",
    href: "/dashboard/warehouses",
    pattern: /^\/dashboard\/warehouses(\/.*)?$/,
    roles: ["super-admin", "system-admin", "operations"],
  },
  {
    title: "Reports",
    href: "/dashboard/reports",
    pattern: /^\/dashboard\/reports(\/.*)?$/,
    roles: ["everybody"],
  },
  {
    title: "Audit Logs",
    href: "/dashboard/audit-logs",
    pattern: /^\/dashboard\/audit-logs(\/.*)?$/,
    roles: ["super-admin", "system-admin"],
  },

  {
    title: "Settings",
    href: "/dashboard/settings",
    pattern: /^\/dashboard\/settings(\/.*)?$/,
    roles: ["everybody"],
  },
];
