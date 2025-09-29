import { useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getDistributorColumns } from "@/components/dashboard/columns/DistributorColumns";
import { handleDelete } from "@/lib/handleDelete";

export function useDistributorColumns(refreshTable: () => void) {
  const router = useRouter();
  const deleteHandler = useCallback(
    (uuid: string) => {
      handleDelete({
        storeName: "distributors",
        uuid,
        onSuccess: refreshTable,
      });
    },
    [refreshTable],
  );

  const columns = useMemo(
    () => getDistributorColumns({ router, handleDelete: deleteHandler }),
    [router, deleteHandler],
  );

  return { columns };
}
