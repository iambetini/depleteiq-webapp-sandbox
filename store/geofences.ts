import type { Geofence } from "@/types/geofence";
import { createEntity } from "./entityFactory";

export const geofences = createEntity<Geofence>({
  reducerPath: "geofencesApi",
  entityEndpoint: "geofences",
  entityName: "Geofence",
});

export const {
  useGetAllQuery: useGetGeofencesQuery,
  useGetByIdQuery: useGetGeofenceQuery,
  useCreateMutation: useCreateGeofenceMutation,
  useUpdateMutation: useUpdateGeofenceMutation,
  useDeleteMutation: useDeleteGeofenceMutation,
} = geofences;
