"use client";

/// <reference types="google.maps" />

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  memo,
} from "react";

export type ShapeChangePayload =
  | {
      kind: "circle";
      center: google.maps.LatLngLiteral;
      radius: number;
    }
  | {
      kind: "polygon";
      path: number[][];
      center: google.maps.LatLngLiteral;
    };

export interface GeofenceMapPickerProps {
  type: "polygon" | "circle";
  latitude?: number | null;
  longitude?: number | null;
  radius?: number | null;
  polygon?: number[][] | null;
  onShapeChange: (payload: ShapeChangePayload) => void;
  onClear?: (nextType?: "polygon" | "circle") => void;
  className?: string;
  showClearButton?: boolean;
  isReadOnly?: boolean;
}

export interface GeofenceMapPickerRef {
  clearShape: (
    nextType?: "polygon" | "circle",
    options?: { notify?: boolean }
  ) => void;
}

const DEFAULT_CENTER: google.maps.LatLngLiteral = {
  lat: 6.5244,
  lng: 3.3792,
};

const SHAPE_STYLE = {
  strokeColor: "#2563eb",
  strokeOpacity: 0.8,
  strokeWeight: 2,
  fillColor: "#3b82f6",
  fillOpacity: 0.2,
};

function getGoogleMapsNamespace(): typeof google | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }
  return (window as typeof window & { google?: typeof google }).google;
}

let googleMapsPromise: Promise<typeof google> | null = null;

function loadGoogleMapsApi(): Promise<typeof google> {
  if (typeof window === "undefined") {
    return Promise.reject(
      new Error("Google Maps can only be loaded in the browser.")
    );
  }

  const existingNamespace = getGoogleMapsNamespace();
  if (existingNamespace?.maps) {
    return Promise.resolve(existingNamespace);
  }

  if (!googleMapsPromise) {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      googleMapsPromise = Promise.reject(
        new Error(
          "Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY environment variable."
        )
      );
      return googleMapsPromise;
    }

    googleMapsPromise = new Promise<typeof google>((resolve, reject) => {
      const existingScript = document.querySelector<HTMLScriptElement>(
        'script[data-google-maps-loader="true"]'
      );

      if (existingScript) {
        existingScript.addEventListener("load", () => {
          const namespace = getGoogleMapsNamespace();
          if (namespace) {
            resolve(namespace);
          } else {
            reject(new Error("Google Maps failed to load."));
          }
        });
        existingScript.addEventListener("error", () =>
          reject(new Error("Google Maps script failed to load."))
        );
        return;
      }

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
      script.async = true;
      script.defer = true;
      script.dataset.googleMapsLoader = "true";
      script.onload = () => {
        const namespace = getGoogleMapsNamespace();
        if (namespace) {
          resolve(namespace);
        } else {
          reject(new Error("Google Maps failed to load."));
        }
      };
      script.onerror = () =>
        reject(new Error("Failed to load Google Maps script."));
      document.head.appendChild(script);
    });
  }

  return googleMapsPromise;
}

function computePolygonCentroid(path: number[][]): google.maps.LatLngLiteral {
  if (!path.length) {
    return DEFAULT_CENTER;
  }

  const { latSum, lngSum } = path.reduce(
    (acc, [lat, lng]) => ({
      latSum: acc.latSum + lat,
      lngSum: acc.lngSum + lng,
    }),
    { latSum: 0, lngSum: 0 }
  );

  return {
    lat: latSum / path.length,
    lng: lngSum / path.length,
  };
}

function computeDistanceMeters(
  a: google.maps.LatLngLiteral,
  b: google.maps.LatLngLiteral
): number {
  const earthRadius = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h =
    sinDLat * sinDLat +
    Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  return 2 * earthRadius * Math.asin(Math.min(1, Math.sqrt(h)));
}

const REQUIRED_LIBRARIES = ["maps", "places"] as const;

async function ensureLibraries(googleMaps: typeof google): Promise<void> {
  const importLibrary = googleMaps.maps?.importLibrary;
  if (typeof importLibrary === "function") {
    for (const library of REQUIRED_LIBRARIES) {
      try {
        await importLibrary(library as any);
      } catch (error) {
        console.warn(`Failed to import Google Maps library: ${library}`, error);
      }
    }
  }
}

function hasExistingShape(
  type: "polygon" | "circle",
  latitude?: number | null,
  longitude?: number | null,
  radius?: number | null,
  polygon?: number[][] | null
): boolean {
  if (type === "circle") {
    return latitude != null && longitude != null && !!radius;
  }
  return !!polygon && polygon.length >= 3;
}

