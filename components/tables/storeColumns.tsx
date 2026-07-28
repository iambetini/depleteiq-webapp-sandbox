import { Edit, Eye, MoreHorizontal, Trash2, Unlink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { handleDelete } from "@/lib/handleDelete";
import type { ColumnDef } from "@/components/ui/data-table-types";
import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useDispatch } from "react-redux";
import { storeApis } from "@/store";
import { unassignStoresFromPromoter } from "@/lib/promoter-unassign";
import type { Store } from "@/types/store";

export function useStoreColumns(
  refreshTable?: () => void
): ColumnDef<Store, unknown>[] {
  const router = useRouter();
  const { toast } = useToast();
  const dispatch = useDispatch();

  const handleUnassign = async (promoterUuid: string, storeUuid: string) => {
    try {
      await unassignStoresFromPromoter(promoterUuid, [storeUuid]);
      refreshTable?.();
      toast({
        title: "Success",
        description: "Store unassigned successfully",
      });
      dispatch(storeApis.stores.util.invalidateTags(["Store"] as any));
      dispatch(storeApis.promoters.util.invalidateTags(["Promoter"] as any));
    } catch (e: any) {
      toast({
        title: "Error",
        description: e?.response?.data?.message || e?.message || "Failed to unassign store",
        variant: "destructive",
      });
    }
  };

  const deleteHandler = useCallback((uuid: string) => {
    handleDelete({
      storeName: "stores",
      uuid,
      onSuccess: refreshTable,
    });
  }, [refreshTable]);

  return [
    {
      accessorKey: "business.name",
      header: "Business",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.business?.name || "—"}</div>
          {row.original.business?.user?.full_name && (
            <div className="text-sm text-muted-foreground">
              {row.original.business.user.full_name}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "business.user.phone",
      header: "Phone",
      cell: ({ row }) =>
        row.original.business?.user?.phone || row.original.business?.phone || "—",
    },
    {
      accessorKey: "business.type",
      header: "Type",
      cell: ({ row }) => (
        <span className="capitalize">{row.original.business?.type || "—"}</span>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => row.original.category || "—",
    },
    {
      accessorKey: "market.name",
      header: "Market",
      cell: ({ row }) => row.original.market?.full_name || row.original.market?.name || "—",
    },
    {
      accessorKey: "promo_class",
      header: "Promo Class",
      cell: ({ row }) => (
        <span className="capitalize">{row.original.promo_class || "—"}</span>
      ),
    },
    {
      accessorKey: "in_market",
      header: "In Market",
      cell: ({ row }) => (row.original.in_market ? "Yes" : "No"),
    },
    {
      accessorKey: "has_qr",
      header: "Has QR Code",
      cell: ({ row }) => (row.original.has_qr ? "Yes" : "No"),
    },
    {
      accessorKey: "business.address",
      header: "Address",
      cell: ({ row }) => (
        <div
          className="max-w-[250px] text-sm"
          title={row.original.business?.address || undefined}
        >
          {row.original.business?.address || "—"}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push(`/dashboard/stores/${row.original.uuid}`)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/dashboard/stores/${row.original.uuid}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            {row.original.promoter && (
              <DropdownMenuItem
                onClick={() => handleUnassign(row.original.promoter!.uuid, row.original.uuid)}
              >
                <Unlink className="mr-2 h-4 w-4" />
                Remove Promoter
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => deleteHandler(row.original.uuid)}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
}
