// src/api/dashboard/route.ts

import axios from "axios";
import { getAuthToken } from "@/lib/auth/session";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://paxlete.com/api";

// ===========================================
// TYPES
// ===========================================

export interface UserOtherDetail {
  id: number;
  user_id: string;
  skipaccount: string;
  profilesetup: string;
  individualteam: string;
  accountsetup: string;
  birthDate: string;
  activityLevel: string;
  weightGoalType: string;
  timeZone: string;
  measurementUnit: string;
  autoAdjust: string;
  gender: string;
  trainingGoals: string;
  trainingSport: string;
  currentWeight: string;
  goalWeight: string;
  height: string;
  bodyfat: string;
  avarage_daily_steps: string;
  calories_goal: string;
  target_workout_week: string;
  target_supplement_week: string;
  target_cardio_week: string;
  target_conditioning_week: string;
  time_zone: null | string;
  weekly_reset: null | string;
  country: null | string;
  state: string;
  city: string;
  r_bench_press: string;
  r_back_squat: string;
  r_power_clean: string;
  r_deadlift: string;
  Bench_CMP: null | string;
  Squat_CMP: null | string;
  Clean_CMP: null | string;
  Deadlift_CMP: null | string;
  optimalWellnessScore: null | string;
  unread_notifications_count?: number | string;
  weekly_load?: number | string;
  weekly_str?: number | string;
  weekly_kcal?: number | string;
  weekly_power?: number | string;
  created_at: string;
  updated_at: string;
}

export interface UserData {
  id: number;
  name: string;
  username: string;
  email: string;
  role_id: string;
  created_at: string;
  updated_at: string;
  image: string | null;
  pf_points?: number | string;
  OtherDetail: UserOtherDetail;
}

export interface DashboardResponse {
  message: string;
  user: UserData;
}

export interface DashboardSummary {
  userName: string;
  userEmail: string;
  userImage: string | null;
  currentWeight: number;
  goalWeight: number;
  height: number;
  bodyfat: number;
  dailySteps: number;
  caloriesGoal: number;
  accountSetupComplete: boolean;
  weeklyTargets: {
    workout: number;
    supplement: number;
    cardio: number;
    conditioning: number;
  };
  strengthMetrics: {
    benchPress: number;
    backSquat: number;
    powerClean: number;
    deadlift: number;
  };
  measurementUnit: string;
  activityLevel: string;
  trainingGoals: string[];
  trainingSports: string[];
  birthDate: string;
  gender: string;
  unreadNotificationsCount: number;
  pfPoints: number;
  weeklyStats: {
    load: number;
    str: number;
    cal: number;
    pwr: number;
  };
}

export interface ActivityLevel {
  id: number;
  name: string;
  value: number;
  created_at: string;
  updated_at: string;
}

type ApiErrorPayload = {
  message?: string;
  error?: string;
};

// ===========================================
// HELPER FUNCTIONS
// ===========================================

function extractErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<ApiErrorPayload>(error)) {
    const status = error.response?.status;
    // Surface auth errors clearly so callers can redirect
    if (status === 401 || status === 403) {
      return "Invalid credentials. Please log in again.";
    }
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

const parseToList = (value: unknown): string[] => {
  if (!value) return [];
  const str = String(value);
  return str
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
};

// ===========================================
// AXIOS CLIENT
// Single instance with interceptor — token is
// read at request time so it's always fresh.
// ===========================================

const apiClient = axios.create({ baseURL: API_BASE });

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (!token) {
    // Abort immediately rather than sending an unauthenticated request
    throw new axios.Cancel("No auth token found. Redirecting to login.");
  }
  config.headers.Authorization = `Bearer ${token}`;
  config.headers["Content-Type"] = "application/json";
  return config;
});

// ===========================================
// IN-MEMORY CACHE
// One network round-trip per page load.
// All derived methods read from this cache.
// ===========================================

let _cache: DashboardResponse | null = null;
let _cachePromise: Promise<DashboardResponse> | null = null;

/**
 * Fetches /dashboard once and caches the result for the lifetime of the page.
 * Concurrent callers share the same in-flight promise so only one request fires.
 * Call invalidateCache() after any mutation that changes dashboard data.
 */
