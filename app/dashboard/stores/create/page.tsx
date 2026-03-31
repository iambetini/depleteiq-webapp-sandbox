"use client"

import { BusinessForm } from "@/components/dashboard/BusinessForm"
import ViewPageHeader from "@/components/dashboard/ViewPageHeader"
import { toast } from "@/hooks/use-toast"
import { catchError } from "@/lib/utils"
import { useCreateStoreMutation } from "@/store/stores"
import { useRouter } from "next/navigation"
import { useRef } from "react"
import * as Yup from "yup"

export default function CreateStorePage() {
  const router = useRouter()
  const [createStore, { isLoading }] = useCreateStoreMutation()
  const formRef = useRef<any>(null)

  const initialValues = {
    business_id: "",
    address: "",
    type: "",
    category: "",
    market_id: "",
  }

  const validationSchema = Yup.object({
    business_id: Yup.string().required("Business is required"),
    address: Yup.string().nullable(),
    type: Yup.string().nullable(),
    category: Yup.string().nullable(),
    market_id: Yup.string().nullable(),
  })

  const handleSubmit = async (values: typeof initialValues, helpers: any) => {
    try {
      await createStore(values).unwrap()
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

  const fields = [
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
      name: "type",
      label: "Store Type",
      type: "text" as const,
      required: false,
      placeholder: "Enter store type",
    },
    {
      name: "category",
      label: "Category",
      type: "text" as const,
      required: false,
      placeholder: "Enter category",
    },
        {
      name: "address",
      label: "Address",
      type: "textarea" as const,
      required: false,
      placeholder: "Enter store address",
      rows: 3,
    },
  ]

  return (
    <div>
      <ViewPageHeader
        title="Create Store"
        description="Add a new store to the system"
      />
      <BusinessForm
        title="Create Store"
        description="Enter the details for the new store"
        initialValues={initialValues}
        validationSchema={validationSchema}
        fields={fields}
        isLoading={isLoading}
        onSubmit={handleSubmit}
        submitLabel="Create Store"
        onCancel={() => router.back()}
        cardClassName="max-w-2xl"
        ref={formRef}
      />
    </div>
  )
}
