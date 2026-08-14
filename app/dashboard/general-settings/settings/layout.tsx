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
    return 'deliveries'
  }

  const tabs = [
    { id: 'orders', label: 'Orders', path: `/dashboard/general-settings/settings/orders` },
    { id: 'deliveries', label: 'Deliveries', path: `/dashboard/general-settings/settings/deliveries` },
    { id: 'reports', label: 'Reports', path: `/dashboard/general-settings/settings/reports` },
    { id: 'telescope', label: 'Telescope', path: `/dashboard/general-settings/settings/telescope` },
    { id: 'horizon', label: 'Horizon', path: `/dashboard/general-settings/settings/horizon` },
  ]

  const activeTab = getActiveTab()

  return (
    <div>
      {/* Tab Navigation */}
      <div className="mb-6">
        <nav className="inline-flex items-center gap-1 rounded-2xl bg-[#eef0f3] p-1.5 border border-gray-200/80" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => router.push(tab.path)}
              className={cn(
                "whitespace-nowrap px-4 py-2 rounded-xl text-sm transition-all duration-200",
                activeTab === tab.id
                  ? "bg-white text-gray-900 font-bold shadow-sm border border-gray-200/80"
                  : "text-gray-500 font-medium hover:text-gray-800"
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
