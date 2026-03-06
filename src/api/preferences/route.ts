import axios from "axios";
import { getAuthToken } from "@/lib/auth/session";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "https://paxlete.com/api";

export interface PreferencesData {
  workout: number;
  supplement: number;
  cardio: number;
  conditioning: number;
  avarage_daily_steps: number;
  calories_goal: number;
  Daily_Steps_Burn: number | null;
  Calories_ai: number | null;
  CustomActivity_workout: unknown[];
  CustomActivity_supplemental: unknown[];
  CustomActivity_conditioning: unknown[];
  CustomActivity_cardio: unknown[];
}

export interface WeeklyTarget {
  workout: number;
  supplement: number;
  cardio: number;
  conditioning: number;
}

export interface CardioGoal {
  calories_goal: number;
}

export interface AverageSteps {
  avarage_daily_steps: number;
}

export interface ActivityDay {
  day: string;
  time: string[];
}

type ApiErrorPayload = {
  message?: string;
  error?: string;
};

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

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
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

export const preferenceApi = {
  getPreferencesData: async (): Promise<PreferencesData> => {
    try {
      const response = await apiClient.get("/preferences-data");
      return response.data?.data as PreferencesData;
    } catch (error: unknown) {
      throw new Error(extractErrorMessage(error, "Failed to load preference data."));
    }
  },

  getWeeklyTarget: async (): Promise<WeeklyTarget> => {
    try {
      const response = await apiClient.get("/weekly-target");
      return response.data?.data as WeeklyTarget;
    } catch (error: unknown) {
      throw new Error(extractErrorMessage(error, "Failed to load weekly targets."));
    }
  },

  getCardioGoal: async (): Promise<CardioGoal> => {
    try {
      const response = await apiClient.get("/cardio-goal");
      return response.data?.data as CardioGoal;
    } catch (error: unknown) {
      throw new Error(extractErrorMessage(error, "Failed to load cardio goal."));
    }
  },

  getAvgSteps: async (): Promise<AverageSteps> => {
    try {
      const response = await apiClient.get("/avg-step");
      return response.data?.data as AverageSteps;
    } catch (error: unknown) {
      throw new Error(extractErrorMessage(error, "Failed to load average daily steps."));
    }
  },

  getActivityDays: async (type: string): Promise<ActivityDay[]> => {
    try {
      const response = await apiClient.get(`/get-activity-days?type=${encodeURIComponent(type)}`);
      const activity = response.data?.activity;
      if (!activity) return [];
      if (typeof activity === "string") {
        try {
          return JSON.parse(activity) as ActivityDay[];
        } catch {
          return [];
        }
      }
      return Array.isArray(activity) ? (activity as ActivityDay[]) : [];
    } catch (error: unknown) {
      throw new Error(extractErrorMessage(error, `Failed to load ${type} schedule.`));
    }
  },

  updateWeeklyTarget: async (target: WeeklyTarget): Promise<void> => {
    try {
      const formData = new FormData();
      formData.append("workout", String(target.workout));
      formData.append("supplement", String(target.supplement));
      formData.append("cardio", String(target.cardio));
      formData.append("conditioning", String(target.conditioning));
      await apiClient.post("/update-weekly-target", formData);
    } catch (error: unknown) {
      throw new Error(extractErrorMessage(error, "Failed to update weekly targets."));
    }
  },

  updateCardioGoal: async (caloriesGoal: number): Promise<void> => {
    try {
      const formData = new FormData();
      formData.append("calories_goal", String(caloriesGoal));
      await apiClient.post("/update-cardio-goal", formData);
    } catch (error: unknown) {
      throw new Error(extractErrorMessage(error, "Failed to update cardio goal."));
    }
  },

  updateAvgSteps: async (steps: number): Promise<void> => {
    try {
      const formData = new FormData();
      formData.append("avarage_daily_steps", String(steps));
      await apiClient.post("/update-avg-step", formData);
    } catch (error: unknown) {
      throw new Error(extractErrorMessage(error, "Failed to update average daily steps."));
    }
  },

  addActivityDays: async (type: string, activity: ActivityDay[]): Promise<void> => {
    try {
      const body = new URLSearchParams();
      body.append("Activity", JSON.stringify(activity));
      body.append("type", type);

      await apiClient.post("/add-activity-days", body.toString(), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
      });
    } catch (error: unknown) {
      throw new Error(extractErrorMessage(error, `Failed to update ${type} schedule.`));
    }
  },
};
