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
  school?: string | null;
  organization_type?: string | null;
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
  team?: { id: string; name: string; code?: string; invite_link?: string };
  data?: { id: string; name: string; code?: string; invite_link?: string };
  id?: string;
  name?: string;
}

export interface InstitutionDetails {
  title?: string;
  mascot?: string | null;
  type?: string;
  email?: string;
  phone?: string;
  address?: string;
  country?: string;
  state?: string;
  city?: string;
  maxCoaches?: number;
  max_coaches?: number;
  sponsored?: boolean;
}

export interface PlanDetails {
  code: string;
  name?: string;
  maxTeams?: number;
  [key: string]: unknown;
}

export interface TeamInviteInfo {
  invite_link?: string;
  unique_code?: string;
  name?: string;
  owner?: string;
  logo?: string;
  team_id?: number;
  institution?: { title?: string; type?: string; mascot?: string };
}

export interface TeamPlayer {
  id: number;
  name?: string;
  username?: string;
  profile_picture?: string | null;
  score?: string;
  completion_pct?: string | number;
}

export interface GetTeamPlayersParams {
  team_id?: number | string;
  search?: string;
  page?: number;
  limit?: number;
}

// ===========================================
// ERROR HANDLER
// ===========================================

type ErrorPayload = { message?: string; error?: string };

function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<ErrorPayload>(error)) {
    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      fallback
    );
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

// ===========================================
// AXIOS CLIENT
// ===========================================

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

// ===========================================
// COACH API
// ===========================================

export const getCoachTeams = async (): Promise<CoachTeam[]> => {
  console.log("[coachApi] getCoachTeams → GET /coach-teams");
  try {
    const { data } = await apiClient.get<GetCoachTeamsResponse>("/coach-teams");
    const raw: any[] = Array.isArray(data) ? data : (data?.data ?? []);
    const teams = raw.map((t) => ({
      ...t,
      tagged_players_count: t.tagged_players_count ?? t._count?.teamMembers ?? 0,
    }));
    console.log("[coachApi] getCoachTeams ✅", teams);
    return teams;
  } catch (error: unknown) {
    console.error("[coachApi] getCoachTeams ❌", error);
    throw new Error(getErrorMessage(error, "Failed to fetch coach teams."));
  }
};

export const createCoachTeam = async (
  payload: CreateCoachTeamPayload,
): Promise<CreateCoachTeamResponse> => {
  console.log("[coachApi] createCoachTeam → POST /coach-team", { name: payload.name, hasLogo: !!payload.logo });
  try {
    const formData = new FormData();
    formData.append("name", payload.name);
    if (payload.logo) formData.append("logo", payload.logo);
    const { data } = await apiClient.post<CreateCoachTeamResponse>(
      "/coach-team",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    console.log("[coachApi] createCoachTeam ✅", data);
    return data;
  } catch (error: unknown) {
    console.error("[coachApi] createCoachTeam ❌", error);
    throw new Error(getErrorMessage(error, "Failed to create coach team."));
  }
};

export const deleteCoachTeam = async (id: string): Promise<{ message: string }> => {
  console.log("[coachApi] deleteCoachTeam → DELETE /coach-team", { id });
  try {
    const { data } = await apiClient.delete<{ message: string }>("/coach-team", { params: { id } });
    console.log("[coachApi] deleteCoachTeam ✅", data);
    return data;
  } catch (error: unknown) {
    console.error("[coachApi] deleteCoachTeam ❌", error);
    throw new Error(getErrorMessage(error, "Failed to delete team."));
  }
};

export const getInstitutionDetails = async (): Promise<InstitutionDetails | null> => {
  console.log("[coachApi] getInstitutionDetails → GET /institution-details");
  try {
    const { data } = await apiClient.get<{ message: string; data: InstitutionDetails } | InstitutionDetails>("/institution-details");
    const inst: InstitutionDetails = (data as any)?.data ?? data;
    console.log("[coachApi] getInstitutionDetails ✅", inst);
    return inst;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      console.log("[coachApi] getInstitutionDetails → 404 (no org yet)");
      return null;
    }
    console.error("[coachApi] getInstitutionDetails ❌", error);
    throw new Error(getErrorMessage(error, "Failed to fetch institution details."));
  }
};

