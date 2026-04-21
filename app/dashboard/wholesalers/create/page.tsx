"use client"

import UserForm from "@/components/dashboard/UserForm"
import ViewPageHeader from "@/components/dashboard/ViewPageHeader"
import { toast } from "@/hooks/use-toast"
import { userFullNameEmailFormatter } from "@/lib/label-formatters"
import { catchError } from "@/lib/utils"
import { useCreateWholesalerMutation } from "@/store/wholesalers"
import { useRouter } from "next/navigation"
import { useRef } from "react"
import * as Yup from "yup"

export default function CreateWholesalerPage() {
  const router = useRouter()
  const [createWholesaler, { isLoading }] = useCreateWholesalerMutation()
  const formRef = useRef<any>(null)

  const initialValues = {
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    business_name: "",
    business_address: "",
    business_category: "",
    tpe_user_id: "",
    send_notification: false,
  }

  const validationSchema = Yup.object({
    first_name: Yup.string().required("First name is required"),
    last_name: Yup.string().required("Last name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    phone: Yup.string().required("Phone is required"),
    password: Yup.string().required("Password is required"),
    business_name: Yup.string().required("Business name is required"),
    business_address: Yup.string().required("Business address is required"),
    business_category: Yup.string().nullable(),
    tpe_user_id: Yup.string().nullable(),
    send_notification: Yup.boolean(),
  })

  const handleSubmit = async (values: typeof initialValues, helpers: any) => {
    try {
      await createWholesaler(values).unwrap()
      toast({
        title: "Success",
        description: "Wholesaler created successfully",
      })
      helpers.resetForm()
      router.push("/dashboard/wholesalers")
    } catch (error: any) {
      catchError(error, helpers.setFieldError)
    } finally {
      helpers.setSubmitting(false)
    }
  }

  const fields = [
    {
      name: "business_name",
      label: "Business Name",
      type: "text" as const,
      required: true,
      placeholder: "Enter business name",
      section: "Business Information",
    },
    {
      name: "business_address",
      label: "Address",
      type: "text" as const,
      required: true,
      placeholder: "Enter business address",
      section: "Business Information",
    },
    {
      name: "business_category",
      label: "Business Category (Optional)",
      type: "text" as const,
      required: false,
      placeholder: "e.g., Retail, Wholesale, Distribution, etc.",
      section: "Business Information",
    },
    {
      name: "first_name",
      label: "First Name",
      type: "text" as const,
      required: true,
      placeholder: "Enter first name",
      section: "User Information",
    },
    {
      name: "last_name",
      label: "Last Name",
      type: "text" as const,
      required: true,
      placeholder: "Enter last name",
      section: "User Information",
    },
    {
      name: "email",
      label: "Email",
      type: "email" as const,
      required: true,
      placeholder: "Enter email address",
      section: "User Information",
    },
    {
      name: "phone",
      label: "Phone",
      type: "text" as const,
      required: true,
      placeholder: "Enter phone number (international format)",
      section: "User Information",
    },
    {
      name: "password",
      label: "Password",
      type: "password" as const,
      required: true,
      placeholder: "Enter password",
      section: "User Information",
    },
    {
      name: "tpe_user_id",
      label: "TPE",
      type: "selectWithFetch" as const,
      required: false,
      fetchUrl: "/users?roles=tpe",
      valueKey: "uuid",
      labelFormatter: userFullNameEmailFormatter,
      placeholder: "Select TPE user",
      section: "Assignment",
    },
    {
      name: "send_notification",
      label: "Send login credentials to user",
      type: "switch" as const,
      section: "Options",
    },
  ]

  return (
    <div>
      <ViewPageHeader
        title="Create Wholesaler"
        description="Add a new wholesaler to the system"
      />
      <UserForm
        title="Create Wholesaler"
        description="Enter the details for the new wholesaler"
        initialValues={initialValues}
        validationSchema={validationSchema}
        fields={fields}
        isLoading={isLoading}
        onSubmit={handleSubmit}
        submitLabel="Create Wholesaler"
        onCancel={() => router.back()}
        cardClassName="max-w-4xl"
        ref={formRef}
      />
    </div>
  )
}
