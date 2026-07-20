"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Menu,
  Mail,
  Send,
  CheckCircle2,
  Info,
  Dumbbell,
  Activity,
  Heart,
  Flame,
  Calendar,
  Zap,
  PlusCircle,
  Apple,
  Droplet,
  Bell,
  ChevronRight,
  Plus,
} from "lucide-react";
import { profileApi, type ProfileData } from "@/api/profile/route";
import { CoachSidebar } from "@/app/coach/coach-dashboard/components/CoachSidebar";
import { invalidateDashboardCache } from "@/api/dashboard/route";
import { clearAuthSession, getAuthUser, getTokenPayload } from "@/lib/auth/session";

// TODO(backend): Avg Weekly / Avg Load / Avg kCal / Overall Score / Player Rank / Current
// Status counts / Daily To-Do / Standards have no per-player API yet for a coach view.
// Dummy placeholders layered on top of the real profile fields (workoutCount, Strength,
// optimalWellnessScore) until those are added.
const STATUS_GOALS = [
  { label: "Workout", current: 0, total: 10, badge: 5, icon: Dumbbell },
  { label: "Supplemental", current: 4, total: 4, badge: 4, icon: Activity },
  { label: "Cardio", current: 0, total: 2, badge: null, icon: Heart },
  { label: "Conditioning", current: 0, total: 4, badge: null, icon: Flame },
];

// TODO(backend): no per-player endpoint yet for user info (birth date, timezone,
// activity level, calorie/energy targets) or body-composition metrics from the coach
// side — dummy placeholders matching the design until those exist.
const USER_INFO_COLUMNS = [
  { label: "Birth Date", value: "23/02/2025" },
  { label: "Time Zone", value: "indian/Chagos" },
  { label: "Activity Level", value: "1.2" },
  { label: "Calories Goal", value: "4000" },
  { label: "Resting Energy Expenditure (REE)", value: "1425.875" },
  { label: "Total Daily Energy Expenditure", value: "1539.945" },
];

const USER_METRICS_COLUMNS = [
  { label: "Weight Goal", value: "loss" },
  { label: "Current Weight", value: "56" },
  { label: "Goal Weight", value: "50" },
  { label: "Height", value: "5'5" },
  { label: "Body Fat %", value: "5" },
  { label: "SMM", value: "" },
];

const QUICK_ICONS = [
  { label: "Itinerary", icon: Calendar, bg: "bg-[#8B5CF6]", text: "text-[#8B5CF6]" },
  { label: "Cardio", icon: Zap, bg: "bg-[#EF4444]", text: "text-[#EF4444]" },
  { label: "Recovery", icon: PlusCircle, bg: "bg-[#10B981]", text: "text-[#10B981]" },
  { label: "Macros", icon: Apple, bg: "bg-[#F97316]", text: "text-[#F97316]" },
  { label: "Hydrate", icon: Droplet, bg: "bg-[#3B82F6]", text: "text-[#3B82F6]" },
];

function stub(label: string) {
  alert(`${label} — coming soon (backend endpoint pending).`);
}

