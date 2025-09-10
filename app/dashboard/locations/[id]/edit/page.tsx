"use client";
import { LocationForm } from "@/components/dashboard/LocationForm";
import ViewPageHeader from "@/components/dashboard/ViewPageHeader";
import { toast } from "@/hooks/use-toast";
import { catchError } from "@/lib/utils";
import { useUpdateLocationMutation } from "@/store/locations";
import { useRouter } from "next/navigation";
import * as Yup from "yup";
import { useLocationContext } from "../location-context";

interface LocationData {
  street: string
  city: string
  state: string
  region: string
  country: string
  postal_code: string
  latitude: number | string
  longitude: number | string
}


export default function EditLocationPage() {
  const router = useRouter();
  const [updateLocation] = useUpdateLocationMutation();
  const { location, isLoading } = useLocationContext();

  if (!location) { return null; }

  const initialValues: LocationData = {
    street: location?.street || "",
    city: location?.city || "",
    state: location?.state || "",
    region: location?.region || "",
    country: location?.country || "",
    postal_code: location?.postal_code || "",
    latitude: location?.latitude || "",
    longitude: location?.longitude || "",
  };

  const validationSchema = Yup.object({
    street: Yup.string().nullable(),
    city: Yup.string().nullable(),
    state: Yup.string().nullable(),
    region: Yup.string().nullable(),
    country: Yup.string().nullable(),
    postal_code: Yup.string().nullable(),
    latitude: Yup.number()
      .min(-90, "Latitude must be between -90 and 90")
      .max(90, "Latitude must be between -90 and 90")
      .required("Please select a location to get coordinates"),
    longitude: Yup.number()
      .min(-180, "Longitude must be between -180 and 180")
      .max(180, "Longitude must be between -180 and 180")
      .required("Please select a location to get coordinates"),
  })

  const handleSubmit = async (values: LocationData, helpers: any) => {
    try {
      await updateLocation({ id: location.uuid, data: values }).unwrap();
      toast({
        title: "Success",
        description: "Location updated successfully",
      });
      helpers.resetForm();
    } catch (error: any) {
      catchError(error, helpers.setFieldError);
    } finally {
      helpers.setSubmitting(false);
    }
  };

  const handleSuccess = () => {
    // Additional success handling if needed
  };

  return (
    <>
      <ViewPageHeader title="Edit Location" />
      <LocationForm
        initialValues={initialValues}
        validationSchema={validationSchema}
        isLoading={isLoading}
        onSubmit={handleSubmit}
        onSuccess={handleSuccess}
        submitLabel="Update Location"
        title="Edit Location"
        description="Update location information"
        onCancel={() => router.back()}
      />
    </>
  );
}
