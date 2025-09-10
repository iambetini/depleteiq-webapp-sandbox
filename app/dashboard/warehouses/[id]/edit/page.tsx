"use client"

import ViewPageHeader from "@/components/dashboard/ViewPageHeader";
import { WarehouseForm } from "@/components/dashboard/WarehouseForm";
import { FormWithLocationModal } from "@/components/dashboard/FormWithLocationModal";
import { createAddressFieldConfig } from "@/lib/field-configs";
import { toast } from "@/hooks/use-toast";
import { catchError } from "@/lib/utils";
import { useUpdateWarehouseMutation } from "@/store/warehouses";
import type { Warehouse } from "@/types/warehouse";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import * as Yup from "yup";
import { useWarehouseContext } from "../warehouse-context";

export default function EditWarehousePage() {
  const { warehouse, isLoading, fetchWarehouse } = useWarehouseContext();
  const { data: session } = useSession()
  const router = useRouter()
  const [updateWarehouse] = useUpdateWarehouseMutation()

  if (!warehouse) { return null; }

  const validationSchema = useMemo(() => Yup.object({
    warehouse_code: Yup.string().required("Warehouse code is required"),
    address: Yup.string().required("Address is required"),
  }), []);

  const handleSubmit = useCallback(async (values: Warehouse, { setSubmitting, setFieldError }: any) => {
    try {
      const payload = {
        warehouse_code: values.warehouse_code,
        address: values.address,
        location_id: values.location_id,
      };
      await updateWarehouse({ id: warehouse.uuid, data: payload }).unwrap();
      toast({ title: "Success", description: "Warehouse updated successfully" });
      fetchWarehouse();
      router.push(`/dashboard/warehouses/${warehouse.uuid}`);
    } catch (error: any) {
      catchError(error, setFieldError);
    } finally {
      setSubmitting(false);
    }
  }, [warehouse, updateWarehouse, fetchWarehouse, router]);

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
      <FormWithLocationModal>
        {({ onFieldUpdate, setFormRef, setLocationModalOpen }) => (
          <WarehouseForm
            title="Update Warehouse"
            description="Edit warehouse information below"
            initialValues={warehouse as Warehouse}
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