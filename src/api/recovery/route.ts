// src/api/recovery/route.ts
import axios from "axios";
import { getAuthToken } from "@/lib/auth/session";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.paxlete.com";

// ===========================================
// TYPES
// ===========================================

export interface RecoveryZone {
  id: string;
  form: string;
  title: string;
  type: string;
  info: string;
  time: string;
  sponsor_ad: string;
  instructions: string;
  recovery_item_live: string;
  recovery_zone_all: string;
  from_dashboard: string;
  from_wo_complete: string;
  from_recovery_dash: string;
  suggested: string;
  image: string;
  favorites: string;
  cat_water: string;
  cat_heat: string;
  cat_compression: string;
  cat_cold: string;
  cat_percussion: string;
  cat_breathwork: string;
  cat_muscle_relaxation: string;
  cat_light_therapy: string;
  cat_active_stretching: string;
  cat_misc_hyperbaric: string;
  created_date: string;
  updated_date: string;
  owner: string;
}

// Add this interface for the nested recovery zone in records
export interface RecoveryZoneBasic {
  id: string;
  form: string;
  title: string;
  type: string;
  info: string;
  time: string;
  image: string;
}

// Add these interfaces
export interface AiSuggestion {
  workoutMin: number;
  bodyMultiplier: number;
  strengthMultiplier: number;
  suggestedMin: number;
}

export interface RecoveryProgress {
  recoveryGoal: number;
  recoveryTotal: number;
  recoveryRemaining: number;
  recoveryPercentage: number;
}

export interface RecentRecord {
  id: string;
  title: string;
  recovery_title: string;
  time_spent: number;
  date: string;
  images: string | null;
  created_date: string;
  updated_date: string;
  member_id: string;
  owner: string;
  recovery_id: string;
}

export interface SuggestedAndFavouriteResponse {
  SuggestedZones: RecoveryZone[];
  FavouriteZones: RecoveryZone[];
  remaining: RecoveryZone[];
}

export interface RecoveryDashboardData {
  aiSuggestion: AiSuggestion;
  progress: RecoveryProgress;
  recentRecords: RecentRecord[];
}

export interface CreateRecoveryRecordPayload {
  title: string;
  time_spent: number;
  recovery_id: string;
  date: string;
  upload_image?: string | null;
}

export interface CreateRecoveryRecordResponse {
  message: string;
  record: any;
}

export interface UpdateRecoveryGoalPayload {
  recovery_goal: number;
}

export interface UpdateRecoveryGoalResponse {
  message: string;
  recovery_goal: number;
}

// FIX: Add recovery_zone property to match actual API response
export interface RecoveryRecord {
  id: string;
  title: string;
  recovery_title: string;
  time_spent: number;
  date: string;
  recovery_id: string;
  images: string | null;
  member_id: string;
  created_date: string;
  updated_date: string;
  owner: string;
  recovery_zone?: RecoveryZoneBasic; // ← ADD THIS
}

// FIX: Change from 'data' to 'items' to match actual API response
export interface RecoveryRecordsResponse {
  items: RecoveryRecord[]; // ← CHANGE from 'data' to 'items'
  total: number;
  currentPage: number;
  totalPages: number;
}

export interface RecoveryCustomActivity {
  id: string | number;
  custom_activity_id?: number;
  name: string; // Activity name from API
  title?: string; // Optional title
  type: string; // "recovery", "sleep", etc.
  day: string; // "Monday", "Tuesday", etc.
  time: string; // "16:30:00"
  duration: number;
  intensity: string;
  completed: boolean;
  completed_activity?: boolean | null;
  scheduled_time?: string;
  scheduled_date?: string;
  notes?: string;
  recovery_score?: number;
  cover_image?: string;
  recurring?: string; // "Every Week", etc.
  day_number?: number; // 1 = Monday, 2 = Tuesday, etc.
  activity_time?: string;
  activity_day?: string;
  created_at?: string;
  updated_at?: string;
  member_id?: string | number;
  user_id?: string | number;
  status?: number;
  remove?: boolean;
  team_id?: string | null;
  team_check?: string | null;
  workout_preferences?: string | null;
  workout_preferences_type?: number;
  default_value?: string | null;
  number?: string | null;
  cardio_id?: string | null;
  user_completed?: boolean | null;
}

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
// RECOVERY API
// ===========================================

export const getSuggestedAndFavouriteZones =
  async (): Promise<SuggestedAndFavouriteResponse> => {
    try {
      const { data } = await apiClient.get<SuggestedAndFavouriteResponse>(
        "/recovery/suggested-and-favourite-zones",
      );
      console.log("📋 Recovery zones response:", data);
      return data;
    } catch (error: unknown) {
      throw new Error(
        getErrorMessage(error, "Failed to fetch recovery zones."),
      );
    }
  };

