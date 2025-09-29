"use client"

import { MarketForm } from "@/components/dashboard/MarketForm";
import ViewPageHeader from "@/components/dashboard/ViewPageHeader";
import { FormWithLocationModal } from "@/components/dashboard/FormWithLocationModal";
import { createAddressFieldConfig } from "@/lib/field-configs";
import { toast } from "@/hooks/use-toast";
import { catchError } from "@/lib/utils";
import { useCreateMarketMutation } from "@/store/markets";
import { useGetWarehousesQuery } from "@/store/warehouses";
import { useRouter } from "next/navigation";
import * as Yup from "yup";

export default function CreateMarketPage() {
  const router = useRouter();
  const [createMarket, { isLoading }] = useCreateMarketMutation();
  const { data: warehousesData, isLoading: warehousesLoading } = useGetWarehousesQuery();

  const initialValues = {
    name: "",
    description: "",
    type: "",
    address: "",
    location_id: "",
    warehouse_id: "",
  };

  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    description: Yup.string(),
    type: Yup.string().oneOf(["InMarket", "OutMarket"]).required("Type is required"),
    address: Yup.string().required("Address is required"),
    warehouse_id: Yup.string().required("Warehouse is required"),
  });

  const handleSubmit = async (values: typeof initialValues, helpers: any) => {
    try {
      await createMarket(values).unwrap();
      toast({
        title: "Success",
        description: "Market created successfully",
      });
      helpers.resetForm();
    } catch (error: any) {
      catchError(error, helpers.setFieldError);
    } finally {
      helpers.setSubmitting(false);
    }
  };

  const createFields = (setLocationModalOpen: (open: boolean) => void) => [
    {
      name: "name",
      label: "Name",
      type: "text" as const,
      required: true,
      placeholder: "Enter market name",
    },
    {
      name: "description",
      label: "Description",
      type: "text" as const,
      placeholder: "Enter description",
    },
    {
      name: "type",
      label: "Type",
      type: "select" as const,
      required: true,
      options: [
        { value: "InMarket", label: "InMarket" },
        { value: "OutMarket", label: "OutMarket" },
      ],
      placeholder: "Select type",
    },
    {
      name: "warehouse_id",
      label: "Warehouse",
      type: "selectWithFetch" as const,
      required: true,
      store: "warehouses",
      valueKey: "uuid",
      labelKey: "warehouse_code",
      placeholder: "Select warehouse",
    },
    createAddressFieldConfig(() => setLocationModalOpen(true), "text"),
  ];

  return (
    <>
      <ViewPageHeader
        title="Create Market"
        description="Add a new market to the system"
      />
      <FormWithLocationModal>
        {({ onFieldUpdate, setFormRef, setLocationModalOpen }) => (
          <MarketForm
            title="Market Information"
            description="Add a new market to the system"
            initialValues={initialValues}
            validationSchema={validationSchema}
            fields={createFields(setLocationModalOpen)}
            isLoading={isLoading || warehousesLoading}
            onSubmit={handleSubmit}
            submitLabel="Create Market"
            onCancel={() => router.back()}
            onFieldUpdate={onFieldUpdate}
            ref={setFormRef}
          />
        )}
      </FormWithLocationModal>
    </>
  );
}