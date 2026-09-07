"use client"

import { BusinessForm } from "@/components/dashboard/BusinessForm"
import { FormWithLocationModal } from "@/components/dashboard/FormWithLocationModal"
import ViewPageHeader from "@/components/dashboard/ViewPageHeader"
import { toast } from "@/hooks/use-toast"
import { catchError } from "@/lib/utils"
import { useCreateStoreMutation } from "@/store/stores"
import { STORE_CATEGORIES } from "@/types/store"
import { useRouter } from "next/navigation"
import * as Yup from "yup"

const emptyToNull = (value: string) => (value?.trim() ? value.trim() : null)

const categoryOptions = STORE_CATEGORIES.map((category) => ({
  label: category,
  value: category,
}))

export default function CreateStorePage() {
  const router = useRouter()
  const [createStore, { isLoading }] = useCreateStoreMutation()

  const initialValues = {
    business_id: "",
    market_id: "",
    address: "",
    location_id: "",
    in_market: "in_market",
    promo_class: "",
    category: [] as string[],
  }

  const validationSchema = Yup.object({
    business_id: Yup.string().required("Business is required"),
    market_id: Yup.string().nullable(),
    address: Yup.string().nullable(),
    location_id: Yup.string().nullable(),
    in_market: Yup.string().oneOf(["in_market", "out_market"]).required("Market status is required"),
    promo_class: Yup.string().oneOf(["pareto", "non-pareto", ""]).nullable(),
    category: Yup.array()
      .of(Yup.string().oneOf([...STORE_CATEGORIES]))
      .nullable(),
  })

  const handleSubmit = async (values: typeof initialValues, helpers: any) => {
    try {
      const payload = {
        business_id: values.business_id,
        market_id: emptyToNull(values.market_id),
        location_id: emptyToNull(values.location_id),
        in_market: values.in_market === "in_market",
        promo_class: emptyToNull(values.promo_class),
        category: Array.isArray(values.category) ? values.category : [],
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
