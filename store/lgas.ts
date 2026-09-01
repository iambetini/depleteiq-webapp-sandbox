import { Lga } from "@/types/lga";
import { createEntity } from "./entityFactory";

export const lgas = createEntity<Lga>({
  reducerPath: "lgasApi",
  entityEndpoint: "lgas",
  entityName: "Lga",
});
export const {
  useGetAllQuery: useGetLgasQuery,
  useGetByIdQuery: useGetLgaQuery,
  useCreateMutation: useCreateLgaMutation,
  useUpdateMutation: useUpdateLgaMutation,
  useDeleteMutation: useDeleteLgaMutation,
} = lgas;
