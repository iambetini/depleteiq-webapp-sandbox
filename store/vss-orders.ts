import type { VssOrder } from "../types/vss-order";
import { createEntity } from "./entityFactory";

export const vssOrders = createEntity<VssOrder>({
  reducerPath: "vssOrdersApi",
  entityEndpoint: "vss-orders",
  entityName: "VssOrder",
});

export const {
  useGetAllQuery: useGetVssOrdersQuery,
  useGetByIdQuery: useGetVssOrderQuery,
  useCreateMutation: useCreateVssOrderMutation,
  useUpdateMutation: useUpdateVssOrderMutation,
  useDeleteMutation: useDeleteVssOrderMutation,
} = vssOrders;
