// src/api/hydration/route.ts
import axios from "axios";
import { getAuthToken } from "@/lib/auth/session";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.paxlete.com";

// ===========================================
// TYPES
// ===========================================

export interface ProteinRecord {
  id: string;
  label: string;
  value: number;
  unit: string;
}

export interface HydrateRecord {
  id: string;
  title: string;
  created_date: string;
  updated_date: string;
  owner: string;
  oz_number: number;
  member_id: string;
  hydrate_zone_id: string;
  protein_records: string; // JSON string that needs parsing
  calories: number | null;
  upload_image: string | null;
}

export interface HydrationZone {
  id: string;
  title: string;
  created_date: string;
  updated_date: string;
  owner: string;
  picture: string;
  oz_number: number;
  order: number;
  hydrate_records: HydrateRecord[];
}

export interface AddHydrationPayload {
  title: string;                    // Add this - e.g., "My Hydration"
  oz_number: number;                // e.g., 8, 16, 24
  hydrate_zone_id: string;          // Zone ID
  protein_records: string;          // This should be a JSON string, not an array
  calories?: number;                // Optional
  upload_image?: string | null;     // Optional
}

export interface AddHydrationResponse {
  message: string;
  data: HydrateRecord;
}

export interface CustomActivity {
  id: number;                        // number, not string
  name: string;
  type: string;
  user_id: number;
  day: string;
  recurring: string;
  status: number;
  time: string;                      // "07:00" format
  completed_activity: boolean | null; // null from API, not false
  workout_preferences_type: number;
  remove: boolean;
  day_number: number;
  created_at: string;
  updated_at: string;
}

export interface CompleteCustomActivityResponse {
  message: string;
  record: HydrateRecord;
}


export type TodayHydration = HydrateRecord[];

// ===========================================
// ERROR HANDLER
// ===========================================

type ErrorPayload = {
  message?: string;
  error?: string;
};

function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<ErrorPayload>(error)) {
    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      fallback
    );
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

// ===========================================
// AXIOS CLIENT
// ===========================================

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

// ===========================================
// HYDRATION API
// ===========================================

export const getHydrationZones = async (): Promise<HydrationZone[]> => {
  try {
    const { data } = await apiClient.get<HydrationZone[]>("/hydration/zones");
    console.log("📋 Hydration zones response:", data);
    return data;
  } catch (error: unknown) {
    throw new Error(
      getErrorMessage(error, "Failed to fetch hydration zones."),
    );
  }
};

export const addHydrationRecord = async (
  payload: AddHydrationPayload
): Promise<AddHydrationResponse> => {
  try {
    const { data } = await apiClient.post<AddHydrationResponse>("/hydration/records", payload);
    console.log("📋 Add hydration response:", data);
    return data;
  } catch (error: unknown) {
    throw new Error(
      getErrorMessage(error, "Failed to add hydration record."),
    );
  }
};

export const getTodayHydration = async (): Promise<HydrateRecord[]> => {
  try {
    const { data } = await apiClient.get<HydrateRecord[]>("/hydration/today");
    console.log("📋 Today's hydration response:", data);
    return data;
  } catch (error: unknown) {
    throw new Error(
      getErrorMessage(error, "Failed to fetch today's hydration data."),
    );
  }
};

export const getCustomActivities = async (): Promise<CustomActivity[]> => {
  try {
    const { data } = await apiClient.get<CustomActivity[]>("/hydration/custom-activities");
    console.log("📋 Custom activities:", data);
    return Array.isArray(data) ? data : [];
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to fetch custom activities."));
  }
};

export const deleteCustomActivity = async (activityId: number): Promise<{ message: string }> => {
  const { data } = await apiClient.delete(`/hydration/custom-activities/${activityId}`);
  return data;
};

export const completeCustomActivity = async (customActivityId: number): Promise<any> => {
  const { data } = await apiClient.post("/hydration/custom-activities/complete", {
    custom_activity_id: customActivityId  // already a number, no parseInt needed
  });
  return data;
};

export const hydrationApi = {
  getHydrationZones,
  addHydrationRecord,
  getTodayHydration,
  getCustomActivities,
  completeCustomActivity,
  deleteCustomActivity,
};

export default hydrationApi;