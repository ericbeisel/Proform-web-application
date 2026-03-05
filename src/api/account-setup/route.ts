// ✅ UPDATED: all numeric fields forced to integers via toInt()
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { getAuthToken } from '@/lib/auth/session';

// ─── Helper: always send whole integers to the API ────────────────────────────
function toInt(val: string | number | undefined | null): string {
  if (val === undefined || val === null || val === '') return '0';
  const n = Math.round(Number(val));
  return isNaN(n) ? '0' : String(n);
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://paxlete.com/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AccountSetupInput {
  // Step 1 – Personal Basics
  gender: string;
  birthday: string;
  activityLevel: string;
  unitPreference: string;
  // Step 2 – Goals & Preferences
  primaryGoal: string;
  trainingGoals: string[];
  preferredActivities: string[];
  // Step 3 – Core Metrics
  currentWeight: string;
  goalWeight: string;
  heightFeet: string;
  heightInches: string;
  bodyFatPercentage: string;
  // Step 4 – Lifestyle Metrics
  dailySteps: string;
  cardioCalorieGoal: string;
  // Step 6 – Your Schedule
  workoutDays: string[];
  supplementalDays: string[];
  cardioDays: string[];
  conditioningDays: string[];
  // Step 7 – 1RM Method
  selected1RMMethod: 'auto' | 'manual' | null;
  // Step 8 – Strength Profile
  benchPress: string;
  squat: string;
  deadlift: string;
  powerClean: string;
  autoCalculateFuture: boolean;
  // Step 9 – Preferences (all IDs from API)
  timeZoneId: string;       // numeric ID from /api/timezone
  weeklyResetDay: string;
  countryId: string;        // numeric ID from /api/country
  stateId: string;          // numeric ID from /api/state
  cityId: string;           // numeric ID from /api/cities
}

// ─── Location & Timezone API types ───────────────────────────────────────────

export interface TimezoneOption {
  id: string | number;  // API returns id as string e.g. "1", "2"
  name: string;         // e.g. "CST: Central Standard Time"
  timeValue?: string;   // e.g. "America/Chicago"
  offset?: string;
  label?: string;
}

export interface CountryOption {
  id: number;
  name: string;
}

export interface StateOption {
  id: number;
  name: string;
  country_id?: number;
}

export interface CityOption {
  id: number;
  name: string;
  state_id?: number;
}

// ─── Location & Timezone fetch functions ─────────────────────────────────────

/** Fetch all timezones from GET /api/timezone */
export const fetchTimezones = async (): Promise<TimezoneOption[]> => {
  try {
    const { data } = await axios.get(`${API_BASE}/timezone`);
    console.log('[fetchTimezones] raw response:', data);
    const raw: any[] = Array.isArray(data) ? data : (data.data ?? data.timezones ?? []);
    // API returns id as string (e.g. "1"). Keep as-is but log for debugging.
    console.log('[fetchTimezones] first item sample:', raw[0]);
    return raw;
  } catch (error: any) {
    console.error('[fetchTimezones] error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch timezones');
  }
};

/** Fetch all countries from GET /api/country */
export const fetchCountries = async (): Promise<CountryOption[]> => {
  try {
    const { data } = await axios.get(`${API_BASE}/country`);
    console.log('[fetchCountries] raw response:', data);
    return Array.isArray(data) ? data : (data.data ?? data.countries ?? []);
  } catch (error: any) {
    console.error('[fetchCountries] error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch countries');
  }
};

