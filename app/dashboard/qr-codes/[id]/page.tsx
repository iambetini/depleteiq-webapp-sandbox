"use client"

import ViewPageHeader from "@/components/dashboard/ViewPageHeader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"
import { useSession } from "next-auth/react"
import { useContext } from "./layout"
import { useEffect, useState } from "react"
import * as QRCode from "qrcode"

export default function QrCodeDetailPage() {
  const { data: session } = useSession()
  const user = session?.user
  const { qrcode } = useContext()
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)

  if (!qrcode) {
    return null
  }

  // Generate QR code from reference
  useEffect(() => {
    if (qrcode?.reference) {
      generateQrCode(qrcode.reference)
    }
  }, [qrcode?.reference])

  const generateQrCode = async (reference: string) => {
    if (!reference) {
      setQrCodeDataUrl("")
      return
    }

    try {
      setIsGenerating(true)
      const dataUrl = await QRCode.toDataURL(reference, {
        width: 300,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      })
      setQrCodeDataUrl(dataUrl)
    } catch (error) {
      console.error("Error generating QR code:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    if (!qrCodeDataUrl || !qrcode) return

    const link = document.createElement("a")
    link.href = qrCodeDataUrl
    link.download = `qrcode-${qrcode.uuid}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const userRole = user?.role?.name?.toLowerCase() || ""

  return (
    <div>
      <ViewPageHeader
        title="QR Code Details"
        description="View detailed information about this QR code"
        showEditButton={true}
        editHref={`/dashboard/qr-codes/${qrcode.uuid}/edit`}
        showDeleteButton={["super-admin", "admin", "manager"].includes(userRole)}
        deleteOptions={{
          storeName: "qrCodes",
          uuid: qrcode.uuid,
        }}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[#444444]">Information</CardTitle>
            <CardDescription>QR code details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Reference</label>
              <p className="text-base font-semibold">{qrcode.reference}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Type</label>
              <p className="text-base font-semibold">{qrcode.type || "—"}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <p className="text-base font-semibold">{qrcode.status || "—"}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Created</label>
              <p className="text-base font-semibold">
                {qrcode.created_at
                  ? new Date(qrcode.created_at).toLocaleDateString()
                  : "—"}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Updated</label>
              <p className="text-base font-semibold">
                {qrcode.updated_at
                  ? new Date(qrcode.updated_at).toLocaleDateString()
                  : "—"}
              </p>
            </div>
          </CardContent>
        </Card>

                {/* QR Code Display Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[#444444]">QR Code</CardTitle>
            <CardDescription>Generated from reference</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-4 py-6">
            {isGenerating ? (
              <div className="flex items-center justify-center h-[300px] w-[300px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : qrCodeDataUrl ? (
              <>
                <img
                  src={qrCodeDataUrl}
                  alt="QR Code"
                  className="border-2 border-gray-200 rounded-lg"
                />
                <Button onClick={handleDownload} className="gap-2">
                  <Download className="h-4 w-4" />
                  Download QR Code
                </Button>
              </>
            ) : null}
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
