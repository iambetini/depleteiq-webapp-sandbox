"use client"

import { cn } from "@/lib/utils"
import { usePathname, useRouter } from "next/navigation"

function BusinessesLayoutContent({ children }: { children: React.ReactNode }) {
	const pathname = usePathname()
	const router = useRouter()

	const getActiveTab = () => {
		if (pathname.includes('/distributors')) return 'distributors'
		if (pathname.includes('/wholesalers')) return 'wholesalers'
		return 'distributors'
	}

	const allTabs = [
		{ id: 'distributors', label: 'Distributors', path: `/dashboard/businesses/distributors` },
		{ id: 'wholesalers', label: 'Wholesalers', path: `/dashboard/businesses/wholesalers` },
	]

	const activeTab = getActiveTab()

	return (
		<div>
			<div className="border-b border-gray-200 mb-6">
				<nav className="-mb-px flex space-x-8" aria-label="Tabs">
					{allTabs.map((tab) => (
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
	return <BusinessesLayoutContent>{children}</BusinessesLayoutContent>
}
