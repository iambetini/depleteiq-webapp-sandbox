"use client"

import { BusinessForm } from "@/components/dashboard/BusinessForm"
import ViewPageHeader from "@/components/dashboard/ViewPageHeader"
import { toast } from "@/hooks/use-toast"
import { catchError } from "@/lib/utils"
import { useUpdateLgaMutation } from "@/store/lgas"
import { useRouter } from "next/navigation"
import { useMemo } from "react"
import { useContext } from "../layout"
import * as Yup from "yup"

export default function EditLgaPage() {
  const router = useRouter()
  const { lga, fetchEntity } = useContext()
  const [updateLga, { isLoading }] = useUpdateLgaMutation()

  const initialValues = useMemo(
    () => ({
      name: lga?.name || "",
      state_id: lga?.state?.uuid || "",
    }),
    [lga]
  )

  if (!lga) {
    return null
  }

  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    state_id: Yup.string().required("State is required"),
  })

  const handleSubmit = async (values: any, helpers: any) => {
    try {
      const payload = {
        name: values.name,
        state_id: values.state_id,
      }
      await updateLga({ id: lga.uuid, data: payload }).unwrap()
      toast({
        title: "Success",
        description: "LGA updated successfully",
      })
      fetchEntity()
      router.push(`/dashboard/locations/lgas/${lga.uuid}`)
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
      selectedLabel: lga.state?.name || "",
      placeholder: "Select state",
    },
  ]

  return (
    <div>
      <ViewPageHeader
        title="Edit LGA"
        description="Update LGA details"
      />
      <BusinessForm
        title="LGA Information"
        description="Update the details for this LGA"
        initialValues={initialValues}
        validationSchema={validationSchema}
        fields={createFields()}
        isLoading={isLoading}
        onSubmit={handleSubmit}
        submitLabel="Update LGA"
        onCancel={() => router.back()}
        cardClassName="max-w-2xl"
      />
    </div>
  )
}
