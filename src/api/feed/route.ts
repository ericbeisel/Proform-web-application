import axios from "axios";
import { getAuthToken } from "@/lib/auth/session";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://paxlete.com/api";

console.log("🔧 API Base URL:", API_BASE);

// ===========================================
// TYPES
// ===========================================

export interface Feed {
  id: string;
  user_id: number;
  title: string;
  username: string | null;
  buttonLabel: string | null;
  likes: (string | number)[];
  othertable_id: number | null;
  type: string;
  created_at: string | null;
  updated_at: string | null;
  likeCount: number;
}

export interface HighlightItem {
  id: number;
  user_id: number;
  description: string;
  uploaded_image: string | null;
  upload_video: string | null;
  uploadedImage: string | null;
  uploadVideo: string | null;
  views: any[];
  is_viewed: boolean;
  created_at: string;
}

export interface HighlightGroup {
  user: {
    id: number;
    name: string;
    username: string;
    email: string;
    image: string;
  };
  highlights: HighlightItem[];
  all_watched: boolean;
}

export interface HighlightUser {
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
  total?: number;
}

// ===========================================
// ERROR HANDLER (reuse yours)
// ===========================================

function extractErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    console.error("❌ Axios Error Details:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      }
    });
    return error.response?.data?.message || error.message || fallback;
  }

  if (error instanceof Error) {
    console.error("❌ General Error:", error.message);
    return error.message;
  }

  console.error("❌ Unknown Error:", error);
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
  
  console.log(`📤 ${config.method?.toUpperCase()} Request to: ${config.url}`);
  console.log("🔑 Token present:", !!token);
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("✅ Authorization header added");
  } else {
    console.warn("⚠️ No auth token found");
  }

  config.headers["Content-Type"] = "application/json";
  
  if (config.data) {
    console.log("📦 Request data:", config.data);
  }
  
  if (config.params) {
    console.log("🔍 Request params:", config.params);
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ Response from ${response.config.url}:`, {
      status: response.status,
      dataKeys: Object.keys(response.data || {}),
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error(`❌ Response Error from ${error.config?.url}:`, {
      status: error.response?.status,
      message: error.response?.data?.message,
      error: error.message
    });
    return Promise.reject(error);
  }
);

// ===========================================
// FEED API
// ===========================================

export const feedApi = {
  /**
   * Get Feed (Paginated)
   */
  getFeed: async (page: number = 1): Promise<FeedResponse> => {
    console.log("📡 Fetching feed for page:", page);
    try {
      const res = await apiClient.get<FeedResponse>(`/feed?page=${page}`);
  
      return res.data;
    } catch (err) {
      console.error("💥 Failed to fetch feed");
      throw new Error(
        extractErrorMessage(err, "Failed to fetch feed.")
      );
    }
  },

  /**
   * ⚠️ FIXED: Like Feed (correct API)
   */
  likeFeed: async (id: string): Promise<void> => {
    try {
      await apiClient.get(`/like-feed?id=${id}`);
    } catch (err) {
      throw new Error(extractErrorMessage(err, "Failed to like feed."));
    }
  },

  unlikeFeed: async (id: string): Promise<void> => {
    try {
      await apiClient.get(`/unlike-feed?id=${id}`);
    } catch (err) {
      throw new Error(extractErrorMessage(err, "Failed to unlike feed."));
    }
  },

  /**
   * Get Highlights
   */
  getHighlights: async (userId: number): Promise<any[]> => {
    console.log("🌟 Fetching highlights for user ID:", userId, "Type:", typeof userId);
    try {
      const res = await apiClient.get(`/get-highlight?user_id=${userId}`);
      console.log("📸 Highlights response:", {
        status: res.status,
        dataKeys: Object.keys(res.data || {}),
        dataLength: res.data?.data?.length || 0
      });
      // ✅ Correct extraction
      const highlights = res.data?.data || [];
      console.log("✨ Highlights extracted:", highlights);
      return highlights;
    } catch (err) {
      console.error("💥 Failed to fetch highlights");
      throw new Error(
        extractErrorMessage(err, "Failed to fetch highlights.")
      );
    }
  },

  /**
   * List Highlights (grouped by user, last 24h)
   */
  listHighlights: async (page: number = 1): Promise<HighlightGroup[]> => {
    try {
      const res = await apiClient.get(`/list-highlights?page=${page}`);
      console.log("📸 List highlights response:", {
        status: res.status,
        dataKeys: Object.keys(res.data || {}),
        dataLength: res.data?.data?.length || 0
      });
      return res.data?.data || [];
    } catch (err) {
      throw new Error(extractErrorMessage(err, "Failed to fetch highlights list."));
    }
  },

  /**
   * Create Highlight
   */
  createHighlight: async (formData: FormData): Promise<void> => {
    console.log("📸 Creating new highlight");
    // Log FormData contents
    for (let pair of formData.entries()) {
      console.log(`📎 FormData - ${pair[0]}:`, pair[1]);
    }
    try {
      const response = await apiClient.post(`/create-highlight`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("✅ Highlight created successfully:", response.data);
    } catch (err) {
      console.error("💥 Failed to create highlight");
      throw new Error(
        extractErrorMessage(err, "Failed to create highlight.")
      );
    }
  },

  /**
   * User Search
   */
  searchUsers: async (name: string, page: number = 1): Promise<any[]> => {
    console.log("🔍 Searching users with name:", name, "Page:", page);
    try {
      const res = await apiClient.get(`/user-search?name=${name}&page=${page}`);
      const users = res.data?.data || [];
      console.log(`👥 Found ${users.length} users matching "${name}"`);
      return users;
    } catch (err) {
      console.error("💥 Failed to search users");
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
    console.log("🔄 Toggle like for feed ID:", feedId);
    try {
      const response = await apiClient.get(`/like-feed?id=${feedId}`);
      console.log("✅ Toggle like successful:", response.data);
    } catch (err) {
      console.error("💥 Failed to toggle like");
      throw new Error(
        extractErrorMessage(err, "Failed to like feed.")
      );
    }
  },
};

export default feedApi;