function InfoTable({ columns }: { columns: Array<{ label: string; value: string }> }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[#16A34A]">
      <table className="w-full min-w-[560px] text-center border-collapse">
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c.label}
                className="bg-[#22C55E] text-white text-[11px] font-bold py-2 px-2 border-r border-white/20 last:border-r-0"
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {columns.map((c) => (
              <td
                key={c.label}
                className="bg-[#22C55E] text-white text-xs italic py-2 px-2 border-r border-t border-white/20 last:border-r-0"
              >
                {c.value || "-"}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// TODO(backend): no endpoint exists yet to fetch a specific player's Master Profile
// (workouts/wellness/strength) from the coach side. `getProfileByUsername` is used
// opportunistically for the real name/photo when it resolves; everything else falls
// back to dummy data matching the design until a real coach-facing endpoint exists.
function buildDummyProfile(username: string): ProfileData {
  return {
    role_id: "3",
    image: null,
    id: 0,
    name: "Hrutuja Salunkhe",
    username: username || "hrutu",
    Bench_CMP: null,
    Squat_CMP: null,
    Clean_CMP: null,
    Deadlift_CMP: null,
    optimalWellnessScore: 3,
    Strength: 300,
    SocialMedia: [],
    workoutCount: 3,
    followtype: "none",
    followersCount: 0,
  };
}

export default function MasterProfilePage() {
  const router = useRouter();
  const { username } = useParams<{ username: string }>();

  const handleLogOut = () => {
    invalidateDashboardCache();
    clearAuthSession();
    localStorage.removeItem("user");
    router.replace("/auth/login");
  };

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [userInitial, setUserInitial] = useState("");

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getAuthUser();
    if (user?.name) setUserInitial((user.name as string)[0]?.toUpperCase() ?? "");
    const tokenPayload = getTokenPayload();
    const coachUsername = (user?.username as string | undefined) ?? tokenPayload?.username;
    if (coachUsername) {
      profileApi.getProfileByUsername(coachUsername).then((p) => {
        if (p?.image) setProfilePicture(p.image);
        if (!user?.name) {
          const display = p?.name || p?.username || coachUsername;
          if (display) setUserInitial((display as string)[0]?.toUpperCase() ?? "");
        }
      }).catch(() => {});
    } else if (tokenPayload?.email) {
      setUserInitial(tokenPayload.email[0]?.toUpperCase() ?? "");
    }
  }, []);

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    profileApi
      .getProfileByUsername(username)
      .then(setProfile)
      .catch(() => setProfile(buildDummyProfile(username)))
      .finally(() => setLoading(false));
  }, [username]);

  const todayLabel = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "numeric",
    day: "numeric",
    year: "numeric",
  });

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const displayName = profile.name || profile.username || "Player";
  const wellnessScore = Math.round(profile.optimalWellnessScore || 3);

  const stats = [
    { label: "Total Workouts", value: String(profile.workoutCount ?? 0) },
    { label: "Avg. Weekly", value: "0" },
    { label: "Avg. Strength", value: String(profile.Strength ?? 0) },
    { label: "Avg. Load", value: "0" },
    { label: "Avg. kCal", value: "0" },
    { label: "Overall Score", value: "0" },
    { label: "Player Rank", value: "-" },
  ];

  const strengthColumns = [
    { label: "Strength", value: String(profile.Strength ?? "") },
    { label: "Bench Press", value: profile.Bench_CMP ?? "" },
    { label: "Back Squat", value: profile.Squat_CMP ?? "" },
    { label: "Deadlift", value: profile.Deadlift_CMP ?? "" },
    { label: "Power Clean", value: profile.Clean_CMP ?? "" },
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex">
      <CoachSidebar
        profilePicture={profilePicture}
        userInitial={userInitial}
        onSwitchToPlayer={() => router.replace("/team/teams")}
        onLogOut={handleLogOut}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="md:ml-[220px] flex-1 min-w-0 flex flex-col">

        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden w-8 h-8 rounded-full bg-[#f5f5f7] flex items-center justify-center hover:bg-gray-200 transition shrink-0"
            >
              <Menu size={16} className="text-gray-700" />
            </button>
            <button
              onClick={() => router.back()}
              className="w-8 h-8 rounded-full bg-[#f5f5f7] flex items-center justify-center hover:bg-gray-200 transition shrink-0"
            >
              <ArrowLeft size={16} className="text-gray-700" />
            </button>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs font-semibold text-[#F59E0B] uppercase leading-none truncate">
                Master Profile
              </p>
              <h1 className="text-base sm:text-xl font-black text-[#1f1f1f] truncate leading-tight">
                {displayName}
              </h1>
            </div>
          </div>

          <div className="relative w-9 h-9 rounded-full bg-[#8B5CF6] flex items-center justify-center text-white text-xs font-bold overflow-hidden shrink-0">
            {profile.image ? (
              <img src={profile.image} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              displayName.charAt(0).toUpperCase()
            )}
          </div>
        </header>

        {/* Body */}
        <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-4 sm:py-6 overflow-x-hidden">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden p-4 sm:p-6">

            {/* Identity + stats */}
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:gap-6">
              <button
                onClick={() => stub("Message")}
                className="w-9 h-9 rounded-full bg-[#f5f5f7] flex items-center justify-center hover:bg-gray-200 transition shrink-0"
              >
                <Mail size={16} className="text-[#8B5CF6]" />
              </button>

              <div className="flex flex-col items-center gap-1 shrink-0">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#8B5CF6] flex items-center justify-center text-white text-2xl font-bold overflow-hidden ring-4 ring-white shadow">
                  {profile.image ? (
                    <img src={profile.image} alt={displayName} className="w-full h-full object-cover" />
                  ) : (
                    displayName.charAt(0).toUpperCase()
                  )}
                  <CheckCircle2 size={20} className="absolute -bottom-0.5 -right-0.5 text-[#3B82F6] bg-white rounded-full" />
                </div>
                <p className="text-xs text-gray-400">@{profile.username}</p>
                <p className="text-sm font-bold text-[#222]">{displayName}</p>
              </div>

              <div className="w-full sm:flex-1 sm:min-w-[220px] grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3 pt-1">
                {stats.map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="text-xl font-black text-[#1f1f1f]">{s.value}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => stub("Request")}
                className="flex flex-col items-center gap-1 shrink-0 text-[#3B82F6] hover:opacity-80 transition"
              >
                <Send size={18} />
                <span className="text-[10px] font-semibold">Request</span>
              </button>
            </div>

            {/* Wellness score */}
            <div className="flex flex-col items-center py-5 mt-2 border-t border-gray-100">
              <span className="text-5xl font-black text-[#8B5CF6]">{wellnessScore}</span>
              <div className="flex items-center gap-1.5 mt-1">
                <p className="text-sm font-semibold text-gray-500">Optimal Wellness Score</p>
                <Info size={14} className="text-[#8B5CF6]" />
              </div>
            </div>

            {/* Current Status */}
            <div className="pb-5">
              <h2 className="text-base font-bold text-[#222] mb-3">Current Status:</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {STATUS_GOALS.map((g) => (
                  <div
                    key={g.label}
                    className="relative rounded-2xl bg-gradient-to-br from-[#DDD6FE] to-[#C4B5FD] p-4 flex flex-col items-center justify-center text-center min-h-[110px]"
                  >
                    {g.badge != null && (
                      <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#3B82F6] text-white text-[10px] font-bold flex items-center justify-center">
                        {g.badge}
                      </span>
                    )}
                    <p className="text-2xl font-black text-[#1f1f1f]">
                      {g.current}
                      <span className="text-sm font-semibold text-gray-500">/{g.total}</span>
                    </p>
                    <p className="text-xs font-semibold text-[#4c1d95] mt-1">{g.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* All Activity */}
            <div className="flex justify-center pb-4">
              <button
                onClick={() => stub("All Activity")}
                className="relative h-10 px-8 rounded-full bg-[#3B82F6] text-white text-sm font-semibold hover:bg-[#2563EB] transition"
              >
                All Activity
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  15
                </span>
              </button>
            </div>

            <div className="flex flex-col items-center gap-2.5 pb-5">
              {["Edit Weekly Target", "Workout View/Edit Queue", "Live Workout"].map((label) => (
                <button
                  key={label}
                  onClick={() => stub(label)}
                  className="w-full max-w-64 h-10 rounded-full bg-[#3B82F6] text-white text-sm font-semibold hover:bg-[#2563EB] transition"
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Quick icon row */}
            <div className="pb-5">
              <div className="relative bg-[#f5f5f7] rounded-3xl border border-gray-200 p-4 sm:p-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-4 sm:gap-x-10 sm:gap-y-6">
                <button
                  onClick={() => stub("Notifications")}
                  className="absolute -top-2 left-3 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center shadow"
                >
                  <Bell size={13} />
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white text-red-500 text-[9px] font-bold flex items-center justify-center border border-red-500">
                    5
                  </span>
                </button>
                {QUICK_ICONS.map((q) => (
                  <button key={q.label} onClick={() => stub(q.label)} className="flex flex-col items-center gap-1.5">
                    <div className={`w-11 h-11 rounded-full ${q.bg} flex items-center justify-center`}>
                      <q.icon size={18} className="text-white" />
                    </div>
                    <span className={`text-xs font-semibold ${q.text}`}>{q.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Daily To-Do List */}
            <div className="pb-5">
              <h2 className="text-base font-bold text-[#222] mb-3">Daily To-Do List:</h2>
              <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold text-[#222]">{todayLabel}</p>
                  <ChevronRight size={16} className="text-gray-400" />
                </div>
                <p className="text-sm text-gray-400 mb-3">you dont have any workouts or activity. Find workouts</p>
                <div className="border border-red-300 rounded-xl px-3 py-2 text-center">
                  <p className="text-xs font-semibold text-red-500">Pending: Submit a Player Card in the next 30 days!</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2.5 pb-5">
              <button
                onClick={() => stub("View Itinerary")}
                className="w-full max-w-64 h-10 rounded-full bg-[#3B82F6] text-white text-sm font-semibold hover:bg-[#2563EB] transition"
              >
                View Itinerary
              </button>
              <button
                onClick={() => router.push(`/coach/players/${username}/exercise-log`)}
                className="w-full max-w-64 h-10 rounded-full bg-[#3B82F6] text-white text-sm font-semibold hover:bg-[#2563EB] transition"
              >
                Exercise Log
              </button>
            </div>

            {/* Standards/Goals */}
            <div className="bg-[#f5f5f7] rounded-3xl border border-gray-200 p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-[#222]">Standards/Goals:</h2>
                <button
                  onClick={() => stub("Add Standard")}
                  className="w-7 h-7 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition"
                >
                  <Plus size={14} className="text-[#3B82F6]" />
                </button>
              </div>
              <p className="text-sm text-gray-400 text-center mb-3">No standards yet</p>
              <div className="flex justify-center">
                <button
                  onClick={() => stub("View All Standards")}
                  className="h-8 px-6 rounded-full bg-[#3B82F6] text-white text-xs font-semibold hover:bg-[#2563EB] transition"
                >
                  View All
                </button>
              </div>
              <div className="flex justify-end mt-2">
                <button onClick={() => stub("Next")} className="flex items-center gap-1 text-xs font-semibold text-[#8B5CF6] hover:underline">
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Coaching Notes */}
            <div className="relative pt-6 pb-5">
              <h2 className="text-lg font-bold text-[#222] text-center">Coaching Notes:</h2>
              <button
                onClick={() => stub("Add Coaching Note")}
                className="absolute top-6 right-0 w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition"
              >
                <Plus size={16} className="text-[#3B82F6]" />
              </button>

              <div className="relative border border-gray-200 rounded-2xl p-4 mt-4 min-h-[140px]">
                <span className="absolute top-3 right-4 text-[11px] text-gray-400">Date/Time</span>
                <p className="text-sm text-gray-400 italic">Note Text</p>
              </div>

              <div className="flex justify-center mt-3">
                <button onClick={() => stub("View More Notes")} className="text-sm font-semibold text-[#3B82F6] hover:underline">
                  View More Notes
                </button>
              </div>
            </div>

            {/* User Info */}
            <div className="pb-5">
              <h2 className="text-lg font-bold text-[#222] text-center mb-3">User Info:</h2>
              <InfoTable columns={USER_INFO_COLUMNS} />
            </div>

            {/* User Metrics */}
            <div className="pb-5">
              <h2 className="text-lg font-bold text-[#222] text-center mb-3">User Metrics:</h2>
              <InfoTable columns={USER_METRICS_COLUMNS} />
            </div>

            {/* Strength */}
            <div>
              <InfoTable columns={strengthColumns} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
