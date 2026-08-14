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
}

function escapeHtml(str: string) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")
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

export function MultiMap({ locations = [], className = "" }: MultiMapProps) {
    const mapRef = useRef<HTMLDivElement | null>(null)
    const mapInstance = useRef<any>(null)
    const markersRef = useRef<any[]>([])
    const readyRef = useRef(false)

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
            // trigger marker sync now that the map exists
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
            mapInstance.current = null
            readyRef.current = false
            if (mapRef.current) mapRef.current.innerHTML = ""
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Sync markers whenever locations change (without rebuilding the map)
    const syncMarkers = () => {
        if (!readyRef.current || !mapInstance.current) return

        const google = (window as any).google

        const pts = locations
            .map((l) => ({
                lat: Number(l.latitude),
                lng: Number(l.longitude),
                title: l.title,
            }))
            .filter((p) => !Number.isNaN(p.lat) && !Number.isNaN(p.lng))

        // clear existing markers
        markersRef.current.forEach((m) => {
            google.maps.event.clearInstanceListeners(m)
            m.setMap(null)
        })
        markersRef.current = []

        if (pts.length === 0) return

        const bounds = new google.maps.LatLngBounds()

        pts.forEach((p) => {
            const marker = new google.maps.Marker({
                position: { lat: p.lat, lng: p.lng },
                map: mapInstance.current,
                title: p.title || "",
            })

            const infoWindow = new google.maps.InfoWindow({
                content: `<div style="padding:8px"><div style="font-weight:600">${escapeHtml(
                    p.title || "Location"
                )}</div><div style="font-size:12px">${p.lat.toFixed(6)}, ${p.lng.toFixed(6)}</div></div>`,
            })

            marker.addListener("click", () => {
                infoWindow.open(mapInstance.current, marker)
            })

            markersRef.current.push(marker)
            bounds.extend({ lat: p.lat, lng: p.lng })
        })

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