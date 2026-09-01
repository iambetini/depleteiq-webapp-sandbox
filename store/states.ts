import { State } from "@/types/state";
import { createEntity } from "./entityFactory";

export const states = createEntity<State>({
  reducerPath: "statesApi",
  entityEndpoint: "states",
  entityName: "State",
});
export const {
  useGetAllQuery: useGetStatesQuery,
  useGetByIdQuery: useGetStateQuery,
  useCreateMutation: useCreateStateMutation,
  useUpdateMutation: useUpdateStateMutation,
  useDeleteMutation: useDeleteStateMutation,
} = states;
