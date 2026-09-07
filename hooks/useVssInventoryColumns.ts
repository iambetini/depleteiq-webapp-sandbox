import { getVssInventoryColumns } from "@/components/dashboard/columns/VssInventoryColumns";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

export function useVssInventoryColumns(variant?: "order" | "supply") {
  const router = useRouter();
  const columns = useMemo(() => getVssInventoryColumns({ router, variant }), [router, variant]);
  return { columns, router };
}
