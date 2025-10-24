export type NotificationStatus = "unread" | "read" | "archived" | string;

export interface NotificationUserSummary {
  uuid: string;
  name?: string;
  email?: string;
}

export interface Notification {
  uuid: string;
  related_user?: NotificationUserSummary | null;
  type: string;
  title: string;
  body: string;
  meta?: any;
  read_at?: string | null;
  status?: NotificationStatus;
  created_at: string;
}
