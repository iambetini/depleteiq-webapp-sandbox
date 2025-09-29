"use client";

import React from "react";
import { LocationModal } from "./LocationModal";
import { useLocationModal } from "@/hooks/use-location-modal";

interface FormWithLocationModalProps {
  children: (props: {
    onFieldUpdate: (fieldName: string, value: any) => void;
    setFormRef: (ref: any) => void;
    locationModalOpen: boolean;
    setLocationModalOpen: (open: boolean) => void;
    handleLocationCreated: (locationData: any, locationId: string) => void;
  }) => React.ReactNode;
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

export function FormWithLocationModal({ children, existingLocationData }: FormWithLocationModalProps) {
  const {
    locationModalOpen,
    setLocationModalOpen,
    handleLocationCreated,
    handleFieldUpdate,
    formRef,
    setFormRef,
  } = useLocationModal();

  return (
    <>
      {children({
        onFieldUpdate: handleFieldUpdate,
        setFormRef,
        locationModalOpen,
        setLocationModalOpen,
        handleLocationCreated,
      })}
      <LocationModal
        open={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        onLocationCreated={handleLocationCreated}
        existingLocationData={existingLocationData}
      />
    </>
  );
}
