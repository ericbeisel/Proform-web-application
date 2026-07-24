import axios from "axios";
import { getAuthToken } from "@/lib/auth/session";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.paxlete.com";

// Debug helper for the "missing member_id" exercise-log errors — logs the full
// decoded JWT payload (not just the id/email/username subset getTokenPayload
// exposes) plus the stored user object, so we can see whether member_id is
// present anywhere on the authenticated session.
function logExerciseLogAuthDebug(context: string) {
  try {
    const token = getAuthToken();
    if (!token) {
      console.log(`[exerciseLogs] ${context} — no auth token found`);
      return;
    }
    const payload = JSON.parse(atob(token.split(".")[1]));
    console.log(`[exerciseLogs] ${context} — decoded token payload:`, payload);
    if (typeof window !== "undefined") {
      const rawUser = window.localStorage.getItem("user");
      console.log(`[exerciseLogs] ${context} — stored user object:`, rawUser ? JSON.parse(rawUser) : null);
    }
  } catch (err) {
    console.error(`[exerciseLogs] ${context} — failed to decode token:`, err);
  }
}

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
  // Links this new session to the host's — same field mobile's
  // programService.createWorkoutSession sends when a non-host joins
  // someone else's shared session, so the backend can group them together.
  refSessionId?: string;
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
  franchiseCode?: string;
  owner?: PublicWorkoutSessionOwner;
  stats?: PublicWorkoutSessionStats;
  locationName?: string;
  liveUserCount?: number;
  compareGroup?: PublicWorkoutSessionCompareGroup;
  commentCount?: number;
  comments?: PublicWorkoutSessionComment[];
  loadChart?: number[];
  workoutLoads?: PublicWorkoutLoad[];
}

export interface PublicWorkoutSessionOwner {
  id?: number;
  memberId?: number | null;
  name?: string;
  username?: string;
  image?: string;
}

export interface PublicWorkoutSessionStats {
  load?: number;
  power?: number;
  calories?: number;
}

export interface PublicWorkoutSessionMetrics {
  viewed?: number;
  started?: number;
  completed?: number;
}

export interface PublicWorkoutSessionCompareGroup {
  yours?: number;
  avg?: number;
  best?: number;
}

export interface PublicWorkoutLoad {
  id: string;
  title?: string;
  createdDate?: string;
  updatedDate?: string;
  load?: number;
  power?: number;
  kcal?: number;
  workoutId?: string;
  program?: string;
  workoutComplete?: boolean;
  sessionId?: string;
}

export interface PublicWorkoutSessionComment {
  id?: string;
  text?: string;
  createdAt?: string;
  user?: { name?: string; username?: string; image?: string };
  [key: string]: unknown;
}