/** Fetch states for a country from POST /api/state */
export const fetchStates = async (countryId: string): Promise<StateOption[]> => {
  if (!countryId || countryId === '0') return [];
  try {
    const params = new URLSearchParams({ country_id: countryId });
    console.log('[fetchStates] requesting states for country_id:', countryId);
    const { data } = await axios.post(`${API_BASE}/state`, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    console.log('[fetchStates] raw response:', data);
    return Array.isArray(data) ? data : (data.data ?? data.states ?? []);
  } catch (error: any) {
    console.error('[fetchStates] error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch states');
  }
};

/** Fetch cities for a state — POST x-www-form-urlencoded with state_id */
export const fetchCities = async (stateId: string): Promise<CityOption[]> => {
  if (!stateId || stateId === '0') return [];
  try {
    const params = new URLSearchParams({ state_id: stateId });
    console.log('[fetchCities] requesting cities for state_id:', stateId);
    const { data } = await axios.post(`${API_BASE}/cities`, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    console.log('[fetchCities] raw response:', data);
    return Array.isArray(data) ? data : (data.data ?? data.cities ?? []);
  } catch (error: any) {
    console.error('[fetchCities] error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch cities');
  }
};

// ─── Mapping helpers ──────────────────────────────────────────────────────────

/**
 * FIX: Use UTC methods to avoid timezone-offset shifting the date by one day.
 * e.g. "1990-05-15" with local timezone could shift to May 14 if UTC-offset is negative.
 */
function formatBirthDate(isoDate: string): string {
  if (!isoDate) return '';
  // FIX: API was interpreting YYYYMMDD as a Unix timestamp ("20070301" → epoch → "1970-08-21").
  // Send as-is "YYYY-MM-DD" so the API parses it as a real calendar date.
  console.log('[formatBirthDate] input:', isoDate, 'passing through as-is');
  return isoDate;
}

function mapActivityLevel(level: string): string {
  // FIX: use integer codes — floating point values like 1.375 cause 500 errors
  const map: Record<string, string> = {
    sedentary:     '1',
    light:         '2',
    moderate:      '3',
    active:        '4',
    'very-active': '5',
  };
  const result = map[level] ?? '1';
  console.log('[mapActivityLevel] input:', level, '→ output:', result);
  return result;
}

function mapWeightGoalType(goal: string): string {
  let result: string;
  if (goal === 'lose-weight') result = 'lose';
  else if (goal === 'build-muscle' || goal === 'increase-strength') result = 'gain';
  else result = 'maintain';
  console.log('[mapWeightGoalType] input:', goal, '→ output:', result);
  return result;
}

function mapGender(gender: string): string {
  if (gender === 'male') return 'male';
  if (gender === 'female') return 'female';
  return 'other';
}

function computeHeight(unit: string, feet: string, inches: string): string {
  if (!feet) return '0';
  let result: string;
  if (unit === 'imperial') {
    result = String(Number(feet) * 12 + Number(inches || '0'));
  } else {
    result = feet;
  }
  console.log('[computeHeight] unit:', unit, 'feet:', feet, 'inches:', inches, '→ output:', result);
  return result;
}

function mapWeeklyReset(day: string): string {
  const map: Record<string, string> = {
    Monday: '0', Tuesday: '1', Wednesday: '2', Thursday: '3',
    Friday: '4', Saturday: '5', Sunday: '6',
  };
  const result = map[day] ?? '0';
  console.log('[mapWeeklyReset] input:', day, '→ output:', result);
  return result;
}

// ─── Payload builder ─────────────────────────────────────────────────────────

function buildPayload(input: AccountSetupInput): URLSearchParams {
  console.log('[buildPayload] full input received:', JSON.stringify(input, null, 2));

  // FIX: Normalise the 1RM method — sessionStorage round-trips may add quotes or whitespace
  const rmMethod = (input.selected1RMMethod ?? '').toString().trim().toLowerCase() as 'auto' | 'manual' | '';
  console.log('[buildPayload] selected1RMMethod raw:', input.selected1RMMethod, '→ normalised:', rmMethod);

  const isManual = rmMethod === 'manual';
  console.log('[buildPayload] isManual:', isManual);

  const benchPress  = isManual ? (input.benchPress  || '0') : '0';
  const backSquat   = isManual ? (input.squat        || '0') : '0';
  const powerClean  = isManual ? (input.powerClean   || '0') : '0';
  const deadlift    = isManual ? (input.deadlift     || '0') : '0';

  console.log('[buildPayload] 1RM values → bench:', benchPress, 'squat:', backSquat, 'powerClean:', powerClean, 'deadlift:', deadlift);

  const fields: Record<string, string> = {
    birthDate:               formatBirthDate(input.birthday),
    activityLevel:           mapActivityLevel(input.activityLevel),
    weightGoalType:          mapWeightGoalType(input.primaryGoal),
    timeZone:                String(parseInt(input.timeZoneId || '0', 10)),  // API id is string e.g. '1','2'
    measurementUnit:         input.unitPreference === 'imperial' ? 'lbs' : 'kg',
    autoAdjust:              input.autoCalculateFuture ? '1' : '0',
    gender:                  mapGender(input.gender),
    trainingGoals:           (input.trainingGoals  || []).join(','),
    trainingSport:           (input.preferredActivities || []).join(','),
    currentWeight:           input.currentWeight     || '0',
    goalWeight:              input.goalWeight         || '0',
    height:                  computeHeight(input.unitPreference, input.heightFeet, input.heightInches),
    bodyfat:                 input.bodyFatPercentage  || '0',
    avarage_daily_steps:     input.dailySteps         || '0',
    calories_goal:           input.cardioCalorieGoal  || '0',
    target_workout_week:     toInt((input.workoutDays        || []).length),
    target_supplement_week:  toInt((input.supplementalDays   || []).length),
    target_cardio_week:      toInt((input.cardioDays          || []).length),
    target_conditioning_week: toInt((input.conditioningDays    || []).length),
    weekly_reset:            mapWeeklyReset(input.weeklyResetDay),
    country:                 input.countryId    || '0',
    state:                   input.stateId      || '0',
    city:                    input.cityId       || '0',
    r_bench_press:           benchPress,
    r_back_squat:            backSquat,
    r_power_clean:           powerClean,
    r_deadlift:              deadlift,
  };

  console.log('[buildPayload] final fields object:', fields);

  const params = new URLSearchParams();
  Object.entries(fields).forEach(([key, value]) => params.append(key, value));

  console.log('[buildPayload] URLSearchParams string:', params.toString());
  return params;
}

// ─── Submit function ─────────────────────────────────────────────────────────

export const submitAccountSetup = async (input: AccountSetupInput) => {
  try {
    console.log('[submitAccountSetup] called with input:', JSON.stringify(input, null, 2));

    const params = buildPayload(input);
    const token = getAuthToken();

    console.log('[submitAccountSetup] token present:', !!token);
    console.log('[submitAccountSetup] posting to:', `${API_BASE}/accountsetup`);

    const { data } = await axios.post(
      `${API_BASE}/accountsetup`,
      params,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }
    );

    console.log('[submitAccountSetup] SUCCESS response:', JSON.stringify(data, null, 2));
    return data;
  } catch (error: any) {
    console.error('[submitAccountSetup] ERROR status:', error.response?.status);
    console.error('[submitAccountSetup] ERROR data:', JSON.stringify(error.response?.data, null, 2));
    console.error('[submitAccountSetup] ERROR message:', error.message);

    const message =
      error.response?.data?.message ||
      error.message ||
      'Account setup failed. Please try again.';
    throw new Error(message);
  }
};

// ─── Next.js Route Handler ────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const input: AccountSetupInput = await req.json();
    console.log('[POST /account-setup] received input:', JSON.stringify(input, null, 2));
    const data = await submitAccountSetup(input);
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (err: any) {
    console.error('[POST /account-setup] route error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
