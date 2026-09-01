"use client"

import { BusinessForm } from "@/components/dashboard/BusinessForm"
import ViewPageHeader from "@/components/dashboard/ViewPageHeader"
import { toast } from "@/hooks/use-toast"
import { catchError } from "@/lib/utils"
import { useUpdateStateMutation } from "@/store/states"
import { useRouter } from "next/navigation"
import { useMemo } from "react"
import { useContext } from "../layout"
import * as Yup from "yup"

export default function EditStatePage() {
  const router = useRouter()
  const { state, fetchEntity } = useContext()
  const [updateState, { isLoading }] = useUpdateStateMutation()

  const initialValues = useMemo(
    () => ({
      name: state?.name || "",
      region_id: state?.region?.uuid || "",
    }),
    [state]
  )

  if (!state) {
    return null
  }

  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    region_id: Yup.string().required("Region is required"),
  })

  const handleSubmit = async (values: any, helpers: any) => {
    try {
      const payload = {
        name: values.name,
        region_id: values.region_id,
      }
      await updateState({ id: state.uuid, data: payload }).unwrap()
      toast({
        title: "Success",
        description: "State updated successfully",
      })
      fetchEntity()
      router.push(`/dashboard/locations/states/${state.uuid}`)
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
      selectedLabel: state.region?.name || "",
      placeholder: "Select region",
    },
  ]

  return (
    <div>
      <ViewPageHeader
        title="Edit State"
        description="Update state details"
      />
      <BusinessForm
        title="State Information"
        description="Update the details for this state"
        initialValues={initialValues}
        validationSchema={validationSchema}
        fields={createFields()}
        isLoading={isLoading}
        onSubmit={handleSubmit}
        submitLabel="Update State"
        onCancel={() => router.back()}
        cardClassName="max-w-2xl"
      />
    </div>
  )
}