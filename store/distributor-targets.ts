import { Target } from "@/types/target";
import { createEntity } from "./entityFactory";

export const distributorTargets = createEntity<Target>({
  reducerPath: "distributorTargetsApi",
  entityEndpoint: "targets",
  entityName: "Target",
});
export const {
  useGetAllQuery: useGetDistributorTargetsQuery,
  useGetByIdQuery: useGetDistributorTargetQuery,
  useCreateMutation: useCreateDistributorTargetMutation,
  useUpdateMutation: useUpdateDistributorTargetMutation,
  useDeleteMutation: useDeleteDistributorTargetMutation,
} = distributorTargets;