export const getPresignedUrl = async (params: {
  fileName: string;
  contentType: string;
  folder: string;
}): Promise<{ uploadUrl: string; fileUrl: string }> => {
  console.log("[coachApi] getPresignedUrl → GET /storage/presigned-url", params);
  try {
    const { data } = await apiClient.get<{ uploadUrl: string; fileUrl: string }>(
      "/storage/presigned-url",
      { params },
    );
    console.log("[coachApi] getPresignedUrl ✅", data);
    return data;
  } catch (error: unknown) {
    console.error("[coachApi] getPresignedUrl ❌", error);
    throw new Error(getErrorMessage(error, "Failed to get upload URL."));
  }
};

export const uploadFileToS3 = async (uploadUrl: string, file: File): Promise<void> => {
  console.log("[coachApi] uploadFileToS3 → PUT", uploadUrl);
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!res.ok) throw new Error(`S3 upload failed: ${res.status}`);
  console.log("[coachApi] uploadFileToS3 ✅");
};

export const saveInstitutionDetails = async (
  payload: InstitutionDetails,
  mascotFile?: File | null,
): Promise<void> => {
  console.log("[coachApi] saveInstitutionDetails → POST /institution-details", payload, { hasFile: !!mascotFile });
  try {
    let mascotUrl = payload.mascot ?? "";

    // If a new file is provided, upload to S3 first via presigned URL
    if (mascotFile) {
      const { uploadUrl, fileUrl } = await getPresignedUrl({
        fileName: mascotFile.name,
        contentType: mascotFile.type,
        folder: "institutions/mascots",
      });
      await uploadFileToS3(uploadUrl, mascotFile);
      mascotUrl = fileUrl;
      console.log("[coachApi] mascot uploaded to S3:", mascotUrl);
    }

    const jsonPayload = { ...payload, mascot: mascotUrl };
    console.log("[coachApi] saveInstitutionDetails sending as JSON", jsonPayload);
    const { data } = await apiClient.post("/institution-details", jsonPayload);
    console.log("[coachApi] saveInstitutionDetails ✅", data);
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const msg = error.response?.data?.message ?? "";
      console.error("[coachApi] saveInstitutionDetails ❌ status:", error.response?.status, "body:", error.response?.data);
      // Backend bug: POST doesn't upsert yet — treat "already exist" as a success
      if (typeof msg === "string" && msg.toLowerCase().includes("already exist")) {
        console.warn("[coachApi] saveInstitutionDetails: backend does not support upsert yet. Treating as success.");
        return;
      }
    } else {
      console.error("[coachApi] saveInstitutionDetails ❌", error);
    }
    throw new Error(getErrorMessage(error, "Failed to save institution details."));
  }
};

export const getPlanDetails = async (code: string): Promise<PlanDetails> => {
  console.log("[coachApi] getPlanDetails → GET /plan-details", { code });
  try {
    const { data } = await apiClient.get<PlanDetails>("/plan-details", { params: { code } });
    console.log("[coachApi] getPlanDetails ✅", data);
    return data;
  } catch (error: unknown) {
    console.error("[coachApi] getPlanDetails ❌", error);
    throw new Error(getErrorMessage(error, "Invalid or expired activation code."));
  }
};

export const activatePlan = async (payload: {
  userId: number;
  code: string;
}): Promise<{ message: string }> => {
  console.log("[coachApi] activatePlan → POST /activate-plan", payload);
  try {
    const { data } = await apiClient.post<{ message: string }>("/activate-plan", payload);
    console.log("[coachApi] activatePlan ✅", data);
    return data;
  } catch (error: unknown) {
    console.error("[coachApi] activatePlan ❌", error);
    throw new Error(getErrorMessage(error, "Failed to activate plan."));
  }
};

