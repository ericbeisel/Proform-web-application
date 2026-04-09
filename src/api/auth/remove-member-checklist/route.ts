import axios from "axios";
import { getAuthToken } from "@/lib/auth/session";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://paxlete.com/api";

export const removeMemberChecklist = async (): Promise<void> => {
  try {
    const token = getAuthToken();
    await axios.get(`${API_BASE}/remove_member_checklist`, {
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  } catch (error: unknown) {
    const message = axios.isAxiosError<{ message?: string }>(error)
      ? (error.response?.data?.message ?? error.message)
      : "Failed to update checklist preference.";
    throw new Error(message);
  }
};
