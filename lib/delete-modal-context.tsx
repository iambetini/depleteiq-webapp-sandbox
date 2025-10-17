"use client"

import { ConfirmationModal } from "@/components/ui/confirmation-modal"
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react"
import { setGlobalDeleteModal } from "./handleDelete"

interface DeleteModalState {
  isOpen: boolean
  isDeleting: boolean
  pendingDelete: {
    uuid: string
    displayName: string
    capitalized: string
  } | null
}

interface DeleteModalContextType {
  showDeleteModal: (config: {
    uuid: string
    displayName: string
    capitalized: string
    onConfirm: () => void
    onCancel?: () => void
    title?: string
    message?: string
    confirmText?: string
    cancelText?: string
  }) => void
  hideDeleteModal: () => void
  setDeleting: (deleting: boolean) => void
  state: DeleteModalState
}

const DeleteModalContext = createContext<DeleteModalContextType | null>(null)

export function DeleteModalProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DeleteModalState>({
    isOpen: false,
    isDeleting: false,
    pendingDelete: null,
  })

  const [onConfirm, setOnConfirm] = useState<(() => void) | null>(null)
  const [onCancel, setOnCancel] = useState<(() => void) | null>(null)
  const [title, setTitle] = useState<string>("")
  const [message, setMessage] = useState<string>("")
  const [confirmText, setConfirmText] = useState<string>("Delete")
  const [cancelText, setCancelText] = useState<string>("Cancel")

  const showDeleteModal = useCallback((config: {
    uuid: string
    displayName: string
    capitalized: string
    onConfirm: () => void
    onCancel?: () => void
    title?: string
    message?: string
    confirmText?: string
    cancelText?: string
  }) => {
    setState({
      isOpen: true,
      isDeleting: false,
      pendingDelete: {
        uuid: config.uuid,
        displayName: config.displayName,
        capitalized: config.capitalized,
      },
    })
    setOnConfirm(() => config.onConfirm)
    setOnCancel(() => config.onCancel)
    setTitle(config.title || `Delete ${config.capitalized}`)
    setMessage(config.message || `Are you sure you want to delete this ${config.displayName}? This action cannot be undone.`)
    setConfirmText(config.confirmText || "Delete")
    setCancelText(config.cancelText || "Cancel")
  }, [])

  const hideDeleteModal = useCallback(() => {
    setState({
      isOpen: false,
      isDeleting: false,
      pendingDelete: null,
    })
    setOnConfirm(null)
    setOnCancel(null)
  }, [])

  const setDeleting = useCallback((deleting: boolean) => {
    setState(prev => ({ ...prev, isDeleting: deleting }))
  }, [])

  const handleConfirm = useCallback(() => {
    if (onConfirm) {
      onConfirm()
    }
  }, [onConfirm])

  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel()
    }
    hideDeleteModal()
  }, [onCancel, hideDeleteModal])

  // Register this modal context with the global handler
  useEffect(() => {
    setGlobalDeleteModal({
      showDeleteModal,
      hideDeleteModal,
      setDeleting,
    })

    // Cleanup on unmount
    return () => {
      setGlobalDeleteModal(null)
    }
  }, [showDeleteModal, hideDeleteModal, setDeleting])

  return (
    <DeleteModalContext.Provider value={{
      showDeleteModal,
      hideDeleteModal,
      setDeleting,
      state,
    }}>
      {children}
      <ConfirmationModal
        isOpen={state.isOpen}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        title={title}
        description={message}
        confirmText={confirmText}
        cancelText={cancelText}
        variant="destructive"
        isLoading={state.isDeleting}
      />
    </DeleteModalContext.Provider>
  )
}

export function useDeleteModal() {
  const context = useContext(DeleteModalContext)
  if (!context) {
    throw new Error("useDeleteModal must be used within a DeleteModalProvider")
  }
  return context
}
