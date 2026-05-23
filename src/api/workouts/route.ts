import axios from "axios";
import { getAuthToken } from "@/lib/auth/session";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.paxlete.com";

// ===========================================
// TYPES
// ===========================================

export interface IncompleteSession {
  id: string;
  session_id: string;
  title: string;
  workout_name: string;
  program_name: string;
  program_id: string;
  created_at: string;
  updated_at: string;
  owner_id: string;
  member_id: string;
  url: string;
  status: boolean;
  location_id: string | null;
  team_id: string | null;
  save_data: any;
}

export interface CreateLocationPayload {
  locationTitle: string;
  equipmentIds: string[];
}

export interface CreateLocationResponse {
  message: string;
  locationId: string;
  isTemporary: boolean;
}

export interface CreateSessionPayload {
  workoutLibraryId: string;
  locationId?: string | null;
}

export interface WorkoutSession {
  id: string;
  session_code: string;
  workout_code: string;
  location_id: string | null;
  started_at: string;
}

export interface CreateSessionResponse {
  message: string;
  session: WorkoutSession;
}

export interface CreateFeedPostPayload {
  sessionId: string;
  workoutLibraryId: string;
}

export interface CreateFeedPostResponse {
  message: string;
  feedPost: {
    id: string;
    session_id: string;
    created_at: string;
  };
}

export interface SwapExerciseRequest {
  exerciseId: string;
  sessionId: string;
  section: string;
  existingExercises: string[];
}

export interface SwappedExerciseData {
  id: number;
  exercise_uuid: string;
  exercise_id: string;
  name: string;
  demoGif: string;
  supplemental: string;
  defaultReps: string;
}

export interface SwappedExercise {
  exercise: SwappedExerciseData;
  swapped: boolean;
  reason?: string;
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
// WORKOUT SESSION API
// ===========================================

export const getIncompleteSessions = async (
  workoutCode: string,
): Promise<IncompleteSession[]> => {
  try {
    const { data } = await apiClient.get<{ sessions: IncompleteSession[] } | IncompleteSession[]>(
      `/workouts/rejoin-session?workoutLibraryId=${encodeURIComponent(workoutCode)}`,
    );
    if (Array.isArray(data)) return data;
    if (data && "sessions" in data && Array.isArray(data.sessions)) return data.sessions;
    return [];
  } catch (error: unknown) {
    throw new Error(
      getErrorMessage(error, "Failed to fetch incomplete sessions."),
    );
  }
};

export const createWorkoutLocation = async (
  payload: CreateLocationPayload,
): Promise<CreateLocationResponse> => {
  try {
    const { data } = await apiClient.post<CreateLocationResponse>(
      "/workouts/location",
      payload,
    );
    return data;
  } catch (error: unknown) {
    throw new Error(
      getErrorMessage(error, "Failed to create workout location."),
    );
  }
};

export const createWorkoutSession = async (
  payload: CreateSessionPayload,
): Promise<CreateSessionResponse> => {
  try {
    const { data } = await apiClient.post<CreateSessionResponse>(
      "/workouts/session",
      payload,
    );
    return data;
  } catch (error: unknown) {
    throw new Error(
      getErrorMessage(error, "Failed to create workout session."),
    );
  }
};

export const createFeedPost = async (
  payload: CreateFeedPostPayload,
): Promise<CreateFeedPostResponse> => {
  try {
    const { data } = await apiClient.post<CreateFeedPostResponse>(
      "/workouts/feed-post",
      payload,
    );
    return data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to create feed post."));
  }
};

export const deleteWorkoutSession = async (
  sessionId: string,
): Promise<{ message: string }> => {
  try {
    const { data } = await apiClient.delete<{ message: string }>(
      `/workouts/session/${sessionId}`,
    );
    return data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return { message: "Session not found, cleared locally." };
    }
    throw new Error(
      getErrorMessage(error, "Failed to delete workout session."),
    );
  }
};

