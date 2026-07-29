"use client"

import { cn } from "@/lib/utils"
import { usePathname, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { hasPermissionForRoute } from "@/lib/route-permissions"

function FieldTeamsLayoutContent({ children }: { children: React.ReactNode }) {
	const pathname = usePathname()
	const router = useRouter()
	const { data: session } = useSession()

	const allTabs = [
        { id: 'ime-vss', label: 'IME-VSS', path: `/dashboard/field-agents/ime-vss` },
		{ id: 'tpe', label: 'TPE', path: `/dashboard/field-agents/tpe` },
		{ id: 'promoters', label: 'Promoters', path: `/dashboard/field-agents/promoters` },
	]

	const tabs = allTabs.filter((tab) =>
		hasPermissionForRoute(tab.path, session?.user?.role?.permissions)
	)

	const getActiveTab = () => {
		if (pathname.includes('/ime-vss')) return 'ime-vss'
		if (pathname.includes('/tpe')) return 'tpe'
		if (pathname.includes('/promoters')) return 'promoters'
		return tabs[0]?.id ?? 'ime-vss'
	}

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

export default function Layout({ children }: { children: React.ReactNode }) {
	return <FieldTeamsLayoutContent>{children}</FieldTeamsLayoutContent>
}
