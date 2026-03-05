// src/lib/api/auth.ts
import axios from 'axios';
import { setAuthSession } from '@/lib/auth/session';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://paxlete.com/api';

/**
 * Check if username is available
 * Uses FormData to match backend expectation
 */
export const checkUsername = async (username: string) => {
  try {
    const formData = new FormData();
    formData.append('username', username.trim());

    const { data } = await axios.post(
      `${API_BASE}/checkusername`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Failed to check username availability';
    throw new Error(message);
  }
};

/**
 * Complete signup (step 2)
 * Uses FormData (includes optional image file)
 */
export const signup = async ({
  name,
  email,
  password,
  username,
  image,
}: {
  name: string;
  email: string;
  password: string;
  username: string;
  image?: File;
}) => {
  try {
    const formData = new FormData();
    formData.append('name', name.trim());
    formData.append('email', email.trim());
    formData.append('password', password);
    formData.append('username', username.trim());

    if (image) {
      formData.append('image', image);
    }

    const { data } = await axios.post(
      `${API_BASE}/signup`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    // Auto-save token if present
    const token = data?.token ?? data?.access_token ?? data?.accessToken;
    if (token) {
      setAuthSession(String(token));
    }

    return data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Signup failed. Please try again.';
    throw new Error(message);
  }
};
