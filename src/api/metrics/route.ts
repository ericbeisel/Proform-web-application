import axios from "axios";
import { getAuthToken } from "@/lib/auth/session";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.paxlete.com";

// ===========================================
// TYPES
// ===========================================

export interface UserMetrics {
  comprehensive_benchPress: number;
  comprehensive_backSquat: number;
  comprehensive_powerClean: number;
  comprehensive_deadlift: number;
  comprehensive_ov_strength?: number;
  adjusted_overall_strength?: number;
  r_bench_press: number;
  r_back_squat: number;
  r_power_clean: number;
  r_deadlift: number;
  old_bench_cmp?: number;
  old_squat_cmp?: number;
  old_clean_cmp?: number;
  old_deadlift_cmp?: number;
  bench_cmp_updated_at?: string;
  squat_cmp_updated_at?: string;
  clean_cmp_updated_at?: string;
  deadlift_cmp_updated_at?: string;
}

export interface PlayerCardData {
  date: string;
  name: string;
  currentWeight: number | null;
  bodyCampScore: number;
  height: number | null;
  smm: number;
  bodyFat: number | null;
  diff_days: number | null;
}

export interface OtherDetail {
  bench_cmp?: number;
  squat_cmp?: number;
  clean_cmp?: number;
  deadlift_cmp?: number;
  r_bench_press?: number;
  r_back_squat?: number;
  r_power_clean?: number;
  r_deadlift?: number;
  old_bench_cmp?: number;
  old_squat_cmp?: number;
  old_clean_cmp?: number;
  old_deadlift_cmp?: number;
  bodyCampScore?: number;
  measurement_unit?: string;
}

export interface DashboardUser {
  id: number;
  name?: string;
  username?: string;
  OtherDetail?: OtherDetail;
}

export interface DashboardData {
  user: DashboardUser;
}

export interface UpdateMetricsPayload {
  comprehensive_benchPress?: number;
  comprehensive_backSquat?: number;
  comprehensive_powerClean?: number;
  comprehensive_deadlift?: number;
  r_bench_press?: number;
  r_back_squat?: number;
  r_power_clean?: number;
  r_deadlift?: number;
}

export interface UpdateMetricsResponse {
  message: string;
  data?: UserMetrics;
}

// ===========================================
// ERROR HANDLER
// ===========================================

type ErrorPayload = { message?: string; error?: string };

function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<ErrorPayload>(error)) {
    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      fallback
    );
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

// ===========================================
// AXIOS CLIENT
// ===========================================

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
     console.log("[metricsApi] token:", token);
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);


// ===========================================
// METRICS API
// ===========================================

export const getMetrics = async (): Promise<UserMetrics> => {
  console.log("[metricsApi] getMetrics → GET /metrics");
  try {
    const { data } = await apiClient.get<{ message: string; data: UserMetrics }>("/metrics");
    console.log("[metricsApi] getMetrics ✅", data.data);
    return data.data;
  } catch (error: unknown) {
    console.error("[metricsApi] getMetrics ❌", error);
    throw new Error(getErrorMessage(error, "Failed to fetch metrics."));
  }
};

export const updateMetrics = async (
  payload: UpdateMetricsPayload,
): Promise<UpdateMetricsResponse> => {
  console.log("[metricsApi] updateMetrics → POST /update-metrics", payload);
  try {
    const cleaned: Record<string, number> = {};
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        cleaned[key] = Number(value);
      }
    });
    const { data } = await apiClient.post<UpdateMetricsResponse>(
      "/update-metrics",
      cleaned,
    );
    console.log("[metricsApi] updateMetrics ✅", data);
    return data;
  } catch (error: unknown) {
    console.error("[metricsApi] updateMetrics ❌", error);
    throw new Error(getErrorMessage(error, "Failed to update metrics."));
  }
};

export const getPlayerCard = async (): Promise<PlayerCardData> => {
  console.log("[metricsApi] getPlayerCard → GET /player-card");
  try {
    const { data } = await apiClient.get<PlayerCardData>("/player-card");
    console.log("[metricsApi] getPlayerCard ✅", data);
    return data;
  } catch (error: unknown) {
    console.error("[metricsApi] getPlayerCard ❌", error);
    throw new Error(getErrorMessage(error, "Failed to fetch player card."));
  }
};

export const getDashboard = async (): Promise<DashboardData> => {
  console.log("[metricsApi] getDashboard → GET /dashboard");
  try {
    const { data } = await apiClient.get<DashboardData>("/dashboard");
    console.log("[metricsApi] getDashboard ✅", data);
    return data;
  } catch (error: unknown) {
    console.error("[metricsApi] getDashboard ❌", error);
    throw new Error(getErrorMessage(error, "Failed to fetch dashboard."));
  }
};

export const metricsApi = {
  getMetrics,
  updateMetrics,
  getPlayerCard,
  getDashboard,
};

export default metricsApi;
