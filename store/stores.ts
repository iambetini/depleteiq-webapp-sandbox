import type { Store } from "../types/store"
import { createEntity } from "./entityFactory"

export const stores = createEntity<Store>({
  reducerPath: "storesApi",
  entityEndpoint: "stores",
  entityName: "Store",
})

export const {
  useGetAllQuery: useGetStoresQuery,
  useGetByIdQuery: useGetStoreQuery,
  useCreateMutation: useCreateStoreMutation,
  useUpdateMutation: useUpdateStoreMutation,
  useDeleteMutation: useDeleteStoreMutation,
} = stores
