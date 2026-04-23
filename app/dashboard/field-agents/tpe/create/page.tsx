"use client"

import UserForm from "@/components/dashboard/UserForm"
import ViewPageHeader from "@/components/dashboard/ViewPageHeader"
import { toast } from "@/hooks/use-toast"
import { catchError } from "@/lib/utils"
import { useCreateTPEMutation } from "@/store/tpe"
import { useRouter } from "next/navigation"
import { useRef } from "react"
import * as Yup from "yup"

export default function CreateTPEPage() {
  const router = useRouter()
  const [createTPE, { isLoading }] = useCreateTPEMutation()
  const formRef = useRef<any>(null)

  const initialValues = {
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    market_id: "",
    send_notification: false,
  }

  const validationSchema = Yup.object({
    first_name: Yup.string().required("First name is required"),
    last_name: Yup.string().required("Last name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    phone: Yup.string().required("Phone is required"),
    password: Yup.string().required("Password is required"),
    market_id: Yup.string().nullable(),
    send_notification: Yup.boolean(),
  })

  const handleSubmit = async (values: typeof initialValues, helpers: any) => {
    try {
      await createTPE(values).unwrap()
      toast({
        title: "Success",
        description: "TPE user created successfully",
      })
      helpers.resetForm()
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
      required: true,
      placeholder: "Enter first name",
    },
    {
      name: "last_name",
      label: "Last Name",
      type: "text" as const,
      required: true,
      placeholder: "Enter last name",
    },
    {
      name: "email",
      label: "Email",
      type: "email" as const,
      required: true,
      placeholder: "Enter email address",
    },
    {
      name: "phone",
      label: "Phone",
      type: "text" as const,
      required: true,
      placeholder: "Enter phone number (international format)",
    },
    {
      name: "password",
      label: "Password",
      type: "password" as const,
      required: true,
      placeholder: "Enter password",
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
      name: "send_notification",
      label: "Send Welcome Email",
      type: "checkbox" as const,
      required: false,
    },
  ]

  return (
    <div>
      <ViewPageHeader
        title="Create TPE"
        description="Add a new TPE (Third Party Executor) to the system"
      />
      <UserForm
        title="Create TPE"
        description="Enter the details for the new TPE user"
        initialValues={initialValues}
        validationSchema={validationSchema}
        fields={fields}
        isLoading={isLoading}
        onSubmit={handleSubmit}
        submitLabel="Create TPE"
        onCancel={() => router.back()}
        cardClassName="max-w-2xl"
        ref={formRef}
      />
    </div>
  )
}
