import type { Brand } from "../types/brand";
import { createEntity } from "./entityFactory";

export const brands = createEntity<Brand>({
  reducerPath: "brandsApi",
  entityEndpoint: "brands",
  entityName: "Brand",
});

export const {
  useGetAllQuery: useGetBrandsQuery,
  useGetByIdQuery: useGetBrandQuery,
  useCreateMutation: useCreateBrandMutation,
  useUpdateMutation: useUpdateBrandMutation,
  useDeleteMutation: useDeleteBrandMutation,
} = brands;
