import type { Notification } from "@/types/notification";
import { createEntity } from "./entityFactory";

export const notifications = createEntity<
  Notification,
  Partial<Notification>,
  Partial<Notification>
>({
  reducerPath: "notificationsApi",
  entityEndpoint: "notifications",
});

export const {
  useGetAllQuery: useGetNotificationsQuery,
  useGetByIdQuery: useGetNotificationQuery,
  useCreateMutation: useCreateNotificationMutation,
  useUpdateMutation: useUpdateNotificationMutation,
  useDeleteMutation: useDeleteNotificationMutation,
} = notifications;

// Custom helper for storing FCM token via extraPath
export const useStoreFcmToken = () => {
  // Reuse the POST via create with extraPath
  const [create] = useCreateNotificationMutation();
  return async (token: string) => {
    await create({
      data: { fcm_token: token } as any,
      extraPath: "store-token",
    });
  };
};
