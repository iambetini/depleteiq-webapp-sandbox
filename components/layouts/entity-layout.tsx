"use client"

import { ViewPageHeader } from "@/components/dashboard/ViewPageHeader"
import { LoadingSkeleton } from "@/components/ui/loading-skeleton"
import { cn } from "@/lib/utils"
import { notFound } from "next/navigation"
import { usePathname, useRouter, useParams } from "next/navigation"
import { useDistributorData } from "@/hooks/use-entity-data"
import { useImeVssData } from "@/hooks/use-entity-data"

interface TabConfig {
  id: string
  label: string
  path: string
}

interface EntityLayoutProps {
  children: React.ReactNode
  entityType: 'distributor' | 'ime-vss'
  tabs: TabConfig[]
}

function EntityLayoutContent({ children, entityType, tabs }: EntityLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const params = useParams()

  // Always call both hooks to avoid conditional hook calls
  const distributorData = useDistributorData(entityType === 'distributor')
  const imeVssData = useImeVssData(entityType === 'ime-vss')
  
  // Select the appropriate data based on entity type
  const { entity, isLoading, error } = entityType === 'distributor' ? distributorData : imeVssData

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (error || !entity) {
    notFound()
  }

  // Determine the active tab based on the current path
  const getActiveTab = () => {
    if (pathname.endsWith('/manage')) return 'manage'
    if (pathname.endsWith('/orders')) return 'orders'
    if (pathname.endsWith('/distributors')) return 'distributors'
    if (pathname.endsWith('/target')) return 'target'
    return 'view'
  }

  const activeTab = getActiveTab()

  // Get title and description based on entity type
  const getTitleAndDescription = () => {
    if (entityType === 'distributor') {
      const distributor = entity as any
      return {
        title: distributor.business_name || "Distributor",
        description: distributor.user ? `${distributor.user.first_name} ${distributor.user.last_name}` : ""
      }
    } else {
      const imeVss = entity as any
      return {
        title: `${imeVss.first_name} ${imeVss.last_name}` || "IME-VSS",
        description: imeVss.email || ""
      }
    }
  }

  const { title, description } = getTitleAndDescription()

  return (
    <div>
      <ViewPageHeader
        title={title}
        description={description}
      />

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-4">
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

// Distributor Layout
export function DistributorLayout({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const distributorId = params.id as string

  const tabs: TabConfig[] = [
    { id: 'view', label: 'Overview', path: `/dashboard/distributors/${distributorId}` },
    { id: 'orders', label: 'Orders', path: `/dashboard/distributors/${distributorId}/orders` },
    { id: 'target', label: 'Target', path: `/dashboard/distributors/${distributorId}/target` },
    { id: 'manage', label: 'Manage', path: `/dashboard/distributors/${distributorId}/manage` },
  ]

  return (
    <EntityLayoutContent entityType="distributor" tabs={tabs}>
      {children}
    </EntityLayoutContent>
  )
}

// IME-VSS Layout
export function ImeVssLayout({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const imeVssId = params.id as string

  const tabs: TabConfig[] = [
    { id: 'view', label: 'Overview', path: `/dashboard/ime-vss/${imeVssId}` },
    { id: 'orders', label: 'Orders', path: `/dashboard/ime-vss/${imeVssId}/orders` },
    { id: 'distributors', label: 'Distributors', path: `/dashboard/ime-vss/${imeVssId}/distributors` },
    { id: 'manage', label: 'Manage', path: `/dashboard/ime-vss/${imeVssId}/manage` },
  ]

  return (
    <EntityLayoutContent entityType="ime-vss" tabs={tabs}>
      {children}
    </EntityLayoutContent>
  )
}
