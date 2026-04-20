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

export const workoutApi = {
  getWorkoutPageData,
  getAllSportCategories,
  getAllPrograms,
  getAllFeaturedTrainers,
};

export default workoutApi;