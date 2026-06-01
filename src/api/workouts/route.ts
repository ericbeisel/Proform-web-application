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
  shortId?: string;
  title?: string;
  subtitle?: string;
  programName?: string;
  program_id?: string;
  workoutTitle?: string;
  workoutImage?: string;
  workoutCategory?: string;
  week?: string;
  day?: string;
  createdAt?: string;
  createdAtFormatted?: string;
  joinedCount?: number;
  participants?: { id?: number; name?: string; username?: string; image?: string }[];
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

export const getWorkoutSessionById = async (sessionId: string): Promise<WorkoutSession> => {
  const { data } = await apiClient.get<WorkoutSession>(`/workouts/session/${sessionId}`);
  console.log("[workout session] API response:", data);
  return data;
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
  sets?: string;
  supplemental: string;
  demo_gif: string;
  demoGif: string;
  is_power_set: boolean;
  order: number;
  title: string;
  weight?: string;
  weight_adj?: string;
  original_exercise_name?: string;
  original_demo_gif?: string;
  swapped?: boolean;
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
    const exercises = data.exercises || data.workouts || [];
    console.log("[section] API response:", data);
    return exercises;
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

// ===========================================
// SUGGESTED EXERCISES + SAVE SWAP
// ===========================================

export interface SuggestedExercise {
  id: number;
  exercise_uuid: string;
  exercise_id: string;
  name: string;
  demoGif: string;
  demo_gif?: string;
  supplemental: string;
  defaultReps: string;
  sets?: string;
  weight?: string;
  weight_adj?: string;
}

export const getSuggestedExercises = async (params: {
  exerciseId: string;
  sessionId?: string | null;
  section?: string | null;
  existingExercises?: string[];
}): Promise<SuggestedExercise[]> => {
  try {
    const query = new URLSearchParams();
    query.set("exerciseId", params.exerciseId);
    if (params.sessionId) query.set("sessionId", params.sessionId);
    if (params.section) query.set("section", params.section);
    params.existingExercises?.forEach((id) => query.append("existingExercises", id));
    const { data } = await apiClient.get<SuggestedExercise[] | { exercises: SuggestedExercise[] }>(
      `/workouts/suggested-exercises?${query.toString()}`,
    );
    if (Array.isArray(data)) return data;
    if ("exercises" in data && Array.isArray(data.exercises)) return data.exercises;
    return [];
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to fetch suggested exercises."));
  }
};

export interface SaveSwapPayload {
  exerciseId: string;
  swapExerciseId: string;
  specializedWorkoutId?: string;
  sessionId?: string;
  oneLocation?: string;
  allLocations?: boolean;
  title?: string;
  sets?: string;
  reps?: string;
  weight?: number;
  weightAdj?: string;
}

export const saveExerciseSwap = async (
  payload: SaveSwapPayload,
): Promise<{ message: string }> => {
  try {
    const { data } = await apiClient.post<{ message: string }>("/workouts/save-swap", payload);
    return data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to save exercise swap."));
  }
};

export interface SearchableExercise {
  id: string | number;
  exercise_id: string;
  exercise_uuid?: string;
  name: string;
  exercise_name?: string;
  demo_gif?: string;
  demoGif?: string;
  isFavorite?: boolean;
}

export const getAllExercises = async (params: {
  page?: number;
  limit?: number;
}): Promise<{ exercises: SearchableExercise[]; total: number }> => {
  try {
    const query = new URLSearchParams();
    query.set("page", String(params.page ?? 1));
    query.set("limit", String(params.limit ?? 20));
    const { data } = await apiClient.get(`/workouts/exercises?${query.toString()}`);
    if (Array.isArray(data)) return { exercises: data, total: data.length };
    if (data.exercises) return { exercises: data.exercises, total: data.total ?? data.exercises.length };
    if (data.data) return { exercises: data.data, total: data.total ?? data.data.length };
    return { exercises: [], total: 0 };
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to fetch exercises."));
  }
};

export const searchExercises = async (params: {
  q?: string;
  page?: number;
  supplemental?: string;
  resistance?: string;
  intensity?: string;
  muscle?: string;
  type?: string;
  location?: string;
  max?: string;
  favoritesOnly?: boolean;
}): Promise<{ exercises: SearchableExercise[]; total: number }> => {
  try {
    const query = new URLSearchParams();
    if (params.q) query.set("q", params.q);
    if (params.page) query.set("page", String(params.page));
    if (params.supplemental) query.set("supplemental", params.supplemental);
    if (params.resistance) query.set("resistanceType", params.resistance);
    if (params.intensity) query.set("intensity", params.intensity);
    if (params.muscle) query.set("muscleGroup", params.muscle);
    if (params.type) query.set("type", params.type);
    if (params.location) query.set("locationId", params.location);
    if (params.max) query.set("opmRecord", params.max);
    if (params.favoritesOnly) query.set("favoritesOnly", "true");
    const { data } = await apiClient.get(`/workouts/search-exercises?${query.toString()}`);
    if (Array.isArray(data)) return { exercises: data, total: data.length };
    if (data.exercises) return { exercises: data.exercises, total: data.total ?? data.exercises.length };
    return { exercises: [], total: 0 };
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to search exercises."));
  }
};

export const getFavoriteExercises = async (): Promise<SearchableExercise[]> => {
  try {
    const { data } = await apiClient.get("/workouts/favorites");
    console.log("[fav API] GET /workouts/favorites raw response:", JSON.stringify(data));
    if (Array.isArray(data)) return data;
    if (data.exercises) return data.exercises;
    if (data.favorites) return data.favorites;
    if (data.data) return data.data;
    return [];
  } catch (error: unknown) {
    console.error("[fav API] GET favorites error:", error);
    throw new Error(getErrorMessage(error, "Failed to fetch favorites."));
  }
};

export const addFavoriteExercise = async (exerciseId: string): Promise<void> => {
  try {
    console.log("[fav API] POST /workouts/exercises/" + exerciseId + "/favorite");
    const { data } = await apiClient.post(`/workouts/exercises/${exerciseId}/favorite`);
    console.log("[fav API] add response:", data);
  } catch (error: unknown) {
    console.error("[fav API] add error:", error);
    throw new Error(getErrorMessage(error, "Failed to add favorite."));
  }
};

export const removeFavoriteExercise = async (exerciseId: string): Promise<void> => {
  try {
    console.log("[fav API] DELETE /workouts/exercises/" + exerciseId + "/favorite");
    const { data } = await apiClient.delete(`/workouts/exercises/${exerciseId}/favorite`);
    console.log("[fav API] remove response:", data);
  } catch (error: unknown) {
    console.error("[fav API] remove error:", error);
    throw new Error(getErrorMessage(error, "Failed to remove favorite."));
  }
};

export interface DropdownOptions {
  supplemental: string[];
  resistance: string[];
  intensities: number[];
  muscleGroups: string[];
  type: string[];
  exerciseLocation: { id?: string | number; title?: string; name?: string }[];
  loadMeter: number[];
  opmRecords: string[];
}

export interface WorkoutLoadRecord {
  load: number;
  power: number;
  kcal: number;
  [key: string]: unknown;
}

export interface WorkoutLoadSummary {
  load: number;
  power: number;
  kcal: number;
}

export interface CreateWorkoutLoadDto {
  sessionId: string;
  workoutId: string;
  title?: string;
  load?: number;
  power?: number;
  kcal?: number;
  tableName?: string;
  memberId?: string;
  program?: string;
  workoutComplete?: boolean;
  completeWorkoutId?: string;
  sss?: string;
  muscleTracking?: string;
}

export const createWorkoutLoad = async (payload: CreateWorkoutLoadDto): Promise<WorkoutLoadRecord> => {
  try {
    const { data } = await apiClient.post<WorkoutLoadRecord>("/workouts/workout-load", payload);
    console.log("[createWorkoutLoad] saved:", data);
    return data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to save workout load."));
  }
};

export const getWorkoutLoads = async (sessionId: string): Promise<WorkoutLoadSummary> => {
  try {
    const { data } = await apiClient.get<WorkoutLoadRecord[] | WorkoutLoadRecord>(
      "/workouts/workout-loads",
      { params: { sessionId } }
    );
    const records = Array.isArray(data) ? data : [data];
    console.log("[getWorkoutLoads] raw response:", data, "| records:", records);
    return records.reduce(
      (acc, r) => ({
        load: acc.load + (Number(r.load) || 0),
        power: acc.power + (Number(r.power) || 0),
        kcal: acc.kcal + (Number(r.kcal) || 0),
      }),
      { load: 0, power: 0, kcal: 0 }
    );
  } catch {
    return { load: 0, power: 0, kcal: 0 };
  }
};

export interface CompletedUser {
  id: number;
  name: string;
  username: string;
  member_id: string;
  image: string | null;
}

export const getCompletedUsers = async (workoutName: string): Promise<CompletedUser[]> => {
  try {
    const { data } = await apiClient.get<CompletedUser[]>("/workouts/completed-users", {
      params: { workoutName },
    });
    console.log("[completed users] API response:", data);
    return Array.isArray(data) ? data : [];
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to fetch completed users."));
  }
};

export interface PowerSetDetailSet {
  suggestedWeight: string;
  suggestedReps: string;
  weight: string;
  reps: string;
  maxV: string;
  recorded: boolean;
  unableToPerform: boolean;
  unit: string;
}

export interface PowerSetDetailExercise {
  id: number;
  exercise_uuid: string;
  name: string;
  supplemental: string;
  demoGif: string;
}

export interface PowerSetDetailWorkout {
  id: string;
  title: string;
  reps: string;
  weight: string;
  weight_adj: string;
}

export interface PowerSetDetail {
  workout: PowerSetDetailWorkout;
  exercise: PowerSetDetailExercise;
  sets: PowerSetDetailSet[];
  unit: string;
  suggestedReps: string;
  suggestedWeight: string;
}

export const getPowerSetDetails = async (params: {
  specializedWorkoutId: string;
  sessionId?: string | null;
}): Promise<PowerSetDetail> => {
  const query = new URLSearchParams();
  query.set("specializedWorkoutId", params.specializedWorkoutId);
  if (params.sessionId) query.set("sessionId", params.sessionId);
  const { data } = await apiClient.get<PowerSetDetail>(
    `/workouts/power-set-details?${query.toString()}`,
  );
  console.log("[power set details] API response:", data);
  return data;
};

export const getDropdownOptions = async (): Promise<DropdownOptions> => {
  try {
    const { data } = await apiClient.get("/workouts/dropdown-options");
    console.log("[dropdown] raw response:", data);
    return data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to fetch dropdown options."));
  }
};
