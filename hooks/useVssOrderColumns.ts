import { getVssOrderColumns } from "@/components/dashboard/columns/VssOrderColumns";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

export function useVssOrderColumns() {
  const router = useRouter();

  const columns = useMemo(() => getVssOrderColumns({ router }), [router]);

  return { columns, router };
}
