import { getOrderColumns } from "@/components/dashboard/columns/OrderColumns";
import { useUpdateOrderMutation } from "@/store/orders";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";

export function useOrderColumns() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [updateOrder] = useUpdateOrderMutation();

  const columns = useMemo(
    () =>
      getOrderColumns({ session, router, updateOrder, currentPath: pathname }),
    [session, router, updateOrder, pathname],
  );

  return { columns, session, router, updateOrder };
}
