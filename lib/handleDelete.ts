import { toast } from "@/hooks/use-toast";
import { store, storeApis } from "@/store/index";

/**
 * Handles deletion of an entity using the appropriate store's delete mutation.
 * This function now returns a confirmation handler that can be used with a modal.
 *
 * @param storeName - The name of the store (e.g., "vehicles", "brands")
 * @param uuid - The UUID of the entity to delete
 * @param entityLabel - Optional label for the entity (e.g., "vehicle", "brand")
 * @param onSuccess - Optional callback to execute on successful deletion
 * @param onError - Optional callback to execute on failed deletion
 * @param confirmMessage - Optional custom confirmation message
 * @param confirmTitle - Optional custom confirmation title
 * @param confirmText - Optional custom confirm button text
 * @param cancelText - Optional custom cancel button text
 * @param useModal - Whether to use modal confirmation (default: true) or browser confirm (false)
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

  // If useModal is false, fall back to browser confirm
  if (!useModal) {
    const message =
      confirmMessage || `Are you sure you want to delete this ${displayName}?`;
    if (!window.confirm(message)) return;
  }

  try {
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

    if (onSuccess) onSuccess();
  } catch (error) {
    toast({
      title: "Error",
      description: `Failed to delete ${displayName}`,
      variant: "destructive",
    });

    if (onError) onError();
  }
}
