"use client"

import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "@/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import MultiMap from "@/components/ui/multi-map"
import { SelectWithFetch } from "@/components/ui/select"
import { useGetUserQuery } from "@/store/users"
import { calculateDateRange } from "@/lib/date-utils"
import {
    setCustomDateRange,
    setDateRange,
    setSelectedFilter,
} from "@/store/dashboard-filters"
import { RefreshCw, Route } from "lucide-react"

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

export default function FootprintsPage() {
    const dispatch = useDispatch()
    const selectedFilter = useSelector(
        (state: RootState) => state.dashboardFilters.selectedFilter
    )
    const customDateRange = useSelector(
        (state: RootState) => state.dashboardFilters.customDateRange
    )

    const [dateReady, setDateReady] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [items, setItems] = useState<FootprintItem[]>([])
    const [refreshKey, setRefreshKey] = useState(0)
    const [showDistance, setShowDistance] = useState(false)
    const [selectedUserId, setSelectedUserId] = useState("")

    const { data: userResp } = useGetUserQuery(selectedUserId, {
        skip: !selectedUserId,
    })
    const selectedUser = (userResp as any)?.data || userResp
    const selectedUserLabel = selectedUser
        ? `${selectedUser.first_name || ""} ${selectedUser.last_name || ""}`.trim()
        : ""

    // Default this page to Today (shared store may still hold "This week" from elsewhere)
    useLayoutEffect(() => {
        const todayRange = calculateDateRange("Today")
        dispatch(setSelectedFilter("Today"))
        dispatch(setCustomDateRange({}))
        dispatch(setDateRange(todayRange))
        setDateReady(true)
    }, [dispatch])

    // Keep API/UI aligned with DateFilter. For presets, always derive from
    // selectedFilter so a stale store range (e.g. "This week" after hard reload)
    // cannot disagree with the dropdown label.
    const dateRange = useMemo(() => {
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

        const filter =
            selectedFilter === "Custom" ? "Today" : selectedFilter
        const computed = calculateDateRange(filter)
        return { start: computed.start_date, end: computed.end_date }
    }, [
        selectedFilter,
        customDateRange.from,
        customDateRange.to,
    ])

    const handleRefresh = useCallback(() => {
        setRefreshKey((key) => key + 1)
    }, [])

    const clearUserFilter = useCallback(() => {
        setSelectedUserId("")
    }, [])

    // Wider date ranges need a VSS filter to avoid loading too much data
    const requiresVss = selectedFilter !== "Today"
    const canFetch =
        dateReady &&
        Boolean(dateRange.start && dateRange.end) &&
        (!requiresVss || Boolean(selectedUserId))

    useEffect(() => {
        setShowDistance(false)
    }, [selectedUserId, dateRange.start, dateRange.end])

    useEffect(() => {
        if (!canFetch) {
            setItems([])
            setLoading(false)
            setError(null)
            return
        }
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
                        start_date: dateRange.start,
                        end_date: dateRange.end,
                        per_page: String(FOOTPRINT_PER_PAGE),
                        page: String(page),
                    })
                    if (selectedUserId) {
                        query.set("user_id", selectedUserId)
                    }
                    const resp = await apiClient.get(`/user-footprint?${query}`, {
                        signal: abort.signal,
                        showToast: false,
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
                if (
                    abort.signal.aborted ||
                    (e as any).name === "AbortError" ||
                    (e as any).name === "CanceledError" ||
                    (e as any).message === "canceled"
                ) {
                    return
                }
                console.error(e)
                setItems([])
                setError("Failed to load footprint data. Please try again.")
            } finally {
                if (!abort.signal.aborted) setLoading(false)
            }
        }

        fetchData()
        return () => abort.abort()
    }, [canFetch, selectedUserId, dateRange.start, dateRange.end, refreshKey])

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

    const canShowDistance = Boolean(selectedUserId) && locations.length >= 2

    const totalDistanceKm = useMemo(() => {
        if (!canShowDistance) return 0
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
    }, [locations, canShowDistance])

    const mapTitle = selectedUserId
        ? selectedUserLabel || "User map"
        : "All users"

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between space-y-0">
                    <CardTitle className="text-[#444444]">
                        {mapTitle}
                        {!loading && (
                            <span className="ml-2 text-sm font-normal text-[#ababab]">
                                {dateRange.start === dateRange.end
                                    ? dateRange.start
                                    : `${dateRange.start} → ${dateRange.end}`}
                                {locations.length > 0
                                    ? ` · ${locations.length} location${locations.length === 1 ? "" : "s"}`
                                    : ""}
                                {showDistance && canShowDistance
                                    ? ` · ${formatDistanceKm(totalDistanceKm)}`
                                    : ""}
                            </span>
                        )}
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <div className="flex items-center gap-2 min-w-[200px]">
                            <SelectWithFetch
                                store="vss"
                                value={selectedUserId}
                                onChange={setSelectedUserId}
                                valueKey="uuid"
                                labelKey="full_name"
                                placeholder={
                                    requiresVss
                                        ? "Select VSS (required)..."
                                        : "Filter by VSS..."
                                }
                                params={{
                                    roles: "vss",
                                    per_page: 1000,
                                }}
                                selectedLabel={selectedUserLabel || undefined}
                                className="w-[240px]"
                                labelFormatter={(item: any) =>
                                    item.full_name ||
                                    `${item.first_name || ""} ${item.last_name || ""}`.trim() ||
                                    item.email ||
                                    item.uuid
                                }
                            />
                            {selectedUserId && !requiresVss && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    type="button"
                                    onClick={clearUserFilter}
                                >
                                    Clear
                                </Button>
                            )}
                        </div>
                        <Button
                            variant={showDistance ? "default" : "outline"}
                            size="sm"
                            onClick={() => setShowDistance((v) => !v)}
                            disabled={loading || !canShowDistance}
                            type="button"
                            title={
                                !selectedUserId
                                    ? "Select a user to show path distance"
                                    : undefined
                            }
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
                            disabled={loading || !canFetch}
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
                    {requiresVss && !selectedUserId ? (
                        <div className="p-6 text-center text-gray-500">
                            Select a VSS to view footprints for{" "}
                            {selectedFilter.toLowerCase()}.
                        </div>
                    ) : loading ? (
                        <div className="p-6 text-center text-gray-500">Loading footprints...</div>
                    ) : error ? (
                        <div className="p-6 text-center text-red-500">{error}</div>
                    ) : locations.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                            No locations for {selectedFilter.toLowerCase()} ({dateRange.start}
                            {dateRange.start !== dateRange.end ? ` to ${dateRange.end}` : ""}
                            {selectedUserId && selectedUserLabel
                                ? ` · ${selectedUserLabel}`
                                : ""}
                            ).
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {showDistance && canShowDistance && (
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
                                showPath={showDistance && canShowDistance}
                                className="h-[600px] w-full"
                            />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
