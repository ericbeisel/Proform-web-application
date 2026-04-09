import axios from "axios";
import { getAuthToken } from "@/lib/auth/session";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://paxlete.com/api";

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
  user_id?: string | number;
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
  // Diff fields from API
  smm_diff?: string | number | null;
  bf_diff?: string | number | null;
  body_camp_diff?: string | number | null;
  weight_diff?: string | number | null;
  height_diff?: string | number | null;
  smmDiff?: string | number | null;
  bodyFatDiff?: string | number | null;
  bodyCampScoreDiff?: string | number | null;
  currentWeightDiff?: string | number | null;
  heightDiff?: string | number | null;
  type?: string | null;
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

export interface PlayerCardType {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface PlayerCardTypeResponse extends Array<PlayerCardType> {}

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

// Add or update this interface
export interface PlayerCardListResponse {
  message: string;
  total_scan: number;
  filter: {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
  }[];
  smm_diff: string;
  body_camp_diff: string;
  bf_diff: string;
  name: string;
  data: PlayerCardDetail[];
}

/**
 * Get player card list (history of all scans)
 */
export const getPlayerCardList = async (): Promise<PlayerCardListResponse> => {
  try {
    const { data } =
      await apiClient.get<PlayerCardListResponse>("/player-card-list");
    console.log("📋 Player card list response:", data);
    return data;
  } catch (error: unknown) {
    throw new Error(
      getErrorMessage(error, "Failed to fetch player card list."),
    );
  }
};

export const getPlayerCard = async (): Promise<PlayerCardData> => {
  try {
    const { data } = await apiClient.get<PlayerCardData>("/player-card");
    return data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to fetch player card."));
  }
};

export const createPlayerCard = async (
  formData: FormData,
): Promise<unknown> => {
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

export const getPlayerCardDetails =
  async (): Promise<PlayerCardDetailsResponse> => {
    try {
      const { data } = await apiClient.get<PlayerCardDetailsResponse>(
        "/player-card-details",
      );
      return data;
    } catch (error: unknown) {
      throw new Error(
        getErrorMessage(error, "Failed to fetch player card details."),
      );
    }
  };

export const getAdminPlayerCardList =
  async (): Promise<PlayerCardDetailsResponse> => {
    try {
      const { data } = await apiClient.get<PlayerCardDetailsResponse>(
        "/admin-playercard-list",
      );
      console.log("📋 Admin player card list response:", data);
      return data;
    } catch (error: unknown) {
      throw new Error(
        getErrorMessage(error, "Failed to fetch admin player card list."),
      );
    }
  };

export const getAdminPlayerCardById = async (
  id: number,
): Promise<PlayerCardDetail> => {
  try {
    const { data } = await apiClient.get<any>(`/view-player-card?id=${id}`);
    console.log("Admin Player Data", data);

    if (data && typeof data === "object" && "data" in data && data.data) {
      // The diff fields are now directly inside the data object in the new API response
      return data.data as PlayerCardDetail;
    }

    return data as PlayerCardDetail;
  } catch (error: unknown) {
    throw new Error(
      getErrorMessage(error, "Failed to fetch admin player card details."),
    );
  }
};

export const getAdminPlayerCardDetails = async (
  id: number,
): Promise<PlayerCardDetail> => {
  try {
    const { data } = await apiClient.get<
      { message?: string; data?: PlayerCardDetail } | PlayerCardDetail
    >(`/view-player-card?id=${id}`);

    if ("data" in data && data.data) {
      return data.data;
    }

    return data as PlayerCardDetail;
  } catch (error: unknown) {
    throw new Error(
      getErrorMessage(error, "Failed to fetch admin player card details."),
    );
  }
};

export const acceptAdminPlayerCard = async (
  params: AcceptPlayerCardParams,
): Promise<unknown> => {
  try {
    const formData = new FormData();
    formData.append("currentWeight", params.currentWeight);
    formData.append("height", params.height);
    formData.append("smm", params.smm);
    formData.append("bodyFat", params.bodyFat);
    formData.append("bodyCampScore", params.bodyCampScore);
    formData.append("id", params.id.toString());

    const { data } = await apiClient.post(
      "/accept-admin-playercard",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Accept: "application/json",
        },
      },
    );

    return data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to accept player card."));
  }
};

export const rejectAdminPlayerCard = async (
  params: RejectPlayerCardParams,
): Promise<unknown> => {
  try {
    const formData = new FormData();
    formData.append("reject_comment", params.reject_comment);
    formData.append("id", params.id.toString());

    const { data } = await apiClient.post(
      "/reject-admin-playercard",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Accept: "application/json",
        },
      },
    );

    return data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to reject player card."));
  }
};

export const getPlayerCardTypes = async (): Promise<PlayerCardType[]> => {
  try {
    const { data } = await apiClient.get<PlayerCardType[]>("/player-card-type");
    console.log("📋 Player card types response:", data);
    return data;
  } catch (error: unknown) {
    throw new Error(
      getErrorMessage(error, "Failed to fetch player card types."),
    );
  }
};
