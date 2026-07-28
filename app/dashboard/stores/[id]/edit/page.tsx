"use client"

import { BusinessForm } from "@/components/dashboard/BusinessForm"
import { FormWithLocationModal } from "@/components/dashboard/FormWithLocationModal"
import ViewPageHeader from "@/components/dashboard/ViewPageHeader"
import { toast } from "@/hooks/use-toast"
import { catchError } from "@/lib/utils"
import { useUpdateStoreMutation } from "@/store/stores"
import { useRouter } from "next/navigation"
import { useMemo } from "react"
import { useContext } from "../layout"
import * as Yup from "yup"

const emptyToNull = (value: string) => (value?.trim() ? value.trim() : null)

const formatAddress = (location: any) => {
  if (!location) return ""
  return [
    location.street,
    location.city,
    location.state,
    location.country,
    location.postal_code,
  ]
    .filter(Boolean)
    .join(", ")
}

export default function EditStorePage() {
  const router = useRouter()
  const { store, fetchEntity } = useContext()
  const [updateStore, { isLoading }] = useUpdateStoreMutation()

  const initialValues = useMemo(
    () => ({
      market_id: store?.market?.uuid || "",
      address: formatAddress(store?.location) || store?.location?.full_location || "",
      location_id: store?.location?.uuid || "",
      in_market: Boolean(store?.in_market),
      promo_class: store?.promo_class || "",
      category: store?.category || "",
    }),
    [store]
  )

  if (!store) {
    return null
  }

  const validationSchema = Yup.object({
    market_id: Yup.string().nullable(),
    address: Yup.string().nullable(),
    location_id: Yup.string().nullable(),
    in_market: Yup.boolean(),
    promo_class: Yup.string().oneOf(["pareto", "non-pareto", ""]).nullable(),
    category: Yup.string().oneOf(["pc", "pharma", "food and bev", ""]).nullable(),
  })

  const handleSubmit = async (values: any, helpers: any) => {
    try {
      const payload = {
        market_id: emptyToNull(values.market_id),
        location_id: emptyToNull(values.location_id),
        in_market: Boolean(values.in_market),
        promo_class: emptyToNull(values.promo_class),
        category: emptyToNull(values.category),
      }
      await updateStore({ id: store.uuid, data: payload }).unwrap()
      toast({
        title: "Success",
        description: "Store updated successfully",
      })
      fetchEntity()
      router.push(`/dashboard/stores/${store.uuid}`)
    } catch (error: any) {
      catchError(error, helpers.setFieldError)
    } finally {
      helpers.setSubmitting(false)
    }
  }

  const handleInMarketToggle = async (checked: boolean) => {
    try {
      await updateStore({
        id: store.uuid,
        data: { in_market: checked },
      }).unwrap()
      toast({
        title: "Success",
        description: `Store marked as ${checked ? "in market" : "not in market"}`,
      })
      fetchEntity()
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error?.data?.message || error?.message || "Failed to update in market status",
        variant: "destructive",
      })
      fetchEntity()
    }
  }

  const createFields = (setLocationModalOpen: (open: boolean) => void) => [
    {
      name: "market_id",
      label: "Market",
      type: "selectWithFetch" as const,
      required: false,
      fetchUrl: "/markets",
      valueKey: "uuid",
      labelKey: "name",
      initialSearch: store.market?.name || "",
      placeholder: "Select a market",
    },
    {
      name: "address",
      label: "Location",
      type: "text" as const,
      required: false,
      readOnly: true,
      placeholder: "Click to create location",
      onFocus: () => setLocationModalOpen(true),
    },
    {
      name: "promo_class",
      label: "Promo Class",
      type: "select" as const,
      required: false,
      placeholder: "Select promo class",
      options: [
        { label: "Pareto", value: "pareto" },
        { label: "Non-pareto", value: "non-pareto" },
      ],
    },
    {
      name: "category",
      label: "Category",
      type: "select" as const,
      required: false,
      placeholder: "Select category",
      options: [
        { label: "Personal Care", value: "pc" },
        { label: "Pharmaceutical", value: "pharma" },
        { label: "Food & Beverage", value: "food and bev" },
      ],
    },
    {
      name: "in_market",
      label: "In Market",
      type: "switch" as const,
      onCheckedChange: handleInMarketToggle,
    },
  ]

  return (
    <div>
      <ViewPageHeader
        title="Edit Store"
        description="Update store details"
      />
      <FormWithLocationModal
        existingLocationData={
          store.location
            ? {
                street: store.location.street,
                city: store.location.city,
                state: store.location.state,
                region: store.location.region,
                country: store.location.country,
                postal_code: store.location.postal_code,
                latitude: store.location.latitude,
                longitude: store.location.longitude,
              }
            : null
        }
      >
        {({ setFormRef, setLocationModalOpen }) => (
          <BusinessForm
            title="Edit Store"
            description="Update the details for this store"
            initialValues={initialValues}
            validationSchema={validationSchema}
            fields={createFields(setLocationModalOpen)}
            isLoading={isLoading}
            onSubmit={handleSubmit}
            submitLabel="Update Store"
            onCancel={() => router.back()}
            cardClassName="max-w-2xl"
            ref={setFormRef}
          />
        )}
      </FormWithLocationModal>
    </div>
  )
}
