import axios from "axios";
import { getAuthToken } from "@/lib/auth/session";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.paxlete.com";

function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    return (error.response?.data as { message?: string } | undefined)?.message ?? fallback;
  }
  return error instanceof Error ? error.message : fallback;
}

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export interface Purchase {
  id: string;
  status?: string;
  amount?: number;
  workoutTitle?: string;
  creatorName?: string;
  duration?: string;
  createdAt: string;
  expiresAt: string;
  [key: string]: unknown;
}

export const getPurchases = async (
  status?: "all" | "active" | "expired",
): Promise<Purchase[]> => {
  try {
    const url = status ? `/payments/purchases?status=${status}` : "/payments/purchases";
    const { data } = await apiClient.get<Purchase[]>(url);
    return Array.isArray(data) ? data : [];
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to fetch purchase history."));
  }
};

export const createPaymentIntent = async (
  workoutId: string,
): Promise<{ clientSecret: string; paymentIntentId: string }> => {
  try {
    const { data } = await apiClient.post("/payments/create-intent", { workoutId });
    return data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to create payment intent."));
  }
};
