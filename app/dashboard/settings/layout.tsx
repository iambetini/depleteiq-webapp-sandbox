"use client"

import { cn } from "@/lib/utils"
import { usePathname, useRouter } from "next/navigation"

function SettingsLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  const getActiveTab = () => {
    if (pathname.includes('/deliveries')) return 'deliveries'
    if (pathname.includes('/orders')) return 'orders'
    if (pathname.includes('/reports')) return 'reports'
    if (pathname.includes('/telescope')) return 'telescope'
    if (pathname.includes('/horizon')) return 'horizon'
    if (pathname.includes('/users')) return 'users'
    if (pathname.includes('/roles')) return 'roles'
    return 'roles'
  }

  const tabs = [
    { id: 'roles', label: 'Roles & Permissions', path: `/dashboard/settings/roles` },
    { id: 'users', label: 'Users', path: `/dashboard/settings/users` },
    { id: 'deliveries', label: 'Deliveries', path: `/dashboard/settings/deliveries` },
    { id: 'orders', label: 'Orders', path: `/dashboard/settings/orders` },
    { id: 'reports', label: 'Reports', path: `/dashboard/settings/reports` },
    { id: 'telescope', label: 'Telescope', path: `/dashboard/settings/telescope` },
    { id: 'horizon', label: 'Horizon', path: `/dashboard/settings/horizon` },
  ]

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

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <SettingsLayoutContent>
      {children}
    </SettingsLayoutContent>
  )
}
