import axios from "axios";
import { getAuthToken } from "@/lib/auth/session";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://paxlete.com/api";

export interface NotificationActor {
  id?: number;
  name?: string;
  username?: string;
  image?: string | null;
}

export interface NotificationItem {
  id: number;
  title?: string;
  message?: string;
  body?: string;
  description?: string;
  is_read?: boolean;
  read?: boolean;
  created_at?: string;
  date?: string;
  timestamp?: string;
  type?: string;
  user?: NotificationActor | null;
  player?: NotificationActor | null;
}

export interface NotificationsResponse {
  notifications: NotificationItem[];
  total?: number;
  page?: number;
  limit?: number;
  hasMore?: boolean;
}

const apiClient = axios.create({ baseURL: API_BASE });

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers["Content-Type"] = "application/json";
  return config;
});

export const notificationsApi = {
  getNotifications: async (
    page: number = 1,
    limit: number = 20
  ): Promise<NotificationsResponse> => {
    const { data } = await apiClient.get("/notifications", {
      params: { page, limit },
    });

    const list: NotificationItem[] = data?.notifications || data?.data || data || [];

    return {
      notifications: Array.isArray(list) ? list : [],
      total: data?.total,
      page: data?.page ?? page,
      limit: data?.limit ?? limit,
      hasMore: data?.hasMore ?? (Array.isArray(list) ? list.length >= limit : false),
    };
  },

  markAsRead: async (id?: number): Promise<void> => {
    await apiClient.post("/notifications/read", id ? { id } : {});
  },
};

export default notificationsApi;
