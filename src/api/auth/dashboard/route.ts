import axios from 'axios';
import { getAuthToken } from '@/lib/auth/session';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://paxlete.com/api';

export type DashboardResponse = {
  user?: Record<string, unknown>;
  OtherDetail?: Record<string, unknown>;
} & Record<string, unknown>;

export const getDashboardData = async (): Promise<DashboardResponse> => {
  try {
    const token = getAuthToken();
    const { data } = await axios.get<DashboardResponse>(`${API_BASE}/dashboard`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    return data;
  } catch (error: unknown) {
    const message =
      axios.isAxiosError<{ message?: string }>(error)
        ? (error.response?.data?.message ?? error.message)
        : 'Failed to load dashboard.';
    throw new Error(message);
  }
};
