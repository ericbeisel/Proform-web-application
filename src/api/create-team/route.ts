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

export interface Team {
  id: string;
  name: string;
  number: string | null;
  address: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  individual: string;
}

export interface GetTeamsListResponse {
  message: string;
  data: Team[];
}

export const createTeam = async (teamName: string): Promise<CreateTeamResponse> => {
  try {
    const token = getAuthToken();
    
    const formData = new URLSearchParams();
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

export const getTeamsList = async (): Promise<GetTeamsListResponse> => {
  try {
    const token = getAuthToken();
    
    const { data } = await axios.get(`${API_BASE}/list-individual-team`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    console.log('[getTeamsList] Success:', data);
    return data;
  } catch (error: any) {
    console.error('[getTeamsList] Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch teams list');
  }
};