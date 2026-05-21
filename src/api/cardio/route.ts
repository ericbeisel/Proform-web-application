// src/api/cardio/route.ts
import axios from "axios";
import { getAuthToken } from "@/lib/auth/session";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.paxlete.com";

// ===========================================
// TYPES
// ===========================================

export interface CardioMenuItem {
  id: string;
  category: string;
  name: string;
  suggestion: string | null;
  mets: number | null;
  load_metric: number;
  duration: string;
  calories: string;
  demo_url: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface CardioSession {
  id: string;
  title: string;
  minutes: number;
  calories_burned: number;
  member_id: string;
  created_date?: string;
  updated_date?: string;
}

export interface AddCardioPayload {
  title: string;
  minutes: number;
  calories_burned: number;
  member_id: string;
}

export interface AddCardioResponse {
  message: string;
  data: CardioSession;
}

export interface CompleteCardioPayload {
  id?: string;
  cardio_option: string;
  minutes: number;
  calories_burned: number;
  manifest_id: string;
  "distance mi": number; // Note: space in the name
  mets: number;
  "avg watts": number; // Note: space in the name
  гра: number; // This appears to be RPM in Cyrillic
  "peak hr": number; // Note: space in the name
  avg_hr: number;
  avg_mets: number;
  image?: string;
}

export interface CompleteCardioResponse {
  message: string;
  data: any;
}

// export interface CardioGoalPayload {
//   calories_goal: number;
//   member_id: string;
// }

export interface CardioGoalPayload {
  cardio_goal: number; // Changed from 'calories_goal' to 'cardio_goal'
  member_id: string;
}

export interface CardioGoalResponse {
  message: string;
  data: any;
}

export interface CardioSession {
  id: string;
  title: string;
  owner_id: string | null;
  member_id: string;
  minutes: number;
  calories_burned: number;
  created_at: string;
  updated_at: string;
  image_url?: string;
}

export interface UserDetail {
  id: number;
  user_id: number;
  cardio_goal: number;
  target_cardio_week: number;
  // ... other user fields
}

export interface CardioDashboardResponse {
  userDetail: UserDetail;
  sessionCount: number;
  sessions: CardioSession[];
}

export interface CardioSessionsResponse {
  total: number;
  page: number;
  limit: number;
  data: CardioSession[];
}

export interface CardioHistoryItem {
  id: string;
  title: string;
  owner_id: string;
  minutes: number;
  calories_burned: number;
  cardio_option: string;
  image: string | null;
  current_load: number | null;
  power: number | null;
  distance_mi: number;
  mets: number;
  avg_watts: number;
  rpm: number;
  peak_hr: number;
  avg_hr: number;
  like: boolean | null;
  likes: number | null;
  avg_mets: number | null;
  manifest_id: string;
  created_at: string;
  updated_at: string;
  menu_name: string;
  menu_category: string;
  menu_demo_url: string | null;
}

export interface CardioHistoryResponse {
  total: number;
  page: number;
  limit: number;
  weeklyCaloriesSum: number;
  data: CardioHistoryItem[];
}

// /api/cardio/route.ts
export interface CardioActivity {
  id: number; // Change from string to number
  cardio_id: string | null;
  completed_activity: boolean | null; // Add this field
  created_at: string;
  day: string;
  day_number: number;
  default_value: string | null;
  name: string; // Add this field
  number: string | null;
  recurring: string;
  remove: boolean;
  status: number;
  team_check: string | null;
  team_id: string | null;
  time: string;
  type: string;
  updated_at: string;
  user_completed: boolean | null;
  user_id: number;
  workout_preferences: string | null;
  workout_preferences_type: number;
}

export interface CardioActivitiesResponse {
  total: number;
  data: CardioActivity[];
}

export interface CardioActivity {
  id: number;
  name: string;
  type: string;
  user_id: number;
  day: string;
  time: string;
  completed_activity: boolean | null;
  created_at: string;
  updated_at: string;
  day_number: number;
  recurring: string;
  status: number;
  // ... other fields as needed
}

export interface CompletedCardioSession {
  id: string;
  title: string;
  owner_id: string;
  member_id: string;
  minutes: number;
  calories_burned: number;
  created_at: string;
  updated_at: string;
  calculators?: any[];
}

export interface CardioSchedule {
  id: string;
  title: string;
  owner_id: string;
  member_id: string | null;
  schedule_number: string;
  days: number;
  created_at: string;
  updated_at: string;
  day_name: string;
  custom_activity_id: number;

