import { Role } from "@/types/role";
import { createEntity } from "./entityFactory";

export const roles = createEntity<Role>({
  reducerPath: "rolesApi",
  entityEndpoint: "roles",
  entityName: "Role",
});
export const {
  useGetAllQuery: useGetRolesQuery,
  useGetByIdQuery: useGetRoleQuery,
  useCreateMutation: useCreateRoleMutation,
  useUpdateMutation: useUpdateRoleMutation,
  useDeleteMutation: useDeleteRoleMutation,
} = roles;