export const getRecoveryDashboard =
  async (): Promise<RecoveryDashboardData> => {
    try {
      const { data } = await apiClient.get<RecoveryDashboardData>(
        "/recovery/dashboard",
      );
      console.log("📋 Recovery dashboard response:", data);
      return data;
    } catch (error: unknown) {
      throw new Error(
        getErrorMessage(error, "Failed to fetch recovery dashboard data."),
      );
    }
  };

export const getAllRecoveryZones = async (): Promise<RecoveryZone[]> => {
  try {
    const { data } = await apiClient.get<RecoveryZone[]>("/recovery/zones");
    console.log("📋 All recovery zones response:", data);
    return data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to fetch recovery zones."));
  }
};

export const getRecoveryZoneById = async (
  id: string,
): Promise<RecoveryZone> => {
  try {
    const { data } = await apiClient.get<RecoveryZone>(`/recovery/zones/${id}`);
    console.log("📋 Recovery zone details response:", data);
    return data;
  } catch (error: unknown) {
    throw new Error(
      getErrorMessage(error, "Failed to fetch recovery zone details."),
    );
  }
};

export const createRecoveryRecord = async (
  payload: CreateRecoveryRecordPayload,
): Promise<CreateRecoveryRecordResponse> => {
  try {
    const { data } = await apiClient.post<CreateRecoveryRecordResponse>(
      "/recovery/records",
      payload,
    );
    console.log("📋 Create recovery record response:", data);
    return data;
  } catch (error: unknown) {
    throw new Error(
      getErrorMessage(error, "Failed to create recovery record."),
    );
  }
};

export const updateRecoveryGoal = async (
  recoveryGoal: number,
): Promise<UpdateRecoveryGoalResponse> => {
  try {
    const { data } = await apiClient.patch<UpdateRecoveryGoalResponse>(
      "/recovery/goal",
      {
        recovery_goal: recoveryGoal,
      },
    );
    console.log("📋 Update recovery goal response:", data);
    return data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to update recovery goal."));
  }
};

export const getRecoveryRecords = async (
  page: number = 1,
  limit: number = 10,
): Promise<RecoveryRecordsResponse> => {
  try {
    const { data } = await apiClient.get<RecoveryRecordsResponse>(
      `/recovery/records?page=${page}&limit=${limit}`,
    );
    console.log("📋 Recovery records response:", data);
    return data;
  } catch (error: unknown) {
    throw new Error(
      getErrorMessage(error, "Failed to fetch recovery records."),
    );
  }
};

export const getRecoveryCustomActivities = async (): Promise<
  RecoveryCustomActivity[]
> => {
  try {
    const token = getAuthToken();
    const { data } = await axios.get(`${API_BASE}/recovery/custom-activities`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });
    console.log("📋 Recovery custom activities response:", data);
    return Array.isArray(data) ? data : data.data || [];
  } catch (error: unknown) {
    console.error("Error fetching recovery activities:", error);
    throw new Error("Failed to fetch recovery activities");
  }
};

// Complete a custom recovery activity
// Complete a custom recovery activity and create a record
export const completeRecoveryCustomActivity = async (
  custom_activity_id: number,
  title: string,
  time_spent: number,
  recovery_id?: string,
  upload_image?: File | string,
): Promise<void> => {
  try {
    const token = getAuthToken();

    const requestBody: any = {
      custom_activity_id: custom_activity_id,
      title: title,
      time_spent: time_spent,
    };

    if (recovery_id) {
      requestBody.recovery_id = recovery_id;
    }

    if (upload_image) {
      requestBody.upload_image = upload_image;
    }

    await axios.post(
      `${API_BASE}/recovery/custom-activities/complete`,
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      },
    );
  } catch (error: unknown) {
    console.error("Error completing recovery activity:", error);
    throw new Error("Failed to complete recovery activity");
  }
};

// Delete a custom recovery activity
export const deleteRecoveryCustomActivity = async (
  activityId: string | number,
): Promise<void> => {
  try {
    const token = getAuthToken();
    await axios.delete(`${API_BASE}/recovery/custom-activities/${activityId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });
  } catch (error: unknown) {
    console.error("Error deleting recovery activity:", error);
    throw new Error("Failed to delete recovery activity");
  }
};

export const recoveryApi = {
  getSuggestedAndFavouriteZones,
  getRecoveryDashboard,
  getAllRecoveryZones,
  getRecoveryZoneById,
  createRecoveryRecord,
  updateRecoveryGoal,
  getRecoveryRecords,
};

export default recoveryApi;
