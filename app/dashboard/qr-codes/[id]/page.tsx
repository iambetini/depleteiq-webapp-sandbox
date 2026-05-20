"use client"

import ViewPageHeader from "@/components/dashboard/ViewPageHeader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Download, Link as LinkIcon, Loader2, Unlink } from "lucide-react"
import { useSession } from "next-auth/react"
import { useContext } from "./layout"
import { useEffect, useState } from "react"
import * as QRCode from "qrcode"
import { useUnassignQrCodeMutation } from "@/store/qr-codes"
import { useToast } from "@/hooks/use-toast"
import { QRCodeAssignmentDialog } from "@/components/qr-code/qr-code-assignment-dialog"

export default function QrCodeDetailPage() {
  const { data: session } = useSession()
  const user = session?.user
  const { qrcode } = useContext()
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [showUnassignConfirmation, setShowUnassignConfirmation] = useState(false)
  const [unassignQrCode, { isLoading: isUnassigning }] = useUnassignQrCodeMutation()
  const { toast } = useToast()

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

  // Handle unassign click - show confirmation
  const handleUnassignClick = () => {
    setShowUnassignConfirmation(true)
  }

  // Handle confirm unassign
  const handleConfirmUnassign = async () => {
    if (!qrcode) return

    try {
      await unassignQrCode(qrcode.uuid).unwrap()
      toast({
        title: "Success",
        description: "QR code unassigned successfully",
      })
      setShowUnassignConfirmation(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to unassign QR code",
        variant: "destructive",
      })
    }
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
        <div className="space-y-6">
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

          {/* Assignment Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#444444]">Assignment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {qrcode.store ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Assigned Store</p>
                      <p className="text-sm text-muted-foreground">
                        {qrcode.store.name || qrcode.store.uuid}
                      </p>
                      {qrcode.store.address && (
                        <p className="text-xs text-muted-foreground">
                          {qrcode.store.address}
                        </p>
                      )}
                    </div>
                    <Badge>Assigned</Badge>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleUnassignClick}
                    disabled={isUnassigning}
                  >
                    <Unlink className="mr-2 h-4 w-4" />
                    Unassign
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    This QR code is not assigned to any store.
                  </p>
                  <Button
                    type="button"
                    className="w-full"
                    onClick={() => setShowAssignDialog(true)}
                  >
                    <LinkIcon className="mr-2 h-4 w-4" />
                    Assign to Store
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

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

      <QRCodeAssignmentDialog
        open={showAssignDialog}
        onOpenChange={setShowAssignDialog}
        qrCodeId={qrcode.uuid}
      />

      <AlertDialog open={showUnassignConfirmation} onOpenChange={setShowUnassignConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Unassign</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unassign this QR code from the store? This action cannot be easily undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <p className="text-sm">
              <span className="font-medium">QR Code Reference:</span> {qrcode.reference}
            </p>
            {qrcode.store && (
              <p className="text-sm">
                <span className="font-medium">Store:</span> {qrcode.store.name}
              </p>
            )}
          </div>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel onClick={() => setShowUnassignConfirmation(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmUnassign} disabled={isUnassigning}>
              {isUnassigning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Unassign
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
