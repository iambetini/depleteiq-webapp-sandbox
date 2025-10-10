import { Market } from "@/types/market";
import { createEntity } from "./entityFactory";

export const markets = createEntity<Market>({
  reducerPath: "marketsApi",
  entityEndpoint: "markets",
  entityName: "Market",
});
export const {
  useGetAllQuery: useGetMarketsQuery,
  useGetByIdQuery: useGetMarketQuery,
  useCreateMutation: useCreateMarketMutation,
  useUpdateMutation: useUpdateMarketMutation,
  useDeleteMutation: useDeleteMarketMutation,
} = markets;
