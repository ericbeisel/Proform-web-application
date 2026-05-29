import axios from "axios";
import { getAuthToken } from "@/lib/auth/session";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.paxlete.com";

// ===========================================
// TYPES
// ===========================================

export interface CoachTeam {
  id: string;
  name: string;
  logo?: string | null;
  owner_name?: string | null;
  invite_link?: string | null;
  unique_code?: string | null;
  tagged_players_count: number;
  created_at: string;
  updated_at: string;
}

export interface GetCoachTeamsResponse {
  message: string;
  data: CoachTeam[];
}

export interface CreateCoachTeamPayload {
  name: string;
  logo?: File | null;
}

export interface CreateCoachTeamResponse {
  message?: string;
  team?: {
    id: string;
    name: string;
    code?: string;
    invite_link?: string;
  };
  data?: {
    id: string;
    name: string;
    code?: string;
    invite_link?: string;
  };
  id?: string;
  name?: string;
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
// COACH API
// ===========================================

export const getCoachTeams = async (): Promise<CoachTeam[]> => {
  try {
    const { data } = await apiClient.get<GetCoachTeamsResponse>("/coach-teams");

    if (Array.isArray(data)) return data;
    console.log("code generated getCoachTeams response:", data);
    if (data?.data && Array.isArray(data.data)) return data.data;
    return [];
    
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to fetch coach teams."));
  }
};

export const createCoachTeam = async (
  payload: CreateCoachTeamPayload,
): Promise<CreateCoachTeamResponse> => {
  try {
    const formData = new FormData();
    formData.append("name", payload.name);
    if (payload.logo) {
      formData.append("logo", payload.logo);
    }

    const { data } = await apiClient.post<CreateCoachTeamResponse>(
      "/coach-team",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to create coach team."));
  }
};

export interface JoinTeamPayload {
  team_id: number;
  unique_code: string;
}

export interface JoinTeamResponse {
  message: string;
}

export const joinTeam = async (
  payload: JoinTeamPayload,
): Promise<JoinTeamResponse> => {
  try {
    const { data } = await apiClient.post<JoinTeamResponse>(
      "/join-team",
      payload,
    );
    return data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to join team."));
  }
};

export interface TeamPreview {
  id: string;
  name: string;
  logo?: string | null;
  coach_name?: string | null;
  owner_name?: string | null;
}

export const getTeamPreview = async (
  team_id: number,
  code: string,
): Promise<TeamPreview> => {
  try {
    const { data } = await apiClient.get<TeamPreview>("/team-preview", {
      params: { team_id, code },
    });
    return data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to fetch team info."));
  }
};

export const deleteCoachTeam = async (id: string): Promise<{ message: string }> => {
  try {
    const { data } = await apiClient.delete<{ message: string }>("/coach-team", {
      params: { id },
    });
    return data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to delete team."));
  }
};

export const coachApi = {
  getCoachTeams,
  createCoachTeam,
  joinTeam,
  deleteCoachTeam,
  getTeamPreview,
};

export default coachApi;
