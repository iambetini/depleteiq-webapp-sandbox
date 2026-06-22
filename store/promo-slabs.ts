import type { PromoSlab } from "../types/promo-slab"
import { createEntity } from "./entityFactory"

export const promoSlabs = createEntity<PromoSlab>({
  reducerPath: "promoSlabsApi",
  entityEndpoint: "promo-slabs",
  entityName: "PromoSlab",
})

export const {
  useGetAllQuery: useGetPromoSlabsQuery,
  useGetByIdQuery: useGetPromoSlabQuery,
  useCreateMutation: useCreatePromoSlabMutation,
  useUpdateMutation: useUpdatePromoSlabMutation,
  useDeleteMutation: useDeletePromoSlabMutation,
} = promoSlabs