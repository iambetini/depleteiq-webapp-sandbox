"use client"

import { BusinessForm } from "@/components/dashboard/BusinessForm"
import ViewPageHeader from "@/components/dashboard/ViewPageHeader"
import { toast } from "@/hooks/use-toast"
import { catchError } from "@/lib/utils"
import { useCreateCoverageAreaMutation } from "@/store/coverage-areas"
import { useRouter } from "next/navigation"
import * as Yup from "yup"

export default function CreateCoverageAreaPage() {
  const router = useRouter()
  const [createCoverageArea, { isLoading }] = useCreateCoverageAreaMutation()

  const initialValues = {
    name: "",
    lga_id: "",
    geofence_id: "",
    enable_geofence: false,
  }

  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    lga_id: Yup.string().required("LGA is required"),
    geofence_id: Yup.string().nullable(),
    enable_geofence: Yup.boolean(),
  })

  const handleSubmit = async (values: typeof initialValues, helpers: any) => {
    try {
      const payload = {
        name: values.name,
        lga_id: values.lga_id,
        geofence_id: values.geofence_id || null,
        enable_geofence: Boolean(values.enable_geofence),
      }
      await createCoverageArea(payload).unwrap()
      toast({
        title: "Success",
        description: "Coverage area created successfully",
      })
      helpers.resetForm()
      router.push("/dashboard/locations/coverage-areas")
    } catch (error: any) {
      catchError(error, helpers.setFieldError)
    } finally {
      helpers.setSubmitting(false)
    }
  }

  const createFields = () => [
    {
      name: "name",
      label: "Coverage Area Name",
      type: "text" as const,
      required: true,
      placeholder: "Enter coverage area name",
    },
    {
      name: "lga_id",
      label: "LGA",
      type: "selectWithFetch" as const,
      required: true,
      fetchUrl: "/lgas",
      valueKey: "uuid",
      labelKey: "name",
      placeholder: "Select LGA",
    },
    {
      name: "geofence_id",
      label: "Geofence",
      type: "selectWithFetch" as const,
      required: false,
      fetchUrl: "/geofences",
      valueKey: "uuid",
      labelKey: "name",
      placeholder: "Select geofence",
    },
    {
      name: "enable_geofence",
      label: "Enable Geofence",
      type: "switch" as const,
    },
  ]

  return (
    <div>
      <ViewPageHeader
        title="Create Coverage Area"
        description="Add a new coverage area"
      />
      <BusinessForm
        title="Coverage Area Information"
        description="Enter the details for the new coverage area"
        initialValues={initialValues}
        validationSchema={validationSchema}
        fields={createFields()}
        isLoading={isLoading}
        onSubmit={handleSubmit}
        submitLabel="Create Coverage Area"
        onCancel={() => router.back()}
        cardClassName="max-w-2xl"
      />
    </div>
  )
}
