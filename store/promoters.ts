import type { Promoter } from "../types/promoter"
import { createEntity } from "./entityFactory"

export const promoters = createEntity<Promoter>({
  reducerPath: "promotersApi",
  entityEndpoint: "promoters",
  entityName: "Promoter",
})

export const {
  useGetAllQuery: useGetPromotersQuery,
  useGetByIdQuery: useGetPromoterQuery,
  useCreateMutation: useCreatePromoterMutation,
  useUpdateMutation: useUpdatePromoterMutation,
  useDeleteMutation: useDeletePromoterMutation,
} = promoters
