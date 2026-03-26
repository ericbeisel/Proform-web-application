import axios from "axios";
import { getAuthToken } from "@/lib/auth/session";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://paxlete.com/api";

// ===========================================
// TYPES
// ===========================================

export interface Feed {
  id: number;
  user_id: string;
  title: string;
  username: string;
  buttonLabel: string | null;
  likes: string[];
  othertable_id: number | null;
  type: string;
  created_at: string;
  updated_at: string;
  likeCount: number;
}

export interface HighlightUser {
  // API currently returns empty array → keep flexible
  [key: string]: any;
}

export interface CurrentUser {
  id: number;
  name: string;
  username: string;
  email: string;
  role_id: string;
  image: string;
  OtherDetail: {
    gender?: string;
    currentWeight?: string;
    goalWeight?: string;
    height?: string;
    activityLevel?: string;
    [key: string]: any;
  };
}

export interface FeedResponse {
  message: string;
  hightlightUser: HighlightUser[];
  feeds: Feed[];
  currectUser: CurrentUser;
}

// ===========================================
// ERROR HANDLER (reuse yours)
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
// FEED API
// ===========================================

export const feedApi = {
  /**
   * Get Feed (Paginated)
   */
  getFeed: async (page: number = 1): Promise<FeedResponse> => {
    try {
      const res = await apiClient.get<FeedResponse>(`/feed?page=${page}`);
      return res.data;
    } catch (err) {
      throw new Error(
        extractErrorMessage(err, "Failed to fetch feed.")
      );
    }
  },

  /**
   * ⚠️ FIXED: Like Feed (correct API)
   */
  likeFeed: async (id: number): Promise<void> => {
    try {
      await apiClient.get(`/like-feed?id=${id}`);
    } catch (err) {
      throw new Error(
        extractErrorMessage(err, "Failed to like feed.")
      );
    }
  },

  /**
   * Unlike Feed
   */
  unlikeFeed: async (id: number): Promise<void> => {
    try {
      await apiClient.get(`/unlike-feed?id=${id}`);
    } catch (err) {
      throw new Error(
        extractErrorMessage(err, "Failed to unlike feed.")
      );
    }
  },

  /**
   * Get Highlights
   */
getHighlights: async (userId: number): Promise<any[]> => {
  try {
    const res = await apiClient.get(
      `/get-highlight?user_id=${userId}`
    );

    // ✅ Correct extraction
    return res.data?.data || [];
  } catch (err) {
    throw new Error(
      extractErrorMessage(err, "Failed to fetch highlights.")
    );
  }
},

  /**
   * Create Highlight
   */
  createHighlight: async (formData: FormData): Promise<void> => {
    try {
      await apiClient.post(`/create-highlight`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    } catch (err) {
      throw new Error(
        extractErrorMessage(err, "Failed to create highlight.")
      );
    }
  },

  /**
   * User Search
   */
  searchUsers: async (name: string, page: number = 1): Promise<any[]> => {
    try {
      const res = await apiClient.get(
        `/user-search?name=${name}&page=${page}`
      );
      return res.data?.data || [];
    } catch (err) {
      throw new Error(
        extractErrorMessage(err, "Failed to search users.")
      );
    }
  },

  /**
   * ❌ KEEP (for backward compatibility if used somewhere)
   * but internally redirect to correct API
   */
  toggleLike: async (feedId: number): Promise<void> => {
    try {
      await apiClient.get(`/like-feed?id=${feedId}`);
    } catch (err) {
      throw new Error(
        extractErrorMessage(err, "Failed to like feed.")
      );
    }
  },
};

export default feedApi;