import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { getDistributorColumns } from "@/components/dashboard/columns/DistributorColumns";

export function useDistributorColumns(refreshTable: () => void) {
  const router = useRouter();

  const columns = useMemo(
    () => getDistributorColumns({ router, refreshTable }),
    [router, refreshTable],
  );

  return { columns, router };
}
