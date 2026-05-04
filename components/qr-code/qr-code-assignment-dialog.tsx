"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { SelectWithFetch } from "@/components/ui/select"
import { useAssignQrCodeMutation } from "@/store/qr-codes"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface QRCodeAssignmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  qrCodeId: string
  onSuccess?: () => void
}

export function QRCodeAssignmentDialog({
  open,
  onOpenChange,
  qrCodeId,
  onSuccess,
}: QRCodeAssignmentDialogProps) {
  const [selectedStoreId, setSelectedStoreId] = useState<string>("")
  const [selectedStoreName, setSelectedStoreName] = useState<string>("")
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [assignQrCode, { isLoading: isAssigning }] = useAssignQrCodeMutation()
  const { toast } = useToast()

  const handleAssignClick = async () => {
    if (!selectedStoreId) {
      toast({
        title: "Error",
        description: "Please select a store",
        variant: "destructive",
      })
      return
    }
    setShowConfirmation(true)
  }

  const handleConfirmAssign = async () => {
    try {
      await assignQrCode({
        id: qrCodeId,
        data: {
          store_uuid: selectedStoreId,
        },
      }).unwrap()

      toast({
        title: "Success",
        description: "QR code assigned to store successfully",
      })

      setSelectedStoreId("")
      setSelectedStoreName("")
      setShowConfirmation(false)
      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to assign QR code",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Assign QR Code to Store</DialogTitle>
            <DialogDescription>
              Select a store to assign this QR code to.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="store">Store</Label>
              <SelectWithFetch
                store="stores"
                value={selectedStoreId}
                onChange={(value) => {
                  setSelectedStoreId(value)
                }}
                valueKey="uuid"
                labelKey="name"
                placeholder="Select a store..."
                searchParam="search"
                params={{ assigned: false }}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isAssigning}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAssignClick}
              disabled={isAssigning || !selectedStoreId}
            >
              {isAssigning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Assignment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to assign this QR code to the selected store?
              Any existing store assignment will be replaced.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel onClick={() => setShowConfirmation(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAssign} disabled={isAssigning}>
              {isAssigning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
