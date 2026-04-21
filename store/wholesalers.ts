import { Wholesaler } from "@/types/wholesaler"
import { createEntity } from "./entityFactory"

export const wholesalers = createEntity<Wholesaler>({
  reducerPath: "wholesalersApi",
  entityEndpoint: "wholesalers",
  entityName: "Wholesaler",
})

export const {
  useGetAllQuery: useGetWholesalersQuery,
  useGetByIdQuery: useGetWholesalerQuery,
  useCreateMutation: useCreateWholesalerMutation,
  useUpdateMutation: useUpdateWholesalerMutation,
  useDeleteMutation: useDeleteWholesalerMutation,
} = wholesalers
