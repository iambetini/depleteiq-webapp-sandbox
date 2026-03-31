import type { Business } from "../types/business"
import { createEntity } from "./entityFactory"

export const businesses = createEntity<Business>({
  reducerPath: "businessesApi",
  entityEndpoint: "businesses",
  entityName: "Business",
})

export const {
  useGetAllQuery: useGetBusinessesQuery,
  useGetByIdQuery: useGetBusinessQuery,
  useCreateMutation: useCreateBusinessMutation,
  useUpdateMutation: useUpdateBusinessMutation,
  useDeleteMutation: useDeleteBusinessMutation,
} = businesses
