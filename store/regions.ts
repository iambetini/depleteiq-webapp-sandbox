import { Region } from "@/types/region";
import { createEntity } from "./entityFactory";

export const regions = createEntity<Region>({
  reducerPath: "regionsApi",
  entityEndpoint: "regions",
  entityName: "Region",
});
export const {
  useGetAllQuery: useGetRegionsQuery,
  useGetByIdQuery: useGetRegionQuery,
  useCreateMutation: useCreateRegionMutation,
  useUpdateMutation: useUpdateRegionMutation,
  useDeleteMutation: useDeleteRegionMutation,
} = regions;
