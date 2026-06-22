// src/api/itinerary/route.ts
import axios from "axios";
import { getAuthToken } from "@/lib/auth/session";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.paxlete.com";

export interface ItineraryWorkout {
  id: string;
  title: string;
  created_date: string;
  updated_date: string;
  owner: string | null;
  member_id: string;
  completed: boolean;
  type: string;
  queue_name: string;
  order: number;
  group: string;
  completion_id: string | null;
  session_id: string | null;
  queue_id: string | null;
  created_date_2: string;
  team_id: string | null;
  archive: boolean;
  day: string;
  cover_photo: string;
  workout_title: string;
  muscles_used: string;
  week: string;
  program_name: string;
  micro_order: number;
  activity_id: number;
  activity_name: string;
  activity_time: string;
  activity_day: string;
  activity_status: number;
  completed_activity: boolean;
  day_number: number;
}

export interface CustomActivity {
  id: number;
  name: string;
  type: string;
  user_id: number;
  day: string;
  time: string;
  day_number: number;
}

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

export const getItinerary = async (): Promise<ItineraryWorkout[]> => {
  try {
    const { data } = await apiClient.get<ItineraryWorkout[]>(
      "/itinerary-setup/get-itinerary",
    );
    console.log("📋 Itinerary response:", data);
    return data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to fetch itinerary."));
  }
};

export const getCustomActivities = async (): Promise<CustomActivity[]> => {
  try {
    const { data } = await apiClient.get<CustomActivity[]>(
      "/itinerary-setup/get-custom-activities",
    );
    console.log("📋 Custom activities response:", data);
    return data;
  } catch (error: unknown) {
    throw new Error(
      getErrorMessage(error, "Failed to fetch custom activities."),
    );
  }
};

export interface MissedActivity {
  id: number;
  name: string;
  type: string;
  day: number;
  time: string;
  colour: string;
  completed: boolean;
  recurring: string;
  SetItineraryTime: number;
}

interface MissedActivitiesResponse {
  AllActivity: Record<number, MissedActivity[]>;
  missedActivity: MissedActivity[];
}

export const getMissedActivities = async (): Promise<MissedActivity[]> => {
  try {
    const { data } = await apiClient.get<MissedActivitiesResponse>(
      "/itinerary-setup/missed-activities",
    );
    console.log("📋 Missed activities response:", data);
    return data.missedActivity ?? [];
  } catch (error: unknown) {
    throw new Error(
      getErrorMessage(error, "Failed to fetch missed activities."),
    );
  }
};

export const itineraryApi = {
  getItinerary,
  getCustomActivities,
  getMissedActivities,
};

export default itineraryApi;
