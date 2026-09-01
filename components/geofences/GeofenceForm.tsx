"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import GeofenceMapPicker, {
  GeofenceMapPickerRef,
  ShapeChangePayload,
} from "@/components/geofences/GeofenceMapPicker";
import { cn } from "@/lib/utils";
import { Form, Formik, type FormikHelpers } from "formik";
import { Loader2, Plus } from "lucide-react";
import { memo, useMemo, useRef, useEffect, useCallback, useState } from "react";
import { useFormikContext } from "formik";
import * as Yup from "yup";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export interface GeofenceFormValues {
  name: string;
  type: "polygon" | "circle";
  latitude: string;
  longitude: string;
  radius: string;
  polygon_input: string;
  description: string;
}

interface GeofenceFormProps {
  initialValues: GeofenceFormValues;
  onSubmit: (
    values: GeofenceFormValues,
    helpers: FormikHelpers<GeofenceFormValues>
  ) => Promise<void>;
  submitLabel: string;
  onCancel: () => void;
  isSubmitting?: boolean;
  isLoading?: boolean;
  className?: string;
}

const validationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  type: Yup.mixed<"polygon" | "circle">()
    .oneOf(["polygon", "circle"])
    .required("Type is required"),
  latitude: Yup.string().when("type", {
    is: "circle",
    then: (schema) => schema.required("Latitude is required"),
    otherwise: (schema) => schema.optional(),
  }),
  longitude: Yup.string().when("type", {
    is: "circle",
    then: (schema) => schema.required("Longitude is required"),
    otherwise: (schema) => schema.optional(),
  }),
  radius: Yup.string().when("type", {
    is: "circle",
    then: (schema) =>
      schema
        .required("Radius is required")
        .test("positive", "Radius must be greater than zero", (value) => {
          if (!value) return false;
          return Number(value) > 0;
        }),
    otherwise: (schema) => schema.optional(),
  }),
  polygon_input: Yup.string().when("type", {
    is: "polygon",
    then: (schema) =>
      schema
        .required("Polygon coordinates are required")
        .test("valid-json", "Polygon must be valid JSON", (value) => {
          if (!value) return false;
          try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) && parsed.length >= 3;
          } catch (error) {
            return false;
          }
        }),
    otherwise: (schema) => schema.optional(),
  }),
  description: Yup.string().optional(),
});

function getPolygonPointCount(json: string | undefined): number {
  if (!json) return 0;
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
}

