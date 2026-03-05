import axios from 'axios';
import { getAuthToken } from '@/lib/auth/session';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://paxlete.com/api';

/**
 * checkAccountStatus
 * GET https://paxlete.com/api/dashboard
 *
 * Response shape (from Postman):
 * {
 *   OtherDetail: {
 *     accountsetup: 0 | 1,   ← 0 = not done, 1 = done
 *     profilesetup: 0 | 1,
 *     ...
 *   }
 * }
 *
 * Returns:
 *   '/dashboard'              if accountsetup === 1
 *   '/account-setup/newMember' if accountsetup === 0
 */
export const checkAccountStatus = async (): Promise<'/dashboard' | '/account-setup/newMember'> => {
  try {
    const token = getAuthToken();

    const { data } = await axios.get(`${API_BASE}/dashboard`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const accountSetupDone = data?.OtherDetail?.accountsetup === 1;
    return accountSetupDone ? '/dashboard' : '/account-setup/newMember';
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Failed to check account status.';
    throw new Error(message);
  }
};
