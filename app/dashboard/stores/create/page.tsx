"use client"

import { BusinessForm } from "@/components/dashboard/BusinessForm"
import { FormWithLocationModal } from "@/components/dashboard/FormWithLocationModal"
import ViewPageHeader from "@/components/dashboard/ViewPageHeader"
import { toast } from "@/hooks/use-toast"
import { catchError } from "@/lib/utils"
import { useCreateStoreMutation } from "@/store/stores"
import { useRouter } from "next/navigation"
import * as Yup from "yup"

const emptyToNull = (value: string) => (value?.trim() ? value.trim() : null)

export default function CreateStorePage() {
  const router = useRouter()
  const [createStore, { isLoading }] = useCreateStoreMutation()

  const initialValues = {
    business_id: "",
    market_id: "",
    address: "",
    location_id: "",
    in_market: false,
    promo_class: "",
    category: "",
  }

  const validationSchema = Yup.object({
    business_id: Yup.string().required("Business is required"),
    market_id: Yup.string().nullable(),
    address: Yup.string().nullable(),
    location_id: Yup.string().nullable(),
    in_market: Yup.boolean(),
    promo_class: Yup.string().oneOf(["pareto", "non-pareto", ""]).nullable(),
    category: Yup.string().oneOf(["pc", "pharma", "food and bev", ""]).nullable(),
  })

  const handleSubmit = async (values: typeof initialValues, helpers: any) => {
    try {
      const payload = {
        business_id: values.business_id,
        market_id: emptyToNull(values.market_id),
        location_id: emptyToNull(values.location_id),
        in_market: Boolean(values.in_market),
        promo_class: emptyToNull(values.promo_class),
        category: emptyToNull(values.category),
      }
      await createStore(payload).unwrap()
      toast({
        title: "Success",
        description: "Store created successfully",
      })
      helpers.resetForm()
      router.push("/dashboard/stores")
    } catch (error: any) {
      catchError(error, helpers.setFieldError)
    } finally {
      helpers.setSubmitting(false)
    }
  }

  const createFields = (setLocationModalOpen: (open: boolean) => void) => [
    {
      name: "business_id",
      label: "Business",
      type: "selectWithFetch" as const,
      required: true,
      fetchUrl: "/businesses",
      valueKey: "uuid",
      labelFormatter: (item: any) => `${item.name} (${item.type})`,
      placeholder: "Select a business",
    },
    {
      name: "market_id",
      label: "Market",
      type: "selectWithFetch" as const,
      required: false,
      fetchUrl: "/markets",
      valueKey: "uuid",
      labelKey: "name",
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
    },
  ]

  return (
    <div>
      <ViewPageHeader
        title="Create Store"
        description="Add a new store to the system"
      />
      <FormWithLocationModal>
        {({ setFormRef, setLocationModalOpen }) => (
          <BusinessForm
            title="Create Store"
            description="Enter the details for the new store"
            initialValues={initialValues}
            validationSchema={validationSchema}
            fields={createFields(setLocationModalOpen)}
            isLoading={isLoading}
            onSubmit={handleSubmit}
            submitLabel="Create Store"
            onCancel={() => router.back()}
            cardClassName="max-w-2xl"
            ref={setFormRef}
          />
        )}
      </FormWithLocationModal>
    </div>
  )
}
