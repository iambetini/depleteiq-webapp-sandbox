"use client"

import { cn } from "@/lib/utils"
import { usePathname, useRouter } from "next/navigation"
import { usePermissions } from "@/lib/permission-context"

function ControlCentreLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { hasRoutePermission } = usePermissions()

  const getActiveTab = () => {
    if (pathname.includes('/roles')) return 'roles'
    if (pathname.includes('/users')) return 'users'
    if (pathname.includes('/deliveries') || pathname.includes('/orders') || 
        pathname.includes('/reports') || pathname.includes('/telescope') || 
        pathname.includes('/horizon') || pathname.includes('/settings')) return 'settings'
    return 'roles'
  }

  const allTabs = [
    { id: 'roles', label: 'Roles & Permissions', path: `/dashboard/general-settings/roles` },
    { id: 'users', label: 'Users', path: `/dashboard/general-settings/users` },
    { id: 'settings', label: 'Settings', path: `/dashboard/general-settings/settings` },
  ]

  const tabs = allTabs.filter((tab) => hasRoutePermission(tab.path))

  const activeTab = getActiveTab()

  return (
    <div>
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => router.push(tab.path)}
              className={cn(
                "whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200",
                activeTab === tab.id
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
              aria-current={activeTab === tab.id ? 'page' : undefined}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      {children}
    </div>
  )
}

export default function ControlCentreLayout({ children }: { children: React.ReactNode }) {
  return (
    <ControlCentreLayoutContent>
      {children}
    </ControlCentreLayoutContent>
  )
}
