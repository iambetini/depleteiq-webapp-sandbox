"use client"

import UserForm, { UserFormRef } from "@/components/dashboard/UserForm"
import ViewPageHeader from "@/components/dashboard/ViewPageHeader"
import { LocationModal } from "@/components/dashboard/LocationModal"
import { toast } from "@/hooks/use-toast"
import { userFullNameEmailFormatter } from "@/lib/label-formatters"
import { catchError } from "@/lib/utils"
import { useCreateDistributorMutation } from "@/store/distributors"
import { useRouter } from "next/navigation"
import { useDispatch } from "react-redux"
import { useState } from "react"
import * as Yup from "yup"

export default function CreateDistributorPage() {
  const [createDistributor, { isLoading }] = useCreateDistributorMutation()
  const router = useRouter()
  const dispatch = useDispatch()
  const [locationModalOpen, setLocationModalOpen] = useState(false)
  const [formRef, setFormRef] = useState<UserFormRef | null>(null)

  const initialValues = {
    first_name: "",
    last_name: "",
    category: "",
    email: "",
    phone: "",
    password: "",
    business_name: "",
    address: "",
    ime_vss_user_id: "",
    location_id: "",
    send_notification: false,
  }

  const validationSchema = Yup.object({
    first_name: Yup.string().required("First name is required"),
    last_name: Yup.string().required("Last name is required"),
    category: Yup.string().required("Category is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    phone: Yup.string(),
    password: Yup.string().required("Password is required"),
    business_name: Yup.string().required("Business name is required"),
    address: Yup.string().required("Address is required"),
    ime_vss_user_id: Yup.string().required("IME VSS User is required"),
    location_id: Yup.string().required("Location is required"),
    send_notification: Yup.boolean(),
  })

  const handleSubmit = async (values: typeof initialValues, helpers: any) => {
    try {
      await createDistributor(values).unwrap()
      toast({
        title: "Success",
        description: "Distributor created successfully",
      })
      helpers.resetForm()
    } catch (error: any) {
      catchError(error, helpers.setFieldError);
    } finally {
      helpers.setSubmitting(false)
    }
  }

  const handleLocationCreated = (locationId: string) => {
    // Update the form field with the new location ID
    if (formRef && formRef.setFieldValue) {
      formRef.setFieldValue("location_id", locationId)
    }
    setLocationModalOpen(false)
  }

  const handleFieldUpdate = (fieldName: string, value: any) => {
    if (formRef && formRef.setFieldValue) {
      formRef.setFieldValue(fieldName, value)
    }
  }

  const fields = [
    {
      name: "business_name",
      label: "Business Name",
      type: "text" as const,
      required: true,
      placeholder: "Enter business name",
    },
    {
      name: "category",
      label: "Category",
      type: "text" as const,
      required: true,
      placeholder: "Enter category",
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
      placeholder: "Enter email",
    },
    {
      name: "phone",
      label: "Phone",
      type: "text" as const,
      required: false,
      placeholder: "Enter phone number",
    },
    {
      name: "password",
      label: "Password",
      type: "password" as const,
      required: true,
      placeholder: "Enter password",
    },
    {
      name: "ime_vss_user_id",
      label: "Assign IME/VSS Team",
      type: "selectWithFetch" as const,
      required: true,
      fetchUrl: "/users?roles=ime,vss",
      valueKey: "uuid",
      labelFormatter: userFullNameEmailFormatter,
      placeholder: "Select IME/VSS user",
    },
    {
      name: "location_id",
      label: "Location",
      type: "selectWithFetchAndCreate" as const,
      required: true,
      fetchUrl: "/locations",
      valueKey: "uuid",
      labelKey: "full_location",
      placeholder: "Select location",
      onCreateNew: () => setLocationModalOpen(true),
      createButtonText: "Create Location",
    },
    {
      name: "address",
      label: "Address",
      type: "textarea" as const,
      required: true,
      placeholder: "Enter address",
      rows: 3,
    }
  ]

  return (
    <div>
      <ViewPageHeader title="Create Distributor" description="Add a new distributor to the system" />
      <UserForm
        title="Create Distributor"
        description="Enter the details for the new distributor"
        initialValues={initialValues}
        validationSchema={validationSchema}
        fields={fields}
        isLoading={isLoading}
        onSubmit={handleSubmit}
        submitLabel="Create Distributor"
        onCancel={() => router.back()}
        cardClassName="max-w-4xl"
        onFieldUpdate={handleFieldUpdate}
        ref={setFormRef}
      />
      <LocationModal
        open={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        onLocationCreated={handleLocationCreated}
      />
    </div>
  )
}
