import { TPE } from "@/types/tpe"
import { createEntity } from "./entityFactory"

export const tpes = createEntity<TPE>({
  reducerPath: "tpesApi",
  entityEndpoint: "tpes",
  entityName: "TPE",
})

export const {
  useGetAllQuery: useGetTPEsQuery,
  useGetByIdQuery: useGetTPEQuery,
  useCreateMutation: useCreateTPEMutation,
  useUpdateMutation: useUpdateTPEMutation,
  useDeleteMutation: useDeleteTPEMutation,
} = tpes
