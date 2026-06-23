// src/api/workout/route.ts
import axios from "axios";
import { getAuthToken } from "@/lib/auth/session";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.paxlete.com";

// ===========================================
// TYPES
// ===========================================

export interface Program {
  id: string;
  title: string;
  duration: string;
  description: string;
  image: string;
  paid_plan: string;
  free_is_program: boolean;
  enrolled: number;
  times_completed: number;
  package: string;
  package_id: string;
  sport?: string;
  code: string;
}

export interface ProgramWithUI extends Program {
  purchased: boolean;
  dollar: boolean;
  views: number;
  bought: number;
  category?: string;
  level?: string;
}

export interface Organization {
  id: string;
  title: string;
}

export interface SportCategory {
  id: string;
  title: string;
  slug: string;
  field_slug: string;
  owner: string;
  image: string | null;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface FeaturedTrainer {
  id: string;
  title: string;
  slug: string;
  owner: string;
  image: string;
  order: number;
  description: string;
  hide: boolean;
  myprograms: string;
  courses: string | null;
  created_at: string;
  updated_at: string;
}

export interface AgeGroup {
  id: string;
  title: string;
  slug: string;
  owner: string;
  icon: string;
  order: number;
  myprograms: string;
  created_at: string;
  updated_at: string;
}

export interface SettingCategory {
  id: string;
  title: string;
  slug: string;
  owner: string;
  icon: string;
  order: number;
  myprograms: string;
  created_at: string;
  updated_at: string;
}

export interface ProgramFocus {
  id: string;
  title: string;
  slug: string;
  owner: string;
  icon: string;
  order: number;
  myprograms: string;
  created_at: string;
  updated_at: string;
}

export interface WorkoutPageResponse {
  featuredPrograms: Program;
  popularPrograms: Program[];
  freePrograms: Program[];
  suggestedPrograms: Program[];
  organizations: Organization[];
  sportCategories: SportCategory[];
  programFocus: ProgramFocus[];
  featuredTrainers: FeaturedTrainer[];
  ageGroups: AgeGroup[];
  settingCategories: SettingCategory[];
  featuredFranchise: FeaturedFranchise;
}

export interface SportCategoryName {
  id: string;
  title: string;
}

export interface FeaturedFranchise {
  id: string;
  title: string;
  abbreviation: string;
  cover_photo: string;
  profile_photo: string;
  franchise_id: string;
  owner: string;
  upgrade_lightbox: string;
  created_at: string;
  updated_at: string;
}

interface PaginatedPrograms {
  results: Program[];
  count: number;
  next: string | null;
  previous: string | null;
}

export interface ProgramDetail {
  id: string;
  title: string;
  duration: string;
  description: string;
  image: string;
  paid_plan: string | null;
  free_is_program: boolean;
  enrolled: number;
  times_completed: number;
  package: string;
  package_id: string;
  organization_name: string;
  workouts: {
    cover_photo: string;
    workout_title: string;
    key: string;
    week: string;
    order: number;
    title: string;
    muscles_used?: string;
  }[];
  trainers: any[];
  objectives: string[];
  schedule?: string;
  nutrition?: string;
  intensity?: string;
  pre_req?: string;
  addworkoutcount: number; // Changed from addworkoutCount to addworkoutcount (all lowercase)
  supplementalWorkoutCounts: number; // Keep as is
  code?: string; // Add code field for fetching exercises and equipment
}

export interface StartProgramPayload {
  programId: string;
  type: string; // "Workout" or other types
  addSuggested: number; // 1 for true, 0 for false (includes supplemental)
}

export interface StartProgramResponse {
  message: string;
  queue_id?: string;
  program_id?: string;
  status?: string;
}

export interface WorkoutQueueItem {
  id: string;
  title: string;
  workout_title: string;
  day: string;
  week: string;
  program_name: string;
  completed: boolean;
  muscles_used: string;
  cover_photo: string;
  order: number;
  micro_order: number;
  created_date: string;
  updated_date: string;
  type: string;
  queue_name: string;
  group: string;
  member_id: string;
  owner: string | null;
  completion_id: string | null;
  session_id: string | null;
  queue_id: string | null;
  created_date_2: string;
  team_id: string | null;
  archive: boolean;
}

export interface WorkoutQueueResponse {
  message?: string;
  count?: number;
  workouts?: WorkoutQueueItem[];
}

// NEW: Activity Workout Queue Item Type (extended with activity fields)
export interface ActivityWorkoutQueueItem extends WorkoutQueueItem {
  activity_id: number;
  activity_name: string;
  activity_time: string;
  activity_day: string;
  activity_status: number;
  completed_activity: boolean;
}

export interface ProgramsBySportResponse {
  data: Program[];
  total: number;
  currentPage: number;
  totalPages: number;
}

export interface ProgramsByTrainerResponse {
  data: Program[];
  total: number;
  currentPage: number;
  totalPages: number;
}

export interface ProgramsByFocusResponse {
  data: Program[];
  total: number;
  currentPage: number;
  totalPages: number;
}

export interface ProgramsByAgeGroupResponse {
  data: Program[];
  total: number;
  currentPage: number;
  totalPages: number;
}

export interface ProgramsBySettingResponse {
  data: Program[];
  total: number;
  currentPage: number;
  totalPages: number;
}

export interface WorkoutStats {
  calories: string;
  power: number;
}

export interface PowerSetChild {
  id: string;
  label: string;
  multiplier: number;
  calculated_weight: number;
  reps: string;
  msrmt: string;
  min_reps?: number | null;
  isCompleted?: boolean;
}

export interface PowerSet {
  id: string;
  title_primary: string;
  title_secondary: string;
  demo_gif?: string;
  child_sets: PowerSetChild[];
  round?: number | string;
  is_money_set?: boolean;
  is_gray?: boolean;
  emoji?: string;
}

export interface WorkoutGroupItem {
  title: string;
  program: string;
  overlay: string;
  reps: string;
  sets?: string;
  order: number;
  exercise_id: string;
  exercise_name: string;
  supplemental: string;
  demo_gif: string;
  is_power_set: boolean;
  weight?: string;
  weight_adj?: string;
}

export interface WorkoutGroup {
  label: string;
  rounds: string;
  workouts: WorkoutGroupItem[];
  isCompleted?: boolean;
}

export interface Exercise {
  id: number;
  exercise_uuid: string;
  exercise_id: string;
  name: string;
  supplemental?: string; // this is the equipment type e.g. "BARBELL"
  specialized_title?: string; // e.g. "ANE01" — use this for filtering
  order?: number;
  demoGif?: string;
  video?: string;
  altVideo?: string | null;
}

export interface ExercisesResponse {
  data: Exercise[];
  total: number;
  currentPage: number;
  totalPages: number;
}

export interface Equipment {
  id: number;
  name: string;
  slug?: string;
  type?: string;
  keyword?: string;
  icon?: string; // was "image" before — this is why icons weren't showing
  hideonlocations?: boolean;
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
// WORKOUT API
// ===========================================

export const getWorkoutPageData = async (): Promise<WorkoutPageResponse> => {
  try {
    const { data } = await apiClient.get<WorkoutPageResponse>(
      "/discovery/workout-page",
    );
    console.log("📋 Workout page data response:", data);
    return data;
  } catch (error: unknown) {
    throw new Error(
      getErrorMessage(error, "Failed to fetch workout page data."),
    );
  }
};

export const getAllSportCategories = async (): Promise<SportCategoryName[]> => {
  try {
    const { data } = await apiClient.get<SportCategoryName[]>(
      "/sport-categories/names",
    );
    console.log("📋 All sport categories:", data);
    return data;
  } catch (error: unknown) {
    throw new Error(
      getErrorMessage(error, "Failed to fetch sport categories."),
    );
  }
};

export const getAllPrograms = async (): Promise<Program[]> => {
  try {
    let allPrograms: Program[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const { data } = await apiClient.get<Program[]>(`/programs?page=${page}`);

      if (!Array.isArray(data) || data.length === 0) {
        hasMore = false;
      } else {
        allPrograms = [...allPrograms, ...data];
        // If returned less than 10, we've hit the last page
        if (data.length < 10) {
          hasMore = false;
        }
        page++;
      }
    }

    console.log("📋 Total programs fetched:", allPrograms.length);
    return allPrograms;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to fetch programs."));
  }
};

export const getAllFeaturedTrainers = async (): Promise<FeaturedTrainer[]> => {
  try {
    const { data } =
      await apiClient.get<FeaturedTrainer[]>("/featured-trainers");
    console.log("📋 All featured trainers:", data);
    return data;
  } catch (error: unknown) {
    throw new Error(
      getErrorMessage(error, "Failed to fetch featured trainers."),
    );
  }
};

export const getProgramDetail = async (
  programId: string,
): Promise<ProgramDetail> => {
  try {
    const { data } = await apiClient.get<ProgramDetail>(
      `/discovery/program/${programId}`,
    );
    console.log("📋 Program detail response:", data);
    return data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to fetch program details."));
  }
};

export const startProgram = async (
  payload: StartProgramPayload,
): Promise<StartProgramResponse> => {
  try {
    const { data } = await apiClient.post<StartProgramResponse>(
      "/programs/start-program",
      payload,
    );
    console.log("📋 Start program response:", data);
    return data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to start program."));
  }
};

export const addWorkoutToQueue = async (payload: {
  workoutTitle: string;
  type: string;
  priority: "top" | "bottom";
  includeSupplemental: boolean;
}): Promise<{ message: string }> => {
  try {
    const { data } = await apiClient.post<{ message: string }>(
      "/programs/add-workout-to-queue",
      payload,
    );
    console.log("📋 Add workout to queue response:", data);
    return data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to add workout to queue."));
  }
};

export const getWorkoutQueue = async (
  type: string = "workout",
): Promise<WorkoutQueueItem[]> => {
  try {
    const { data } = await apiClient.get<WorkoutQueueItem[]>(
      `/programs/workout-queue?type=${type}`,
    );
    console.log("📋 Workout queue response:", data);
    return data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to fetch workout queue."));
  }
};

// NEW: Get Activity Workout Queue
export const getActivityWorkoutQueue = async (
  type: string = "Workout",
): Promise<ActivityWorkoutQueueItem[]> => {
  try {
    const { data } = await apiClient.get<ActivityWorkoutQueueItem[]>(
      `/programs/activity-workout-queue?type=${type}`,
    );
    console.log("📋 Activity workout queue response:", data);
    return data;
  } catch (error: unknown) {
    throw new Error(
      getErrorMessage(error, "Failed to fetch activity workout queue."),
    );
  }
};

// Optional: Get both queues in parallel
export const getAllWorkoutQueues = async (type: string = "Workout") => {
  try {
    const [workoutQueue, activityWorkoutQueue] = await Promise.all([
      getWorkoutQueue(type.toLowerCase()),
      getActivityWorkoutQueue(type),
    ]);

    return {
      workoutQueue,
      activityWorkoutQueue,
    };
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to fetch workout queues."));
  }
};

// CORRECTED: Reorder Workout Queue
export const reorderWorkoutQueue = async (
  type: string,
  orderedIds: string[],
): Promise<any> => {
  try {
    console.log(type, orderedIds);

    const { data } = await apiClient.post("/programs/reorder-queue", {
      type: type,
      workoutIds: orderedIds,
    });
    console.log("📋 Reorder response:", data);
    return data;
  } catch (error: unknown) {
    console.error("Reorder API error:", error);
    throw new Error(getErrorMessage(error, "Failed to reorder workout queue."));
  }
};

export const deleteFromQueue = async (id: string): Promise<void> => {
  try {
    await apiClient.post("/programs/delete-queue", { id });
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to remove from queue."));
  }
};

export const getProgramsBySport = async (
  sport: string,
  page: number = 1,
): Promise<ProgramsBySportResponse> => {
  try {
    const { data } = await apiClient.get<ProgramsBySportResponse>(
      `/programs/by-sport?sport=${encodeURIComponent(sport)}&page=${page}`,
    );
    console.log("📋 Programs by sport response:", data);
    return data;
  } catch (error: unknown) {
    throw new Error(
      getErrorMessage(error, "Failed to fetch programs by sport."),
    );
  }
};

export const getProgramsByTrainer = async (
  trainer: string,
  page: number = 1,
): Promise<ProgramsByTrainerResponse> => {
  try {
    const { data } = await apiClient.get<ProgramsByTrainerResponse>(
      `/programs/by-trainer?trainer=${encodeURIComponent(trainer)}&page=${page}`,
    );
    console.log("📋 Programs by trainer response:", data);
    return data;
  } catch (error: unknown) {
    throw new Error(
      getErrorMessage(error, "Failed to fetch programs by trainer."),
    );
  }
};

export const getProgramsByFocus = async (
  focusId: string,
  page: number = 1,
): Promise<ProgramsByFocusResponse> => {
  try {
    const { data } = await apiClient.get<ProgramsByFocusResponse>(
      `/programs/by-focus?focusId=${focusId}&page=${page}`,
    );
    console.log("📋 Programs by focus response:", data);
    return data;
  } catch (error: unknown) {
    throw new Error(
      getErrorMessage(error, "Failed to fetch programs by focus."),
    );
  }
};

export const getProgramsByAgeGroup = async (
  ageGroupId: string,
  page: number = 1,
): Promise<ProgramsByAgeGroupResponse> => {
  try {
    const { data } = await apiClient.get<ProgramsByAgeGroupResponse>(
      `/programs/by-age-group?ageGroupId=${ageGroupId}&page=${page}`,
    );
    console.log("📋 Programs by age group response:", data);
    return data;
  } catch (error: unknown) {
    throw new Error(
      getErrorMessage(error, "Failed to fetch programs by age group."),
    );
  }
};

export const getProgramsBySetting = async (
  settingId: string,
  page: number = 1,
): Promise<ProgramsBySettingResponse> => {
  try {
    const { data } = await apiClient.get<ProgramsBySettingResponse>(
      `/programs/by-setting?settingId=${settingId}&page=${page}`,
    );
    console.log("📋 Programs by setting response:", data);
    return data;
  } catch (error: unknown) {
    throw new Error(
      getErrorMessage(error, "Failed to fetch programs by setting."),
    );
  }
};

export const getProgramExercises = async (
  programCode: string,
  page: number = 1,
  take: number = 50,
): Promise<ExercisesResponse> => {
  try {
    const { data } = await apiClient.get<ExercisesResponse>(
      `/programs/${programCode}/exercises?page=${page}&take=${take}`,
    );
    console.log("📋 Program exercises response:", data);
    return data;
  } catch (error: unknown) {
    throw new Error(
      getErrorMessage(error, "Failed to fetch program exercises."),
    );
  }
};

// Get equipment for a program
export const getProgramEquipment = async (
  programCode: string,
  hideOnLocation: boolean = false,
): Promise<Equipment[]> => {
  try {
    const { data } = await apiClient.get<Equipment[]>(
      `/programs/${programCode}/equipment?hideOnLocation=${hideOnLocation}`,
    );
    console.log("📋 Program equipment response:", data);
    return data;
  } catch (error: unknown) {
    throw new Error(
      getErrorMessage(error, "Failed to fetch program equipment."),
    );
  }
};

export const getProgramWorkoutStats = async (
  programCode: string,
): Promise<WorkoutStats> => {
  try {
    const { data } = await apiClient.get<WorkoutStats>(
      `/programs/${programCode}/workout-stats`,
    );
    console.log("📋 Program workout stats response:", data);
    return data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to fetch workout stats."));
  }
};

export const getProgramPowerSets = async (
  programCode: string,
  sessionId?: string | null,
): Promise<PowerSet[]> => {
  try {
    const { data } = await apiClient.get<PowerSet[]>(
      `/programs/${programCode}/power-sets`,
      sessionId ? { params: { session_id: sessionId } } : undefined,
    );
    console.log("📋 Program power sets response:", data);
    if (Array.isArray(data) && data.length > 0) {
      console.log("📋 First power set detail:", JSON.stringify(data[0], null, 2));
    }
    return Array.isArray(data) ? data : [];
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to fetch power sets."));
  }
};

export const getProgramIdByCode = async (
  programCode: string,
): Promise<string | null> => {
  // Strip trailing digits: "rc2" → "rc", "ne01" stays "ne01"
  const baseCode = programCode.replace(/\d+$/, "") || programCode;

  // Fast path: try the workout-page discovery endpoint which returns programs with codes
  try {
    const pageData = await getWorkoutPageData();
    const allDiscoveryPrograms = [
      pageData.featuredPrograms,
      ...pageData.popularPrograms,
      ...pageData.freePrograms,
      ...pageData.suggestedPrograms,
    ].filter(Boolean);

    const match = allDiscoveryPrograms.find(
      (p) => p?.code?.toLowerCase() === baseCode.toLowerCase(),
    );
    if (match?.id) {
      console.log(`✅ Found UUID via discovery for "${baseCode}":`, match.id);
      return match.id;
    }
  } catch {}

  // Slow fallback: scan all programs
  try {
    const programs = await getAllPrograms();
    const match = programs.find(
      (p) => p.code?.toLowerCase() === baseCode.toLowerCase(),
    );
    if (match?.id) {
      console.log(
        `✅ Found UUID via all programs for "${baseCode}":`,
        match.id,
      );
      return match.id;
    }
  } catch {}

  return null;
};

// export const getProgramIdByCode = async (programCode: string): Promise<string | null> => {
//   // Try 1: discovery program endpoint (accepts code on many backends)
//   try {
//     const { data } = await apiClient.get<ProgramDetail>(`/discovery/program/${programCode}`);
//     if (data?.id) return data.id;
//   } catch {}

//   // Try 2: dedicated by-code endpoint
//   try {
//     const { data } = await apiClient.get<Program>(`/programs/by-code/${programCode}`);
//     if (data?.id) return data.id;
//   } catch {}

//   // Try 3: search paginated programs list
//   try {
//     const programs = await getAllPrograms();
//     const match = programs.find(
//       (p) => p.code?.toLowerCase() === programCode.toLowerCase()
//     );
//     if (match?.id) return match.id;
//   } catch {}

//   return null;
// };

export const getProgramTags = async (code: string): Promise<string[]> => {
  try {
    const { data } = await apiClient.get<string[]>(`/programs/${code}/tags`);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

export const getProgramGroupedWorkouts = async (
  programCode: string,
): Promise<WorkoutGroup[]> => {
  try {
    const { data } = await apiClient.get<WorkoutGroup[]>(
      `/programs/${programCode}/workouts`,
    );
    console.log("📋 Program grouped workouts response:", data);
    return data;
  } catch (error: unknown) {
    throw new Error(
      getErrorMessage(error, "Failed to fetch grouped workouts."),
    );
  }
};

export const workoutApi = {
  getWorkoutPageData,
  getAllSportCategories,
  getAllPrograms,
  getAllFeaturedTrainers,
  getActivityWorkoutQueue, // NEW: Add to API object
  getAllWorkoutQueues, // NEW: Add to API object
  getProgramsBySport,
  getProgramsByTrainer,
  getProgramsByFocus,
  getProgramsByAgeGroup,
  getProgramsBySetting,
  getProgramExercises,
  getProgramEquipment,
};

export default workoutApi;
