"use client"

import ViewPageHeader from "@/components/dashboard/ViewPageHeader";
import { WarehouseForm } from "@/components/dashboard/WarehouseForm";
import { FormWithLocationModal } from "@/components/dashboard/FormWithLocationModal";
import { createAddressFieldConfig } from "@/lib/field-configs";
import { toast } from "@/hooks/use-toast";
import { catchError } from "@/lib/utils";
import { useUpdateWarehouseMutation } from "@/store/warehouses";
import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import * as Yup from "yup";
import { useContext } from "../layout";

export default function EditWarehousePage() {
  const { warehouse, isLoading } = useContext();
  const router = useRouter()
  const [updateWarehouse] = useUpdateWarehouseMutation()

  const validationSchema = useMemo(() => Yup.object({
    warehouse_code: Yup.string().required("Warehouse code is required"),
    address: Yup.string().required("Address is required"),
  }), []);

  // Create initial values with proper defaults to avoid null values
  const initialValues = useMemo(() => {
    if (!warehouse) return null;
    
    return {
      warehouse_code: warehouse.warehouse_code || "",
      address: warehouse.address || "",
      location_id: warehouse.location_id || "",
    };
  }, [warehouse]);

  const handleSubmit = useCallback(async (values: any, { setSubmitting, setFieldError }: any) => {
    try {
      const payload = {
        warehouse_code: values.warehouse_code,
        address: values.address,
        location_id: values.location_id,
      };
      await updateWarehouse({ id: warehouse.uuid, data: payload }).unwrap();
      toast({ title: "Success", description: "Warehouse updated successfully" });
      router.push(`/dashboard/warehouses/${warehouse.uuid}`);
    } catch (error: any) {
      catchError(error, setFieldError);
    } finally {
      setSubmitting(false);
    }
  }, [warehouse, updateWarehouse, router]);

  if (!warehouse || !initialValues) { return null; }

  const createFields = (setLocationModalOpen: (open: boolean) => void) => [
    { 
      name: "warehouse_code", 
      label: "Warehouse Code", 
      type: "text" as const, 
      required: true, 
      placeholder: "Warehouse Code" 
    },
    createAddressFieldConfig(() => setLocationModalOpen(true), "text"),
  ];

  return (
    <>
      <ViewPageHeader
        title="Update Warehouse"
        description="Edit warehouse information below"
      />
      <FormWithLocationModal existingLocationData={warehouse.location}>
        {({ onFieldUpdate, setFormRef, setLocationModalOpen }) => (
          <WarehouseForm
            title="Update Warehouse"
            description="Edit warehouse information below"
            initialValues={initialValues}
            validationSchema={validationSchema}
            fields={createFields(setLocationModalOpen)}
            isLoading={isLoading}
            onSubmit={handleSubmit}
            submitLabel="Update Warehouse"
            onCancel={() => router.back()}
            cardClassName="max-w-2xl"
            onFieldUpdate={onFieldUpdate}
            ref={setFormRef}
          />
        )}
      </FormWithLocationModal>
    </>
  )
}