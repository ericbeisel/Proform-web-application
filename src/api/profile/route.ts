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

export interface DetailedSocialMedia {
  id: number;
  type: string;
  url: string;
  hide: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  logo: string;
}

export interface SocialMediaListResponse {
  message: string;
  data: DetailedSocialMedia[];
}

export interface EditSocialMediaPayload {
  user_id: number | string;
  type: string; // "youtube", "instagram", etc.
  url: string;
  hide?: string; // "0" or "1"
}

export interface FollowPayload {
  user_id: number | string; // The person being followed
  follower_id: number | string; // The person who is logged in
}

export interface UnfollowPayload {
  user_id: number | string; // The person being unfollowed
  follower_id: number | string; // The person who is logged in
}

export interface FollowActionPayload {
  user_id: number | string; // The ID of the profile being viewed
  follower_username: string; // The username of the logged-in user
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
 
  getProfileByUsername: async (username: string): Promise<ProfileData> => {
    try {
      const res = await apiClient.get<ProfileResponse>(
        `/my-profile?username=${username}`,
      );

      return res.data.data;
    } catch (err) {
      throw new Error(
        extractErrorMessage(err, "Failed to fetch profile data."),
      );
    }
  },

  getSocialMedia: async (
    userId: number | string,
  ): Promise<DetailedSocialMedia[]> => {
    try {
      const res = await apiClient.get<SocialMediaListResponse>(
        "/get-social-media",
        {
          params: { user_id: userId },
        },
      );
      return res.data.data || [];
    } catch (err) {
      throw new Error(
        extractErrorMessage(err, "Failed to fetch social media."),
      );
    }
  },

  editSocialMedia: async (payload: EditSocialMediaPayload): Promise<void> => {
    try {
      await apiClient.post("/edit-social-media", payload);
    } catch (err) {
      throw new Error(
        extractErrorMessage(err, "Failed to update social media link."),
      );
    }
  },

  updateProfile: async (
    payload: Partial<ProfileData> & { user_id: number | string },
  ): Promise<void> => {
    try {
      await apiClient.post("/edit-profile", payload);
    } catch (err) {
      throw new Error(
        extractErrorMessage(err, "Failed to update profile information."),
      );
    }
  },

  followUser: async (payload: FollowActionPayload): Promise<any> => {
    try {
      const res = await apiClient.post("/follow-user", payload);
      return res.data;
    } catch (err) {
      throw new Error(extractErrorMessage(err, "Failed to follow user."));
    }
  },

  unfollowUser: async (payload: FollowActionPayload): Promise<any> => {
    try {
      const res = await apiClient.post("/unfollow-user", payload);
      return res.data;
    } catch (err) {
      throw new Error(extractErrorMessage(err, "Failed to unfollow user."));
    }
  },
};

export default profileApi;
