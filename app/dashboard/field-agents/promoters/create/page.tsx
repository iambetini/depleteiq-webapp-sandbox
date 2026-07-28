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
    tpe_user_id: "",
    password: "",
  }


  const validationSchema = Yup.object({
    market_id: Yup.string().required("Market is required"),
    first_name: Yup.string().required("First name is required"),
    last_name: Yup.string().required("Last name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    tpe_user_id: Yup.string().nullable(),
    password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  })

  const handleSubmit = async (values: typeof initialValues, helpers: any) => {
    try {
      await createPromoter(values).unwrap()
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
      name: "password",
      label: "Password",
      type: "password" as const,
      required: true,
      placeholder: "Enter password",
    },
    {
      name: "tpe_user_id",
      label: "TPE Supervisor",
      type: "selectWithFetch" as const,
      required: false,
      fetchUrl: "/tpes",
      valueKey: "uuid",
      labelKey: "uuid",
      labelFormatter: (user: any) => `${user.first_name} ${user.last_name} (${user.email})`,
      placeholder: "Select TPE supervisor (optional)",
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
