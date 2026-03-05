import axios from 'axios';
import { setAuthSession } from '@/lib/auth/session';

export const login = async (email: string, password: string) => {
  try {
    const { data } = await axios.post(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/login`,
      { email, password }
    );

    // Save token immediately (common pattern)
    const token = data?.token ?? data?.access_token ?? data?.accessToken;
    if (token) {
      setAuthSession(String(token));
    }

    return data;
  } catch (error: any) {
    const message = error.response?.data?.message || 'Invalid email or password';
    throw new Error(message);
  }
};