const GeofenceMapPickerInner = forwardRef<
  GeofenceMapPickerRef,
  GeofenceMapPickerProps
>(
  (
    {
      type,
      latitude,
      longitude,
      radius,
      polygon,
      onShapeChange,
      onClear,
      className,
      showClearButton = true,
      isReadOnly = false,
    },
    ref
  ) => {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<google.maps.Map | null>(null);
    const activeShapeRef = useRef<
      google.maps.Circle | google.maps.Polygon | null
    >(null);
    const previewOverlayRef = useRef<
      google.maps.Polyline | google.maps.Circle | null
    >(null);
    const drawingListenersRef = useRef<google.maps.MapsEventListener[]>([]);
    const polygonPointsRef = useRef<google.maps.LatLng[]>([]);
    const circleCenterRef = useRef<google.maps.LatLng | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [polygonPointCount, setPolygonPointCount] = useState(0);
    const [circleStep, setCircleStep] = useState<"center" | "radius">("center");
    const geometrySignatureRef = useRef<string>("");
    const isInternalShapeUpdateRef = useRef(false);
    const renderInitialShapeRef = useRef<
      (options?: { fitCamera?: boolean }) => void
    >(() => undefined);

    const geometrySignature = useMemo(() => {
      return JSON.stringify({
        type,
        latitude,
        longitude,
        radius,
        polygon,
      });
    }, [type, latitude, longitude, radius, polygon]);

    const initialCenter = useMemo<google.maps.LatLngLiteral>(() => {
      if (latitude != null && longitude != null) {
        return { lat: latitude, lng: longitude };
      }

      if (polygon && polygon.length > 0) {
        return computePolygonCentroid(polygon);
      }

      return DEFAULT_CENTER;
    }, [latitude, longitude, polygon]);

    const clearDrawingListeners = React.useCallback(() => {
      drawingListenersRef.current.forEach((listener) =>
        google.maps.event.removeListener(listener)
      );
      drawingListenersRef.current = [];
    }, []);

    const clearPreviewOverlay = React.useCallback(() => {
      if (previewOverlayRef.current) {
        previewOverlayRef.current.setMap(null);
        previewOverlayRef.current = null;
      }
    }, []);

    const resetDrawingState = React.useCallback(() => {
      polygonPointsRef.current = [];
      circleCenterRef.current = null;
      setPolygonPointCount(0);
      setCircleStep("center");
      clearPreviewOverlay();
    }, [clearPreviewOverlay]);

    const stopDrawingMode = React.useCallback(() => {
      clearDrawingListeners();
      resetDrawingState();
      setIsDrawing(false);
    }, [clearDrawingListeners, resetDrawingState]);

    const clearShape = React.useCallback(
      (nextType?: "polygon" | "circle", options?: { notify?: boolean }) => {
        if (activeShapeRef.current) {
          activeShapeRef.current.setMap(null);
          activeShapeRef.current = null;
        }
        stopDrawingMode();
        if (options?.notify !== false) {
          onClear?.(nextType);
        }
        geometrySignatureRef.current = JSON.stringify({
          type: nextType ?? type,
          latitude: null,
          longitude: null,
          radius: (nextType ?? type) === "polygon" ? 0 : null,
          polygon: null,
        });
      },
      [onClear, stopDrawingMode, type]
    );

    useImperativeHandle(ref, () => ({
      clearShape,
    }));

    const attachPolygonListeners = React.useCallback(
      (polygonShape: google.maps.Polygon) => {
        const updatePath = () => {
          const path = polygonShape
            .getPath()
            .getArray()
            .map(
              (latLng) => [latLng.lat(), latLng.lng()] as number[][][number]
            );

          const center = computePolygonCentroid(path);
          isInternalShapeUpdateRef.current = true;
          geometrySignatureRef.current = JSON.stringify({
            type: "polygon",
            latitude: center.lat,
            longitude: center.lng,
            radius: 0,
            polygon: path,
          });
          onShapeChange({
            kind: "polygon",
            path,
            center,
          });
        };

        google.maps.event.addListener(
          polygonShape.getPath(),
          "set_at",
          updatePath
        );
        google.maps.event.addListener(
          polygonShape.getPath(),
          "insert_at",
          updatePath
        );
        google.maps.event.addListener(
          polygonShape.getPath(),
          "remove_at",
          updatePath
        );
        updatePath();
      },
      [onShapeChange]
    );

    const attachCircleListeners = React.useCallback(
      (circle: google.maps.Circle) => {
        const updateCircle = () => {
          const center = circle.getCenter();
          if (!center) return;
          isInternalShapeUpdateRef.current = true;
          geometrySignatureRef.current = JSON.stringify({
            type: "circle",
            latitude: center.lat(),
            longitude: center.lng(),
            radius: circle.getRadius(),
            polygon: null,
          });
          onShapeChange({
            kind: "circle",
            center: {
              lat: center.lat(),
              lng: center.lng(),
            },
            radius: circle.getRadius(),
          });
        };

        google.maps.event.addListener(circle, "center_changed", updateCircle);
        google.maps.event.addListener(circle, "radius_changed", updateCircle);
        updateCircle();
      },
      [onShapeChange]
    );

    const finalizePolygon = React.useCallback(
      (googleMaps: typeof google) => {
        const points = polygonPointsRef.current;
        if (!mapRef.current || points.length < 3) {
          return;
        }

        clearPreviewOverlay();
        clearDrawingListeners();
        resetDrawingState();
        setIsDrawing(false);

        const polygonShape = new googleMaps.maps.Polygon({
          paths: points.map((latLng) => ({
            lat: latLng.lat(),
            lng: latLng.lng(),
          })),
          ...SHAPE_STYLE,
          draggable: false,
          editable: true,
          map: mapRef.current,
        });

        activeShapeRef.current = polygonShape;
        attachPolygonListeners(polygonShape);
      },
      [
        attachPolygonListeners,
        clearDrawingListeners,
        clearPreviewOverlay,
        resetDrawingState,
      ]
    );

    const finalizeCircle = React.useCallback(
      (googleMaps: typeof google, center: google.maps.LatLng, radiusMeters: number) => {
        if (!mapRef.current || radiusMeters <= 0) {
          return;
        }

        clearPreviewOverlay();
        clearDrawingListeners();
        resetDrawingState();
        setIsDrawing(false);

        const circle = new googleMaps.maps.Circle({
          ...SHAPE_STYLE,
          draggable: true,
          editable: true,
          center: { lat: center.lat(), lng: center.lng() },
          radius: radiusMeters,
          map: mapRef.current,
        });

        activeShapeRef.current = circle;
        attachCircleListeners(circle);
      },
      [
        attachCircleListeners,
        clearDrawingListeners,
        clearPreviewOverlay,
        resetDrawingState,
      ]
    );

    const startDrawingMode = React.useCallback(
      (drawType: "polygon" | "circle") => {
        const googleMaps = getGoogleMapsNamespace();
        if (!mapRef.current || !googleMaps || isReadOnly) {
          return;
        }

        if (activeShapeRef.current) {
          return;
        }

        stopDrawingMode();
        resetDrawingState();
        setIsDrawing(true);

        if (drawType === "polygon") {
          const clickListener = mapRef.current.addListener(
            "click",
            (event: google.maps.MapMouseEvent) => {
              if (!event.latLng) return;

              polygonPointsRef.current = [
                ...polygonPointsRef.current,
                event.latLng,
              ];
              setPolygonPointCount(polygonPointsRef.current.length);

              if (previewOverlayRef.current) {
                previewOverlayRef.current.setMap(null);
              }

              previewOverlayRef.current = new googleMaps.maps.Polyline({
                path: polygonPointsRef.current,
                strokeColor: SHAPE_STYLE.strokeColor,
                strokeOpacity: SHAPE_STYLE.strokeOpacity,
                strokeWeight: SHAPE_STYLE.strokeWeight,
                map: mapRef.current!,
              });
            }
          );
          drawingListenersRef.current.push(clickListener);
          return;
        }

        const clickListener = mapRef.current.addListener(
          "click",
          (event: google.maps.MapMouseEvent) => {
            if (!event.latLng) return;

            if (!circleCenterRef.current) {
              circleCenterRef.current = event.latLng;
              setCircleStep("radius");

              previewOverlayRef.current = new googleMaps.maps.Circle({
                ...SHAPE_STYLE,
                center: {
                  lat: event.latLng.lat(),
                  lng: event.latLng.lng(),
                },
                radius: 1,
                map: mapRef.current!,
              });
              return;
            }

            const center = circleCenterRef.current;
            const radiusMeters = computeDistanceMeters(
              { lat: center.lat(), lng: center.lng() },
              { lat: event.latLng.lat(), lng: event.latLng.lng() }
            );
            finalizeCircle(googleMaps, center, radiusMeters);
          }
        );

        const moveListener = mapRef.current.addListener(
          "mousemove",
          (event: google.maps.MapMouseEvent) => {
            if (!circleCenterRef.current || !event.latLng) return;

            const previewCircle = previewOverlayRef.current;
            if (!(previewCircle instanceof googleMaps.maps.Circle)) {
              return;
            }

            const radiusMeters = computeDistanceMeters(
              {
                lat: circleCenterRef.current.lat(),
                lng: circleCenterRef.current.lng(),
              },
              { lat: event.latLng.lat(), lng: event.latLng.lng() }
            );
            previewCircle.setRadius(radiusMeters);
          }
        );

        drawingListenersRef.current.push(clickListener, moveListener);
      },
      [
        finalizeCircle,
        isReadOnly,
        resetDrawingState,
        stopDrawingMode,
      ]
    );

    const renderInitialShape = React.useCallback(
      (options?: { fitCamera?: boolean }) => {
        const googleMaps = getGoogleMapsNamespace();
        if (!mapRef.current || !googleMaps) return;

        const fitCamera = options?.fitCamera ?? false;

        stopDrawingMode();

        if (activeShapeRef.current) {
          activeShapeRef.current.setMap(null);
          activeShapeRef.current = null;
        }

        if (type === "circle") {
          if (latitude == null || longitude == null || !radius) {
            if (!isReadOnly) {
              startDrawingMode("circle");
            }
            return;
          }

          const circle = new googleMaps.maps.Circle({
            ...SHAPE_STYLE,
            draggable: !isReadOnly,
            editable: !isReadOnly,
            center: { lat: latitude, lng: longitude },
            radius,
            map: mapRef.current,
          });

          activeShapeRef.current = circle;
          if (fitCamera) {
            mapRef.current.fitBounds(circle.getBounds()!);
          }
          attachCircleListeners(circle);
          return;
        }

        if (!polygon || polygon.length === 0) {
          if (!isReadOnly) {
            startDrawingMode("polygon");
          }
          return;
        }

        const polygonShape = new googleMaps.maps.Polygon({
          paths: polygon.map(([lat, lng]) => ({ lat, lng })),
          ...SHAPE_STYLE,
          draggable: false,
          editable: !isReadOnly,
          map: mapRef.current,
        });

        activeShapeRef.current = polygonShape;

        if (fitCamera) {
          const bounds = new googleMaps.maps.LatLngBounds();
          polygonShape.getPath().forEach((latLng) => bounds.extend(latLng));
          mapRef.current.fitBounds(bounds);
        }

        attachPolygonListeners(polygonShape);
      },
      [
        attachCircleListeners,
        attachPolygonListeners,
        isReadOnly,
        latitude,
        longitude,
        polygon,
        radius,
        startDrawingMode,
        stopDrawingMode,
        type,
      ]
    );

    renderInitialShapeRef.current = renderInitialShape;

    const handleFinishPolygon = React.useCallback(() => {
      const googleMaps = getGoogleMapsNamespace();
      if (!googleMaps) return;
      finalizePolygon(googleMaps);
    }, [finalizePolygon]);

    const handleUndoPolygonPoint = React.useCallback(() => {
      const googleMaps = getGoogleMapsNamespace();
      if (!googleMaps || polygonPointsRef.current.length === 0) {
        return;
      }

      polygonPointsRef.current = polygonPointsRef.current.slice(0, -1);
      setPolygonPointCount(polygonPointsRef.current.length);

      if (previewOverlayRef.current) {
        previewOverlayRef.current.setMap(null);
        previewOverlayRef.current = null;
      }

      if (polygonPointsRef.current.length > 0 && mapRef.current) {
        previewOverlayRef.current = new googleMaps.maps.Polyline({
          path: polygonPointsRef.current,
          strokeColor: SHAPE_STYLE.strokeColor,
          strokeOpacity: SHAPE_STYLE.strokeOpacity,
          strokeWeight: SHAPE_STYLE.strokeWeight,
          map: mapRef.current,
        });
      }
    }, []);

    // Load Google Maps once — do not re-create the map when shape props change
    useEffect(() => {
      let cancelled = false;

      setIsLoading(true);
      loadGoogleMapsApi()
        .then(async (googleMaps) => {
          if (cancelled || !mapContainerRef.current) {
            return;
          }

          await ensureLibraries(googleMaps);

          if (cancelled || !mapContainerRef.current) {
            return;
          }

          mapRef.current = new googleMaps.maps.Map(mapContainerRef.current, {
            center: initialCenter,
            zoom: 12,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
          });

          geometrySignatureRef.current = geometrySignature;
          renderInitialShapeRef.current({ fitCamera: true });

          if (!cancelled) {
            setIsLoading(false);
          }
        })
        .catch((err) => {
          console.error(err);
          if (!cancelled) {
            setError(err.message || "Unable to load Google Maps.");
            setIsLoading(false);
          }
        });

      return () => {
        cancelled = true;
        stopDrawingMode();
        if (activeShapeRef.current) {
          activeShapeRef.current.setMap(null);
          activeShapeRef.current = null;
        }
        mapRef.current = null;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps -- map is created once on mount
    }, []);

    // React to external prop changes (paste coordinates, type switch, clear) — not map drags
    useEffect(() => {
      if (geometrySignatureRef.current === geometrySignature) {
        return;
      }

      if (isInternalShapeUpdateRef.current) {
        isInternalShapeUpdateRef.current = false;
        geometrySignatureRef.current = geometrySignature;
        return;
      }

      if (!mapRef.current) {
        return;
      }

      geometrySignatureRef.current = geometrySignature;
      renderInitialShapeRef.current({ fitCamera: true });
    }, [geometrySignature]);

    const drawingInstructions = useMemo(() => {
      if (isReadOnly) {
        return "This map shows the current geofence shape.";
      }
      if (isDrawing) {
        if (type === "polygon") {
          return "Click the map to add points. Use Finish when you have at least 3 points.";
        }
        if (circleStep === "center") {
          return "Click the map to set the circle center.";
        }
        return "Move the mouse to preview the radius, then click again to finish.";
      }
      if (
        hasExistingShape(type, latitude, longitude, radius, polygon ?? undefined)
      ) {
        return `Drag vertices to adjust the ${type}.`;
      }
      return `Use the map to draw a ${type}.`;
    }, [
      circleStep,
      isDrawing,
      isReadOnly,
      latitude,
      longitude,
      polygon,
      radius,
      type,
    ]);

    return (
      <div className={cn("space-y-3", className)}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-foreground">
              {isReadOnly ? "Geofence Snapshot" : "Draw Geofence"}
            </p>
            <p className="text-xs text-muted-foreground">{drawingInstructions}</p>
          </div>
          <div className="flex items-center gap-2">
            {isDrawing && type === "polygon" && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleUndoPolygonPoint}
                  disabled={polygonPointCount === 0 || isLoading}
                >
                  Undo Point
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleFinishPolygon}
                  disabled={polygonPointCount < 3 || isLoading}
                >
                  Finish Polygon
                </Button>
              </>
            )}
            {showClearButton && !isReadOnly && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  clearShape(undefined, { notify: true });
                  if (!isReadOnly) {
                    startDrawingMode(type);
                  }
                }}
                disabled={isLoading}
              >
                Clear Shape
              </Button>
            )}
          </div>
        </div>

        <div className="relative h-[600px] w-full overflow-hidden rounded-lg border">
          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80">
              <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading Google Maps…
              </div>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80">
              <div className="max-w-sm text-center text-sm text-destructive">
                {error}
              </div>
            </div>
          )}
          <div ref={mapContainerRef} className="h-full w-full" />
        </div>
      </div>
    );
  }
);

GeofenceMapPickerInner.displayName = "GeofenceMapPicker";

function arePropsEqual(
  prev: GeofenceMapPickerProps,
  next: GeofenceMapPickerProps
): boolean {
  const prevPolygonSig = prev.polygon ? JSON.stringify(prev.polygon) : "";
  const nextPolygonSig = next.polygon ? JSON.stringify(next.polygon) : "";

  return (
    prev.type === next.type &&
    prev.latitude === next.latitude &&
    prev.longitude === next.longitude &&
    prev.radius === next.radius &&
    prevPolygonSig === nextPolygonSig &&
    prev.onShapeChange === next.onShapeChange &&
    prev.onClear === next.onClear &&
    prev.className === next.className
  );
}

const GeofenceMapPicker = memo(GeofenceMapPickerInner, arePropsEqual);

export default GeofenceMapPicker;
