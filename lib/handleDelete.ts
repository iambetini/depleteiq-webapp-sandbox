import { toast } from "@/hooks/use-toast";
import { store, storeApis } from "@/store/index";

// Global reference to the modal context
let globalDeleteModal: {
  showDeleteModal: (config: any) => void;
  hideDeleteModal: () => void;
  setDeleting: (deleting: boolean) => void;
} | null = null;

// Function to set the global modal reference
export function setGlobalDeleteModal(modalContext: typeof globalDeleteModal) {
  globalDeleteModal = modalContext;
}

/**
 * Handle delete operation with optional modal confirmation
 */
export async function handleDelete({
  storeName,
  uuid,
  entityLabel,
  onSuccess,
  onError,
  confirmMessage,
  confirmTitle,
  confirmText = "Delete",
  cancelText = "Cancel",
  useModal = true,
}: {
  storeName: string;
  uuid: string;
  entityLabel?: string;
  onSuccess?: () => void;
  onError?: () => void;
  confirmMessage?: string;
  confirmTitle?: string;
  confirmText?: string;
  cancelText?: string;
  useModal?: boolean;
}) {
  // Get the display name for the entity
  const displayName =
    entityLabel ||
    (storeName.endsWith("s") && storeName.length > 1
      ? storeName.slice(0, -1)
      : storeName);

  const capitalized =
    displayName.charAt(0).toUpperCase() + displayName.slice(1);

  // If useModal is false, fall back to browser confirm
  if (!useModal) {
    const message =
      confirmMessage || `Are you sure you want to delete this ${displayName}?`;
    if (!window.confirm(message)) return;

    await executeDelete(
      storeName,
      uuid,
      displayName,
      capitalized,
      onSuccess,
      onError,
    );
    return;
  }

  // Use global modal if available
  if (globalDeleteModal) {
    globalDeleteModal.showDeleteModal({
      uuid,
      displayName,
      capitalized,
      title: confirmTitle,
      message: confirmMessage,
      confirmText,
      cancelText,
      onConfirm: () =>
        executeDelete(
          storeName,
          uuid,
          displayName,
          capitalized,
          onSuccess,
          onError,
        ),
    });
  } else {
    // Fallback to browser confirm if modal not available
    const message =
      confirmMessage || `Are you sure you want to delete this ${displayName}?`;
    if (!window.confirm(message)) return;

    await executeDelete(
      storeName,
      uuid,
      displayName,
      capitalized,
      onSuccess,
      onError,
    );
  }
}

/**
 * Execute the actual delete operation
 */
async function executeDelete(
  storeName: string,
  uuid: string,
  displayName: string,
  capitalized: string,
  onSuccess?: () => void,
  onError?: () => void,
) {
  if (globalDeleteModal) {
    globalDeleteModal.setDeleting(true);
  }

  try {
    // Get the store API
    const storeApi = (storeApis as any)[storeName];

    if (!storeApi) {
      console.error(`Store API not found for: ${storeName}`);
      toast({
        title: "Error",
        description: `Failed to delete ${displayName}: Store not found`,
        variant: "destructive",
      });
      if (onError) onError();
      return;
    }

    // Use the store's delete endpoint directly
    const result = await store.dispatch(
      storeApi.endpoints.delete.initiate(uuid),
    );

    if ("error" in result) {
      throw new Error(result.error?.message || "Delete operation failed");
    }

    toast({
      title: "Success",
      description: `${capitalized} deleted successfully`,
    });

    // Close modal if it's open
    if (globalDeleteModal) {
      globalDeleteModal.hideDeleteModal();
    }

    if (onSuccess) onSuccess();
  } catch (error) {
    toast({
      title: "Error",
      description: `Failed to delete ${displayName}`,
      variant: "destructive",
    });

    if (onError) onError();
  } finally {
    if (globalDeleteModal) {
      globalDeleteModal.setDeleting(false);
    }
  }
}
