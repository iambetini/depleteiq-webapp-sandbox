"use client"

import { ViewPageHeader } from "@/components/dashboard/ViewPageHeader"
import { TabConfig } from "@/components/layouts/entity-layout"
import { LoadingSkeleton } from "@/components/ui/loading-skeleton"
import { useGetPromoterQuery } from "@/store/promoters"
import { cn } from "@/lib/utils"
import { notFound, useParams, usePathname, useRouter } from "next/navigation"
import { createEntityLayout } from "@/lib/entity-layout-factory";
import type { Promoter } from "@/types/promoter";

const { Layout, useContext } = createEntityLayout<Promoter>({
  storeName: "promoters",
});

export { useContext };


export default function PromoterLayout({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const pathname = usePathname()
  const router = useRouter()
  const promoterId = params.id as string
  const { data: promoter, isLoading } = useGetPromoterQuery(promoterId);

  const tabs: TabConfig[] = [
    { id: 'view', label: 'Overview', path: `/dashboard/promos/promoters/${promoterId}` },
    { id: 'stores', label: 'Stores', path: `/dashboard/promos/promoters/${promoterId}/stores` },
  ]

  // Determine the active tab based on the current path
  const getActiveTab = () => {
    if (pathname.endsWith('/view')) return 'view'
    if (pathname.endsWith('/stores')) return 'stores'
    return 'view'
  }

  const activeTab = getActiveTab()

  if (isLoading) { return <LoadingSkeleton /> }
  if (!promoter) { notFound() }

  return (
    <Layout>
      <ViewPageHeader
        title="Promoter Details"
        description="View detailed information about this promoter"
        showEditButton={true}
        editHref={`/dashboard/promos/promoters/${promoter.uuid}/edit`}
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
    </Layout>
  )
}
