"use client"

import ViewPageHeader from "@/components/dashboard/ViewPageHeader"
import { WarehouseForm } from "@/components/dashboard/WarehouseForm"
import { FormWithLocationModal } from "@/components/dashboard/FormWithLocationModal"
import { createAddressFieldConfig } from "@/lib/field-configs"
import { toast } from "@/hooks/use-toast"
import { catchError } from "@/lib/utils"
import { useCreateWarehouseMutation } from "@/store/warehouses"
import { useRouter } from "next/navigation"
import * as Yup from "yup"

export default function CreateWarehousePage() {
  const router = useRouter()
  const [createWarehouse, { isLoading: isCreating }] = useCreateWarehouseMutation()

  const initialValues = {
    warehouse_code: "",
    address: "",
    location_id: "",
  }

  const validationSchema = Yup.object({
    warehouse_code: Yup.string().required("Warehouse code is required"),
    address: Yup.string().required("Address is required"),
  })

  const handleSubmit = async (values: typeof initialValues, helpers: any) => {
    try {
      await createWarehouse(values).unwrap()
      toast({
        title: "Success",
        description: "Warehouse created successfully",
      })
      helpers.resetForm()
    } catch (error: any) {
      catchError(error, helpers.setFieldError);
    } finally {
      helpers.setSubmitting(false)
    }
  }

  const createFields = (setLocationModalOpen: (open: boolean) => void) => [
    { 
      name: "warehouse_code", 
      label: "Warehouse Code", 
      type: "text" as const, 
      required: true, 
      placeholder: "Warehouse Code" 
    },
    createAddressFieldConfig(() => setLocationModalOpen(true), "text"),
  ]

  return (
    <>
      <ViewPageHeader title="Create Warehouse" description="Add a new warehouse to the system" />
      <FormWithLocationModal>
        {({ onFieldUpdate, setFormRef, setLocationModalOpen }) => (
          <WarehouseForm
            title="Warehouse Information"
            description="Add a new warehouse to the system"
            initialValues={initialValues}
            validationSchema={validationSchema}
            fields={createFields(setLocationModalOpen)}
            isLoading={isCreating}
            onSubmit={handleSubmit}
            submitLabel="Create Warehouse"
            onCancel={() => router.back()}
            onFieldUpdate={onFieldUpdate}
            ref={setFormRef}
          />
        )}
      </FormWithLocationModal>
    </>
  )
}