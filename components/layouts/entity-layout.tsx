"use client"

import { ViewPageHeader } from "@/components/dashboard/ViewPageHeader"
import { LoadingSkeleton } from "@/components/ui/loading-skeleton"
import { cn } from "@/lib/utils"
import { notFound } from "next/navigation"
import { usePathname, useRouter, useParams } from "next/navigation"
import { useDistributorData } from "@/hooks/use-entity-data"
import { useImeVssData } from "@/hooks/use-entity-data"
import { useVssData } from "@/hooks/use-entity-data"
import { useTargetData } from "@/hooks/use-entity-data"

export interface TabConfig {
  id: string
  label: string
  path: string
}

interface EntityLayoutProps {
  children: React.ReactNode
  entityType: 'distributor' | 'ime' | 'vss' | 'target' | 'promoter'
  tabs: TabConfig[]
}

function EntityLayoutContent({ children, entityType, tabs }: EntityLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const params = useParams()

  // Always call all hooks to avoid conditional hook calls
  const distributorData = useDistributorData(entityType === 'distributor')
  const imeVssData = useImeVssData(entityType === 'ime')
  const vssData = useVssData(entityType === 'vss')
  const targetData = useTargetData(entityType === 'target')
  // Select the appropriate data based on entity type
  const { entity, isLoading, error } =
    entityType === 'distributor' ? distributorData :
      entityType === 'ime' ? imeVssData :
        entityType === 'vss' ? vssData :
          targetData

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (error || !entity) {
    notFound()
  }

  // Determine the active tab based on the current path
  const getActiveTab = () => {
    if (pathname.endsWith('/assignment')) return 'assignment'
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
    } else if (entityType === 'ime') {
      const ime = entity as any
      return {
        title: `${ime.first_name} ${ime.last_name}` || "IME",
        description: ime.email || ""
      }
    } else if (entityType === 'vss') {
      const vss = entity as any
      return {
        title: `${vss.first_name} ${vss.last_name}` || "VSS",
        description: vss.email || ""
      }
    } else {
      const target = entity as any
      return {
        title: `${target.user?.first_name || ''} ${target.user?.last_name || ''}` || "Target",
        description: target.type ? `${target.type} - ${target.goal_type}` : ""
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
    { id: 'view', label: 'Overview', path: `/dashboard/businesses/distributors/${distributorId}` },
    { id: 'orders', label: 'Orders', path: `/dashboard/businesses/distributors/${distributorId}/orders` },
    { id: 'target', label: 'Target', path: `/dashboard/businesses/distributors/${distributorId}/target` },
    { id: 'manage', label: 'Manage', path: `/dashboard/businesses/distributors/${distributorId}/manage` },
  ]

  return (
    <EntityLayoutContent entityType="distributor" tabs={tabs}>
      {children}
    </EntityLayoutContent>
  )
}

// ime Layout
export function ImeVssLayout({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const imeVssId = params.id as string

  const tabs: TabConfig[] = [
    { id: 'view', label: 'Overview', path: `/dashboard/field-agents/ime/${imeVssId}` },
    { id: 'orders', label: 'Orders', path: `/dashboard/field-agents/ime/${imeVssId}/orders` },
    { id: 'distributors', label: 'Distributors', path: `/dashboard/field-agents/ime/${imeVssId}/distributors` },
    { id: 'manage', label: 'Manage', path: `/dashboard/field-agents/ime/${imeVssId}/manage` },
  ]

  return (
    <EntityLayoutContent entityType="ime" tabs={tabs}>
      {children}
    </EntityLayoutContent>
  )
}

// VSS Layout
export function VssLayout({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const vssId = params.id as string

  const tabs: TabConfig[] = [
    { id: 'view', label: 'Overview', path: `/dashboard/field-agents/vss/${vssId}` },
    { id: 'assignment', label: 'Assignments', path: `/dashboard/field-agents/vss/${vssId}/assignment` },
    { id: 'orders', label: 'Orders', path: `/dashboard/field-agents/vss/${vssId}/orders` },
    { id: 'distributors', label: 'Distributors', path: `/dashboard/field-agents/vss/${vssId}/distributors` },
    { id: 'manage', label: 'Manage', path: `/dashboard/field-agents/vss/${vssId}/manage` },
  ]

  return (
    <EntityLayoutContent entityType="vss" tabs={tabs}>
      {children}
    </EntityLayoutContent>
  )
}

// Target Layout
export function TargetLayout({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const targetId = params.id as string

  const tabs: TabConfig[] = [
    { id: 'view', label: 'Overview', path: `/dashboard/targets/${targetId}` },
    { id: 'manage', label: 'Manage', path: `/dashboard/targets/${targetId}/manage` },
  ]

  return (
    <EntityLayoutContent entityType="target" tabs={tabs}>
      {children}
    </EntityLayoutContent>
  )
}
