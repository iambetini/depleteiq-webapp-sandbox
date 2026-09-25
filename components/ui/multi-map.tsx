"use client"

import { useEffect, useRef } from "react"

interface LocationItem {
    latitude: number | string
    longitude: number | string
    title?: string
}

interface MultiMapProps {
    locations: LocationItem[]
    className?: string
    /** When true, draw a dashed orange path with directional arrowheads. */
    showPath?: boolean
}

function escapeHtml(str: string) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")
}

/** Spread coincident points in a small spiral so every marker is visible/clickable. */
function withOverlapOffsets(
    pts: { lat: number; lng: number; title?: string }[]
): { lat: number; lng: number; title?: string; originalLat: number; originalLng: number }[] {
    const seen = new Map<string, number>()
    const OFFSET_DEG = 0.00004 // ~4–5 meters

    return pts.map((p) => {
        const key = `${p.lat.toFixed(6)},${p.lng.toFixed(6)}`
        const count = seen.get(key) || 0
        seen.set(key, count + 1)

        if (count === 0) {
            return { ...p, originalLat: p.lat, originalLng: p.lng }
        }

        const angle = count * 0.9
        const radius = OFFSET_DEG * Math.ceil(count / 6)
        return {
            ...p,
            lat: p.lat + Math.cos(angle) * radius,
            lng: p.lng + Math.sin(angle) * radius,
            originalLat: p.lat,
            originalLng: p.lng,
        }
    })
}

function loadGoogleMapsScript(): Promise<void> {
    if (typeof window === "undefined") return Promise.resolve()
    if ((window as any).google?.maps) return Promise.resolve()

    return new Promise<void>((resolve, reject) => {
        const existing = document.querySelector('script[src*="maps.googleapis.com"]')
        if (existing) {
            const start = Date.now()
            const timeoutMs = 10000
            const timer = setInterval(() => {
                if ((window as any).google?.maps) {
                    clearInterval(timer)
                    resolve()
                } else if (Date.now() - start > timeoutMs) {
                    clearInterval(timer)
                    reject(new Error("Timed out waiting for Google Maps API to load"))
                }
            }, 100)
            return
        }

        const script = document.createElement("script")
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
        script.async = true
        script.defer = true
        script.onload = () => resolve()
        script.onerror = () => reject(new Error("Failed to load Google Maps API"))
        document.head.appendChild(script)
    })
}

