import { Branch } from "@/types/branch";
import { createEntity } from "./entityFactory";

export const branches = createEntity<Branch>({
  reducerPath: "branchesApi",
  entityEndpoint: "branches",
});

export const {
  useGetAllQuery: useGetBranchesQuery,
  useGetByIdQuery: useGetBranchQuery,
  useCreateMutation: useCreateBranchMutation,
  useUpdateMutation: useUpdateBranchMutation,
  useDeleteMutation: useDeleteBranchMutation,
} = branches;
