"use client"

import { BusinessForm } from "@/components/dashboard/BusinessForm"
import ViewPageHeader from "@/components/dashboard/ViewPageHeader"
import { toast } from "@/hooks/use-toast"
import { catchError } from "@/lib/utils"
import { useCreateLgaMutation } from "@/store/lgas"
import { useRouter } from "next/navigation"
import * as Yup from "yup"

export default function CreateLgaPage() {
  const router = useRouter()
  const [createLga, { isLoading }] = useCreateLgaMutation()

  const initialValues = {
    name: "",
    state_id: "",
  }

  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    state_id: Yup.string().required("State is required"),
  })

  const handleSubmit = async (values: typeof initialValues, helpers: any) => {
    try {
      const payload = {
        name: values.name,
        state_id: values.state_id,
      }
      await createLga(payload).unwrap()
      toast({
        title: "Success",
        description: "LGA created successfully",
      })
      helpers.resetForm()
      router.push("/dashboard/locations/lgas")
    } catch (error: any) {
      catchError(error, helpers.setFieldError)
    } finally {
      helpers.setSubmitting(false)
    }
  }

  const createFields = () => [
    {
      name: "name",
      label: "LGA Name",
      type: "text" as const,
      required: true,
      placeholder: "Enter LGA name",
    },
    {
      name: "state_id",
      label: "State",
      type: "selectWithFetch" as const,
      required: true,
      fetchUrl: "/states",
      valueKey: "uuid",
      labelKey: "name",
      placeholder: "Select state",
    },
  ]

  return (
    <div>
      <ViewPageHeader
        title="Create LGA"
        description="Add a new Local Government Area"
      />
      <BusinessForm
        title="LGA Information"
        description="Enter the details for the new LGA"
        initialValues={initialValues}
        validationSchema={validationSchema}
        fields={createFields()}
        isLoading={isLoading}
        onSubmit={handleSubmit}
        submitLabel="Create LGA"
        onCancel={() => router.back()}
        cardClassName="max-w-2xl"
      />
    </div>
  )
}
