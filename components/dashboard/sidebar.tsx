"use client";
import { Button } from "@/components/ui/button";
import {
  Building2,
  FileText,
  Gift,
  GitBranch,
  History,
  Home,
  LogOut,
  Map as MapIcon,
  MapPin,
  Megaphone,
  Package,
  PackageCheck,
  QrCode,
  Settings,
  Shield,
  ShoppingBag,
  ShoppingCart,
  Store,
  Truck,
  UserCheck,
  UserCog,
  UserPlus,
  Users,
  Warehouse,
  Flag,
} from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

import { usePermissions } from "@/lib/permission-context";

type IconType = React.ComponentType<{ className?: string }>;

export interface SidebarItem {
  title: string;
  href: string;
  permissions: string[]; // Array of permission names required to show this sidebar item
  icon?: string;
}

const iconMap: Record<string, IconType> = {
  Home,
  ShoppingCart,
  UserCheck,
  UserCog,
  Users,
  Package,
  Building2,
  MapPin,
  Map: MapIcon,
  PackageCheck,
  Truck,
  Warehouse,
  GitBranch,
  Shield,
  FileText,
  History,
  Settings,
  Flag,
  ShoppingBag,
  Store,
  Megaphone,
  UserPlus,
  QrCode,
  Gift,
};

export const sidebarItems: SidebarItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    permissions: ["view dashboard"],
    icon: "Home",
  },
  {
    title: "Orders",
    href: "/dashboard/orders",
    permissions: ["view orders"],
    icon: "ShoppingCart",
  },
  {
    title: "Supplies",
    href: "/dashboard/supplies",
    permissions: ["view orders"],
    icon: "PackageCheck",
  },
  {
    title: "Targets",
    href: "/dashboard/targets",
    permissions: ["view targets"],
    icon: "Flag",
  },
  {
    title: "Brands",
    href: "/dashboard/brands",
    permissions: ["view brands"],
    icon: "Package",
  },
  {
    title: "Businesses",
    href: "/dashboard/businesses",
    permissions: ["view distributors", "view wholesalers"],
    icon: "Building2",
  },
  {
    title: "Field Agents",
    href: "/dashboard/field-agents",
    permissions: ["view distributors", "view tpe", "view promoters"],
    icon: "Users",
  },
  {
    title: "Assignments",
    href: "/dashboard/assignments",
    permissions: ["view distributors"],
    icon: "UserCheck",
  },
  {
    title: "Promos",
    href: "/dashboard/promos",
    permissions: ["view promos"],
    icon: "Gift",
  },
  {
    title: "Stores",
    href: "/dashboard/stores",
    permissions: ["view stores"],
    icon: "Store",
  },
  {
    title: "QR Codes",
    href: "/dashboard/qr-codes",
    permissions: ["view qr_codes"],
    icon: "QrCode",
  },
  {
    title: "Branches",
    href: "/dashboard/branches",
    permissions: ["view distributors"],
    icon: "GitBranch",
  },
  {
    title: "Markets",
    href: "/dashboard/markets",
    permissions: ["view markets"],
    icon: "Building2",
  },
  {
    title: "Locations",
    href: "/dashboard/locations",
    permissions: ["view locations"],
    icon: "MapPin",
  },
  {
    title: "Geofences",
    href: "/dashboard/geofences",
    permissions: ["view geofences"],
    icon: "Map",
  },
  {
    title: "Deliveries",
    href: "/dashboard/deliveries",
    permissions: ["view deliveries"],
    icon: "PackageCheck",
  },
  {
    title: "Vehicles",
    href: "/dashboard/vehicles",
    permissions: ["view vehicles"],
    icon: "Truck",
  },
  {
    title: "Warehouses",
    href: "/dashboard/warehouses",
    permissions: ["view warehouses"],
    icon: "Warehouse",
  },
  {
    title: "Reports",
    href: "/dashboard/reports",
    permissions: ["view reports"],
    icon: "FileText",
  },
  {
    title: "Audit Logs",
    href: "/dashboard/audit-logs",
    permissions: ["view audit logs"],
    icon: "History",
  },
  {
    title: "General Settings",
    href: "/dashboard/general-settings",
    permissions: ["all access"],
    icon: "Settings",
  },
];

// Helper function to filter sidebar items based on user permissions
function filterSidebarItems(
  items: SidebarItem[],
  hasAnyPermission: (permissions: string[]) => boolean,
): SidebarItem[] {
  return items.filter((item) => hasAnyPermission(item.permissions));
}

// Helper function to find the active sidebar item for a given pathname
function findActiveSidebarItem(pathname: string): SidebarItem | null {
  // Prefer the most specific route match (exact or parent prefix)
  return sidebarItems
    .filter(
      (item) =>
        pathname === item.href || pathname.startsWith(item.href + "/")
    )
    .sort((a, b) => b.href.length - a.href.length)[0] ?? null;
}

const handleLogout = async () => {
  await signOut({ callbackUrl: "/auth/login" });
};

interface SidebarMenuItemProps {
  item: SidebarItem;
  activeHref: string | undefined;
}

function SidebarMenuItem({ item, activeHref }: SidebarMenuItemProps) {
  const isActive = activeHref === item.href;
  const Icon = iconMap[item.icon || "Home"] || Home;

  return (
    <Link href={item.href}>
      <Button
        variant={isActive ? "default" : "ghost"}
        className={`w-full justify-start ${isActive ? "btn-primary" : "hover:bg-[#f2f2f2]"}`}
      >
        <Icon className="mr-3 h-4 w-4" />
        {item.title}
      </Button>
    </Link>
  );
}

function SidebarMenu({
  items,
  activeHref,
}: {
  items: SidebarItem[];
  activeHref: string | undefined;
}) {
  return (
    <>
      {items.map((item) => (
        <SidebarMenuItem
          key={item.href}
          item={item}
          activeHref={activeHref}
        />
      ))}
    </>
  );
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const { hasAnyPermission } = usePermissions();

  const visibleMenuItems = React.useMemo(
    () => filterSidebarItems(sidebarItems, hasAnyPermission),
    [hasAnyPermission]
  );

  const activeItem = React.useMemo(
    () => findActiveSidebarItem(pathname),
    [pathname]
  );

  return (
    <aside className="w-64 bg-white border-r border-[#eeeeee] min-h-screen">
      <div className="p-4">
        <nav className="space-y-1">
          <SidebarMenu items={visibleMenuItems} activeHref={activeItem?.href} />
          <Button
            variant="ghost"
            className="w-full justify-start hover:bg-[#f2f2f2]"
            onClick={handleLogout}
          >
            <LogOut className="mr-3 h-4 w-4" />
            Logout
          </Button>
        </nav>
      </div>
    </aside>
  );
}
