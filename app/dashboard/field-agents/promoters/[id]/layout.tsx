"use client"

import { ViewPageHeader } from "@/components/dashboard/ViewPageHeader"
import { TabConfig } from "@/components/layouts/entity-layout"
import { cn } from "@/lib/utils"
import { useParams, usePathname, useRouter } from "next/navigation"
import { createEntityLayout } from "@/lib/entity-layout-factory"
import type { Promoter } from "@/types/promoter"

const { Layout, useContext } = createEntityLayout<Promoter>({
  storeName: "promoters",
});

export { useContext };


export default function PromoterLayout({ children }: { children: React.ReactNode }) {
  return (
    <Layout>
      <PromoterLayoutContent>{children}</PromoterLayoutContent>
    </Layout>
  )
}

function PromoterLayoutContent({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const pathname = usePathname()
  const router = useRouter()
  const promoterId = params.id as string
  const { promoter } = useContext()

  const tabs: TabConfig[] = [
    { id: 'view', label: 'Overview', path: `/dashboard/field-agents/promoters/${promoterId}` },
    { id: 'stores', label: 'Stores', path: `/dashboard/field-agents/promoters/${promoterId}/stores` },
  ]

  // Determine the active tab based on the current path
  const getActiveTab = () => {
    if (pathname.endsWith('/view')) return 'view'
    if (pathname.endsWith('/stores')) return 'stores'
    return 'view'
  }

  const activeTab = getActiveTab()

  if (!promoter) { return null }

  const displayName =
    promoter.full_name ||
    [promoter.first_name, promoter.last_name].filter(Boolean).join(" ") ||
    [promoter.user?.first_name, promoter.user?.last_name].filter(Boolean).join(" ") ||
    "Promoter Details"

  return (
    <>
      <ViewPageHeader
        title={displayName}
        description="Promoter Details"
        showEditButton={true}
        editHref={`/dashboard/field-agents/promoters/${promoter.uuid}/edit`}
        showDeleteButton={true}
        deleteOptions={{
          storeName: "promoters",
          uuid: promoter.uuid,
        }}
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
    </>
  )
}
