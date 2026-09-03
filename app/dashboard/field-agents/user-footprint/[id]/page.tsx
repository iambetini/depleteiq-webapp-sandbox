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
import { Route, RefreshCw } from "lucide-react"

type FootprintItem = {
    uuid?: string
    latitude: number | string
    longitude: number | string
    created_at?: string
    fullname?: string
}

const FOOTPRINT_PER_PAGE = 100
/** Ignore tiny GPS jitter when summing distance (meters). */
const MIN_SEGMENT_METERS = 5

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

function parseTimestamp(value?: string): number {
    if (!value) return 0
    const ms = new Date(value).getTime()
    return Number.isNaN(ms) ? 0 : ms
}

/** Haversine distance in kilometers. */
function haversineKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371
    const toRad = (d: number) => (d * Math.PI) / 180
    const dLat = toRad(lat2 - lat1)
    const dLon = toRad(lon2 - lon1)
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) *
            Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) ** 2
    return 2 * R * Math.asin(Math.sqrt(a))
}

function formatDistanceKm(km: number): string {
    if (km < 0.01) return `${Math.round(km * 1000)} m`
    if (km < 1) return `${(km * 1000).toFixed(0)} m`
    return `${km.toFixed(2)} km`
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
    const [showDistance, setShowDistance] = useState(false)
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
        setShowDistance(false)
    }, [userId, dateRange.start, dateRange.end])

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

    // Chronological order (oldest → newest) for path + distance
    const chronologicalItems = useMemo(
        () =>
            [...items].sort(
                (a, b) => parseTimestamp(a.created_at) - parseTimestamp(b.created_at)
            ),
        [items]
    )

    const locations = useMemo(
        () =>
            chronologicalItems
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
        [chronologicalItems]
    )

    const totalDistanceKm = useMemo(() => {
        if (locations.length < 2) return 0
        let total = 0
        for (let i = 1; i < locations.length; i++) {
            const prev = locations[i - 1]
            const curr = locations[i]
            const segmentKm = haversineKm(
                prev.latitude,
                prev.longitude,
                curr.latitude,
                curr.longitude
            )
            if (segmentKm * 1000 >= MIN_SEGMENT_METERS) {
                total += segmentKm
            }
        }
        return total
    }, [locations])

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
                                {showDistance && locations.length > 1
                                    ? ` · ${formatDistanceKm(totalDistanceKm)}`
                                    : ""}
                            </span>
                        )}
                    </CardTitle>
                    <div className="flex items-center gap-2 shrink-0">
                        <Button
                            variant={showDistance ? "default" : "outline"}
                            size="sm"
                            onClick={() => setShowDistance((v) => !v)}
                            disabled={loading || locations.length < 2}
                            type="button"
                            className={
                                showDistance
                                    ? "bg-[#f97316] hover:bg-[#ea580c] text-white"
                                    : undefined
                            }
                        >
                            <Route className="mr-2 h-4 w-4" />
                            {showDistance ? "Hide distance" : "Show distance"}
                        </Button>
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
                    </div>
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
                        <div className="space-y-3">
                            {showDistance && (
                                <div className="rounded-md border border-orange-200 bg-orange-50 px-3 py-2 text-sm text-[#444444]">
                                    Path distance (point to point):{" "}
                                    <span className="font-semibold">
                                        {formatDistanceKm(totalDistanceKm)}
                                    </span>
                                    {totalDistanceKm < 0.01 && locations.length > 1 && (
                                        <span className="ml-1 text-[#ababab]">
                                            (points are very close or identical)
                                        </span>
                                    )}
                                </div>
                            )}
                            <MultiMap
                                locations={locations}
                                showPath={showDistance}
                                className="h-[600px] w-full"
                            />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
