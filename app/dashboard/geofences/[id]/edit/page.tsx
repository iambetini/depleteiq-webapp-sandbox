"use client";

import GeofenceForm, {
  type GeofenceFormValues,
} from "@/components/geofences/GeofenceForm";
import ViewPageHeader from "@/components/dashboard/ViewPageHeader";
import { catchError } from "@/lib/utils";
import { useUpdateGeofenceMutation } from "@/store/geofences";
import { useRouter } from "next/navigation";
import { useContext } from "../layout";
import { useToast } from "@/hooks/use-toast";

function ensureClosedPolygon(points: any): any {
  if (!Array.isArray(points) || points.length === 0) return points;

  const first = points[0];
  const last = points[points.length - 1];

  const isSamePoint =
    Array.isArray(first) &&
    Array.isArray(last) &&
    first.length === last.length &&
    first.every((value, index) => Number(value) === Number(last[index]));

  if (isSamePoint) return points;

  const firstCopy = Array.isArray(first) ? [...first] : first;
  return [...points, firstCopy];
}

/** Normalize API polygon (string or array) to form string for polygon_input */
function polygonToInput(
  polygon: string | number[][] | null | undefined,
): string {
  if (polygon == null) return "";
  if (typeof polygon === "string") {
    try {
      const parsed = JSON.parse(polygon);
      return Array.isArray(parsed) ? JSON.stringify(parsed) : "";
    } catch {
      return "";
    }
  }
  if (Array.isArray(polygon)) return JSON.stringify(polygon);
  return "";
}

export default function EditGeofencePage() {
  const router = useRouter();
  const { geofence, isLoading, fetchEntity } = useContext();
  const [updateGeofence, { isLoading: isUpdating }] =
    useUpdateGeofenceMutation();
  const { toast } = useToast();

  if (!geofence) {
    return null;
  }

  const initialValues: GeofenceFormValues = {
    name: geofence.name ?? "",
    type: (geofence.type as "polygon" | "circle") ?? "polygon",
    latitude: (geofence as any).center_latitude ?? "",
    longitude: (geofence as any).center_longitude ?? "",
    radius: geofence.radius ?? (geofence.type === "polygon" ? "0" : ""),
    polygon_input: polygonToInput(geofence.polygon),
    description: (geofence as any).description ?? "",
  };

  const handleSubmit = async (
    values: GeofenceFormValues,
    { setSubmitting, setFieldError }: any,
  ) => {
    try {
      // Map form fields to API expected payload
      const payload: Record<string, any> = {
        type: values.type,
        description: values.description || null,
        center_latitude: values.latitude || null,
        center_longitude: values.longitude || null,
        radius:
          values.type === "polygon"
            ? 0
            : values.radius
              ? Math.round(Number(values.radius))
              : null,
        // preserve existing status if present
        status: (geofence as any).status ?? "active",
      };

      // Only send `name` if it changed, so backend doesn't complain about uniqueness
      if (values.name !== (geofence.name ?? "")) {
        payload.name = values.name;
      }

      if (values.type === "polygon") {
        // For polygon, send parsed JSON (not stringified)
        if (values.polygon_input) {
          try {
            const parsed = JSON.parse(values.polygon_input);
            payload.polygon = ensureClosedPolygon(parsed);
          } catch (error) {
            setFieldError("polygon_input", "Polygon must be valid JSON");
            return;
          }
        } else {
          payload.polygon = [];
        }
      }
      // For circle, don't include polygon field at all (use center_latitude, center_longitude, and radius instead)

      await updateGeofence({ id: geofence.uuid, data: payload }).unwrap();
      await fetchEntity();
      toast({
        title: "Geofence updated",
        description: "Geofence has been updated successfully.",
      });
      router.push(`/dashboard/geofences/${geofence.uuid}`);
    } catch (error: any) {
      catchError(error, setFieldError);
      const backendMessage =
        error?.error ||
        error?.data?.[0]?.message ||
        error?.message ||
        error?.errors?.[0]?.message ||
        "Please try again.";
      toast({
        title: "Failed to update geofence",
        description: backendMessage,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <ViewPageHeader title="Update Geofence" description={geofence.name} />
      <GeofenceForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
        submitLabel="Update Geofence"
        onCancel={() => router.push(`/dashboard/geofences/${geofence.uuid}`)}
        isLoading={isLoading || isUpdating}
      />
    </div>
  );
}
