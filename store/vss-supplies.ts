import type { VssSupply } from "../types/vss-supply";
import { createEntity } from "./entityFactory";

export const vssSupplies = createEntity<VssSupply>({
  reducerPath: "vssSuppliesApi",
  entityEndpoint: "vss-supplies",
  entityName: "VssSupply",
});

export const {
  useGetAllQuery: useGetVssSuppliesQuery,
  useGetByIdQuery: useGetVssSupplyQuery,
  useCreateMutation: useCreateVssSupplyMutation,
  useUpdateMutation: useUpdateVssSupplyMutation,
  useDeleteMutation: useDeleteVssSupplyMutation,
} = vssSupplies;