function parsePolygon(json: string | undefined): number[][] | null {
  if (!json) return null;
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function GeofenceForm({
  initialValues,
  onSubmit,
  submitLabel,
  onCancel,
  isSubmitting = false,
  isLoading = false,
  className,
}: GeofenceFormProps) {
  const mapRef = useRef<GeofenceMapPickerRef | null>(null);

  const sanitizedInitialValues = useMemo<GeofenceFormValues>(() => {
    // Ensure we always have radius for polygon type (even if legacy data omitted it)
    const baseRadius =
      initialValues.type === "polygon"
        ? initialValues.radius || "0"
        : initialValues.radius || "";

    return {
      ...initialValues,
      radius: baseRadius,
      description: initialValues.description || "",
    };
  }, [initialValues]);

  return (
    <Card className={cn("max-w-4xl", className)}>
      <CardHeader>
        <CardTitle>Geofence Details</CardTitle>
        <CardDescription>
          Provide a name, choose the geofence shape, and draw it on the map. For
          polygon geofences, add at least three points. Circle geofences require
          a center and radius.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Formik<GeofenceFormValues>
          initialValues={sanitizedInitialValues}
          validationSchema={validationSchema}
          enableReinitialize
          onSubmit={onSubmit}
        >
          {({
            values,
            errors,
            touched,
            setFieldValue,
            isSubmitting: formikSubmitting,
          }) => {
            const submitting = isSubmitting || formikSubmitting;
            const polygonPointCount = getPolygonPointCount(
              values.polygon_input
            );

            return (
              <Form className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={values.name}
                      onChange={(event) =>
                        setFieldValue("name", event.target.value)
                      }
                      placeholder="Enter geofence name"
                      autoComplete="off"
                    />
                    {touched.name && errors.name && (
                      <p className="text-sm text-destructive">{errors.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">
                      Type <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={values.type}
                      onValueChange={(value: "polygon" | "circle") => {
                        if (value === values.type) {
                          return;
                        }

                        setFieldValue("type", value);
                        // Reset geometry when switching type
                        setFieldValue("latitude", "");
                        setFieldValue("longitude", "");
                        setFieldValue("radius", value === "polygon" ? "0" : "");
                        setFieldValue("polygon_input", "");
                        mapRef.current?.clearShape(value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select geofence type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="polygon">Polygon</SelectItem>
                        <SelectItem value="circle">Circle</SelectItem>
                      </SelectContent>
                    </Select>
                    {touched.type && errors.type && (
                      <p className="text-sm text-destructive">
                        {errors.type as string}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={values.description}
                    onChange={(e) =>
                      setFieldValue("description", e.target.value)
                    }
                    placeholder="Optional description for the geofence"
                  />
                  {touched.description && errors.description && (
                    <p className="text-sm text-destructive">
                      {errors.description}
                    </p>
                  )}
                </div>

                <GeofenceMapSection mapRef={mapRef} />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label className="text-sm text-muted-foreground">
                      Latitude
                    </Label>
                    <Input
                      value={values.latitude}
                      readOnly
                      placeholder="Auto-filled from map"
                    />
                    {touched.latitude && errors.latitude && (
                      <p className="text-xs text-destructive">
                        {errors.latitude}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm text-muted-foreground">
                      Longitude
                    </Label>
                    <Input
                      value={values.longitude}
                      readOnly
                      placeholder="Auto-filled from map"
                    />
                    {touched.longitude && errors.longitude && (
                      <p className="text-xs text-destructive">
                        {errors.longitude}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm text-muted-foreground">
                      {values.type === "circle"
                        ? "Radius (meters)"
                        : "Polygon Points"}
                    </Label>
                    <Input
                      value={
                        values.type === "circle"
                          ? values.radius
                          : polygonPointCount
                      }
                      readOnly
                      placeholder={
                        values.type === "circle"
                          ? "Radius will appear after drawing"
                          : "Points will appear after drawing"
                      }
                    />
                    {values.type === "circle" &&
                      touched.radius &&
                      errors.radius && (
                        <p className="text-xs text-destructive">
                          {errors.radius}
                        </p>
                      )}
                    {values.type === "polygon" &&
                      touched.polygon_input &&
                      errors.polygon_input && (
                        <p className="text-xs text-destructive">
                          {errors.polygon_input}
                        </p>
                      )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="btn-primary"
                    disabled={submitting || isLoading}
                  >
                    {submitting || isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      submitLabel
                    )}
                  </Button>
                </div>
              </Form>
            );
          }}
        </Formik>
      </CardContent>
    </Card>
  );
}

export default GeofenceForm;

interface GeofenceMapSectionProps {
  mapRef: React.RefObject<GeofenceMapPickerRef | null>;
}

const GeofenceMapSection = memo(function GeofenceMapSection({
  mapRef,
}: GeofenceMapSectionProps) {
  const { values, setFieldValue } = useFormikContext<GeofenceFormValues>();
  const latestValuesRef = useRef(values);
  const [coordinateInput, setCoordinateInput] = useState("");
  const [parseError, setParseError] = useState<string | null>(null);
  const [isCoordinateInputOpen, setIsCoordinateInputOpen] = useState(false);

  useEffect(() => {
    latestValuesRef.current = values;
  }, [values]);

  const handleShapeChange = useCallback(
    (payload: ShapeChangePayload) => {
      const current = latestValuesRef.current;
      if (payload.kind === "circle") {
        const latStr = payload.center.lat.toString();
        const lngStr = payload.center.lng.toString();
        const radiusStr = payload.radius.toString();

        if (latStr !== current.latitude)
          setFieldValue("latitude", latStr, false);
        if (lngStr !== current.longitude)
          setFieldValue("longitude", lngStr, false);
        if (radiusStr !== current.radius)
          setFieldValue("radius", radiusStr, false);
        if (current.polygon_input !== "")
          setFieldValue("polygon_input", "", false);
      } else {
        const serialized = JSON.stringify(payload.path);
        const latStr = payload.center.lat.toString();
        const lngStr = payload.center.lng.toString();

        if (serialized !== current.polygon_input)
          setFieldValue("polygon_input", serialized, false);
        if (latStr !== current.latitude)
          setFieldValue("latitude", latStr, false);
        if (lngStr !== current.longitude)
          setFieldValue("longitude", lngStr, false);
        if (current.radius !== "0") setFieldValue("radius", "0", false);
      }
    },
    [setFieldValue]
  );

  const handleClear = useCallback(
    (nextType?: "polygon" | "circle") => {
      const targetType = nextType ?? latestValuesRef.current.type;
      setFieldValue("latitude", "", false);
      setFieldValue("longitude", "", false);
      setFieldValue("radius", targetType === "polygon" ? "0" : "", false);
      setFieldValue("polygon_input", "", false);
    },
    [setFieldValue]
  );

  const handleAssignRef = useCallback(
    (instance: GeofenceMapPickerRef | null) => {
      if (mapRef) {
        (
          mapRef as React.MutableRefObject<GeofenceMapPickerRef | null>
        ).current = instance;
      }
    },
    [mapRef]
  );

  const parseCoordinates = useCallback((input: string): number[][] | null => {
    if (!input.trim()) {
      return null;
    }

    try {
      // Try parsing as JSON array first
      const parsed = JSON.parse(input);
      if (Array.isArray(parsed) && parsed.length >= 3) {
        // Validate that each element is a coordinate pair
        const isValid = parsed.every(
          (coord) =>
            Array.isArray(coord) &&
            coord.length === 2 &&
            typeof coord[0] === "number" &&
            typeof coord[1] === "number"
        );
        if (isValid) {
          return parsed;
        }
      }
    } catch (e) {
      // Not JSON, try other formats
    }

    // Try parsing as comma-separated lat,lng pairs (one per line or all in one line)
    const lines = input.split(/[\n;]/).filter((line) => line.trim());
    const coordinates: number[][] = [];

    for (const line of lines) {
      const parts = line.split(",").map((p) => p.trim());
      if (parts.length === 2) {
        const lat = parseFloat(parts[0]);
        const lng = parseFloat(parts[1]);
        if (!isNaN(lat) && !isNaN(lng)) {
          coordinates.push([lat, lng]);
        }
      } else if (parts.length % 2 === 0 && parts.length >= 2) {
        // Handle multiple coordinates in one line (lat1,lng1,lat2,lng2,...)
        for (let i = 0; i < parts.length; i += 2) {
          const lat = parseFloat(parts[i]);
          const lng = parseFloat(parts[i + 1]);
          if (!isNaN(lat) && !isNaN(lng)) {
            coordinates.push([lat, lng]);
          }
        }
      }
    }

    return coordinates.length >= 3 ? coordinates : null;
  }, []);

  const handleDrawFromCoordinates = useCallback(() => {
    setParseError(null);

    if (values.type !== "polygon") {
      setParseError("Coordinate input is only available for polygon geofences");
      return;
    }

    const coordinates = parseCoordinates(coordinateInput);

    if (!coordinates) {
      setParseError(
        "Invalid coordinate format. Please provide at least 3 coordinate pairs in format: [[lat1,lng1],[lat2,lng2],...] or lat1,lng1 (one per line)"
      );
      return;
    }

    if (coordinates.length < 3) {
      setParseError("A polygon requires at least 3 coordinate points");
      return;
    }

    // Calculate centroid
    const center = coordinates.reduce(
      (acc, [lat, lng]) => ({
        lat: acc.lat + lat / coordinates.length,
        lng: acc.lng + lng / coordinates.length,
      }),
      { lat: 0, lng: 0 }
    );

    // Update form values
    setFieldValue("polygon_input", JSON.stringify(coordinates), false);
    setFieldValue("latitude", center.lat.toString(), false);
    setFieldValue("longitude", center.lng.toString(), false);
    setFieldValue("radius", "0", false);

    // Clear the input and close the collapsible
    setCoordinateInput("");
    setIsCoordinateInputOpen(false);
  }, [coordinateInput, values.type, parseCoordinates, setFieldValue]);

  return (
    <div className="space-y-3">
      {values.type === "polygon" && (
        <Collapsible
          open={isCoordinateInputOpen}
          onOpenChange={setIsCoordinateInputOpen}
        >
          <CollapsibleTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              {isCoordinateInputOpen
                ? "Hide Coordinate Input"
                : "Paste Coordinates"}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Paste Coordinates
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Paste coordinates as JSON{" "}
                  <code className="text-xs bg-muted px-1 rounded">
                    [[lat,lng],[lat,lng],...]
                  </code>{" "}
                  or as one pair per line{" "}
                  <code className="text-xs bg-muted px-1 rounded">
                    lat,lng
                  </code>
                  . At least 3 points are required.
                </p>
              </div>
              <Textarea
                value={coordinateInput}
                onChange={(e) => {
                  setCoordinateInput(e.target.value);
                  setParseError(null);
                }}
                placeholder={`[[6.5244, 3.3792], [6.5300, 3.3850], [6.5200, 3.3900]]\n\nor one per line:\n6.5244, 3.3792\n6.5300, 3.3850\n6.5200, 3.3900`}
                className="min-h-[120px] font-mono text-xs"
              />
              {parseError && (
                <p className="text-xs text-destructive">{parseError}</p>
              )}
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleDrawFromCoordinates}
                  disabled={!coordinateInput.trim()}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Draw on Map
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCoordinateInput("");
                    setParseError(null);
                  }}
                  disabled={!coordinateInput.trim()}
                >
                  Clear
                </Button>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
      <GeofenceMapPicker
        ref={handleAssignRef}
        type={values.type}
        latitude={values.latitude ? Number(values.latitude) : null}
        longitude={values.longitude ? Number(values.longitude) : null}
        radius={values.radius ? Number(values.radius) : null}
        polygon={parsePolygon(values.polygon_input)}
        onShapeChange={handleShapeChange}
        onClear={handleClear}
      />
    </div>
  );
});
