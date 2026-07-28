import type { Participant } from "../types/participant"
import { createEntity } from "./entityFactory"

export const participants = createEntity<Participant>({
  reducerPath: "participantsApi",
  entityEndpoint: "customer-signups",
  entityName: "Participant",
})

export const {
  useGetAllQuery: useGetParticipantsQuery,
  useGetByIdQuery: useGetParticipantQuery,
  useCreateMutation: useCreateParticipantMutation,
  useUpdateMutation: useUpdateParticipantMutation,
  useDeleteMutation: useDeleteParticipantMutation,
} = participants
