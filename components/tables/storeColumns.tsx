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

export function useStoreColumns(
  refreshTable?: () => void
): ColumnDef<any, any>[] {
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
    },
    {
      accessorKey: "type",
      header: "Type",
    },
    {
      accessorKey: "category",
      header: "Category",
    },
    {
      accessorKey: "market.name",
      header: "Market",
    },
    {
      accessorKey: "address",
      header: "Address",
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
                onClick={() => handleUnassign(row.original.promoter.uuid, row.original.uuid)}
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
