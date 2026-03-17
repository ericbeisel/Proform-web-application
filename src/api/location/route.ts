import axios from "axios";
import { getAuthToken } from "@/lib/auth/session";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://paxlete.com/api";

// ===========================================
// TYPES
// ===========================================

export interface Equipment {
  selected: any;
  id: number;
  name: string;
  slug?: string | null;
  type?: string | null;
  icon?: string;
  created_at?: string;
  updated_at?: string;
}

export interface LocationEquipment {
  id: number;
  name: string;
  equipmentList: Equipment[];
}

export interface LocationResponse {
  message: string;
  data: LocationEquipment[];
}

export interface CreateLocationPayload {
   location_name: string;
  equipments: string; // "1,2,3"
  default_location?: number;
}

export interface CreateLocationResponse {
  message: string;
  data: {
    id: number;
    name: string;
    user_id: number;
    equipments: string;
    default_location: number;
    created_at: string;
    updated_at: string;
  };
}

export interface EquipmentItem {
  id: number;
  name: string;
  slug: string;
  type: string;
  keyword: string;
  icon: string;
  hideonlocations: string;
  created_at: string;
  updated_at: string;
}

export interface LocationItem {
  id: number;
  name: string;
  user_id: string;
  equipments: string;
  default_location: string;
  created_at: string;
  updated_at: string;
  equipmentList: EquipmentItem[];
}

export interface LocationListResponse {
  message: string;
  data: LocationItem[];
}

export interface LocationDetailResponse {
  message: string;
  data: LocationItem;
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
// EQUIPMENT API
// ===========================================

export const equipmentApi = {
  /**
   * Fetch all equipment
   */
  getAllEquipment: async (): Promise<Equipment[]> => {
    try {
      const res = await apiClient.get<Equipment[]>("/all-equipment");
      return res.data;
    } catch (err) {
      throw new Error(
        extractErrorMessage(err, "Failed to fetch equipment list.")
      );
    }
  },

  /**
   * Fetch locations with equipment
   */
  getLocationsWithEquipment: async (): Promise<LocationEquipment[]> => {
    try {
      const res = await apiClient.get<LocationResponse>("/list-location");
      return res.data.data || [];
    } catch (err) {
      throw new Error(
        extractErrorMessage(err, "Failed to fetch locations.")
      );
    }
  },

  /**
 * Create new location
 */
createLocation: async (
  payload: CreateLocationPayload
): Promise<CreateLocationResponse["data"]> => {
  try {
    const res = await apiClient.post<CreateLocationResponse>(
      "/create-location",
      payload
    );

    return res.data.data;
  } catch (err) {
    throw new Error(
      extractErrorMessage(err, "Failed to create location.")
    );
  }
},

getLocationList: async (): Promise<LocationItem[]> => {
  try {
    const res = await apiClient.get<LocationListResponse>("/list-location");

    return res.data.data || [];
  } catch (err) {
    throw new Error(
      extractErrorMessage(err, "Failed to fetch locations.")
    );
  }
},

getLocationDetail: async (id: number | string): Promise<LocationItem> => {
  try {
    const res = await apiClient.get<LocationDetailResponse>(
      `/location-detail?id=${id}`
    );

    return res.data.data;
  } catch (err) {
    throw new Error(
      extractErrorMessage(err, "Failed to fetch location details.")
    );
  }
},

deleteLocation: async (id: number | string): Promise<void> => {
  try {
    // Change from delete to get
    await apiClient.get(`/delete-location?id=${id}`);
  } catch (err) {
    throw new Error(
      extractErrorMessage(err, "Failed to delete location.")
    );
  }
},

updateLocation: async (payload: {
  id: number | string;
  location_name: string;
  equipments: string;
}): Promise<void> => {
  try {
    await apiClient.post(`/edit-location`, payload);
  } catch (err) {
    throw new Error(
      extractErrorMessage(err, "Failed to update location.")
    );
  }
},

};

export default equipmentApi;