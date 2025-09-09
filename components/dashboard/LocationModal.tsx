"use client";

import { LocationForm } from "@/components/dashboard/LocationForm";
import { toast } from "@/hooks/use-toast";
import { catchError } from "@/lib/utils";
import { useCreateLocationMutation } from "@/store/locations";
import { Modal } from "@/components/ui/modal";
import * as Yup from "yup";

interface LocationModalProps {
  open: boolean;
  onClose: () => void;
  onLocationCreated: (locationId: string) => void;
}

export function LocationModal({ open, onClose, onLocationCreated }: LocationModalProps) {
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
      const result = await createLocation(locationData).unwrap();
      toast({
        title: "Success",
        description: "Location created successfully",
      });
      helpers.resetForm();
      onLocationCreated(result.uuid);
      onClose();
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
    <Modal
      open={open}
      onClose={onClose}
      size="xlg-center"
      title="Create New Location"
    >
      <div className="max-h-[80vh] overflow-y-auto">
        <LocationForm
          initialValues={initialValues}
          validationSchema={validationSchema}
          isLoading={isLoading}
          onSubmit={handleSubmit}
          submitLabel="Create Location"
          title=""
          description=""
          onCancel={onClose}
          onSuccess={handleSuccess}
        />
      </div>
    </Modal>
  );
}
