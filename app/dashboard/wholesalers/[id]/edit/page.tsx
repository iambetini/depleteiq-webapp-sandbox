"use client"

import UserForm from "@/components/dashboard/UserForm"
import ViewPageHeader from "@/components/dashboard/ViewPageHeader"
import { toast } from "@/hooks/use-toast"
import { userFullNameEmailFormatter } from "@/lib/label-formatters"
import { catchError } from "@/lib/utils"
import {
    useUpdateWholesalerMutation,
} from "@/store/wholesalers"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import * as Yup from "yup"
import { useContext } from "../layout"

export default function EditWholesalerPage() {
  const { wholesaler, isLoading, fetchWholesaler } = useContext()
  const router = useRouter()
  const [updateWholesaler, { isLoading: isUpdating }] = useUpdateWholesalerMutation()
  const [initialValues, setInitialValues] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    business_name: "",
    business_address: "",
    business_category: "",
    tpe_user_id: "",
  })
  const formRef = useRef<any>(null)

  useEffect(() => {
    if (wholesaler) {
      setInitialValues({
        first_name: wholesaler.user?.first_name || "",
        last_name: wholesaler.user?.last_name || "",
        email: wholesaler.user?.email || "",
        phone: wholesaler.user?.phone || "",
        business_name: wholesaler.business?.name || "",
        business_address: wholesaler.business?.address || "",
        business_category: wholesaler.business?.type || "",
        tpe_user_id: wholesaler.tpe_user?.uuid || "",
      })
    }
  }, [wholesaler])

  const validationSchema = Yup.object({
    first_name: Yup.string(),
    last_name: Yup.string(),
    email: Yup.string().email("Invalid email"),
    phone: Yup.string(),
    business_name: Yup.string(),
    business_address: Yup.string(),
    business_category: Yup.string().nullable(),
    tpe_user_id: Yup.string().nullable(),
  })

  const handleSubmit = async (values: typeof initialValues, helpers: any) => {
    try {
      await updateWholesaler({ id: wholesaler!.uuid, data: values }).unwrap()
      toast({
        title: "Success",
        description: "Wholesaler updated successfully",
      })
      fetchWholesaler()
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
      required: false,
      placeholder: "Enter business name",
      section: "Business Information",
    },
    {
      name: "business_address",
      label: "Address",
      type: "text" as const,
      required: false,
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
      required: false,
      placeholder: "Enter first name",
      section: "User Information",
    },
    {
      name: "last_name",
      label: "Last Name",
      type: "text" as const,
      required: false,
      placeholder: "Enter last name",
      section: "User Information",
    },
    {
      name: "email",
      label: "Email",
      type: "email" as const,
      required: false,
      placeholder: "Enter email address",
      section: "User Information",
    },
    {
      name: "phone",
      label: "Phone",
      type: "text" as const,
      required: false,
      placeholder: "Enter phone number (international format)",
      section: "User Information",
    },
    {
      name: "tpe_user_id",
      label: "TPE",
      type: "selectWithFetch" as const,
      required: false,
      store: "users",
      valueKey: "uuid",
      labelKey: "email",
      labelFormatter: userFullNameEmailFormatter,
      placeholder: "Select TPE user",
      initialSearch: wholesaler?.tpe_user?.email || "",
      params: { roles: "tpe" },
      section: "Assignment",
    },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!wholesaler) {
    return null
  }

  return (
    <div>
      <ViewPageHeader
        title="Edit Wholesaler"
        description="Update wholesaler details"
      />
      <UserForm
        title="Edit Wholesaler"
        description="Update the details for this wholesaler"
        initialValues={initialValues}
        validationSchema={validationSchema}
        fields={fields}
        isLoading={isUpdating}
        onSubmit={handleSubmit}
        submitLabel="Update Wholesaler"
        onCancel={() => router.back()}
        cardClassName="max-w-4xl"
        ref={formRef}
      />
    </div>
  )
}
