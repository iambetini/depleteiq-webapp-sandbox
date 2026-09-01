"use client"

import { cn } from "@/lib/utils"
import { usePathname, useRouter } from "next/navigation"

function LocationsLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  const getActiveTab = () => {
    if (pathname.includes('/coverage-areas')) return 'coverage-areas'
    if (pathname.includes('/lgas')) return 'lgas'
    if (pathname.includes('/states')) return 'states'
    if (pathname.includes('/regions')) return 'regions'
    return 'locations'
  }

  const tabs = [
    { id: 'locations', label: 'Locations', path: '/dashboard/locations' },
    { id: 'states', label: 'States', path: '/dashboard/locations/states' },
    { id: 'regions', label: 'Regions', path: '/dashboard/locations/regions' },
    { id: 'lgas', label: 'LGAs', path: '/dashboard/locations/lgas' },
    { id: 'coverage-areas', label: 'Coverage Areas', path: '/dashboard/locations/coverage-areas' },
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

export default function LocationsLayout({ children }: { children: React.ReactNode }) {
  return (
    <LocationsLayoutContent>
      {children}
    </LocationsLayoutContent>
  )
}
