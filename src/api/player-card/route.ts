import axios from 'axios';
import { getAuthToken } from '@/lib/auth/session';

export interface PlayerCardData {
  date: string;
  name: string;
  currentWeight: string;
  bodyCampScore: number;
  height: string;
  smm: number;
  bodyFat: string;
}

// GET - Fetch player card
export const getPlayerCard = async (): Promise<PlayerCardData> => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    console.log('📡 Fetching player card...');
    
    const { data } = await axios.get(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/player-card`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      }
    );

    return data;
  } catch (error: any) {
    console.error('❌ Error fetching:', error.response?.data || error.message);
    const message = error.response?.data?.message || 'Failed to fetch player card';
    throw new Error(message);
  }
};

export const createPlayerCard = async (formData: FormData) => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    console.log('📤 Creating/updating player card...');
    
   const { data } = await axios.post(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/create-player-card`,  // ← was /player-card
    formData,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return data;
  } catch (error: any) {
    console.error('❌ Error creating:', error.response?.data || error.message);
    const message = error.response?.data?.message || 'Failed to create player card';
    throw new Error(message);
  }
};

export const getPlayerCardDetails = async (): Promise<any[]> => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    console.log('📡 Fetching player card details with GET...');
    
    const { data } = await axios.get(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/player-card-details`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      }
    );

    // If API returns a single object, wrap in array
    return Array.isArray(data) ? data : [data];
  } catch (error: any) {
    console.error('❌ Error fetching details:', error.response?.data || error.message);
    const message = error.response?.data?.message || 'Failed to fetch player card details';
    throw new Error(message);
  }
};