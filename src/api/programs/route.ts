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
  }[];
  trainers: any[];
  objectives: string[];
  schedule?: string;
  nutrition?: string;
  intensity?: string;
  pre_req?: string;
  addworkoutcount: number;  // Changed from addworkoutCount to addworkoutcount (all lowercase)
  supplementalWorkoutCounts: number;  // Keep as is
}

export interface StartProgramPayload {
  programId: string;
  type: string;  // "Workout" or other types
  addSuggested: number;  // 1 for true, 0 for false (includes supplemental)
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
    const { data } = await apiClient.get<SportCategoryName[]>("/sport-categories/names");
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
    const { data } = await apiClient.get<FeaturedTrainer[]>("/featured-trainers");
    console.log("📋 All featured trainers:", data);
    return data;
  } catch (error: unknown) {
    throw new Error(
      getErrorMessage(error, "Failed to fetch featured trainers."),
    );
  }
};

export const getProgramDetail = async (programId: string): Promise<ProgramDetail> => {
  try {
    const { data } = await apiClient.get<ProgramDetail>(`/discovery/program/${programId}`);
    console.log("📋 Program detail response:", data);
    return data;
  } catch (error: unknown) {
    throw new Error(
      getErrorMessage(error, "Failed to fetch program details."),
    );
  }
};

export const startProgram = async (payload: StartProgramPayload): Promise<StartProgramResponse> => {
  try {
    const { data } = await apiClient.post<StartProgramResponse>("/programs/start-program", payload);
    console.log("📋 Start program response:", data);
    return data;
  } catch (error: unknown) {
    throw new Error(
      getErrorMessage(error, "Failed to start program."),
    );
  }
};

export const getWorkoutQueue = async (type: string = "workout"): Promise<WorkoutQueueItem[]> => {
  try {
    const { data } = await apiClient.get<WorkoutQueueItem[]>(`/programs/workout-queue?type=${type}`);
    console.log("📋 Workout queue response:", data);
    return data;
  } catch (error: unknown) {
    throw new Error(
      getErrorMessage(error, "Failed to fetch workout queue."),
    );
  }
};

// NEW: Get Activity Workout Queue
export const getActivityWorkoutQueue = async (type: string = "Workout"): Promise<ActivityWorkoutQueueItem[]> => {
  try {
    const { data } = await apiClient.get<ActivityWorkoutQueueItem[]>(`/programs/activity-workout-queue?type=${type}`);
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
      getActivityWorkoutQueue(type)
    ]);
    
    return {
      workoutQueue,
      activityWorkoutQueue
    };
  } catch (error: unknown) {
    throw new Error(
      getErrorMessage(error, "Failed to fetch workout queues."),
    );
  }
};

// CORRECTED: Reorder Workout Queue
export const reorderWorkoutQueue = async (type: string, orderedIds: string[]): Promise<any> => {
  try {
    console.log(type,orderedIds);
    
    const { data } = await apiClient.post("/programs/reorder-queue", {
      type: type,
      workoutIds: orderedIds
    });
    console.log("📋 Reorder response:", data);
    return data;
  } catch (error: unknown) {
    console.error("Reorder API error:", error);
    throw new Error(
      getErrorMessage(error, "Failed to reorder workout queue."),
    );
  }
};

export const getProgramsBySport = async (sport: string, page: number = 1): Promise<ProgramsBySportResponse> => {
  try {
    const { data } = await apiClient.get<ProgramsBySportResponse>(`/programs/by-sport?sport=${encodeURIComponent(sport)}&page=${page}`);
    console.log("📋 Programs by sport response:", data);
    return data;
  } catch (error: unknown) {
    throw new Error(
      getErrorMessage(error, "Failed to fetch programs by sport."),
    );
  }
};

export const getProgramsByTrainer = async (trainer: string, page: number = 1): Promise<ProgramsByTrainerResponse> => {
  try {
    const { data } = await apiClient.get<ProgramsByTrainerResponse>(`/programs/by-trainer?trainer=${encodeURIComponent(trainer)}&page=${page}`);
    console.log("📋 Programs by trainer response:", data);
    return data;
  } catch (error: unknown) {
    throw new Error(
      getErrorMessage(error, "Failed to fetch programs by trainer."),
    );
  }
};

export const getProgramsByFocus = async (focusId: string, page: number = 1): Promise<ProgramsByFocusResponse> => {
  try {
    const { data } = await apiClient.get<ProgramsByFocusResponse>(`/programs/by-focus?focusId=${focusId}&page=${page}`);
    console.log("📋 Programs by focus response:", data);
    return data;
  } catch (error: unknown) {
    throw new Error(
      getErrorMessage(error, "Failed to fetch programs by focus."),
    );
  }
};

export const getProgramsByAgeGroup = async (ageGroupId: string, page: number = 1): Promise<ProgramsByAgeGroupResponse> => {
  try {
    const { data } = await apiClient.get<ProgramsByAgeGroupResponse>(`/programs/by-age-group?ageGroupId=${ageGroupId}&page=${page}`);
    console.log("📋 Programs by age group response:", data);
    return data;
  } catch (error: unknown) {
    throw new Error(
      getErrorMessage(error, "Failed to fetch programs by age group."),
    );
  }
};

export const getProgramsBySetting = async (settingId: string, page: number = 1): Promise<ProgramsBySettingResponse> => {
  try {
    const { data } = await apiClient.get<ProgramsBySettingResponse>(`/programs/by-setting?settingId=${settingId}&page=${page}`);
    console.log("📋 Programs by setting response:", data);
    return data;
  } catch (error: unknown) {
    throw new Error(
      getErrorMessage(error, "Failed to fetch programs by setting."),
    );
  }
};

export const workoutApi = {
  getWorkoutPageData,
  getAllSportCategories,
  getAllPrograms,
  getAllFeaturedTrainers,
  getActivityWorkoutQueue,  // NEW: Add to API object
  getAllWorkoutQueues,      // NEW: Add to API object
   getProgramsBySport,
   getProgramsByTrainer,
    getProgramsByFocus,
    getProgramsByAgeGroup,
    getProgramsBySetting,
};

export default workoutApi;