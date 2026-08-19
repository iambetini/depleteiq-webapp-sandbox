"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { useSelector } from "react-redux"
import { RootState } from "@/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import MultiMap from "@/components/ui/multi-map"
import { useGetUserQuery } from "@/store/users"

type FootprintItem = {
    latitude: number | string
    longitude: number | string
    created_at?: string
    fullname?: string
}

function formatDate(d: Date) {
    return d.toISOString().split("T")[0]
}

function getThisWeekRange() {
    const now = new Date()
    // Treat Monday as start of week
    const day = now.getDay() || 7
    const monday = new Date(now)
    monday.setDate(now.getDate() - day + 1)
    const start = formatDate(monday)
    const end = formatDate(now)
    return { start, end }
}

export default function UserFootprintPage() {
    const params = useParams()
    const userId = params.id as string

    // Read date range from Redux dashboardFilters (updated by DateFilter component)
    const dateRangeFromStore = useSelector((state: RootState) => state.dashboardFilters.dateRange)

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [items, setItems] = useState<FootprintItem[]>([])
    const { data: userResp } = useGetUserQuery(userId, { skip: !userId })
    const user = (userResp as any)?.data || userResp
    const fullName = user ? `${user.first_name || ""} ${user.last_name || ""}`.trim() : ""

    const dateRange = useMemo(() => {
        const start = dateRangeFromStore?.start_date || getThisWeekRange().start
        const end = dateRangeFromStore?.end_date || getThisWeekRange().end
        return { start, end }
    }, [dateRangeFromStore?.start_date, dateRangeFromStore?.end_date])

    useEffect(() => {
        if (!userId) return
        const abort = new AbortController()
        const fetchData = async () => {
            setLoading(true)
            setError(null)
            try {
                // Use dynamic api-client import (avoids bundling)
                const mod = (await import("@/lib/api-client")) as any
                const apiClient = mod.apiClient as any

                const params = new URLSearchParams({
                    user_id: userId,
                    start_date: dateRange.start,
                    end_date: dateRange.end,
                    per_page: "50"
                })
                const finalUrl = `/user-footprint?${params}`

                const resp = await apiClient.get(finalUrl, { signal: abort.signal })
                const data = (resp as any).data

                // Normalize to array from { data: { items: [...] } }
                const payload = Array.isArray(data) ? data : data?.data?.items ?? data?.items ?? []

                setItems(
                    payload.map((p: any) => ({
                        latitude: p.location_set?.latitude ?? p.latitude ?? p.lat,
                        longitude: p.location_set?.longitude ?? p.longitude ?? p.lng,
                        created_at: p.date_time || p.created_at || p.createdAt || "",
                        fullname: p.user ? `${p.user.first_name || ""} ${p.user.last_name || ""}`.trim() : "",
                    }))
                )
            } catch (e) {
                if ((e as any).name === "AbortError") return
                console.error(e)
                setItems([])
                setError("Failed to load footprint data. Please try again.")
            } finally {
                setLoading(false)
            }
        }

        fetchData()
        return () => abort.abort()
    }, [userId, dateRange.start, dateRange.end])

    const locations = useMemo(
        () =>
            items
                .map((it) => ({
                    latitude: Number(it.latitude),
                    longitude: Number(it.longitude),
                    title: it.fullname
                        ? `${it.fullname}${it.created_at ? ` (${new Date(it.created_at).toLocaleString()})` : ""}`
                        : "Location",
                }))
                .filter((p) => !Number.isNaN(p.latitude) && !Number.isNaN(p.longitude)),
        [items]
    )

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-[#444444]">{fullName || "Map"}</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="p-6 text-center text-gray-500">Loading footprints...</div>
                    ) : error ? (
                        <div className="p-6 text-center text-red-500">{error}</div>
                    ) : locations.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">No locations for selected period.</div>
                    ) : (
                        <MultiMap locations={locations} className="h-[600px] w-full" />
                    )}
                </CardContent>
            </Card>
        </div>
    )
}