import { useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getTargetColumns } from "@/components/dashboard/columns/TargetColumns";
import { handleDelete } from "@/lib/handleDelete";

export function useTargetColumns(refreshTable: () => void) {
  const router = useRouter();
  const deleteHandler = useCallback(
    (uuid: string) => {
      handleDelete({
        storeName: "targets",
        uuid,
        onSuccess: refreshTable,
      });
    },
    [refreshTable],
  );

  const columns = useMemo(
    () => getTargetColumns({ router, handleDelete: deleteHandler }),
    [router, deleteHandler],
  );

  return { columns };
}