async function fetchOnce(): Promise<DashboardResponse> {
  if (_cache) return _cache;

  // If a request is already in-flight, share it
  if (_cachePromise) return _cachePromise;

  _cachePromise = apiClient
    .get<DashboardResponse>("/dashboard")
    .then((res) => {
      _cache = res.data;
      // The backend actually sends measurement_unit (snake_case) on
      // OtherDetail, not measurementUnit — mobile defensively checks both
      // everywhere it reads this field. Normalizing here means every web
      // consumer of getDashboardData()/OtherDetail.measurementUnit gets the
      // real value instead of silently defaulting to "lbs".
      const otherDetail = _cache?.user?.OtherDetail as
        | (UserOtherDetail & { measurement_unit?: string })
        | undefined;
      if (otherDetail && !otherDetail.measurementUnit && otherDetail.measurement_unit) {
        otherDetail.measurementUnit = otherDetail.measurement_unit;
      }
      _cachePromise = null;
      return _cache;
    })
    .catch((err: unknown) => {
      _cachePromise = null;
      throw new Error(
        extractErrorMessage(err, "Failed to load dashboard data."),
      );
    });

  return _cachePromise;
}

export function invalidateDashboardCache(): void {
  _cache = null;
  _cachePromise = null;
}

export interface WeeklyTargetData {
  workout: number;
  supplement: number;
  cardio: number;
  conditioning: number;
}

export interface TodayActivity {
  id: string;
  title: string;
  type: string;
  workout_title: string;
  activity_time: string;
  activity_day: string;
  activity_status: number;
  cover_photo?: string;
  muscles_used?: string;
  program_name?: string;
}

export interface LiveSession {
  id: string;
  shortId: string;
  title: string;
  programName: string;
  workoutName: string;
  programImage: string;
  completedRounds: number;
  totalRounds: number;
  status: string;
  startedAt: string;
  locationName?: string;
  createdAt: string;
}

export interface LiveSessionsResponse {
  totalCount: number;
  sessions: LiveSession[];
}

export const getLiveSessions = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  memberId?: string;
  userId?: string;
}): Promise<LiveSessionsResponse> => {
  try {
    console.log("📤 getLiveSessions params:", params);

    const { data } = await apiClient.get<LiveSessionsResponse>(
      "/dashboard/live-sessions",
      { params }
    );

    console.log("📥 getLiveSessions response:", data);

    return data;
  } catch (error) {
    console.error("❌ getLiveSessions error:", error);
    throw error;
  }
};

export interface AllSessionsResponse {
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  sessions: LiveSession[];
}

export const getAllSessions = async (params?: {
  page?: number;
  memberId?: string;
  userId?: string;
  status?: boolean;
}): Promise<AllSessionsResponse> => {
  const { data } = await apiClient.get<AllSessionsResponse>(
    "/dashboard/all-sessions",
    { params }
  );
  return data;
};

export const getTodayActivities = async (day: string): Promise<TodayActivity[]> => {
  const { data } = await apiClient.get<{ day: string; activities: TodayActivity[] }>(
    "/dashboard/today-activities",
    { params: { day } }
  );
  return data.activities || [];
};

export const getWeeklyTarget = async (): Promise<WeeklyTargetData> => {
  const response = await apiClient.get<{ message: string; data: WeeklyTargetData & { user_id: number } }>("/weekly-target");
  console.log("[weekly target] API response:", response.data);
  return response.data.data;
};

export const getActivityLevels = async (): Promise<ActivityLevel[]> => {
  try {
    const response = await apiClient.get("/activity_level");
    return response.data as ActivityLevel[];
  } catch (error: unknown) {
    throw new Error(
      extractErrorMessage(error, "Failed to load activity levels."),
    );
  }
};

// ===========================================
// DASHBOARD API
// ===========================================