export interface PublicWorkoutSession {
  id: string;
  shortId?: string;
  title?: string;
  subtitle?: string;
  workoutTitle?: string;
  programName?: string;
  workoutImage?: string;
  workoutCategory?: string;
  week?: string;
  day?: string;
  program_id?: string;
  workout_code?: string;
  franchiseCode?: string;
  createdAt?: string;
  createdAtFormatted?: string;
  completedAtFormatted?: string;
  joinedCount?: number;
  owner?: PublicWorkoutSessionOwner;
  participants?: { id?: number; name?: string; username?: string; image?: string }[];
  url?: string;
  stats?: PublicWorkoutSessionStats;
  locationName?: string;
  prescribedBy?: string | null;
  exercises?: unknown[];
  liveUserCount?: number;
  sessionMetrics?: PublicWorkoutSessionMetrics;
  compareGroup?: PublicWorkoutSessionCompareGroup;
  likeCount?: number;
  commentCount?: number;
  comments?: PublicWorkoutSessionComment[];
  feedPostId?: string;
  isLiked?: boolean;
  loadChart?: number[];
  workoutLoads?: PublicWorkoutLoad[];
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

// Persists a location change on an in-progress session server-side — same
// endpoint mobile's programService.updateSessionLocation uses. Exercises for
// that session should be re-fetched afterward to reflect the new location's
// equipment (the backend does the substitution, same as elsewhere in this file).
export const updateSessionLocation = async (
  sessionId: string,
  locationId: string,
): Promise<unknown> => {
  try {
    const { data } = await apiClient.post("/workouts/session/update-location", {
      sessionId,
      locationId,
    });
    return data;
  } catch (error: unknown) {
    throw new Error(
      getErrorMessage(error, "Failed to update session location."),
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

// Unauthenticated preview endpoint for share links — used when the viewer
// isn't logged in (or the authenticated lookup fails/404s because they
// don't have access to the session).
export const getPublicWorkoutSession = async (sessionId: string): Promise<PublicWorkoutSession> => {
  const { data } = await apiClient.get<{ message: string; data: PublicWorkoutSession }>(
    `/public-workout-session/${sessionId}`,
  );
  return data.data;
};

export interface ClosedSessionPrescribedBy {
  id?: number;
  name?: string;
  username?: string;
  image?: string;
}

// Response shape for the closed-session detail screen (web's
// /live-sessions/[id], mirroring mobile's LiveSessionDetailScreen).
export interface ClosedSessionDetails {
  id?: string;
  programName?: string;
  workoutTitle?: string;
  prescribedBy?: ClosedSessionPrescribedBy | null;
  locationName?: string;
  // Program identifier needed to open this session's workout overview —
  // named inconsistently across endpoints elsewhere in this file
  // (workout_code/program_id on WorkoutSession), so both are read
  // defensively wherever this is consumed.
  program_id?: string;
  workout_code?: string;
  stats?: PublicWorkoutSessionStats;
  sessionMetrics?: PublicWorkoutSessionMetrics;
  compareGroup?: PublicWorkoutSessionCompareGroup;
  liveUserCount?: number;
  participants?: { id?: number; name?: string; username?: string; image?: string }[];
  exercises?: unknown[];
  isLiked?: boolean;
  likeCount?: number;
  commentCount?: number;
  comments?: PublicWorkoutSessionComment[];
  feedPostId?: string;
}

export const getClosedSessionDetails = async (sessionId: string): Promise<ClosedSessionDetails> => {
  const { data } = await apiClient.get<ClosedSessionDetails | { message: string; data: ClosedSessionDetails }>(
    `/workouts/closed-session/${sessionId}`,
  );
  // Defensive unwrap — /public-workout-session wraps in { data }, while
  // /workouts/session returns flat; this endpoint's convention isn't
  // confirmed yet, so handle either.
  return (data as { data?: ClosedSessionDetails }).data ?? (data as ClosedSessionDetails);
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
  isCompleted?: boolean;
  // Same endpoint mobile calls for this — its locationName field is the
  // session's actual server-side location, source of truth once a session
  // exists (see athenaWorkout.tsx's per-section override).
  locationName?: string;
}

export const getWorkoutSection = async (params: {
  sessionId?: string | null;
  programCode?: string | null;
  section: string;
}): Promise<SectionExercise[]> => {
  const full = await getWorkoutSectionFull(params);
  return full.exercises || full.workouts || [];
};

export const getWorkoutSectionFull = async (params: {
  sessionId?: string | null;
  programCode?: string | null;
  section: string;
}): Promise<GetSectionResponse> => {
  try {
    const query = new URLSearchParams();
    if (params.sessionId) query.set("sessionId", params.sessionId);
    if (params.programCode) query.set("programCode", params.programCode);
    query.set("section", params.section);

    const { data } = await apiClient.get<GetSectionResponse>(
      `/workouts/section?${query.toString()}`,
    );
    console.log("[section] API response:", data);
    return data;
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

// ===========================================
// POWER SET LOGS
// ===========================================

export interface PowerSetLogPayload {
  new_weight: number;
  reps: number;
  unable_to_perform?: boolean;
  power_id?: string;
  specialized_workout_id?: string;
  individual_exercise_id?: string;
  session_id?: string;
  weight_adj?: string;
  tracking_log?: string;
  old_weight?: number;
  old_reps?: number;
}

export const createPowerSetLog = async (
  payload: PowerSetLogPayload,
): Promise<{ powerSetLog: any }> => {
  try {
    const { data } = await apiClient.post("/workouts/power-set-log", payload);
    return data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to save power set log."));
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
  createPowerSetLog,
  // getPowerSetLogs and getPowerSetDetails are declared later in this file
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
    console.log("[exercises] GET /workouts/exercises → params:", params);
    const { data } = await apiClient.get(`/workouts/exercises?${query.toString()}`);
    console.log("[exercises] GET /workouts/exercises ✅ raw response:", data);
    if (Array.isArray(data)) return { exercises: data, total: data.length };
    if (data.exercises) return { exercises: data.exercises, total: data.total ?? data.exercises.length };
    if (data.data) return { exercises: data.data, total: data.total ?? data.data.length };
    return { exercises: [], total: 0 };
  } catch (error: unknown) {
    console.error("[exercises] GET /workouts/exercises ❌ error:", axios.isAxiosError(error) ? error.response?.data : error);
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
    console.log("[exercises] GET /workouts/search-exercises → params:", params, "| query string:", query.toString());
    const { data } = await apiClient.get(`/workouts/search-exercises?${query.toString()}`);
    console.log("[exercises] GET /workouts/search-exercises ✅ raw response:", data);
    if (Array.isArray(data)) return { exercises: data, total: data.length };
    if (data.exercises) return { exercises: data.exercises, total: data.total ?? data.exercises.length };
    return { exercises: [], total: 0 };
  } catch (error: unknown) {
    console.error("[exercises] GET /workouts/search-exercises ❌ error:", axios.isAxiosError(error) ? error.response?.data : error);
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
  id?: string;
  session_id?: string;
  workout_id?: string;
  title?: string;
  program?: string;
  workout_complete?: boolean;
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

export const getWorkoutLoadRecords = async (sessionId: string): Promise<WorkoutLoadRecord[]> => {
  try {
    const { data } = await apiClient.get<WorkoutLoadRecord[] | WorkoutLoadRecord>(
      "/workouts/workout-loads",
      { params: { sessionId } }
    );
    return Array.isArray(data) ? data : [data];
  } catch {
    return [];
  }
};

export const getWorkoutLoads = async (sessionId: string): Promise<WorkoutLoadSummary> => {
  try {
    const records = await getWorkoutLoadRecords(sessionId);
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

export interface PowerSetLog {
  id: string;
  session_id: string;
  title: string;
  program: string;
  exercise: string;
  sets: string;
  type: string;
  weight?: number;
  reps?: number;
  opm?: string;
}

export const getPowerSetLogs = async (sessionId: string): Promise<PowerSetLog[]> => {
  try {
    // Mirrors mobile's programService.getPowerSetLogs — the backend wraps
    // the array in `{ records: [...] }`, it's never a bare array.
    const { data } = await apiClient.get<{ records?: PowerSetLog[] } | PowerSetLog[]>(
      `/workouts/power-set-logs?sessionId=${sessionId}`,
    );
    if (Array.isArray(data)) return data;
    return data?.records || [];
  } catch {
    return [];
  }
};

// A user's public "Accomplishments" (MoneySet/TrophySet power-set records) —
// same /workouts/power-set-logs endpoint as getPowerSetLogs above, but scoped
// by username instead of sessionId, mirroring mobile's
// preferenceService.getPowerSetLogs(undefined, username).
export interface PowerSetAccomplishment {
  id: string;
  type?: string;
  exercise?: string;
  title?: string;
  exerciseInfo?: { name?: string; supplemental?: string };
  new_weight?: number;
  reps?: number;
  amp?: number;
  member_weight_rmp?: number;
  diff?: string;
  [key: string]: unknown;
}

export const getPowerSetLogsByUsername = async (
  username: string,
): Promise<PowerSetAccomplishment[]> => {
  try {
    const { data } = await apiClient.get<{ records?: PowerSetAccomplishment[] } | PowerSetAccomplishment[]>(
      `/workouts/power-set-logs?username=${encodeURIComponent(username)}`,
    );
    if (Array.isArray(data)) return data;
    return data?.records || [];
  } catch {
    return [];
  }
};

export interface PendingActivity {
  id: number;
  name: string;
  type: string;
  day: string;
  time: string;
  day_number: number;
  workoutTitle: string;
  completed_activity: boolean | null;
}

export const getPendingActivities = async (params: {
  type: string;
  workoutName?: string;
}): Promise<PendingActivity[]> => {
  try {
    const query = new URLSearchParams({ type: params.type });
    if (params.workoutName) query.set("workoutName", params.workoutName);
    const { data } = await apiClient.get<PendingActivity[]>(`/workouts/pending-activities?${query.toString()}`);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

export interface MuscleTrackingItem {
  [muscle: string]: number;
}

export interface WorkoutStats {
  thisWorkout: {
    load: number;
    power: number;
    cals: number;
    muscleTracking: MuscleTrackingItem[];
  };
  userAverage: { load: number; power: number; cals: number };
  overallAverage: { load: number; power: number; cals: number };
  loadChart: number[];
}

export const getWorkoutStats = async (sessionId: string): Promise<WorkoutStats | null> => {
  console.log("[getWorkoutStats] → GET /workouts/stats with params:", { sessionId });
  try {
    const { data } = await apiClient.get<WorkoutStats>("/workouts/stats", {
      params: { sessionId },
    });
    console.log("[getWorkoutStats] ✅ raw response:", JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error("[getWorkoutStats] ❌", error);
    return null;
  }
};

export const generateSessionShareLink = async (sessionId: string): Promise<string | null> => {
  try {
    const { data } = await apiClient.post<{ link?: string; url?: string; shareLink?: string }>(
      `/workouts/session/${sessionId}/share-link`
    );
    return data?.link || data?.url || data?.shareLink || null;
  } catch {
    return null;
  }
};

export const completeActivity = async (payload: {
  customActivityId?: number;
  sessionId: string;
  workoutLibraryId: string;
  workoutName?: string;
}): Promise<void> => {
  try {
    await apiClient.post("/workouts/complete-activity", payload);
  } catch (error: unknown) {
    console.error("[completeActivity] raw error response:", axios.isAxiosError(error) ? error.response?.data : error);
    throw new Error(getErrorMessage(error, "Failed to complete workout activity."));
  }
};

// Exact port of mobile's programService.inviteToSession.
export const inviteToSession = async (sessionId: string, email: string): Promise<void> => {
  try {
    await apiClient.post(`/workouts/session/${sessionId}/invite`, { email });
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to send invite email. Please try again."));
  }
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

// ===========================================
// EXERCISE LOGS
// ===========================================

export interface ExerciseLogSet {
  id: number;
  exercise_log_id: number;
  set_number: number;
  unit_type: string;
  reps: number | null;
  value: number | null;
  value_secondary: number | null;
  weight_1: number | null;
  weight_2: number | null;
  measurement: string | null;
  completed: boolean;
  created_at: string;
}

export interface ExerciseLogEntry {
  id: number;
  member_id: string;
  user_id: number;
  exercise_id: string;
  exercise_title: string;
  session_id: string | null;
  photos: string[];
  measurement: string | null;
  notes: string | null;
  logged_at: string;
  created_at: string;
  updated_at: string;
  sets: ExerciseLogSet[];
  user?: {
    id: number;
    name: string | null;
    username: string;
    image: string | null;
  } | null;
}

export interface ExerciseLogsMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ExerciseLogsResponse {
  data: ExerciseLogEntry[];
  meta: ExerciseLogsMeta;
}

export const getExerciseLogs = async (params: {
  page?: number;
  limit?: number;
  exerciseId?: string;
  username?: string;
} = {}): Promise<ExerciseLogsResponse> => {
  logExerciseLogAuthDebug("GET /exercise-logs");
  try {
    const query = new URLSearchParams();
    query.set("page", String(params.page ?? 1));
    query.set("limit", String(params.limit ?? 10));
    if (params.exerciseId) query.set("exerciseId", params.exerciseId);
    if (params.username) query.set("username", params.username);
    console.log("[exerciseLogs] GET /exercise-logs → params:", params);
    const { data } = await apiClient.get<ExerciseLogsResponse>(`/exercise-logs?${query.toString()}`);
    console.log("[exerciseLogs] GET /exercise-logs ✅ response:", data);
    return data;
  } catch (error: unknown) {
    console.error("[exerciseLogs] GET /exercise-logs ❌ error:", axios.isAxiosError(error) ? error.response?.data : error);
    throw new Error(getErrorMessage(error, "Failed to fetch exercise logs."));
  }
};

export interface CreateExerciseLogSetInput {
  set_number: number;
  unit_type: string;
  reps?: number;
  value?: number;
  value_secondary?: number;
  weight_1?: number;
  weight_2?: number;
  measurement?: string;
  completed?: boolean;
}

export interface CreateExerciseLogPayload {
  exerciseId: string;
  sets: CreateExerciseLogSetInput[];
  photos?: File[];
  exerciseTitle?: string;
  sessionId?: string;
  measurement?: string;
  notes?: string;
  loggedAt?: string;
  username?: string;
}

export const createExerciseLog = async (
  payload: CreateExerciseLogPayload,
): Promise<ExerciseLogEntry> => {
  logExerciseLogAuthDebug("POST /exercise-logs");
  try {
    const formData = new FormData();
    formData.append("exerciseId", payload.exerciseId);
    formData.append("sets", JSON.stringify(payload.sets));
    if (payload.exerciseTitle) formData.append("exerciseTitle", payload.exerciseTitle);
    if (payload.sessionId) formData.append("sessionId", payload.sessionId);
    if (payload.measurement) formData.append("measurement", payload.measurement);
    if (payload.notes) formData.append("notes", payload.notes);
    if (payload.loggedAt) formData.append("loggedAt", payload.loggedAt);
    payload.photos?.forEach((file) => formData.append("photos", file));

    console.log("[exerciseLogs] POST /exercise-logs → payload:", {
      exerciseId: payload.exerciseId,
      exerciseTitle: payload.exerciseTitle,
      sessionId: payload.sessionId,
      measurement: payload.measurement,
      notes: payload.notes,
      loggedAt: payload.loggedAt,
      sets: payload.sets,
      photoCount: payload.photos?.length ?? 0,
      username: payload.username,
    });
    // Don't set Content-Type manually — it must include the multipart boundary,
    // which only the browser can generate when it sees the body is FormData.
    // A hand-set header here has no boundary, so the server's multipart parser
    // can't split the body and throws (surfaces as an opaque 500).
    const url = payload.username ? `/exercise-logs?username=${encodeURIComponent(payload.username)}` : "/exercise-logs";
    const { data } = await apiClient.post<ExerciseLogEntry>(url, formData);
    console.log("[exerciseLogs] POST /exercise-logs ✅ response:", data);
    return data;
  } catch (error: unknown) {
    console.error("[exerciseLogs] POST /exercise-logs ❌ error:", axios.isAxiosError(error) ? error.response?.data : error);
    throw new Error(getErrorMessage(error, "Failed to save exercise log."));
  }
};

export const deleteExerciseLog = async (id: number): Promise<void> => {
  logExerciseLogAuthDebug("DELETE /exercise-logs/" + id);
  try {
    console.log("[exerciseLogs] DELETE /exercise-logs/" + id);
    await apiClient.delete(`/exercise-logs/${id}`);
    console.log("[exerciseLogs] DELETE /exercise-logs/" + id + " ✅ deleted");
  } catch (error: unknown) {
    console.error("[exerciseLogs] DELETE /exercise-logs/" + id + " ❌ error:", axios.isAxiosError(error) ? error.response?.data : error);
    throw new Error(getErrorMessage(error, "Failed to delete exercise log."));
  }
};
