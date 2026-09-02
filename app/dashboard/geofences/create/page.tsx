"use client";

import GeofenceForm, {
  type GeofenceFormValues,
} from "@/components/geofences/GeofenceForm";
import ViewPageHeader from "@/components/dashboard/ViewPageHeader";
import { catchError } from "@/lib/utils";
import { useCreateGeofenceMutation } from "@/store/geofences";
import { useRouter } from "next/navigation";
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

  // Append a copy of the first point to close the polygon
  const firstCopy = Array.isArray(first) ? [...first] : first;
  return [...points, firstCopy];
}

const DEFAULT_FORM_VALUES: GeofenceFormValues = {
  name: "",
  type: "polygon",
  latitude: "",
  longitude: "",
  radius: "0",
  polygon_input: "",
  description: "",
};

export default function CreateGeofencePage() {
  const router = useRouter();
  const [createGeofence, { isLoading }] = useCreateGeofenceMutation();
  const { toast } = useToast();

  const handleSubmit = async (
    values: GeofenceFormValues,
    { setSubmitting, setFieldError }: any,
  ) => {
    try {
      const payload: Record<string, any> = {
        name: values.name,
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
        status: (values as any).status || "active",
      };

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

      const response: any = await createGeofence({ data: payload }).unwrap();
      const uuid = response?.uuid ?? response?.data?.item?.uuid ?? "";
      toast({
        title: "Geofence created",
        description: "Geofence has been created successfully.",
      });
      router.push(
        uuid ? `/dashboard/geofences/${uuid}` : "/dashboard/geofences",
      );
    } catch (error: any) {
      catchError(error, setFieldError);

      const backendMessage = 
        error?.error ||
        error?.data?.[0]?.message ||
        error?.message ||
        error?.errors?.[0]?.message ||
        "Failed to create geofence";

      toast({
        title: "Failed to create geofence",
        description: backendMessage,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <ViewPageHeader title="Create Geofence" />
      <GeofenceForm
        initialValues={DEFAULT_FORM_VALUES}
        onSubmit={handleSubmit}
        submitLabel="Create Geofence"
        onCancel={() => router.push("/dashboard/geofences")}
        isLoading={isLoading}
      />
    </div>
  );
}
