"use client"

import { BusinessForm } from "@/components/dashboard/BusinessForm"
import ViewPageHeader from "@/components/dashboard/ViewPageHeader"
import { toast } from "@/hooks/use-toast"
import { catchError } from "@/lib/utils"
import { useCreateStateMutation } from "@/store/states"
import { useRouter } from "next/navigation"
import * as Yup from "yup"

export default function CreateStatePage() {
  const router = useRouter()
  const [createState, { isLoading }] = useCreateStateMutation()

  const initialValues = {
    name: "",
    region_id: "",
  }

  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    region_id: Yup.string().required("Region is required"),
  })

  const handleSubmit = async (values: typeof initialValues, helpers: any) => {
    try {
      const payload = {
        name: values.name,
        region_id: values.region_id,
      }
      await createState(payload).unwrap()
      toast({
        title: "Success",
        description: "State created successfully",
      })
      helpers.resetForm()
      router.push("/dashboard/locations/states")
    } catch (error: any) {
      catchError(error, helpers.setFieldError)
    } finally {
      helpers.setSubmitting(false)
    }
  }

  const createFields = () => [
    {
      name: "name",
      label: "State Name",
      type: "text" as const,
      required: true,
      placeholder: "Enter state name",
    },
    {
      name: "region_id",
      label: "Region",
      type: "selectWithFetch" as const,
      required: true,
      fetchUrl: "/regions",
      valueKey: "uuid",
      labelKey: "name",
      placeholder: "Select region",
    },
  ]

  return (
    <div>
      <ViewPageHeader
        title="Create State"
        description="Add a new state"
      />
      <BusinessForm
        title="State Information"
        description="Enter the details for the new state"
        initialValues={initialValues}
        validationSchema={validationSchema}
        fields={createFields()}
        isLoading={isLoading}
        onSubmit={handleSubmit}
        submitLabel="Create State"
        onCancel={() => router.back()}
        cardClassName="max-w-2xl"
      />
    </div>
  )
}