export const swapExercise = async (
  request: SwapExerciseRequest,
): Promise<SwappedExercise> => {
  try {
    const { data } = await apiClient.post<SwappedExercise>(
      "/workouts/swap-exercise",
      request,
    );
    return data;
  } catch (error: unknown) {
    console.error("[swap] API error for exercise", request.exerciseId, error);
    return {
      exercise: {
        id: 0,
        exercise_uuid: request.exerciseId,
        exercise_id: request.exerciseId,
        name: "",
        demoGif: "",
        supplemental: "",
        defaultReps: "",
      },
      swapped: false,
    };
  }
};

export interface SectionExercise {
  id: string;
  exercise_id: string;
  exercise_uuid: string;
  exercise_name: string;
  reps: string;
  supplemental: string;
  demo_gif: string;
  demoGif: string;
  is_power_set: boolean;
  order: number;
  title: string;
  weight?: string;
  weight_adj?: string;
}

export interface GetSectionResponse {
  section: string;
  exercises: SectionExercise[];
  workouts: SectionExercise[];
}

export const getWorkoutSection = async (params: {
  sessionId?: string | null;
  programCode?: string | null;
  section: string;
}): Promise<SectionExercise[]> => {
  try {
    const query = new URLSearchParams();
    if (params.sessionId) query.set("sessionId", params.sessionId);
    if (params.programCode) query.set("programCode", params.programCode);
    query.set("section", params.section);

    const { data } = await apiClient.get<GetSectionResponse>(
      `/workouts/section?${query.toString()}`,
    );
    console.log("[section] API response:", data);
    return data.exercises || data.workouts || [];
  } catch (error: unknown) {
    console.error("[section] API error:", error);
    throw new Error(getErrorMessage(error, "Failed to fetch workout section."));
  }
};

export interface TrackingLog {
  id: string;
  title: string;
  created_date: string;
  exerciseId: string;
  sessionId: string;
  workoutLibraryId: string;
  weight: number;
  repetitions: number;
  tag?: string;
  load?: number;
  status?: boolean;
}

export interface CreateTrackingLogPayload {
  title: string;
  exerciseId: string;
  sessionId: string;
  workoutLibraryId: string;
  weight: number;
  repetitions: number;
  tag?: string;
  status?: boolean;
  load?: number;
  specializedWorkoutId?: string;
}

export const getTrackingLogs = async (params: {
  sessionId?: string;
  exercise_id?: string;
}): Promise<TrackingLog[]> => {
  try {
    const query = new URLSearchParams();
    if (params.sessionId) query.set("sessionId", params.sessionId);
    if (params.exercise_id) query.set("exercise_id", params.exercise_id);
    const { data } = await apiClient.get<any>(
      `/workouts/tracking-logs?${query.toString()}`,
    );
    console.log("[tracking] Raw GET response:", data);
    if (Array.isArray(data)) return data;
    if (data?.records && Array.isArray(data.records)) return data.records;
    if (data?.logs && Array.isArray(data.logs)) return data.logs;
    if (data?.data && Array.isArray(data.data)) return data.data;
    if (data?.trackingLogs && Array.isArray(data.trackingLogs)) return data.trackingLogs;
    return [];
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to fetch tracking logs."));
  }
};

export const createTrackingLog = async (
  payload: CreateTrackingLogPayload,
): Promise<TrackingLog> => {
  try {
    const { data } = await apiClient.post<{ message: string; trackingLog: TrackingLog }>(
      "/workouts/tracking-log",
      payload,
    );
    return data.trackingLog;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to create tracking log."));
  }
};

export const workoutsApi = {
  getIncompleteSessions,
  createWorkoutLocation,
  createWorkoutSession,
  createFeedPost,
  deleteWorkoutSession,
  getTrackingLogs,
  createTrackingLog,
};

export default workoutsApi;
