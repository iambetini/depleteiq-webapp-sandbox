import { useState } from "react";

export interface LocationModalHook {
  locationModalOpen: boolean;
  setLocationModalOpen: (open: boolean) => void;
  handleLocationCreated: (locationData: any, locationId: string) => void;
  handleFieldUpdate: (fieldName: string, value: any) => void;
  formRef: any;
  setFormRef: (ref: any) => void;
}

export function useLocationModal(): LocationModalHook {
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [formRef, setFormRef] = useState<any>(null);

  const handleLocationCreated = (locationData: any, locationId: string) => {
    // Auto-fill address field with location info (excluding lat/long)
    if (formRef && formRef.setFieldValue) {
      const addressParts = [
        locationData.street,
        locationData.city,
        locationData.state,
        locationData.country,
        locationData.postal_code,
      ].filter(Boolean);

      const formattedAddress = addressParts.join(", ");
      formRef.setFieldValue("address", formattedAddress);
      formRef.setFieldValue("location_id", locationId);
    }
    setLocationModalOpen(false);
  };

  const handleFieldUpdate = (fieldName: string, value: any) => {
    if (formRef && formRef.setFieldValue) {
      formRef.setFieldValue(fieldName, value);
    }
  };

  return {
    locationModalOpen,
    setLocationModalOpen,
    handleLocationCreated,
    handleFieldUpdate,
    formRef,
    setFormRef,
  };
}
