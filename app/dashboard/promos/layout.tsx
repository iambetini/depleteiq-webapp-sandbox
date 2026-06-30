"use client"

import { cn } from "@/lib/utils"
import { usePathname, useRouter } from "next/navigation"

function PromosLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  const getActiveTab = () => {
    if (pathname.includes('/promo-slabs')) return 'promo-slabs'
    if (pathname.includes('/participants')) return 'participants'
    if (pathname.includes('/promo-participations')) return 'promo-participations'
    return 'promos'
  }

  const tabs = [
    { id: 'promos', label: 'Promos', path: `/dashboard/promos` },
    { id: 'promo-slabs', label: 'Promo Slabs', path: `/dashboard/promos/promo-slabs` },
    { id: 'participants', label: 'Sign ups', path: `/dashboard/promos/participants` },
    { id: 'promo-participations', label: 'Promo Participations', path: `/dashboard/promos/promo-participations` },
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

export default function PromosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <PromosLayoutContent>{children}</PromosLayoutContent>
}