export const dashboardApi = {
  /**
   * Raw dashboard response. Cached after first call.
   */
  getDashboardData: async (): Promise<DashboardResponse> => {
    return fetchOnce();
  },

  /**
   * Fully processed summary — everything the UI needs in one call.
   * accountSetupComplete is included so the page doesn't need a second fetch.
   */
  getDashboardSummary: async (): Promise<DashboardSummary> => {
    const data = await fetchOnce();
    const user = data?.user;
    const details = user?.OtherDetail || ({} as UserOtherDetail);

    const setupStr = String(details.accountsetup || "").toLowerCase();
    const accountSetupComplete = setupStr === "1" || setupStr === "completed";

    return {
      userName: user?.name || "User",
      userEmail: user?.email || "",
      userImage: user?.image || null,
      accountSetupComplete,
      currentWeight: parseFloat(details.currentWeight) || 0,
      goalWeight: parseFloat(details.goalWeight) || 0,
      height: parseFloat(details.height) || 0,
      bodyfat: parseFloat(details.bodyfat) || 0,
      dailySteps: parseInt(details.avarage_daily_steps, 10) || 0,
      caloriesGoal: parseInt(details.calories_goal, 10) || 0,
      weeklyTargets: {
        workout: parseInt(details.target_workout_week, 10) || 0,
        supplement: parseInt(details.target_supplement_week, 10) || 0,
        cardio: parseInt(details.target_cardio_week, 10) || 0,
        conditioning: parseInt(details.target_conditioning_week, 10) || 0,
      },
      strengthMetrics: {
        benchPress: parseFloat(details.r_bench_press) || 0,
        backSquat: parseFloat(details.r_back_squat) || 0,
        powerClean: parseFloat(details.r_power_clean) || 0,
        deadlift: parseFloat(details.r_deadlift) || 0,
      },
      measurementUnit: details.measurementUnit || "lbs",
      activityLevel: details.activityLevel || "",
      trainingGoals: parseToList(details.trainingGoals),
      trainingSports: parseToList(details.trainingSport),
      birthDate: details.birthDate || "",
      gender: details.gender || "",
      unreadNotificationsCount: parseInt(String(details.unread_notifications_count ?? 0), 10) || 0,
      pfPoints: parseInt(String(user?.pf_points ?? 0), 10) || 0,
      weeklyStats: {
        load: parseInt(String(details.weekly_load ?? 0), 10) || 0,
        str: parseInt(String(details.weekly_str ?? 0), 10) || 0,
        cal: parseInt(String(details.weekly_kcal ?? 0), 10) || 0,
        pwr: parseInt(String(details.weekly_power ?? 0), 10) || 0,
      },
    };
  },

  getUserProfile: async (): Promise<
    Pick<UserData, "id" | "name" | "email" | "image">
  > => {
    const data = await fetchOnce();
    const user = data.user;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
    };
  },

  getUserMetrics: async (): Promise<
    Pick<
      UserOtherDetail,
      | "currentWeight"
      | "goalWeight"
      | "height"
      | "bodyfat"
      | "avarage_daily_steps"
      | "calories_goal"
    >
  > => {
    const data = await fetchOnce();
    const details = data.user.OtherDetail;
    return {
      currentWeight: details.currentWeight,
      goalWeight: details.goalWeight,
      height: details.height,
      bodyfat: details.bodyfat,
      avarage_daily_steps: details.avarage_daily_steps,
      calories_goal: details.calories_goal,
    };
  },

  getWeeklyTargets: async (): Promise<{
    workout: number;
    supplement: number;
    cardio: number;
    conditioning: number;
  }> => {
    const data = await fetchOnce();
    const details = data.user.OtherDetail;
    return {
      workout: parseInt(details.target_workout_week, 10) || 0,
      supplement: parseInt(details.target_supplement_week, 10) || 0,
      cardio: parseInt(details.target_cardio_week, 10) || 0,
      conditioning: parseInt(details.target_conditioning_week, 10) || 0,
    };
  },

  getStrengthMetrics: async (): Promise<{
    benchPress: number;
    backSquat: number;
    powerClean: number;
    deadlift: number;
  }> => {
    const data = await fetchOnce();
    const details = data.user.OtherDetail;
    return {
      benchPress: parseFloat(details.r_bench_press) || 0,
      backSquat: parseFloat(details.r_back_squat) || 0,
      powerClean: parseFloat(details.r_power_clean) || 0,
      deadlift: parseFloat(details.r_deadlift) || 0,
    };
  },

  getActivityLevels: getActivityLevels,
};

export default dashboardApi;
