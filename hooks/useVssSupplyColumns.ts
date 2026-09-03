import { getVssSupplyColumns } from "@/components/dashboard/columns/VssSupplyColumns";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

export function useVssSupplyColumns() {
  const router = useRouter();
  const columns = useMemo(() => getVssSupplyColumns({ router }), [router]);
  return { columns, router };
}