export const joinTeam = async (payload: {
  team_id: number;
  unique_code: string;
}): Promise<{ message: string }> => {
  console.log("[coachApi] joinTeam → POST /join-team", payload);
  try {
    const { data } = await apiClient.post<{ message: string }>("/join-team", payload);
    console.log("[coachApi] joinTeam ✅", data);
    return data;
  } catch (error: unknown) {
    console.error("[coachApi] joinTeam ❌", error);
    throw new Error(getErrorMessage(error, "Failed to join team."));
  }
};

export const getTeamInvite = async (team_id: string): Promise<TeamInviteInfo> => {
  console.log("[coachApi] getTeamInvite → GET /team/invite", { team_id });
  try {
    const { data } = await apiClient.get("/team/invite", { params: { team_id } });
    console.log("[coachApi] getTeamInvite ✅ raw:", data);
    const info: TeamInviteInfo = (data as any)?.data ?? data;
    return info;
  } catch (error: unknown) {
    console.error("[coachApi] getTeamInvite ❌", error);
    throw new Error(getErrorMessage(error, "Failed to fetch invite link."));
  }
};

export interface TeamLimitInfo {
  remaining: number;
  totalAllowed: number;
  createdCount: number;
  hasActivePlan: boolean;
  planName?: string;
}

export const getRemainingTeamLimit = async (): Promise<TeamLimitInfo> => {
  console.log("[coachApi] getRemainingTeamLimit → GET /team/remaining-limit");
  try {
    const { data } = await apiClient.get("/team/remaining-limit");
    console.log("[coachApi] getRemainingTeamLimit raw response:", data);
    const obj = (data as any)?.data ?? data;
    const result: TeamLimitInfo = {
      remaining: Number(obj?.remaining ?? 0),
      totalAllowed: Number(obj?.totalAllowed ?? 0),
      createdCount: Number(obj?.createdCount ?? 0),
      hasActivePlan: !!obj?.activePlan,
      planName: obj?.activePlan ?? undefined,
    };
    console.log("[coachApi] getRemainingTeamLimit ✅", result);
    return result;
  } catch (error: unknown) {
    // 400 = no active plan — treat as "no plan" state, not an error
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      console.log("[coachApi] getRemainingTeamLimit → 400 (no active plan)");
      return { remaining: 0, totalAllowed: 0, createdCount: 0, hasActivePlan: false };
    }
    console.error("[coachApi] getRemainingTeamLimit ❌", error);
    throw new Error(getErrorMessage(error, "Failed to fetch team limit."));
  }
};

export const getTeamPlayers = async (
  params: GetTeamPlayersParams,
): Promise<{ players: TeamPlayer[]; total: number }> => {
  console.log("[coachApi] getTeamPlayers → GET /coach-team/players", params);
  try {
    const { data } = await apiClient.get("/coach-team/players", { params });
    const players: TeamPlayer[] = Array.isArray(data)
      ? data
      : (data?.data ?? data?.players ?? []);
    const total: number = data?.total ?? players.length;
    console.log("[coachApi] getTeamPlayers ✅", { total, count: players.length, players });
    return { players, total };
  } catch (error: unknown) {
    console.error("[coachApi] getTeamPlayers ❌", error);
    throw new Error(getErrorMessage(error, "Failed to fetch players."));
  }
};

export const coachApi = {
  getCoachTeams,
  createCoachTeam,
  deleteCoachTeam,
  getInstitutionDetails,
  saveInstitutionDetails,
  getPlanDetails,
  activatePlan,
  getRemainingTeamLimit,
  getTeamInvite,
  joinTeam,
  getTeamPlayers,
  getPresignedUrl,
  uploadFileToS3,
};

export default coachApi;
