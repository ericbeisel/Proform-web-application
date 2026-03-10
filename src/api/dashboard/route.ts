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
  OtherDetail: UserOtherDetail;
}

export interface DashboardResponse {
  message: string;
  user: UserData;
}

export interface DashboardSummary {
  userName: string;
  userEmail: string;
  currentWeight: number;
  goalWeight: number;
  height: number;
  bodyfat: number;
  dailySteps: number;
  caloriesGoal: number;
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

// Parse comma/line separated strings into arrays
const parseToList = (value: string): string[] => {
  if (!value) return [];
  return value
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
};

// ===========================================
// AXIOS CLIENT
// ===========================================

// ===========================================
// HELPER FOR HEADERS
// ===========================================

const getHeaders = () => {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// ===========================================
// DASHBOARD API
// ===========================================

export const dashboardApi = {
  /**
   * Get raw dashboard data from API
   */
  getDashboardData: async (): Promise<DashboardResponse> => {
    try {
      const response = await axios.get(`${API_BASE}/dashboard`, {
        headers: getHeaders(),
      });
      return response.data as DashboardResponse;
    } catch (error: unknown) {
      throw new Error(
        extractErrorMessage(error, "Failed to load dashboard data."),
      );
    }
  },

  /**
   * Get processed dashboard summary with parsed values
   */
  getDashboardSummary: async (): Promise<DashboardSummary> => {
    try {
      const response = await axios.get(`${API_BASE}/dashboard`, {
        headers: getHeaders(),
      });
      const data = response.data as DashboardResponse;
      const user = data.user;
      const details = user.OtherDetail;

      return {
        userName: user.name,
        userEmail: user.email,
        currentWeight: parseFloat(details.currentWeight) || 0,
        goalWeight: parseFloat(details.goalWeight) || 0,
        height: parseFloat(details.height) || 0,
        bodyfat: parseFloat(details.bodyfat) || 0,
        dailySteps: parseInt(details.avarage_daily_steps) || 0,
        caloriesGoal: parseInt(details.calories_goal) || 0,
        weeklyTargets: {
          workout: parseInt(details.target_workout_week) || 0,
          supplement: parseInt(details.target_supplement_week) || 0,
          cardio: parseInt(details.target_cardio_week) || 0,
          conditioning: parseInt(details.target_conditioning_week) || 0,
        },
        strengthMetrics: {
          benchPress: parseFloat(details.r_bench_press) || 0,
          backSquat: parseFloat(details.r_back_squat) || 0,
          powerClean: parseFloat(details.r_power_clean) || 0,
          deadlift: parseFloat(details.r_deadlift) || 0,
        },
        measurementUnit: details.measurementUnit,
        activityLevel: details.activityLevel,
        trainingGoals: parseToList(details.trainingGoals),
        trainingSports: parseToList(details.trainingSport),
        birthDate: details.birthDate,
        gender: details.gender,
      };
    } catch (error: unknown) {
      throw new Error(
        extractErrorMessage(error, "Failed to load dashboard summary."),
      );
    }
  },

  /**
   * Get only user profile info
   */
  getUserProfile: async (): Promise<
    Pick<UserData, "id" | "name" | "email" | "image">
  > => {
    try {
      const response = await axios.get(`${API_BASE}/dashboard`, {
        headers: getHeaders(),
      });
      const data = response.data as DashboardResponse;
      const user = data.user;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      };
    } catch (error: unknown) {
      throw new Error(
        extractErrorMessage(error, "Failed to load user profile."),
      );
    }
  },

  /**
   * Get only user metrics (weight, height, bodyfat, goals)
   */
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
    try {
      const response = await axios.get(`${API_BASE}/dashboard`, {
        headers: getHeaders(),
      });
      const data = response.data as DashboardResponse;
      const details = data.user.OtherDetail;

      return {
        currentWeight: details.currentWeight,
        goalWeight: details.goalWeight,
        height: details.height,
        bodyfat: details.bodyfat,
        avarage_daily_steps: details.avarage_daily_steps,
        calories_goal: details.calories_goal,
      };
    } catch (error: unknown) {
      throw new Error(
        extractErrorMessage(error, "Failed to load user metrics."),
      );
    }
  },

  /**
   * Get weekly targets
   */
  getWeeklyTargets: async (): Promise<{
    workout: number;
    supplement: number;
    cardio: number;
    conditioning: number;
  }> => {
    try {
      const response = await axios.get(`${API_BASE}/dashboard`, {
        headers: getHeaders(),
      });
      const data = response.data as DashboardResponse;
      const details = data.user.OtherDetail;

      return {
        workout: parseInt(details.target_workout_week) || 0,
        supplement: parseInt(details.target_supplement_week) || 0,
        cardio: parseInt(details.target_cardio_week) || 0,
        conditioning: parseInt(details.target_conditioning_week) || 0,
      };
    } catch (error: unknown) {
      throw new Error(
        extractErrorMessage(error, "Failed to load weekly targets."),
      );
    }
  },

  /**
   * Get strength metrics (1RM values)
   */
  getStrengthMetrics: async (): Promise<{
    benchPress: number;
    backSquat: number;
    powerClean: number;
    deadlift: number;
  }> => {
    try {
      const response = await axios.get(`${API_BASE}/dashboard`, {
        headers: getHeaders(),
      });
      const data = response.data as DashboardResponse;
      const details = data.user.OtherDetail;

      return {
        benchPress: parseFloat(details.r_bench_press) || 0,
        backSquat: parseFloat(details.r_back_squat) || 0,
        powerClean: parseFloat(details.r_power_clean) || 0,
        deadlift: parseFloat(details.r_deadlift) || 0,
      };
    } catch (error: unknown) {
      throw new Error(
        extractErrorMessage(error, "Failed to load strength metrics."),
      );
    }
  },
};

// ===========================================
// DEFAULT EXPORT (for convenience)
// ===========================================

export default dashboardApi;
