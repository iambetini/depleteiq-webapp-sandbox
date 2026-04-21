"use client"

import { BusinessForm } from "@/components/dashboard/BusinessForm"
import ViewPageHeader from "@/components/dashboard/ViewPageHeader"
import { toast } from "@/hooks/use-toast"
import { catchError } from "@/lib/utils"
import { useUpdateStoreMutation } from "@/store/stores"
import { useRouter } from "next/navigation"
import { useContext } from "../layout"
import * as Yup from "yup"

export default function EditStorePage() {
  const router = useRouter()
  const { store, fetchEntity } = useContext()
  const [updateStore] = useUpdateStoreMutation()

  if (!store) {
    return null
  }

  const validationSchema = Yup.object({
    business_id: Yup.string().required("Business is required"),
    address: Yup.string().nullable(),
    type: Yup.string().nullable(),
    category: Yup.string().nullable(),
    market_id: Yup.string().nullable(),
  })

  const handleSubmit = async (values: any, helpers: any) => {
    try {
      await updateStore({ id: store.uuid, data: values }).unwrap()
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

  const initialValues = {
    business_id: store.business?.uuid || "",
    address: store.address || "",
    type: store.type || "",
    category: store.category || "",
    market_id: store.market?.uuid || "",
  }

  return (
    <div>
      <ViewPageHeader
        title="Edit Store"
        description="Update store details"
      />
      <BusinessForm
        title="Edit Store"
        description="Update the details for this store"
        initialValues={initialValues}
        validationSchema={validationSchema}
        fields={fields}
        isLoading={false}
        onSubmit={handleSubmit}
        submitLabel="Update Store"
        onCancel={() => router.back()}
        cardClassName="max-w-2xl"
      />
    </div>
  )
}
