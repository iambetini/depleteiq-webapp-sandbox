"use client"

import { BusinessForm } from "@/components/dashboard/BusinessForm"
import ViewPageHeader from "@/components/dashboard/ViewPageHeader"
import { toast } from "@/hooks/use-toast"
import { catchError } from "@/lib/utils"
import { useUpdateQrCodeMutation } from "@/store/qr-codes"
import { useRouter } from "next/navigation"
import { useContext } from "../layout"
import * as Yup from "yup"

export default function EditQrCodePage() {
  const router = useRouter()
  const { qrcode, fetchEntity } = useContext()
  const [updateQrCode] = useUpdateQrCodeMutation()

  if (!qrcode) {
    return null
  }

  const validationSchema = Yup.object({
    type: Yup.string().nullable(),
    status: Yup.string().nullable(),
  })

  const handleSubmit = async (values: any, helpers: any) => {
    try {
      await updateQrCode({ id: qrcode.uuid, data: values }).unwrap()
      toast({
        title: "Success",
        description: "QR code updated successfully",
      })
      fetchEntity()
      router.push(`/dashboard/qr-codes/${qrcode.uuid}`)
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

  const initialValues = {
    type: qrcode.type || "",
    status: qrcode.status || "active",
  }

  return (
    <div>
      <ViewPageHeader
        title="Edit QR Code"
        description="Update QR code details"
      />
      <BusinessForm
        title="Edit QR Code"
        description="Update the details for this QR code"
        initialValues={initialValues}
        validationSchema={validationSchema}
        fields={fields}
        isLoading={false}
        onSubmit={handleSubmit}
        submitLabel="Update QR Code"
        onCancel={() => router.back()}
        cardClassName="max-w-2xl"
      />
    </div>
  )
}