export function MultiMap({
    locations = [],
    className = "",
    showPath = false,
}: MultiMapProps) {
    const mapRef = useRef<HTMLDivElement | null>(null)
    const mapInstance = useRef<any>(null)
    const markersRef = useRef<any[]>([])
    const polylineRef = useRef<any>(null)
    const readyRef = useRef(false)
    const showPathRef = useRef(showPath)
    const locationsRef = useRef(locations)

    showPathRef.current = showPath
    locationsRef.current = locations

    // Create the map instance once
    useEffect(() => {
        let cancelled = false

        const init = async () => {
            try {
                await loadGoogleMapsScript()
            } catch (e) {
                console.error(e)
                return
            }
            if (cancelled || !mapRef.current || mapInstance.current) return

            mapInstance.current = new (window as any).google.maps.Map(mapRef.current, {
                center: { lat: 0, lng: 0 },
                zoom: 2,
                mapTypeId: (window as any).google.maps.MapTypeId.ROADMAP,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: true,
                zoomControl: true,
            })
            readyRef.current = true
            syncMarkers()
        }

        init()

        return () => {
            cancelled = true
            markersRef.current.forEach((m) => {
                ; (window as any).google?.maps?.event?.clearInstanceListeners(m)
                m.setMap(null)
            })
            markersRef.current = []
            clearPolyline()
            mapInstance.current = null
            readyRef.current = false
            if (mapRef.current) mapRef.current.innerHTML = ""
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const clearPolyline = () => {
        if (polylineRef.current) {
            if (Array.isArray(polylineRef.current)) {
                polylineRef.current.forEach((overlay: any) => overlay.setMap(null))
            } else {
                polylineRef.current.setMap(null)
            }
            polylineRef.current = null
        }
    }

    const syncPath = () => {
        if (!readyRef.current || !mapInstance.current) return
        const google = (window as any).google

        clearPolyline()

        if (!showPathRef.current) return

        const pathPts = locationsRef.current
            .map((l) => ({
                lat: Number(l.latitude),
                lng: Number(l.longitude),
            }))
            .filter((p) => !Number.isNaN(p.lat) && !Number.isNaN(p.lng))

        if (pathPts.length < 2) return

        // Deep saturated safety orange (matches reference)
        const pathColor = "#ff6600"

        // Moderate-weight dashes — bold but not bulky; ~2:1 dash-to-gap
        const dashedSymbol = {
            path: "M 0,-1 0,1",
            strokeOpacity: 1,
            strokeColor: pathColor,
            strokeWeight: 4,
            scale: 5,
        }

        // Arrowheads wider than the dash so the triangle stays sharp above the line
        const arrowSymbol = {
            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 4,
            strokeColor: pathColor,
            strokeWeight: 1,
            fillColor: pathColor,
            fillOpacity: 1,
        }

        const lineOpts = {
            path: pathPts,
            geodesic: true,
            strokeColor: pathColor,
            strokeOpacity: 0,
            strokeWeight: 4,
            map: mapInstance.current,
        }

        // Dashes only (centers every 18px → gaps at 9, 27, 45, 63, 81…)
        const dashedPath = new google.maps.Polyline({
            ...lineOpts,
            icons: [
                {
                    icon: dashedSymbol,
                    offset: "0",
                    repeat: "18px",
                },
            ],
            zIndex: 2,
        })

        // Arrows on a higher layer, sitting in dash gaps — never at the path start
        const arrowPath = new google.maps.Polyline({
            ...lineOpts,
            icons: [
                {
                    icon: arrowSymbol,
                    offset: "81px",
                    repeat: "54px",
                },
            ],
            zIndex: 3,
        })

        polylineRef.current = [dashedPath, arrowPath]
    }

    const syncMarkers = () => {
        if (!readyRef.current || !mapInstance.current) return

        const google = (window as any).google
        const currentLocations = locationsRef.current

        const pts = withOverlapOffsets(
            currentLocations
                .map((l) => ({
                    lat: Number(l.latitude),
                    lng: Number(l.longitude),
                    title: l.title,
                }))
                .filter((p) => !Number.isNaN(p.lat) && !Number.isNaN(p.lng))
        )

        markersRef.current.forEach((m) => {
            google.maps.event.clearInstanceListeners(m)
            m.setMap(null)
        })
        markersRef.current = []
        clearPolyline()

        if (pts.length === 0) return

        const bounds = new google.maps.LatLngBounds()

        pts.forEach((p, index) => {
            const isFirst = index === 0
            const isLast = index === pts.length - 1

            const marker = new google.maps.Marker({
                position: { lat: p.lat, lng: p.lng },
                map: mapInstance.current,
                title: p.title || "",
                label: {
                    text: String(index + 1),
                    color: "#ffffff",
                    fontSize: pts.length > 99 ? "9px" : "11px",
                    fontWeight: "700",
                },
                zIndex: pts.length - index,
            })

            const badgeColor = isFirst ? "#22c55e" : isLast ? "#ef4444" : "#f97316"
            const badgeLabel = `#${index + 1}`

            const infoContent = `
                <div style="padding:8px;min-width:160px">
                    <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
                        <span style="padding:2px 8px;border-radius:20px;font-size:11px;font-weight:700;color:#fff;background:${badgeColor}">${badgeLabel}</span>
                        <span style="font-weight:600;font-size:13px">${escapeHtml(p.title || "Location")}</span>
                    </div>
                    <div style="font-size:11px;color:#888">${p.originalLat.toFixed(6)}, ${p.originalLng.toFixed(6)}</div>
                </div>`

            const infoWindow = new google.maps.InfoWindow({ content: infoContent })

            marker.addListener("click", () => {
                infoWindow.open(mapInstance.current, marker)
            })

            markersRef.current.push(marker)
            bounds.extend({ lat: p.lat, lng: p.lng })
        })

        syncPath()

        if (pts.length === 1) {
            mapInstance.current.setCenter(bounds.getCenter())
            mapInstance.current.setZoom(15)
        } else {
            mapInstance.current.fitBounds(bounds, 40)
        }
    }

    useEffect(() => {
        syncMarkers()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [locations])

    useEffect(() => {
        syncPath()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showPath])

    if (!locations || locations.length === 0) {
        return (
            <div className={`bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center ${className}`}>
                <div className="text-center text-gray-500">
                    <div className="text-sm font-medium">No locations to display</div>
                </div>
            </div>
        )
    }

    return <div ref={mapRef} className={`rounded-lg overflow-hidden border border-gray-200 ${className}`} />
}

export default MultiMap
