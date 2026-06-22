import axios from "axios";
import { getAuthToken } from "@/lib/auth/session";

const POINTS_API_BASE = "https://api.paxlete.com";

interface PointsHistoryItem {
  id: number;
  user_id: number;
  points: number;
  type: string;
  created_at: string;
}

interface PointsHistoryResponse {
  message: string;
  data: PointsHistoryItem[];
}

export async function getPointsTotal(): Promise<number> {
  const token = getAuthToken();
  const { data } = await axios.get<PointsHistoryResponse>(
    `${POINTS_API_BASE}/pf-points/history`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }
  );
  return (data.data ?? []).reduce((sum, item) => sum + (item.points ?? 0), 0);
}
