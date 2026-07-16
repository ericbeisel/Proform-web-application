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
  followersCount: number;
}

export interface ProfileResponse {
  message: string;
  data: ProfileData;
}

// GET /public-profile — distinct field names/casing from ProfileData
// (bench_cmp not Bench_CMP, strength not Strength), and doesn't include id,
// workoutCount, or followtype at all.
export interface PublicProfileData {
  role_id: number | string;
  image: string | null;
  banner: string | null;
  name: string;
  username: string;
  bench_cmp: number | null;
  squat_cmp: number | null;
  clean_cmp: number | null;
  deadlift_cmp: number | null;
  current_weight?: number;
  height?: number;
  bodyfat?: number;
  optimal_wellness_score?: number;
  strength: number;
  pf_points?: number;
  SocialMedia: DetailedSocialMedia[];
  followersCount: number;
}

export interface PublicProfileResponse {
  message: string;
  data: PublicProfileData;
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
// USER SEARCH TYPES
// ===========================================

export interface SearchUser {
  id: number;
  name: string;
  username: string;
  image: string | null;
  role_id: string;
  followtype: string;
  followersCount: number;
}

export interface UserSearchResponse {
  message: string;
  data: SearchUser[];
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

  // CRITICAL: If data is FormData, let the browser handle the Content-Type header
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  } else {
    config.headers["Content-Type"] = "application/json";
  }

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

  // No-auth-required counterpart to getProfileByUsername — for viewing a
  // shared profile link anonymously (e.g. /profile/view/[username]). Field
  // names/casing differ from ProfileData (see PublicProfileData) and it
  // doesn't include id/workoutCount/followtype at all.
  getPublicProfile: async (username: string): Promise<PublicProfileData> => {
    try {
      const res = await apiClient.get<PublicProfileResponse>(
        `/public-profile?username=${encodeURIComponent(username)}`,
      );
      return res.data.data;
    } catch (err) {
      throw new Error(
        extractErrorMessage(err, "Failed to fetch public profile data."),
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

  updateProfile: async (payload: {
    name: string;
    image?: File | null;
  }): Promise<void> => {
    try {
      const formData = new FormData();
      formData.append("name", payload.name);

      if (payload.image) {
        formData.append("image", payload.image);
      }

      const res = await apiClient.post("/edit-profile", formData);
      console.log("✅ Server Response:", res.data);
    } catch (err) {
      throw new Error(extractErrorMessage(err, "Failed to update profile."));
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

  // ===========================================
  // USER SEARCH API
  // ===========================================

  searchUsers: async (
    page: number = 1,
    search?: string,
  ): Promise<UserSearchResponse> => {
    try {
      let url = `/user-search?page=${page}`;
      if (search) {
        url += `&name=${encodeURIComponent(search)}`;
      }

      const res = await apiClient.get<UserSearchResponse>(url);
      return res.data;
    } catch (err) {
      throw new Error(extractErrorMessage(err, "Failed to search users."));
    }
  },
};

export default profileApi;
