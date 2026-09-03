"use client"

import { cn } from "@/lib/utils"
import { usePathname, useRouter } from "next/navigation"
import { usePermissions } from "@/lib/permission-context"

function FieldTeamsLayoutContent({ children }: { children: React.ReactNode }) {
	const pathname = usePathname()
	const router = useRouter()
	const { hasRoutePermission } = usePermissions()

	// Hide parent tabs for standalone footprint pages
	if (pathname?.startsWith('/dashboard/field-agents/user-footprint')) {
		return <div>{children}</div>
	}

	const allTabs = [
        { id: 'ime', label: 'IME', path: `/dashboard/field-agents/ime` },
        { id: 'vss', label: 'VSS', path: `/dashboard/field-agents/vss` },
		{ id: 'tpe', label: 'TPE', path: `/dashboard/field-agents/tpe` },
		{ id: 'promoters', label: 'Promoters', path: `/dashboard/field-agents/promoters` },
	]

	const tabs = allTabs.filter((tab) => hasRoutePermission(tab.path))

	const getActiveTab = () => {
		if (pathname === '/dashboard/field-agents/ime' || pathname.startsWith('/dashboard/field-agents/ime/')) return 'ime'
		if (pathname === '/dashboard/field-agents/vss' || pathname.startsWith('/dashboard/field-agents/vss/')) return 'vss'
		if (pathname.startsWith('/dashboard/field-agents/tpe')) return 'tpe'
		if (pathname.startsWith('/dashboard/field-agents/promoters')) return 'promoters'
		return tabs[0]?.id ?? 'ime'
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
