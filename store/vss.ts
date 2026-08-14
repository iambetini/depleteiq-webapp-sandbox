import type { User } from "../types/user";
import { createEntity } from "./entityFactory";

export const vss = createEntity<User>({
  reducerPath: "vssApi",
  entityEndpoint: "users",
  entityName: "Vss",
});

export const {
  useGetAllQuery: useGetVSSsQuery,
  useGetByIdQuery: useGetVSSQuery,
  useCreateMutation: useCreateVSSMutation,
  useUpdateMutation: useUpdateVSSMutation,
  useDeleteMutation: useDeleteVSSMutation,
} = vss;
