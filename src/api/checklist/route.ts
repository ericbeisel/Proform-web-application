import axios from "axios";
import { getAuthToken } from "@/lib/auth/session";

const BASE = "https://api.paxlete.com";

function authHeaders() {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface TodayActivity {
  id: string;
  title: string;
  workout_title: string;
  type: string;
  activity_time: string;
  activity_status: number;
  completed: boolean;
  cover_photo: string | null;
  program_name: string;
  muscles_used: string;
  day: string;
  week: string;
  activity_id: number;
}

export interface TodayActivitiesResponse {
  day: string;
  activities: TodayActivity[];
}

export async function getTodayActivities(day: string): Promise<TodayActivitiesResponse> {
  console.log("[checklist] getTodayActivities →", `${BASE}/dashboard/today-activities`, { day });
  const { data } = await axios.get<TodayActivitiesResponse>(
    `${BASE}/dashboard/today-activities`,
    { params: { day }, headers: authHeaders() }
  );
  console.log("[checklist] getTodayActivities ←", data);
  return data;
}

export interface Suggestion {
  id: number | string;
  title?: string;
  name?: string;
  description?: string;
  time?: string;
  DayText?: string;
  colour?: string;
  checkbox1?: boolean;
  completed?: boolean;
  typeLink?: string;
  [key: string]: unknown;
}

export interface AddCustomActivityPayload {
  name: string;
  type: string;
  days: string[];
  time: string;
  recurring: string;
}

export async function addCustomActivity(payload: AddCustomActivityPayload): Promise<void> {
  await axios.post(`${BASE}/add-custom-activity`, payload, { headers: authHeaders() });
}

export async function getSuggestions(memberId: string): Promise<Suggestion[]> {
  console.log("[checklist] getSuggestions →", `${BASE}/itinerary-setup/suggestions`, { memberId });
  const { data } = await axios.get<{ data?: Suggestion[] } | Suggestion[]>(
    `${BASE}/itinerary-setup/suggestions`,
    { params: { memberId }, headers: authHeaders() }
  );
  const result = Array.isArray(data) ? data : (data as { data?: Suggestion[] }).data ?? [];
  console.log("[checklist] getSuggestions ←", result);
  return result;
}
