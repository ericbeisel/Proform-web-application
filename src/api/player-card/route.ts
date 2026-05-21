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
  in_body_scans?: string | null;
  progressImage: string | null;
  progress_image?: string | null;
  currentWeight: number | null;
  current_weight?: number | null;
  smm: number | null;
  bodyCampScore: number | null;
  body_camp_score?: number | null;
  bodyFat: number | null;
  body_fat?: number | null;
  height: number | null;
  name?: string;

  // Accountability tools fields
  bpImage?: string | null;
  bpPhoto?: string | null;
  bp_test_image?: string | null;
  bp_test_type?: string | null;

  breathingImage?: string | null;
  breathingPhoto?: string | null;
  breathing_test_image?: string | null;
  breathing_test_type?: string | null;

  hydrationImage?: string | null;
  hydrationPhoto?: string | null;
  hydration_test_image?: string | null;
  hydration_test_type?: string | null;

  bloodworkImage?: string | null;
  bloodworkPhoto?: string | null;
  bloodwork_test_image?: string | null;

  other_image?: string | null;
  other_description?: string | null;

  // Diff fields
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
  user?: any;
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
  currentWeight: number; // Changed from string to number
  height: number; // Changed from string to number
  smm: number; // Changed from string to number
  bodyFat: number; // Changed from string to number
  bodyCampScore: number; // Changed from string to number
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
    // Send as JSON, not FormData
    const { data } = await apiClient.post(
      "/accept-admin-playercard",
      {
        id: Number(params.id),
        currentWeight: Number(params.currentWeight),
        height: Number(params.height),
        smm: Number(params.smm),
        bodyFat: Number(params.bodyFat),
        bodyCampScore: Number(params.bodyCampScore),
      },
      {
        headers: {
          "Content-Type": "application/json", // Changed from multipart/form-data
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
