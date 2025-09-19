"use client"

import { useState, useCallback } from "react"
import { toast } from "@/hooks/use-toast"
import { store, storeApis } from "@/store/index"

interface UseDeleteConfirmationOptions {
  storeName: string
  entityLabel?: string
  onSuccess?: () => void
  onError?: () => void
  confirmMessage?: string
  confirmTitle?: string
  confirmText?: string
  cancelText?: string
}

export function useDeleteConfirmation(options: UseDeleteConfirmationOptions) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<{
    uuid: string
    displayName: string
    capitalized: string
  } | null>(null)

  const {
    storeName,
    entityLabel,
    onSuccess,
    onError,
    confirmMessage,
    confirmTitle,
    confirmText = "Delete",
    cancelText = "Cancel",
  } = options

  const showDeleteConfirmation = useCallback((uuid: string) => {
    const displayName =
      entityLabel ||
      (storeName.endsWith("s") && storeName.length > 1
        ? storeName.slice(0, -1)
        : storeName)

    const capitalized =
      displayName.charAt(0).toUpperCase() + displayName.slice(1)

    setPendingDelete({ uuid, displayName, capitalized })
    setIsModalOpen(true)
  }, [storeName, entityLabel])

  const handleConfirmDelete = useCallback(async () => {
    if (!pendingDelete) return

    setIsDeleting(true)

    try {
      const storeApi = (storeApis as any)[storeName]

      if (!storeApi) {
        console.error(`Store API not found for: ${storeName}`)
        toast({
          title: "Error",
          description: `Failed to delete ${pendingDelete.displayName}: Store not found`,
          variant: "destructive",
        })
        if (onError) onError()
        return
      }

      const result = await store.dispatch(
        storeApi.endpoints.delete.initiate(pendingDelete.uuid),
      )

      if ("error" in result) {
        throw new Error(result.error?.message || "Delete operation failed")
      }

      toast({
        title: "Success",
        description: `${pendingDelete.capitalized} deleted successfully`,
      })

      if (onSuccess) onSuccess()
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to delete ${pendingDelete.displayName}`,
        variant: "destructive",
      })

      if (onError) onError()
    } finally {
      setIsDeleting(false)
      setIsModalOpen(false)
      setPendingDelete(null)
    }
  }, [pendingDelete, storeName, onSuccess, onError])

  const handleCancelDelete = useCallback(() => {
    setIsModalOpen(false)
    setPendingDelete(null)
  }, [])

  return {
    showDeleteConfirmation,
    isModalOpen,
    isDeleting,
    pendingDelete,
    handleConfirmDelete,
    handleCancelDelete,
    confirmMessage,
    confirmTitle,
    confirmText,
    cancelText,
  }
}