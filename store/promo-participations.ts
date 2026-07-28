import type { PromoParticipation } from "../types/promo-participation"
import { createEntity } from "./entityFactory"

export const promoParticipations = createEntity<PromoParticipation>({
  reducerPath: "promoParticipationsApi",
  entityEndpoint: "promo-participants",
  entityName: "PromoParticipation",
})

export const {
  useGetAllQuery: useGetPromoParticipationsQuery,
  useGetByIdQuery: useGetPromoParticipationQuery,
  useCreateMutation: useCreatePromoParticipationMutation,
  useUpdateMutation: useUpdatePromoParticipationMutation,
  useDeleteMutation: useDeletePromoParticipationMutation,
} = promoParticipations
