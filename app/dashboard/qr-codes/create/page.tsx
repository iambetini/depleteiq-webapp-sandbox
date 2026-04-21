"use client"

import { BusinessForm } from "@/components/dashboard/BusinessForm"
import ViewPageHeader from "@/components/dashboard/ViewPageHeader"
import { toast } from "@/hooks/use-toast"
import { catchError } from "@/lib/utils"
import { useCreateQrCodeMutation } from "@/store/qr-codes"
import { useRouter } from "next/navigation"
import { useRef } from "react"
import * as Yup from "yup"

export default function CreateQrCodePage() {
  const router = useRouter()
  const [createQrCode, { isLoading }] = useCreateQrCodeMutation()
  const formRef = useRef<any>(null)

  const initialValues = {
    type: "",
    status: "active",
  }

  const validationSchema = Yup.object({
    type: Yup.string().nullable(),
    status: Yup.string().nullable(),
  })

  const handleSubmit = async (values: typeof initialValues, helpers: any) => {
    try {
      await createQrCode(values).unwrap()
      toast({
        title: "Success",
        description: "QR code created successfully",
      })
      helpers.resetForm()
      router.push("/dashboard/qr-codes")
    } catch (error: any) {
      catchError(error, helpers.setFieldError)
    } finally {
      helpers.setSubmitting(false)
    }
  }

  const fields = [
    {
      name: "type",
      label: "Type",
      type: "text" as const,
      required: false,
      placeholder: "Enter QR code type",
    },
    {
      name: "status",
      label: "Status",
      type: "text" as const,
      required: false,
      placeholder: "e.g., active, inactive",
    },
  ]

  return (
    <div>
      <ViewPageHeader
        title="Create QR Code"
        description="Add a new QR code to the system"
      />
      <BusinessForm
        title="Create QR Code"
        description="Enter the details for the new QR code"
        initialValues={initialValues}
        validationSchema={validationSchema}
        fields={fields}
        isLoading={isLoading}
        onSubmit={handleSubmit}
        submitLabel="Create QR Code"
        onCancel={() => router.back()}
        cardClassName="max-w-2xl"
        ref={formRef}
      />
    </div>
  )
}
