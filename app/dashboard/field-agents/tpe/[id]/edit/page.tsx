"use client"

import UserForm from "@/components/dashboard/UserForm"
import ViewPageHeader from "@/components/dashboard/ViewPageHeader"
import { toast } from "@/hooks/use-toast"
import { catchError } from "@/lib/utils"
import { useUpdateTPEMutation } from "@/store/tpe"
import { useRouter } from "next/navigation"
import { useRef } from "react"
import * as Yup from "yup"
import { useContext } from "../layout"

export default function EditTPEPage() {
  const router = useRouter()
  const { tpe, fetchEntity } = useContext()
  const [updateTPE, { isLoading }] = useUpdateTPEMutation()
  const formRef = useRef<any>(null)

  if (!tpe) {
    return null
  }

  const assignedMarket = tpe.market_assignment || tpe.market

  const initialValues = {
    first_name: tpe.first_name || "",
    last_name: tpe.last_name || "",
    email: tpe.email || "",
    phone: tpe.phone || "",
    market_id: assignedMarket?.uuid || "",
  }

  const validationSchema = Yup.object({
    first_name: Yup.string(),
    last_name: Yup.string(),
    email: Yup.string().email("Invalid email"),
    phone: Yup.string(),
    market_id: Yup.string().nullable(),
  })

  const handleSubmit = async (values: typeof initialValues, helpers: any) => {
    try {
      await updateTPE({ id: tpe.uuid, data: values }).unwrap()
      toast({
        title: "Success",
        description: "TPE user updated successfully",
      })
      fetchEntity()
      router.push("/dashboard/field-agents/tpe")
    } catch (error: any) {
      catchError(error, helpers.setFieldError)
    } finally {
      helpers.setSubmitting(false)
    }
  }

  const fields = [
    {
      name: "first_name",
      label: "First Name",
      type: "text" as const,
      required: false,
      placeholder: "Enter first name",
    },
    {
      name: "last_name",
      label: "Last Name",
      type: "text" as const,
      required: false,
      placeholder: "Enter last name",
    },
    {
      name: "email",
      label: "Email",
      type: "email" as const,
      required: false,
      placeholder: "Enter email address",
    },
    {
      name: "phone",
      label: "Phone",
      type: "text" as const,
      required: false,
      placeholder: "Enter phone number (international format)",
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
      selectedLabel: assignedMarket?.name || assignedMarket?.full_name || "",
    },
  ]

  return (
    <div>
      <ViewPageHeader
        title="Update TPE"
        description="Update TPE user details"
      />
      <UserForm
        title="TPE Information"
        description="Update the details for this TPE user"
        initialValues={initialValues}
        validationSchema={validationSchema}
        fields={fields}
        isLoading={isLoading}
        onSubmit={handleSubmit}
        submitLabel="Update TPE"
        onCancel={() => router.back()}
        cardClassName="max-w-2xl"
        ref={formRef}
      />
    </div>
  )
}
