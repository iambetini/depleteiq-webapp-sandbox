"use client"

import { BusinessForm } from "@/components/dashboard/BusinessForm"
import ViewPageHeader from "@/components/dashboard/ViewPageHeader"
import { toast } from "@/hooks/use-toast"
import { catchError } from "@/lib/utils"
import { useUpdateQrCodeMutation } from "@/store/qr-codes"
import { useRouter } from "next/navigation"
import { useContext } from "../layout"
import {
  qrCodeEditFormFields,
  qrCodeUpdateValidationSchema,
  type QRCodeEditFormValues,
} from "../../qr-code-form-config"

export default function EditQrCodePage() {
  const router = useRouter()
  const { qrcode, fetchEntity } = useContext()
  const [updateQrCode] = useUpdateQrCodeMutation()

  if (!qrcode) {
    return null
  }

  const handleSubmit = async (values: QRCodeEditFormValues, helpers: any) => {
    try {
      await updateQrCode({
        id: qrcode.uuid,
        data: {
          ...(values.type ? { type: values.type } : {}),
          ...(values.status ? { status: values.status } : {}),
        },
      }).unwrap()
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

  const initialValues: QRCodeEditFormValues = {
    type: (qrcode.type as QRCodeEditFormValues["type"]) || "",
    status:
      qrcode.status === "active" || qrcode.status === "inactive"
        ? qrcode.status
        : "active",
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
        validationSchema={qrCodeUpdateValidationSchema}
        fields={qrCodeEditFormFields as any}
        isLoading={false}
        onSubmit={handleSubmit}
        submitLabel="Update QR Code"
        onCancel={() => router.back()}
        cardClassName="max-w-2xl"
      />
    </div>
  )
}
