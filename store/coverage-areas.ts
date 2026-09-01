import type { CoverageArea } from "@/types/coverage-area";
import { createEntity } from "./entityFactory";

export const coverageAreas = createEntity<CoverageArea>({
  reducerPath: "coverageAreasApi",
  entityEndpoint: "coverage-areas",
  entityName: "CoverageArea",
});

export const {
  useGetAllQuery: useGetCoverageAreasQuery,
  useGetByIdQuery: useGetCoverageAreaQuery,
  useCreateMutation: useCreateCoverageAreaMutation,
  useUpdateMutation: useUpdateCoverageAreaMutation,
  useDeleteMutation: useDeleteCoverageAreaMutation,
} = coverageAreas;
