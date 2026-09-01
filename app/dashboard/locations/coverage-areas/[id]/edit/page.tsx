"use client"

import { BusinessForm } from "@/components/dashboard/BusinessForm"
import ViewPageHeader from "@/components/dashboard/ViewPageHeader"
import { toast } from "@/hooks/use-toast"
import { catchError } from "@/lib/utils"
import { useUpdateCoverageAreaMutation } from "@/store/coverage-areas"
import { useRouter } from "next/navigation"
import { useMemo } from "react"
import { useContext } from "../layout"
import * as Yup from "yup"

export default function EditCoverageAreaPage() {
  const router = useRouter()
  const { coverageArea, fetchEntity } = useContext()
  const [updateCoverageArea, { isLoading }] = useUpdateCoverageAreaMutation()

  const initialValues = useMemo(
    () => ({
      name: coverageArea?.name || "",
      lga_id: coverageArea?.lga?.uuid || "",
      geofence_id: coverageArea?.geofence?.uuid || "",
      enable_geofence: Boolean(coverageArea?.enable_geofence),
    }),
    [coverageArea]
  )

  if (!coverageArea) {
    return null
  }

  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    lga_id: Yup.string().required("LGA is required"),
    geofence_id: Yup.string().nullable().when("enable_geofence", { is: true, then: (s) => s.required("Geofence is required"), otherwise: (s) => s.nullable() }),
    enable_geofence: Yup.boolean(),
  })

  const handleSubmit = async (values: any, helpers: any) => {
    try {
      const payload = {
        name: values.name,
        lga_id: values.lga_id,
        geofence_id: values.geofence_id || null,
        enable_geofence: Boolean(values.enable_geofence),
      }
      await updateCoverageArea({ id: coverageArea.uuid, data: payload }).unwrap()
      toast({
        title: "Success",
        description: "Coverage area updated successfully",
      })
      fetchEntity()
      router.push(`/dashboard/locations/coverage-areas/${coverageArea.uuid}`)
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
      selectedLabel: coverageArea.lga?.name || "",
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
      selectedLabel: coverageArea.geofence?.name || "",
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
        title="Edit Coverage Area"
        description="Update coverage area details"
      />
      <BusinessForm
        title="Coverage Area Information"
        description="Update the details for this coverage area"
        initialValues={initialValues}
        validationSchema={validationSchema}
        fields={createFields()}
        isLoading={isLoading}
        onSubmit={handleSubmit}
        submitLabel="Update Coverage Area"
        onCancel={() => router.back()}
        cardClassName="max-w-2xl"
      />
    </div>
  )
}
