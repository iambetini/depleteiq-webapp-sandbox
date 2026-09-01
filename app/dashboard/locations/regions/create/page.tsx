"use client"

import { BusinessForm } from "@/components/dashboard/BusinessForm"
import ViewPageHeader from "@/components/dashboard/ViewPageHeader"
import { toast } from "@/hooks/use-toast"
import { catchError } from "@/lib/utils"
import { useCreateRegionMutation } from "@/store/regions"
import { useRouter } from "next/navigation"
import * as Yup from "yup"

export default function CreateRegionPage() {
  const router = useRouter()
  const [createRegion, { isLoading }] = useCreateRegionMutation()

  const initialValues = {
    name: "",
    country: "",
  }

  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    country: Yup.string().required("Country is required"),
  })

  const handleSubmit = async (values: typeof initialValues, helpers: any) => {
    try {
      const payload = {
        name: values.name,
        country: values.country,
      }
      await createRegion(payload).unwrap()
      toast({
        title: "Success",
        description: "Region created successfully",
      })
      helpers.resetForm()
      router.push("/dashboard/locations/regions")
    } catch (error: any) {
      catchError(error, helpers.setFieldError)
    } finally {
      helpers.setSubmitting(false)
    }
  }

  const createFields = () => [
    {
      name: "name",
      label: "Region Name",
      type: "text" as const,
      required: true,
      placeholder: "Enter region name",
    },
    {
      name: "country",
      label: "Country",
      type: "text" as const,
      required: true,
      placeholder: "Enter country",
    },
  ]

  return (
    <div>
      <ViewPageHeader
        title="Create Region"
        description="Add a new region"
      />
      <BusinessForm
        title="Region Information"
        description="Enter the details for the new region"
        initialValues={initialValues}
        validationSchema={validationSchema}
        fields={createFields()}
        isLoading={isLoading}
        onSubmit={handleSubmit}
        submitLabel="Create Region"
        onCancel={() => router.back()}
        cardClassName="max-w-2xl"
      />
    </div>
  )
}
