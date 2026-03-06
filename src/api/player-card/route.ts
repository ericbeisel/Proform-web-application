import axios from "axios";
import { getAuthToken } from "@/lib/auth/session";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "https://paxlete.com/api";

export interface PlayerCardData {
  date: string;
  name: string;
  currentWeight: number | null;
  bodyCampScore: number;
  height: number | null;
  smm: number;
  bodyFat: number | null;
}

export interface PlayerCardDetail {
  id: number;
  date: string;
  status: string;
  inBodyScans: string | null;
  progressImage: string | null;
  currentWeight: number | null;
  smm: number | null;
  bodyCampScore: number | null;
  bodyFat: number | null;
  height: number | null;
  name?: string;
}

export interface PlayerCardDetailsResponse {
  message: string;
  total_scan: number;
  currentWeight: number | null;
  improvement: number;
  name: string;
  data: PlayerCardDetail[];
}

export interface AcceptPlayerCardParams {
  id: number;
  currentWeight: string;
  height: string;
  smm: string;
  bodyFat: string;
  bodyCampScore: string;
}

export interface RejectPlayerCardParams {
  id: number;
  reject_comment: string;
}

type ErrorPayload = {
  message?: string;
  error?: string;
};

function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<ErrorPayload>(error)) {
    return error.response?.data?.message || error.response?.data?.error || error.message || fallback;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

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
    if (!token) {
      throw new Error("No authentication token found");
    }
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

export const getPlayerCard = async (): Promise<PlayerCardData> => {
  try {
    const { data } = await apiClient.get<PlayerCardData>("/player-card");
    return data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to fetch player card."));
  }
};

export const createPlayerCard = async (formData: FormData): Promise<unknown> => {
  try {
    const { data } = await apiClient.post("/create-player-card", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Accept: "application/json",
      },
    });
    return data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to create player card."));
  }
};

export const getPlayerCardDetails = async (): Promise<PlayerCardDetailsResponse> => {
  try {
    const { data } = await apiClient.get<PlayerCardDetailsResponse>("/player-card-details");
    return data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to fetch player card details."));
  }
};

export const getAdminPlayerCardList = async (): Promise<PlayerCardDetailsResponse> => {
  try {
    const { data } = await apiClient.get<PlayerCardDetailsResponse>("/admin-playercard-list");
    return data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to fetch admin player card list."));
  }
};

export const getAdminPlayerCardDetails = async (id: number): Promise<PlayerCardDetail> => {
  try {
    const { data } = await apiClient.get<{ message?: string; data?: PlayerCardDetail } | PlayerCardDetail>(
      `/view-player-card?id=${id}`,
    );

    if ("data" in data && data.data) {
      return data.data;
    }

    return data as PlayerCardDetail;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to fetch admin player card details."));
  }
};

export const acceptAdminPlayerCard = async (params: AcceptPlayerCardParams): Promise<unknown> => {
  try {
    const formData = new FormData();
    formData.append("currentWeight", params.currentWeight);
    formData.append("height", params.height);
    formData.append("smm", params.smm);
    formData.append("bodyFat", params.bodyFat);
    formData.append("bodyCampScore", params.bodyCampScore);
    formData.append("id", params.id.toString());

    const { data } = await apiClient.post("/accept-admin-playercard", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Accept: "application/json",
      },
    });

    return data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to accept player card."));
  }
};

export const rejectAdminPlayerCard = async (params: RejectPlayerCardParams): Promise<unknown> => {
  try {
    const formData = new FormData();
    formData.append("reject_comment", params.reject_comment);
    formData.append("id", params.id.toString());

    const { data } = await apiClient.post("/reject-admin-playercard", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Accept: "application/json",
      },
    });

    return data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to reject player card."));
  }
};
