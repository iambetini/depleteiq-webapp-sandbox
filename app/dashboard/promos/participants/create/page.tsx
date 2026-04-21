"use client"

import { BusinessForm } from "@/components/dashboard/BusinessForm"
import ViewPageHeader from "@/components/dashboard/ViewPageHeader"
import { toast } from "@/hooks/use-toast"
import { catchError } from "@/lib/utils"
import { useCreateParticipantMutation } from "@/store/participants"
import { useRouter } from "next/navigation"
import { useRef } from "react"
import * as Yup from "yup"

export default function CreateParticipantPage() {
  const router = useRouter()
  const [createParticipant, { isLoading }] = useCreateParticipantMutation()
  const formRef = useRef<any>(null)

  const initialValues = {
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    phone_network: "",
  }

  const validationSchema = Yup.object({
    first_name: Yup.string().required("First name is required"),
    last_name: Yup.string().required("Last name is required"),
    phone: Yup.string().nullable(),
    email: Yup.string().email("Invalid email").nullable(),
    phone_network: Yup.string().nullable(),
  })

  const handleSubmit = async (values: typeof initialValues, helpers: any) => {
    try {
      await createParticipant(values).unwrap()
      toast({
        title: "Success",
        description: "Participant created successfully",
      })
      helpers.resetForm()
      router.push("/dashboard/promos/participants")
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
      name: "phone",
      label: "Phone",
      type: "text" as const,
      required: false,
      placeholder: "Enter phone number",
    },
    {
      name: "email",
      label: "Email",
      type: "email" as const,
      required: false,
      placeholder: "Enter email address",
    },
    {
      name: "phone_network",
      label: "Phone Network",
      type: "text" as const,
      required: false,
      placeholder: "Enter phone network",
    },
  ]

  return (
    <div>
      <ViewPageHeader
        title="Create Participant"
        description="Add a new participant to the system"
      />
      <BusinessForm
        title="Create Participant"
        description="Enter the details for the new participant"
        initialValues={initialValues}
        validationSchema={validationSchema}
        fields={fields}
        isLoading={isLoading}
        onSubmit={handleSubmit}
        submitLabel="Create Participant"
        onCancel={() => router.back()}
        cardClassName="max-w-2xl"
        ref={formRef}
      />
    </div>
  )
}
