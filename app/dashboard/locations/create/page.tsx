"use client"

import { LocationForm } from "@/components/dashboard/LocationForm";
import ViewPageHeader from "@/components/dashboard/ViewPageHeader";
import { toast } from "@/hooks/use-toast";
import { catchError } from "@/lib/utils";
import { useCreateLocationMutation } from "@/store/locations";
import { useRouter } from "next/navigation";
import * as Yup from "yup";

export default function CreateLocationPage() {
  const router = useRouter();
  const [createLocation, { isLoading }] = useCreateLocationMutation();

  const initialValues = {
    street: "",
    city: "",
    state: "",
    region: "",
    country: "",
    postal_code: "",
    latitude: "",
    longitude: "",
  }

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

  const handleSubmit = async (values: typeof initialValues, helpers: any) => {
    try {
      await createLocation(values).unwrap();
      toast({
        title: "Success",
        description: "Location created successfully",
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
      <ViewPageHeader title="Create Location" />
      <LocationForm
        title="Location Information"
        description="Add a new location to the system"
        initialValues={initialValues}
        validationSchema={validationSchema}
        isLoading={isLoading}
        onSubmit={handleSubmit}
        onSuccess={handleSuccess}
        submitLabel="Create Location"
        onCancel={() => router.back()}
      />
    </>
  );
}
