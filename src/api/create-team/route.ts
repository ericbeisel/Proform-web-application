// src/api/create-team/route.ts
import axios from 'axios';
import { getAuthToken } from '@/lib/auth/session';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://paxlete.com/api';

export interface CreateTeamResponse {
  message: string;
  team?: {
    id: string;
    name: string;
    invite_code?: string;
  };
}

export const createTeam = async (teamName: string): Promise<CreateTeamResponse> => {
  try {
    const token = getAuthToken();
    
    const formData = new URLSearchParams();
    // Change from 'team_name' to 'name' as per error message
    formData.append('name', teamName);

    const { data } = await axios.post(`${API_BASE}/create-individual-team`, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    console.log('[createTeam] Success:', data);
    return data;
  } catch (error: any) {
    console.error('[createTeam] Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to create team');
  }
};