"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { useSelector } from "react-redux"
import { RootState } from "@/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import MultiMap from "@/components/ui/multi-map"
import { useGetUserQuery } from "@/store/users"
import { calculateDateRange } from "@/lib/date-utils"
import { RefreshCw } from "lucide-react"

type FootprintItem = {
    uuid?: string
    latitude: number | string
    longitude: number | string
    created_at?: string
    fullname?: string
}

const FOOTPRINT_PER_PAGE = 100

function normalizeFootprintItems(payload: any[]): FootprintItem[] {
    return payload.map((p: any) => ({
        uuid: p.uuid,
        latitude: p.location_set?.latitude ?? p.latitude ?? p.lat,
        longitude: p.location_set?.longitude ?? p.longitude ?? p.lng,
        created_at: p.date_time || p.created_at || p.createdAt || "",
        fullname: p.user
            ? `${p.user.first_name || ""} ${p.user.last_name || ""}`.trim()
            : "",
    }))
}

function extractItems(data: any): any[] {
    if (Array.isArray(data)) return data
    return data?.data?.items ?? data?.items ?? []
}

function extractPagination(data: any) {
    return data?.meta?.pagination ?? data?.data?.meta?.pagination ?? null
}

export default function UserFootprintPage() {
    const params = useParams()
    const userId = params.id as string

    const selectedFilter = useSelector(
        (state: RootState) => state.dashboardFilters.selectedFilter
    )
    const dateRangeFromStore = useSelector(
        (state: RootState) => state.dashboardFilters.dateRange
    )
    const customDateRange = useSelector(
        (state: RootState) => state.dashboardFilters.customDateRange
    )

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [items, setItems] = useState<FootprintItem[]>([])
    const [refreshKey, setRefreshKey] = useState(0)
    const { data: userResp } = useGetUserQuery(userId, { skip: !userId })
    const user = (userResp as any)?.data || userResp
    const fullName = user ? `${user.first_name || ""} ${user.last_name || ""}`.trim() : ""

    // Keep API query aligned with DateFilter (including default "This week")
    const dateRange = useMemo(() => {
        if (dateRangeFromStore?.start_date && dateRangeFromStore?.end_date) {
            return {
                start: dateRangeFromStore.start_date,
                end: dateRangeFromStore.end_date,
            }
        }

        if (
            selectedFilter === "Custom" &&
            customDateRange.from &&
            customDateRange.to
        ) {
            const computed = calculateDateRange("Custom", {
                from: new Date(customDateRange.from),
                to: new Date(customDateRange.to),
            })
            return { start: computed.start_date, end: computed.end_date }
        }

        const computed = calculateDateRange(
            selectedFilter === "Custom" ? "This week" : selectedFilter
        )
        return { start: computed.start_date, end: computed.end_date }
    }, [
        dateRangeFromStore?.start_date,
        dateRangeFromStore?.end_date,
        selectedFilter,
        customDateRange.from,
        customDateRange.to,
    ])

    const handleRefresh = useCallback(() => {
        setRefreshKey((key) => key + 1)
    }, [])

    useEffect(() => {
        if (!userId || !dateRange.start || !dateRange.end) return
        const abort = new AbortController()
        const fetchData = async () => {
            setLoading(true)
            setError(null)
            try {
                const mod = (await import("@/lib/api-client")) as any
                const apiClient = mod.apiClient as any

                const allItems: any[] = []
                let page = 1
                let lastPage = 1

                do {
                    const query = new URLSearchParams({
                        user_id: userId,
                        start_date: dateRange.start,
                        end_date: dateRange.end,
                        per_page: String(FOOTPRINT_PER_PAGE),
                        page: String(page),
                    })
                    const resp = await apiClient.get(`/user-footprint?${query}`, {
                        signal: abort.signal,
                    })
                    const data = (resp as any).data
                    const pageItems = extractItems(data)
                    allItems.push(...pageItems)

                    const pagination = extractPagination(data)
                    lastPage = Number(pagination?.last_page) || 1
                    page += 1
                } while (page <= lastPage && !abort.signal.aborted)

                if (abort.signal.aborted) return

                setItems(normalizeFootprintItems(allItems))
            } catch (e) {
                if ((e as any).name === "AbortError") return
                console.error(e)
                setItems([])
                setError("Failed to load footprint data. Please try again.")
            } finally {
                if (!abort.signal.aborted) setLoading(false)
            }
        }

        fetchData()
        return () => abort.abort()
    }, [userId, dateRange.start, dateRange.end, refreshKey])

    const locations = useMemo(
        () =>
            items
                .map((it) => {
                    const timestamp = it.created_at
                        ? (() => {
                              const parsed = new Date(it.created_at)
                              return Number.isNaN(parsed.getTime())
                                  ? it.created_at
                                  : parsed.toLocaleString()
                          })()
                        : ""
                    return {
                        latitude: Number(it.latitude),
                        longitude: Number(it.longitude),
                        title: it.fullname
                            ? `${it.fullname}${timestamp ? ` (${timestamp})` : ""}`
                            : timestamp || "Location",
                    }
                })
                .filter((p) => !Number.isNaN(p.latitude) && !Number.isNaN(p.longitude)),
        [items]
    )

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 gap-4">
                    <CardTitle className="text-[#444444]">
                        {fullName || "Map"}
                        {!loading && (
                            <span className="ml-2 text-sm font-normal text-[#ababab]">
                                {dateRange.start === dateRange.end
                                    ? dateRange.start
                                    : `${dateRange.start} → ${dateRange.end}`}
                                {locations.length > 0
                                    ? ` · ${locations.length} location${locations.length === 1 ? "" : "s"}`
                                    : ""}
                            </span>
                        )}
                    </CardTitle>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={loading || !dateRange.start || !dateRange.end}
                        type="button"
                    >
                        <RefreshCw
                            className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
                        />
                        Refresh
                    </Button>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="p-6 text-center text-gray-500">Loading footprints...</div>
                    ) : error ? (
                        <div className="p-6 text-center text-red-500">{error}</div>
                    ) : locations.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                            No locations for {selectedFilter.toLowerCase()} ({dateRange.start}
                            {dateRange.start !== dateRange.end ? ` to ${dateRange.end}` : ""}).
                        </div>
                    ) : (
                        <MultiMap locations={locations} className="h-[600px] w-full" />
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
