"use client";
import { LocationForm } from "@/components/dashboard/LocationForm";
import { Modal } from "@/components/ui/modal";
import { catchError } from "@/lib/utils";
import { useCreateLocationMutation } from "@/store/locations";
import * as Yup from "yup";

interface LocationModalProps {
  open: boolean;
  onClose: () => void;
  onLocationCreated: (locationData: any, locationId: string) => void;
  existingLocationData?: {
    street?: string;
    city?: string;
    state?: string;
    region?: string;
    country?: string;
    postal_code?: string;
    latitude?: string | number;
    longitude?: string | number;
  } | null;
}

export function LocationModal({ open, onClose, onLocationCreated, existingLocationData }: LocationModalProps) {
  const [createLocation, { isLoading }] = useCreateLocationMutation();

  const initialValues = {
    street: existingLocationData?.street || "",
    city: existingLocationData?.city || "",
    state: existingLocationData?.state || "",
    region: existingLocationData?.region || "",
    country: existingLocationData?.country || "",
    postal_code: existingLocationData?.postal_code || "",
    latitude: existingLocationData?.latitude !== undefined ? existingLocationData.latitude.toString() : "",
    longitude: existingLocationData?.longitude !== undefined ? existingLocationData.longitude.toString() : "",
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
  });

  const handleSubmit = async (values: typeof initialValues, helpers: any) => {
    try {
      // Convert string coordinates to numbers
      const locationData = {
        ...values,
        latitude: parseFloat(values.latitude.toString()),
        longitude: parseFloat(values.longitude.toString()),
      }
      const result = await createLocation({ data: locationData, config: { showToast: false } }).unwrap();
      helpers.resetForm();
      onLocationCreated(locationData, result.uuid);
      onClose();
    } catch (error: any) {
      // Check if the error is about location already existing
      if (error?.status === "CUSTOM_ERROR" && error?.data?.[0]?.data?.uuid) {
        const existingLocation = error.data[0].data;
        const existingLocationData = {
          street: existingLocation.street,
          city: existingLocation.city,
          state: existingLocation.state,
          region: existingLocation.region,
          country: existingLocation.country,
          postal_code: existingLocation.postal_code || "", // Not provided in error response
          latitude: parseFloat(existingLocation.latitude),
          longitude: parseFloat(existingLocation.longitude),
        };

        helpers.resetForm();
        onLocationCreated(existingLocationData, existingLocation.uuid);
        onClose();
        return;
      }

      catchError(error, helpers.setFieldError);
    } finally {
      helpers.setSubmitting(false);
    }
  };

  const handleSuccess = () => {
    // Additional success handling if needed
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xlg-center"
      title="Location"
    >
      <div className="max-h-[80vh] overflow-y-auto">
        <LocationForm
          initialValues={initialValues}
          validationSchema={validationSchema}
          isLoading={isLoading}
          onSubmit={handleSubmit}
          submitLabel="Confirm Address"
          title=""
          description=""
          onCancel={onClose}
          onSuccess={handleSuccess}
        />
      </div>
    </Modal>
  );
}
