"use client"

import UserForm from "@/components/dashboard/UserForm"
import ViewPageHeader from "@/components/dashboard/ViewPageHeader"
import { toast } from "@/hooks/use-toast"
import { catchError } from "@/lib/utils"
import { useCreatePromoterMutation } from "@/store/promoters"
import { useRouter } from "next/navigation"
import { useRef } from "react"
import * as Yup from "yup"

export default function CreatePromoterPage() {
  const router = useRouter()
  const [createPromoter, { isLoading }] = useCreatePromoterMutation()
  const formRef = useRef<any>(null)

  const initialValues = {
    market_id: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    phone: "",
  }

  const validationSchema = Yup.object({
    market_id: Yup.string().required("Market is required"),
    first_name: Yup.string()
      .max(255, "First name must be at most 255 characters")
      .required("First name is required"),
    last_name: Yup.string()
      .max(255, "Last name must be at most 255 characters")
      .required("Last name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
    phone: Yup.string().nullable(),
  })

  const handleSubmit = async (values: typeof initialValues, helpers: any) => {
    try {
      const payload = {
        market_id: values.market_id,
        first_name: values.first_name.trim(),
        last_name: values.last_name.trim(),
        email: values.email.trim(),
        password: values.password,
        ...(values.phone?.trim() ? { phone: values.phone.trim() } : {}),
      }

      await createPromoter(payload).unwrap()
      toast({
        title: "Success",
        description: "Promoter created successfully",
      })
      helpers.resetForm()
      router.push("/dashboard/field-agents/promoters")
    } catch (error: any) {
      catchError(error, helpers.setFieldError)
    } finally {
      helpers.setSubmitting(false)
    }
  }

  const fields = [
    {
      name: "market_id",
      label: "Market",
      type: "selectWithFetch" as const,
      required: true,
      fetchUrl: "/markets",
      valueKey: "uuid",
      labelKey: "name",
      placeholder: "Select market",
    },
    {
      name: "email",
      label: "Email",
      type: "email" as const,
      required: true,
      placeholder: "Enter email address",
    },
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
      name: "phone",
      label: "Phone",
      type: "text" as const,
      required: false,
      placeholder: "Enter phone number (optional)",
    },
    {
      name: "password",
      label: "Password",
      type: "password" as const,
      required: true,
      placeholder: "Enter password (min 6 characters)",
    },
  ]

  return (
    <div>
      <ViewPageHeader
        title="Create Promoter"
        description="Add a new promoter to the system"
      />
      <UserForm
        title="Create Promoter"
        description="Enter the details for the new promoter"
        initialValues={initialValues}
        validationSchema={validationSchema}
        fields={fields}
        isLoading={isLoading}
        onSubmit={handleSubmit}
        submitLabel="Create Promoter"
        onCancel={() => router.back()}
        cardClassName="max-w-2xl"
        ref={formRef}
      />
    </div>
  )
}
