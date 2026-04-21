import type { Promo } from "../types/promo"
import { createEntity } from "./entityFactory"

export const promos = createEntity<Promo>({
  reducerPath: "promosApi",
  entityEndpoint: "promos",
  entityName: "Promo",
})

export const {
  useGetAllQuery: useGetPromosQuery,
  useGetByIdQuery: useGetPromoQuery,
  useCreateMutation: useCreatePromoMutation,
  useUpdateMutation: useUpdatePromoMutation,
  useDeleteMutation: useDeletePromoMutation,
} = promos
