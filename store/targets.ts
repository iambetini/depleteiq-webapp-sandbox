import { Target } from "@/types/target";
import { createEntity } from "./entityFactory";

export const targets = createEntity<Target>({
  reducerPath: "targetsApi",
  entityEndpoint: "targets",
  entityName: "Target",
});
export const {
  useGetAllQuery: useGetTargetsQuery,
  useGetByIdQuery: useGetTargetQuery,
  useCreateMutation: useCreateTargetMutation,
  useUpdateMutation: useUpdateTargetMutation,
  useDeleteMutation: useDeleteTargetMutation,
} = targets;