  completed_session: CompletedCardioSession | null;
}

export interface CardioSchedulesResponse {
  cardio_goal: number;
  schedules: CardioSchedule[];
}

// export interface CompleteCardioActivityPayload {
//   activity_id: number;
//   minutes: number;
//   calories_burned: number;
//   title?: string;
//   notes?: string;
//   image?: string; // base64 image
// }

// ===========================================
// ERROR HANDLER
// ===========================================

export interface CardioRecord {
  has_upload_image: boolean;
  avg_mets: number;
  distance_mi: number;
  calories_burned: number;
  peak_hr: number;
  rpm: number;
  avg_hr: number;
  mets: number;
  image: string;
  avg_watts: number;
  cardio_option: string;
  minutes: number;
}

export interface CompleteCardioActivityPayload {
  member_id: string;
  customActivityId: number;
  records: CardioRecord[];
  totalMinutes: number;
  totalCalories: number;
  title?: string;
  cardioType?: string;
}

export interface QuickLogPayload {
  member_id: string;
  records: {
    cardio_option: string;
    minutes: number;
    calories_burned: number;
    image?: string;
  }[];
  totalMinutes: number;
  totalCalories: number;
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
    console.log("🔐 Attaching token to request:", token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("✅ Authorization header set");
      console.log("token:", token);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ===========================================
// CARDIO API
// ===========================================

export const getCardioMenu = async (): Promise<CardioMenuItem[]> => {
  try {
    const { data } = await apiClient.get<CardioMenuItem[]>("/cardio/menu");
    console.log("📋 Cardio menu response:", data);
    return data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to fetch cardio menu."));
  }
};

export const addCardioSession = async (
  payload: AddCardioPayload,
): Promise<AddCardioResponse> => {
  try {
    const { data } = await apiClient.post<AddCardioResponse>(
      "/cardio/session",
      payload,
    );
    console.log("📋 Add cardio session response:", data);
    return data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to add cardio session."));
  }
};

export const completeCardioSession = async (
  payload: CompleteCardioPayload,
): Promise<CompleteCardioResponse> => {
  try {
    const token = getAuthToken();
    const { data } = await apiClient.post<CompleteCardioResponse>(
      "/cardio/calculator",
      payload,
    );
    console.log("📋 Complete cardio session response:", data);
    return data;
  } catch (error: unknown) {
    throw new Error(
      getErrorMessage(error, "Failed to complete cardio session."),
    );
  }
};

export const setCardioGoal = async (
  payload: CardioGoalPayload,
): Promise<CardioGoalResponse> => {
  try {
    const token = getAuthToken();

    // Ensure the payload has the correct field names
    const requestPayload = {
      cardio_goal: payload.cardio_goal,
      member_id: payload.member_id,
    };

    console.log("📤 Sending to /cardio/goal:", requestPayload);

    const { data } = await apiClient.post<CardioGoalResponse>(
      "/cardio/goal",
      requestPayload,
    );
    console.log("📋 Set cardio goal response:", data);
    return data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to set cardio goal."));
  }
};

// export const setCardioGoal = async (payload: CardioGoalPayload): Promise<CardioGoalResponse> => {
//   try {
//     const token = getAuthToken();

//     console.log("📤 Sending to /cardio/goal:", {
//       cardio_goal: payload.cardio_goal,
//       member_id: payload.member_id,
//     });

//     const { data } = await apiClient.post<CardioGoalResponse>("/cardio/goal", {
//       cardio_goal: payload.cardio_goal,
//       member_id: payload.member_id,
//     });
//     console.log("📋 Set cardio goal response:", data);
//     return data;
//   } catch (error: unknown) {
//     throw new Error(getErrorMessage(error, "Failed to set cardio goal."));
//   }
// };

// export const setCardioGoal = async (payload: CardioGoalPayload): Promise<CardioGoalResponse> => {
//   try {
//     const token = getAuthToken();
//     const { data } = await apiClient.post<CardioGoalResponse>("/cardio/goal", payload);
//     console.log("📋 Set cardio goal response:", data);
//     return data;
//   } catch (error: unknown) {
//     throw new Error(getErrorMessage(error, "Failed to set cardio goal."));
//   }
// };

export const getCardioDashboard =
  async (): Promise<CardioDashboardResponse> => {
    try {
      const token = getAuthToken();
      const { data } =
        await apiClient.get<CardioDashboardResponse>("/cardio/dashboard");
      console.log("📋 Cardio dashboard response:", data);
      return data;
    } catch (error: unknown) {
      throw new Error(
        getErrorMessage(error, "Failed to fetch cardio dashboard."),
      );
    }
  };
export const getCardioSessions = async (
  page: number = 1,
  limit: number = 10,
): Promise<CardioSessionsResponse> => {
  try {
    const token = getAuthToken();
    const { data } = await apiClient.get<CardioSessionsResponse>(
      `/cardio/sessions?page=${page}&limit=${limit}`,
    );
    console.log("📋 Cardio sessions response:", data);
    return data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to fetch cardio sessions."));
  }
};

export const getCardioHistory = async (
  filter: string = "thisweek",
  page: number = 1,
  limit: number = 10,
): Promise<CardioHistoryResponse> => {
  try {
    const token = getAuthToken();
    const { data } = await apiClient.get<CardioHistoryResponse>(
      `/cardio/history?filter=${filter}&page=${page}&limit=${limit}`,
    );
    console.log("📋 Cardio history response:", data);
    return data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to fetch cardio history."));
  }
};

export const deleteCardioActivity = async (
  activityId: string,
): Promise<{ message: string }> => {
  try {
    const token = getAuthToken();
    const { data } = await apiClient.delete(`/cardio/activity/${activityId}`);
    console.log("📋 Delete cardio activity response:", data);
    return data;
  } catch (error: unknown) {
    throw new Error(
      getErrorMessage(error, "Failed to delete cardio activity."),
    );
  }
};

export const getCardioActivities = async (): Promise<{
  data: CardioActivity[];
}> => {
  try {
    const token = getAuthToken();
    const response = await apiClient.get("/cardio/activities");
    console.log("📋 Cardio activities response:", response.data);

    // Handle different response structures
    let activities = [];
    if (response.data?.data && Array.isArray(response.data.data)) {
      activities = response.data.data;
    } else if (Array.isArray(response.data)) {
      activities = response.data;
    } else if (
      response.data?.activity &&
      Array.isArray(response.data.activity)
    ) {
      activities = response.data.activity;
    } else {
      activities = [];
    }

    return { data: activities };
  } catch (error: unknown) {
    throw new Error(
      getErrorMessage(error, "Failed to fetch cardio activities."),
    );
  }
};

export const completeCardioActivity = async (
  payload: CompleteCardioActivityPayload,
): Promise<any> => {
  try {
    const token = getAuthToken();
    const { data } = await apiClient.post("/cardio/complete-activity", payload);
    console.log("📋 Complete cardio activity response:", data);
    return data;
  } catch (error: unknown) {
    throw new Error(
      getErrorMessage(error, "Failed to complete cardio activity."),
    );
  }
};

export const quickLogCardio = async (
  payload: QuickLogPayload,
): Promise<any> => {
  try {
    const token = getAuthToken();
    const { data } = await apiClient.post("/cardio/quick-log", payload);
    console.log("📋 Quick log cardio response:", data);
    return data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to quick log cardio."));
  }
};
export const deleteCardioSession = async (
  sessionId: string,
): Promise<{ message: string }> => {
  try {
    const token = getAuthToken();
    const { data } = await apiClient.delete(`/cardio/session/${sessionId}`);
    console.log("📋 Delete cardio session response:", data);
    return data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to delete cardio session."));
  }
};

export const getCardioSchedules =
  async (): Promise<CardioSchedulesResponse> => {
    try {
      const { data } =
        await apiClient.get<CardioSchedulesResponse>("/cardio/schedules");

      console.log("📋 Cardio schedules:", data);

      return data;
    } catch (error: unknown) {
      throw new Error(
        getErrorMessage(error, "Failed to fetch cardio schedules."),
      );
    }
  };

export interface SessionCalculator {
  id: string;
  title: string;
  owner_id: string;
  minutes: number;
  calories_burned: number;
  cardio_option: string;
  image: string;
  current_load: number | null;
  power: number | null;
  distance_mi: number;
  mets: number;
  avg_watts: number;
  rpm: number;
  peak_hr: number;
  avg_hr: number;
  like: boolean | null;
  likes: number | null;
  avg_mets: number;
  manifest_id: string;
  created_at: string;
  updated_at: string;
  menu_name?: string;
  suggestion?: string;
}

export interface CardioSessionDetailsResponse {
  session: {
    id: string;
    title: string;
    owner_id: string;
    member_id: string;
    minutes: number;
    calories_burned: number;
    created_at: string;
    updated_at: string;
    calculators: SessionCalculator[];
  };
  calculators: SessionCalculator[];
  user: {
    id: number;
    username: string;
    image: string;
  };
  cardio_goal: number;
  weekly_burnt: number;
  left_this_week: number;
}

export const getCardioSessionDetails = async (
  sessionId: string,
): Promise<CardioSessionDetailsResponse> => {
  try {
    const { data } = await apiClient.get<CardioSessionDetailsResponse>(
      `/cardio/session-details/${sessionId}`,
    );
    console.log("📋 Cardio session details response:", data);
    return data;
  } catch (error: unknown) {
    throw new Error(
      getErrorMessage(error, "Failed to fetch cardio session details."),
    );
  }
};

export const updateCardioGoal = async (
  cardio_goal: number,
): Promise<{ message: string }> => {
  try {
    const { data } = await apiClient.post("/update-cardio-goal", { cardio_goal });
    console.log("📋 Update cardio goal response:", data);
    return data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to update cardio goal."));
  }
};

export const cardioApi = {
  getCardioMenu,
  updateCardioGoal,
  addCardioSession,
  completeCardioSession,
  setCardioGoal,
  getCardioDashboard,
  getCardioSessions,
  getCardioHistory,
  getCardioActivities,
  deleteCardioActivity,
  completeCardioActivity,
  quickLogCardio,
  deleteCardioSession,
  getCardioSchedules,
  getCardioSessionDetails,
};

export default cardioApi;
