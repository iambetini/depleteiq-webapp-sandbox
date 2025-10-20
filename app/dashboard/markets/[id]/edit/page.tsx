"use client";
import { MarketForm } from "@/components/dashboard/MarketForm";
import ViewPageHeader from "@/components/dashboard/ViewPageHeader";
import { FormWithLocationModal } from "@/components/dashboard/FormWithLocationModal";
import { createAddressFieldConfig } from "@/lib/field-configs";
import { toast } from "@/hooks/use-toast";
import { catchError } from "@/lib/utils";
import { useUpdateMarketMutation } from "@/store/markets";
import { useGetWarehousesQuery } from "@/store/warehouses";
import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import * as Yup from "yup";
import { useContext } from "../layout";

interface MarketData {
  name: string
  description: string
  type: string
  address: string
  location_id: string
  warehouse_id: string
  branch_id: string
}

export default function EditMarketPage() {
  const router = useRouter();
  const [updateMarket] = useUpdateMarketMutation();
  const { market, isLoading } = useContext();
  const { data: warehousesData, isLoading: warehousesLoading } = useGetWarehousesQuery();

  const initialValues: MarketData = useMemo(() => {
    // Create formatted address from location data
    const formatAddress = (location: any) => {
      if (!location) return "";
      const addressParts = [
        location.street,
        location.city,
        location.state,
        location.country,
        location.postal_code,
      ].filter(Boolean);
      return addressParts.join(", ");
    };

    return {
      name: market?.name || "",
      description: market?.description || "",
      type: market?.type || "",
      address: formatAddress(market?.location) || "",
      location_id: market?.location?.uuid || "",
      warehouse_id: market?.warehouse?.uuid || "",
      branch_id: market?.branch || "",
    };
  }, [market]);

  const validationSchema = useMemo(() => Yup.object({
    name: Yup.string().required("Name is required"),
    description: Yup.string(),
    type: Yup.string().oneOf(["InMarket", "OutMarket"]).required("Type is required"),
    address: Yup.string().required("Address is required"),
    warehouse_id: Yup.string().required("Warehouse is required"),
    branch_id: Yup.string().required("Branch is required"),
  }), []);

  const handleSubmit = useCallback(async (values: MarketData, helpers: any) => {
    if (!market) return;
    
    try {
      await updateMarket({ id: market.uuid, data: values }).unwrap();
      toast({
        title: "Success",
        description: "Market updated successfully",
      });
      router.push(`/dashboard/markets/${market.uuid}`);
    } catch (error: any) {
      catchError(error, helpers.setFieldError);
    } finally {
      helpers.setSubmitting(false);
    }
  }, [market, updateMarket, router]);

  if (!market) { return null; }

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
      fetchUrl: "/warehouses",
      valueKey: "uuid",
      labelKey: "warehouse_code",
      placeholder: "Select warehouse",
    },
    createAddressFieldConfig(() => setLocationModalOpen(true), "text"),
    {
      name: "branch_id",
      label: "Branch",
      type: "selectWithFetch" as const,
      required: true,
      fetchUrl: "/branches",
      valueKey: "uuid",
      labelKey: "branch_name",
      placeholder: "Select branch",
    },
  ];

  return (
    <>
      <ViewPageHeader
        title="Update Market"
        description="Edit market information below"
      />
      <FormWithLocationModal existingLocationData={market.location}>
        {({ onFieldUpdate, setFormRef, setLocationModalOpen }) => (
          <MarketForm
            initialValues={initialValues}
            validationSchema={validationSchema}
            fields={createFields(setLocationModalOpen)}
            isLoading={isLoading || warehousesLoading}
            onSubmit={handleSubmit}
            submitLabel="Update Market"
            title="Update Market"
            description="Edit market information below"
            onCancel={() => router.back()}
            onFieldUpdate={onFieldUpdate}
            ref={setFormRef}
          />
        )}
      </FormWithLocationModal>
    </>
  );
}
