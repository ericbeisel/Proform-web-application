import axios from 'axios';
import { getAuthToken } from '@/lib/auth/session';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://paxlete.com/api';

type DashboardLikeResponse = {
  OtherDetail?: Record<string, unknown>;
  user?: {
    OtherDetail?: Record<string, unknown>;
  };
};

function readFlag(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

/**
 * checkAccountStatus
 * GET https://paxlete.com/api/dashboard
 *
 * Mobile parity:
 *   show checklist when `skipaccount === "0"`.
 *   after remove_member_checklist API is called, skipaccount becomes 1.
 *
 * Response shape:
 * {
 *   OtherDetail: {
 *     accountsetup: 0 | 1
 *     skipaccount: 0 | 1
 *     ...
 *   }
 * }
 *
 * Returns '/account-setup/newMember' only when:
 *   - skipaccount (or skipAccount) === "0"
 * Else '/dashboard'
 */
export const checkAccountStatus = async (): Promise<'/dashboard' | '/account-setup/newMember'> => {
  try {
    const token = getAuthToken();

    const { data } = await axios.get<DashboardLikeResponse>(`${API_BASE}/dashboard`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const rootDetails = data?.OtherDetail ?? {};
    const userDetails = data?.user?.OtherDetail ?? {};

    const skipFlag = readFlag(
      userDetails.skipaccount ??
        userDetails.skipAccount ??
        rootDetails.skipaccount ??
        rootDetails.skipAccount,
    );

    const shouldShowChecklist = skipFlag === '0';
    return shouldShowChecklist ? '/account-setup/newMember' : '/dashboard';
  } catch (error: unknown) {
    const message = axios.isAxiosError<{ message?: string }>(error)
      ? (error.response?.data?.message ?? error.message)
      : error instanceof Error
        ? error.message
        : 'Failed to check account status.';
    throw new Error(message);
  }
};
