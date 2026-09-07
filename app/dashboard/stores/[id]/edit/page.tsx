"use client"

import { BusinessForm } from "@/components/dashboard/BusinessForm"
import { FormWithLocationModal } from "@/components/dashboard/FormWithLocationModal"
import ViewPageHeader from "@/components/dashboard/ViewPageHeader"
import { toast } from "@/hooks/use-toast"
import { catchError } from "@/lib/utils"
import { useUpdateStoreMutation } from "@/store/stores"
import {
  STORE_CATEGORIES,
  normalizeStoreCategories,
} from "@/types/store"
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

const categoryOptions = STORE_CATEGORIES.map((category) => ({
  label: category,
  value: category,
}))

export default function EditStorePage() {
  const router = useRouter()
  const { store, fetchEntity } = useContext()
  const [updateStore, { isLoading }] = useUpdateStoreMutation()

  const initialValues = useMemo(
    () => ({
      market_id: store?.market?.uuid || "",
      address: formatAddress(store?.location) || store?.location?.full_location || "",
      location_id: store?.location?.uuid || "",
      in_market: store?.in_market ? "in_market" : "out_market",
      promo_class: store?.promo_class || "",
      category: normalizeStoreCategories(store?.category),
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
    in_market: Yup.string().oneOf(["in_market", "out_market"]).required("Market status is required"),
    promo_class: Yup.string().oneOf(["pareto", "non-pareto", ""]).nullable(),
    category: Yup.array()
      .of(Yup.string().oneOf([...STORE_CATEGORIES]))
      .nullable(),
  })

  const handleSubmit = async (values: any, helpers: any) => {
    try {
      const payload = {
        market_id: emptyToNull(values.market_id),
        location_id: emptyToNull(values.location_id),
        in_market: values.in_market === "in_market",
        promo_class: emptyToNull(values.promo_class),
        category: Array.isArray(values.category) ? values.category : [],
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
      name: "in_market",
      label: "Market Status",
      type: "select" as const,
      required: true,
      placeholder: "Select market status",
      options: [
        { label: "In-market", value: "in_market" },
        { label: "Outmarket", value: "out_market" },
      ],
    },
    {
      name: "category",
      label: "Category",
      type: "multiSelect" as const,
      required: false,
      placeholder: "Select categories",
      options: categoryOptions,
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
