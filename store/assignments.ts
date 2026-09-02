import type { Assignment, AssignmentPayload } from "@/types/assignment";
import { createEntity } from "./entityFactory";

export const assignments = createEntity<Assignment, AssignmentPayload, AssignmentPayload>({
  reducerPath: "assignmentsApi",
  entityEndpoint: "vss-assignments",
  entityName: "Assignment",
});

export const {
  useGetAllQuery: useGetAssignmentsQuery,
  useGetByIdQuery: useGetAssignmentQuery,
  useCreateMutation: useCreateAssignmentMutation,
  useUpdateMutation: useUpdateAssignmentMutation,
  useDeleteMutation: useDeleteAssignmentMutation,
} = assignments;
