"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { MapPin } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";

// Google Places API types
interface PlaceResult {
  place_id: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number | (() => number);
      lng: number | (() => number);
    };
  };
  address_components: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
}

interface ParsedLocation {
  street: string;
  city: string;
  state: string;
  region: string;
  country: string;
  postal_code: string;
  latitude: number;
  longitude: number;
  formatted_address: string;
}

interface GooglePlacesAutocompleteProps {
  onLocationSelect: (location: ParsedLocation) => void;
  initialValue?: string;
  placeholder?: string;
  label?: string;
  className?: string;
  disabled?: boolean;
}

// Google Maps API types
interface GoogleMapsAPI {
  maps: {
    places: {
      Autocomplete: new (input: HTMLInputElement, options: any) => any;
    };
    event: {
      clearInstanceListeners: (instance: any) => void;
    };
  };
}

export function GooglePlacesAutocomplete({
  onLocationSelect,
  initialValue = "",
  placeholder = "Search for a location...",
  label = "Location",
  className,
  disabled = false,
}: GooglePlacesAutocompleteProps) {
  const [inputValue, setInputValue] = useState(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const autocompleteRef = useRef<HTMLInputElement>(null);
  const autocompleteInstanceRef = useRef<any>(null);

  // Parse Google Places API result into our location format
  const parsePlaceResult = useCallback((place: PlaceResult): ParsedLocation => {
    const components = place.address_components;

    // Extract coordinates - they might be functions or properties
    const lat = typeof place.geometry.location.lat === 'function'
      ? place.geometry.location.lat()
      : place.geometry.location.lat;
    const lng = typeof place.geometry.location.lng === 'function'
      ? place.geometry.location.lng()
      : place.geometry.location.lng;

    // Initialize with empty values
    const parsed: ParsedLocation = {
      street: "",
      city: "",
      state: "",
      region: "",
      country: "",
      postal_code: "",
      latitude: lat,
      longitude: lng,
      formatted_address: place.formatted_address,
    };

    // Parse address components
    components.forEach((component) => {
      const types = component.types;

      if (types.includes("street_number") || types.includes("route")) {
        parsed.street = parsed.street ? `${parsed.street} ${component.long_name}` : component.long_name;
      } else if (types.includes("locality")) {
        parsed.city = component.long_name;
      } else if (types.includes("administrative_area_level_1")) {
        parsed.state = component.long_name;
      } else if (types.includes("administrative_area_level_2")) {
        parsed.region = component.long_name;
      } else if (types.includes("country")) {
        parsed.country = component.long_name;
      } else if (types.includes("postal_code")) {
        parsed.postal_code = component.long_name;
      }
    });

    return parsed;
  }, []);

  // Initialize Google Places API
  useEffect(() => {
    const initializeGooglePlaces = () => {
      if ((window as any).google?.maps?.places) {
        setIsLoaded(true);
        return;
      }

      // Load Google Maps API if not already loaded
      if (!document.querySelector('script[src*="maps.googleapis.com"]')) {
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
          setIsLoaded(true);
        };
        script.onerror = () => {
          console.error("Failed to load Google Maps API");
        };
        document.head.appendChild(script);
      }
    };

    initializeGooglePlaces();
  }, []);

  // Initialize autocomplete when Google Maps is loaded
  useEffect(() => {
    if (!isLoaded || !autocompleteRef.current || disabled) return;

    const initializeAutocomplete = () => {
      if (autocompleteInstanceRef.current) {
        // Clean up existing instance
        (window.google as any).maps.event.clearInstanceListeners(autocompleteInstanceRef.current);
      }

      autocompleteInstanceRef.current = new (window.google as any).maps.places.Autocomplete(
        autocompleteRef.current,
        {
          types: ["address"],
          fields: ["place_id", "formatted_address", "geometry", "address_components"],
        }
      );

      // Listen for place selection
      autocompleteInstanceRef.current.addListener("place_changed", () => {
        const place = autocompleteInstanceRef.current.getPlace();

        if (place.place_id) {
          setIsLoading(true);
          try {
            const parsedLocation = parsePlaceResult(place);

            // Ensure coordinates are numbers, not strings
            const finalLocation = {
              ...parsedLocation,
              latitude: typeof parsedLocation.latitude === 'string' ? parseFloat(parsedLocation.latitude) : parsedLocation.latitude,
              longitude: typeof parsedLocation.longitude === 'string' ? parseFloat(parsedLocation.longitude) : parsedLocation.longitude,
            };

            // Clear the input after selection to show it was successful
            setInputValue("");
            onLocationSelect(finalLocation);
          } catch (error) {
            console.error("Error parsing place result:", error);
          } finally {
            setIsLoading(false);
          }
        }
      });
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(initializeAutocomplete, 100);
    return () => clearTimeout(timer);
  }, [isLoaded, disabled, parsePlaceResult, onLocationSelect]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (autocompleteInstanceRef.current) {
        (window.google as any)?.maps?.event?.clearInstanceListeners(autocompleteInstanceRef.current);
      }
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  return (
    <div className={cn("space-y-3", className)}>
      {label && <Label htmlFor="location-search" className="text-sm font-medium text-gray-700">{label}</Label>}
      <div className="relative">
        <Input
          ref={autocompleteRef}
          id="location-search"
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled || !isLoaded}
          className={cn(
            "w-full h-11 text-base",
            isLoading && "opacity-50"
          )}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
          </div>
        )}
        {!isLoading && isLoaded && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <MapPin className="h-4 w-4 text-gray-400" />
          </div>
        )}
      </div>
      {!isLoaded && (
        <div className="text-xs text-gray-500 flex items-center gap-2">
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
          Loading Google Places API...
        </div>
      )}
    </div>
  );
}
