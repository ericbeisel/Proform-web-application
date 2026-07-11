import axios from "axios";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://paxlete.com/api";

function extractErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    return (error.response?.data as { message?: string } | undefined)?.message ?? fallback;
  }
  return error instanceof Error ? error.message : fallback;
}

export const forgotPassword = async (email: string): Promise<void> => {
  try {
    await axios.post(`${API_BASE}/auth/forgot-password`, { email });
  } catch (error: unknown) {
    throw new Error(extractErrorMessage(error, "Failed to send reset code. Please try again."));
  }
};

export const verifyResetOtp = async (email: string, code: string): Promise<void> => {
  try {
    await axios.post(`${API_BASE}/auth/verify-reset-otp`, { email, code });
  } catch (error: unknown) {
    throw new Error(extractErrorMessage(error, "Verification failed. Please check the code."));
  }
};

export const resetPassword = async (email: string, password: string): Promise<void> => {
  try {
    await axios.post(`${API_BASE}/auth/reset-password`, { email, password });
  } catch (error: unknown) {
    throw new Error(extractErrorMessage(error, "Failed to reset password. Please try again."));
  }
};
