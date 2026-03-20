import axios from "axios";
import { getAuthToken } from "@/lib/auth/session";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://paxlete.com/api";

// ===========================================
// TYPES
// ===========================================

export interface SocialMedia {
  platform: string;
  url: string;
}

export interface ProfileData {
  role_id: string;
  image: string | null;
  id: number;
  name: string;
  username: string;
  Bench_CMP: string | null;
  Squat_CMP: string | null;
  Clean_CMP: string | null;
  Deadlift_CMP: string | null;
  optimalWellnessScore: number;
  Strength: number;
  SocialMedia: SocialMedia[];
  workoutCount: number;
  followtype: string;
  FollowsCount: number;
}

export interface ProfileResponse {
  message: string;
  data: ProfileData;
}

// ===========================================
// ERROR HANDLER
// ===========================================

function extractErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message || fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

// ===========================================
// AXIOS CLIENT
// ===========================================

const apiClient = axios.create({
  baseURL: API_BASE,
});

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  config.headers["Content-Type"] = "application/json";

  return config;
});

// ===========================================
// PROFILE API
// ===========================================

export const profileApi = {
  /**
   * Fetch profile data by username
   */
  getProfileByUsername: async (username: string): Promise<ProfileData> => {
    try {
      const res = await apiClient.get<ProfileResponse>(
        `/my-profile?username=${username}`
      );

      return res.data.data;
    } catch (err) {
      throw new Error(
        extractErrorMessage(err, "Failed to fetch profile data.")
      );
    }
  },

  /**
   * Example: Update profile data
   */
  updateProfile: async (payload: Partial<ProfileData>): Promise<void> => {
    try {
      await apiClient.post(`/update-profile`, payload);
    } catch (err) {
      throw new Error(
        extractErrorMessage(err, "Failed to update profile.")
      );
    }
  },
};

export default profileApi;