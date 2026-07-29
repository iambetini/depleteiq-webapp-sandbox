"use client"

import UserForm from "@/components/dashboard/UserForm"
import ViewPageHeader from "@/components/dashboard/ViewPageHeader"
import { toast } from "@/hooks/use-toast"
import { catchError } from "@/lib/utils"
import {
  useGetTPEQuery,
  useUpdateTPEMutation,
} from "@/store/tpe"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import * as Yup from "yup"

export default function EditTPEPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { data, isLoading: isFetching } = useGetTPEQuery(id)
  const [updateTPE, { isLoading }] = useUpdateTPEMutation()
  const [initialValues, setInitialValues] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    market_id: "",
  })
  const formRef = useRef<any>(null)

  useEffect(() => {
    if (data) {
      setInitialValues({
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        email: data.email || "",
        phone: data.phone || "",
        market_id: data.market_assignment?.uuid || data.market?.uuid || "",
      })
    }
  }, [data])

  const validationSchema = Yup.object({
    first_name: Yup.string(),
    last_name: Yup.string(),
    email: Yup.string().email("Invalid email"),
    phone: Yup.string(),
    market_id: Yup.string().nullable(),
  })

  const handleSubmit = async (values: typeof initialValues, helpers: any) => {
    try {
      await updateTPE({ id, data: values }).unwrap()
      toast({
        title: "Success",
        description: "TPE user updated successfully",
      })
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
    },
  ]

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

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
