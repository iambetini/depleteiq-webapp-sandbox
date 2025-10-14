"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

interface LocationMapProps {
  latitude: number | string;
  longitude: number | string;
  address?: string;
  className?: string;
  height?: string;
}

export function LocationMap({
  latitude,
  longitude,
  address,
  className,
  height = "300px"
}: LocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // Convert to numbers and validate
  const latNum = Number(latitude);
  const lngNum = Number(longitude);
  const isValidCoords = !isNaN(latNum) && !isNaN(lngNum) &&
    latNum >= -90 && latNum <= 90 &&
    lngNum >= -180 && lngNum <= 180;


  useEffect(() => {
    if (!mapRef.current || !isValidCoords) return;

    const initializeMap = () => {
      if ((window as any).google?.maps) {
        const mapOptions = {
          center: { lat: latNum, lng: lngNum },
          zoom: 15,
          mapTypeId: (window as any).google.maps.MapTypeId.ROADMAP,
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: true,
          fullscreenControl: true,
        };

        // Create map instance
        mapInstanceRef.current = new (window as any).google.maps.Map(mapRef.current, mapOptions);

        // Create marker
        markerRef.current = new (window as any).google.maps.Marker({
          position: { lat: latNum, lng: lngNum },
          map: mapInstanceRef.current,
          title: address || "Selected Location",
          animation: (window as any).google.maps.Animation.DROP,
        });

        // Add info window if address is provided
        if (address) {
          const infoWindow = new (window as any).google.maps.InfoWindow({
            content: `
              <div class="p-2">
                <h3 class="m-0 mb-1 text-sm font-semibold">Selected Location</h3>
                <p class="m-0 text-xs text-gray-600">${address}</p>
                <p class="mt-1 mb-0 text-xs text-gray-500">
                  Lat: ${latNum.toFixed(6)}, Lng: ${lngNum.toFixed(6)}
                </p>
              </div>
            `,
          });

          markerRef.current.addListener("click", () => {
            infoWindow.open(mapInstanceRef.current, markerRef.current);
          });
        }
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(initializeMap, 100);
    return () => clearTimeout(timer);
  }, [latNum, lngNum, address, isValidCoords]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
      if (mapInstanceRef.current) {
        (window as any).google?.maps?.event?.clearInstanceListeners(mapInstanceRef.current);
      }
    };
  }, []);

  if (!isValidCoords) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gray-100 border border-gray-200 rounded-lg",
          className
        )}
        // eslint-disable-next-line react/forbid-dom-props
        style={{ height }}
      >
        <div className="text-center text-gray-500">
          <div className="text-sm font-medium">No location selected</div>
          <div className="text-xs">Select a location to see the map</div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <div
        ref={mapRef}
        className="w-full rounded-lg border border-gray-200 overflow-hidden"
        // eslint-disable-next-line react/forbid-dom-props
        style={{ height }}
      />
      <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded shadow-sm text-xs text-gray-600 font-mono">
        {latNum.toFixed(6)}, {lngNum.toFixed(6)}
      </div>
    </div>
  );
}
