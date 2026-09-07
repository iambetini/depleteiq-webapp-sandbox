import type { VssInventoryTransaction } from "../types/vss-inventory-transaction";
import { createEntity } from "./entityFactory";

export const vssInventoryTransactions = createEntity<VssInventoryTransaction>({
  reducerPath: "vssInventoryTransactionsApi",
  entityEndpoint: "vss-inventory-transactions",
  entityName: "VssInventoryTransaction",
});

export const {
  useGetAllQuery: useGetVssInventoryTransactionsQuery,
  useGetByIdQuery: useGetVssInventoryTransactionQuery,
  useCreateMutation: useCreateVssInventoryTransactionMutation,
  useUpdateMutation: useUpdateVssInventoryTransactionMutation,
  useDeleteMutation: useDeleteVssInventoryTransactionMutation,
} = vssInventoryTransactions;
