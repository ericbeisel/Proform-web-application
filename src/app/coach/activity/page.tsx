"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CoachSidebar } from "@/app/coach/coach-dashboard/components/CoachSidebar";
import { invalidateDashboardCache } from "@/api/dashboard/route";
import { clearAuthSession, getAuthUser, getTokenPayload } from "@/lib/auth/session";
import { coachApi, type CoachTeam } from "@/api/coach/route";
import { profileApi } from "@/api/profile/route";
import { getWorkoutSessionById } from "@/api/workouts/route";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Search,
  X,
  Menu,
  Droplets,
  Activity,
  Heart,
  Wind,
  FlaskConical,
  ImageIcon,
  Dumbbell,
  CheckCircle2,
  Loader2,
  Flame,
  Timer,
  MoreHorizontal,
} from "lucide-react";

// ─── Filter options ───────────────────────────────────────────────────────────

const TIME_FILTERS = ["All Time", "Today", "This Week", "Last 30 Days"];

const LOG_TYPES = [
  "All Activity",
  "Primary Workout",
  "Cardio",
  "Supplemental",
  "Conditioning",
  "InBody Scan",
  "Blood Test",
  "Progress Photo",
  "BP Test",
  "Breathing Test",
  "Hydration Test",
  "Other",
];

// ─── Unified item types ───────────────────────────────────────────────────────

type WorkoutKind = "Primary Workout" | "Cardio" | "Supplemental" | "Conditioning" | "Recovery" | "Hydration";
type SubmissionKind =
  | "InBody Scan"
  | "Blood Test"
  | "Progress Photo"
  | "BP Test"
  | "Breathing Test"
  | "Hydration Test"
  | "Other";

export type ActivityKind = WorkoutKind | SubmissionKind;

interface FeedItem {
  _source: "feed";
  id: string;
  kind: WorkoutKind;
  rawType: string;
  player: string;
  username: string;
  avatarUrl?: string | null;
  imageUrl?: string | null;
  activityId?: string | null;
  workoutTitle: string;
  isCompleted: boolean;
  dateIso: string;
  team?: string;
}

interface SubmissionItem {
  _source: "submission";
  id: number;
  kind: SubmissionKind;
  player: string;
  username: string;
  avatarUrl?: string | null;
  imageUrl: string | null;
  note?: string;
  dateIso: string;
  team?: string;
}

type ActivityItem = FeedItem | SubmissionItem;

function isFeed(a: ActivityItem): a is FeedItem {
  return a._source === "feed";
}

// ─── Feed type → filter kind ──────────────────────────────────────────────────

function feedTypeToKind(type: string): WorkoutKind {
  const t = type.toUpperCase();
  if (t.includes("CARDIO"))       return "Cardio";
  if (t.includes("HYDRATION"))    return "Hydration";
  if (t.includes("RECOVERY"))     return "Recovery";
  if (t.includes("SUPPLEMENTAL")) return "Supplemental";
  if (t.includes("CONDITIONING")) return "Conditioning";
  return "Primary Workout";
}

function shouldShowFeedItem(type: string): boolean {
  const t = type.toUpperCase();
  if (t === "SESSION") return false;
  if (t.startsWith("START")) return false;
  return true;
}

// ─── Dummy submission data (replace with real API when ready) ─────────────────

const DUMMY_SUBMISSIONS: SubmissionItem[] = [
  {
    _source: "submission",
    id: 1001,
    dateIso: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1h ago
    player: "Sneha Gharge",
    username: "sneha09",
    team: "SP",
    kind: "Blood Test",
    imageUrl: null,
    note: "CBC panel submitted",
  },
  {
    _source: "submission",
    id: 1002,
    dateIso: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    player: "Komal Rajpure",
    username: "komal123",
    team: "SP",
    kind: "InBody Scan",
    imageUrl: null,
    note: "DEXA scan — Week 4",
  },
  {
    _source: "submission",
    id: 1003,
    dateIso: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(), // yesterday
    player: "Rohan Desai",
    username: "rohan_d",
    team: "SP",
    kind: "Progress Photo",
    imageUrl: null,
  },
  {
    _source: "submission",
    id: 1004,
    dateIso: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
    player: "Anita Sharma",
    username: "anita_s",
    team: "Alpha",
    kind: "BP Test",
    imageUrl: null,
    note: "120 / 80 reading",
  },
  {
    _source: "submission",
    id: 1005,
    dateIso: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    player: "Vijay Patil",
    username: "vijay_p",
    team: "Alpha",
    kind: "Breathing Test",
    imageUrl: null,
  },
  {
    _source: "submission",
    id: 1006,
    dateIso: new Date(Date.now() - 50 * 60 * 60 * 1000).toISOString(),
    player: "Sneha Gharge",
    username: "sneha09",
    team: "SP",
    kind: "Hydration Test",
    imageUrl: null,
    note: "Urine SG: 1.015",
  },
  {
    _source: "submission",
    id: 1007,
    dateIso: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    player: "Komal Rajpure",
    username: "komal123",
    team: "SP",
    kind: "Other",
    imageUrl: null,
    note: "Sleep journal submitted",
  },
];

// ─── Config maps ──────────────────────────────────────────────────────────────

const WORKOUT_CONFIG: Record<WorkoutKind, { chip: string; chipBg: string }> = {
  "Primary Workout": { chip: "PRIMARY",     chipBg: "bg-blue-500"   },
  Cardio:            { chip: "CARDIO",      chipBg: "bg-red-400"    },
  Supplemental:      { chip: "SUPPLEMENTAL",chipBg: "bg-green-500"  },
  Conditioning:      { chip: "CONDITIONING",chipBg: "bg-yellow-500" },
  Recovery:          { chip: "RECOVERY",    chipBg: "bg-teal-500"   },
  Hydration:         { chip: "HYDRATION",   chipBg: "bg-cyan-500"   },
};

const SUBMISSION_CONFIG: Record<
  SubmissionKind,
  { chip: string; chipBg: string; icon: React.ReactNode }
> = {
  "Blood Test":     { chip: "BLOOD TEST",     chipBg: "bg-red-500",    icon: <FlaskConical size={12} /> },
  "InBody Scan":    { chip: "INBODY SCAN",    chipBg: "bg-blue-500",   icon: <Activity size={12} /> },
  "Progress Photo": { chip: "PROGRESS PHOTO", chipBg: "bg-purple-500", icon: <ImageIcon size={12} /> },
  "BP Test":        { chip: "BP TEST",        chipBg: "bg-orange-500", icon: <Heart size={12} /> },
  "Breathing Test": { chip: "BREATHING TEST", chipBg: "bg-cyan-500",   icon: <Wind size={12} /> },
  "Hydration Test": { chip: "HYDRATION TEST", chipBg: "bg-green-500",  icon: <Droplets size={12} /> },
  Other:            { chip: "OTHER",          chipBg: "bg-gray-500",   icon: <MoreHorizontal size={12} /> },
};

// ─── Date helpers ─────────────────────────────────────────────────────────────

function toDateLabel(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "Unknown";
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}


function formatFullDateTime(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const date = d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }).toLowerCase();
  return `${date} ${time}`;
}

function groupByDate(items: ActivityItem[]): { label: string; items: ActivityItem[] }[] {
  const map: Record<string, ActivityItem[]> = {};
  const order: string[] = [];
  items.forEach((a) => {
    const label = toDateLabel(a.dateIso);
    if (!map[label]) { map[label] = []; order.push(label); }
    map[label].push(a);
  });
  return order.map((label) => ({ label, items: map[label] }));
}

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ name, url }: { name: string; url?: string | null }) {
  return (
    <div className="w-[48px] h-[48px] rounded-full bg-[#8b5cf6] p-[3px] shadow-[0_4px_12px_rgba(139,92,246,0.30)] shrink-0">
      <div className="w-full h-full rounded-full border-[2px] border-white overflow-hidden flex items-center justify-center bg-[#7c3aed]">
        {url ? (
          <img src={url} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-white text-sm font-black">{initials(name)}</span>
        )}
      </div>
    </div>
  );
}

// ─── Feed / workout card ──────────────────────────────────────────────────────

function WorkoutCard({ item }: { item: FeedItem }) {
  const cfg = WORKOUT_CONFIG[item.kind];
  const [thumbUrl, setThumbUrl] = useState<string | null>(item.imageUrl ?? null);

  useEffect(() => {
    if (thumbUrl || !item.activityId) return;
    getWorkoutSessionById(item.activityId)
      .then((session) => { if (session?.workoutImage) setThumbUrl(session.workoutImage); })
      .catch(() => {});
  }, [item.activityId]);

  return (
    <div className="bg-white rounded-[20px] border border-[#ececf3] px-4 pt-3 pb-4 mb-3 shadow-sm">
      {/* Header row */}
      <div className="flex items-start justify-between mb-2">
        <p className="text-[11px] text-gray-400">{formatFullDateTime(item.dateIso)}</p>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-[12px] font-bold text-gray-800 leading-tight">{item.player}</p>
            <p className="text-[11px] text-gray-400">({item.username})</p>
          </div>
          <Avatar name={item.player} url={item.avatarUrl} />
        </div>
      </div>

      {/* Metadata row */}
      <div className="flex items-center gap-3 mb-3 text-[11px] text-gray-500">
        {item.isCompleted && (
          <span className="inline-flex items-center gap-1 text-green-500 font-semibold">
            <CheckCircle2 size={11} /> Completed
          </span>
        )}
        <span className="inline-flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center">
            <Flame size={10} className="text-purple-500" />
          </span>
          Cal: 900
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center">
            <Timer size={10} className="text-purple-500" />
          </span>
          Min: 90
        </span>
      </div>

      {/* Inner card */}
      <div className="bg-[#f5f5f7] rounded-2xl flex items-center gap-3 px-3 py-3">
        <div className="w-14 h-14 rounded-xl bg-gray-200 shrink-0 flex items-center justify-center overflow-hidden">
          {thumbUrl ? (
            <img src={thumbUrl} alt={item.workoutTitle} className="w-full h-full object-cover" />
          ) : (
            <Dumbbell size={22} className="text-gray-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-[#111827] leading-tight truncate">{item.workoutTitle}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">{item.team || "—"}</p>
        </div>
        <span className={`shrink-0 ${cfg.chipBg} text-white text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide flex items-center gap-1`}>
          <span className="w-[3px] h-[3px] rounded-full bg-white/70" />
          {cfg.chip}
        </span>
      </div>
    </div>
  );
}

// ─── Submission card ──────────────────────────────────────────────────────────

function SubmissionCard({ item }: { item: SubmissionItem }) {
  const cfg = SUBMISSION_CONFIG[item.kind];
  return (
    <div className="bg-white rounded-[20px] border border-[#ececf3] px-4 pt-3 pb-4 mb-3 shadow-sm">
      {/* Header row */}
      <div className="flex items-start justify-between mb-2">
        <p className="text-[11px] text-gray-400">{formatFullDateTime(item.dateIso)}</p>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-[12px] font-bold text-gray-800 leading-tight">{item.player}</p>
            <p className="text-[11px] text-gray-400">({item.username})</p>
          </div>
          <Avatar name={item.player} url={item.avatarUrl} />
        </div>
      </div>

      {/* Metadata row */}
      {item.note && (
        <div className="flex items-center gap-1.5 mb-3 text-[11px] text-gray-500">
          <span className="text-gray-400">{cfg.icon}</span>
          <span>{item.note}</span>
        </div>
      )}
      {!item.note && <div className="mb-2" />}

      {/* Inner card */}
      <div className="bg-[#f5f5f7] rounded-2xl flex items-center gap-3 px-3 py-3">
        <div className="w-14 h-14 rounded-xl bg-gray-200 shrink-0 flex items-center justify-center overflow-hidden">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.kind} className="w-full h-full object-cover" />
          ) : (
            <span className="text-gray-400 scale-150">{cfg.icon}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-[#111827] leading-tight truncate">{item.kind}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">{item.team || "—"}</p>
        </div>
        <span className={`shrink-0 ${cfg.chipBg} text-white text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide flex items-center gap-1`}>
          <span className="w-[3px] h-[3px] rounded-full bg-white/70" />
          {cfg.chip}
        </span>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const TIME_RANGE_MAP: Record<string, string> = {
  "All Time":    "all",
  "Today":       "today",
  "This Week":   "week",
  "Last 30 Days":"month",
};

function ActivityContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const teamIdFromUrl = searchParams.get("team_id") ?? "";

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logType, setLogType] = useState("All Activity");
  const [timeFilter, setTimeFilter] = useState("All Time");
  const [search, setSearch] = useState("");
  const [teams, setTeams] = useState<CoachTeam[]>([]);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [userInitial, setUserInitial] = useState("");
  // Real feed state
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const handleLogOut = () => {
    invalidateDashboardCache();
    clearAuthSession();
    localStorage.removeItem("user");
    router.replace("/auth/login");
  };

  // Map raw activity-logs API response → FeedItem
  const mapRawFeeds = (rawFeeds: any[]): FeedItem[] =>
    rawFeeds.filter((raw) => shouldShowFeedItem(raw.type || "")).map((raw) => ({
      _source: "feed" as const,
      id: String(raw.id),
      kind: feedTypeToKind(raw.type || ""),
      rawType: raw.type || "",
      player: raw.player?.name || raw.user?.name || raw.username || "Player",
      username: raw.player?.username || raw.user?.username || raw.username || "user",
      avatarUrl: raw.player?.image || raw.user?.image || null,
      imageUrl: raw.mediaUrl || raw.media_url || null,
      activityId: raw.activity_id || null,
      workoutTitle: raw.title || raw.subtitle || "Workout",
      isCompleted: (raw.title || "").toLowerCase().startsWith("completed"),
      dateIso: raw.timestamp || raw.date || raw.created_at || new Date().toISOString(),
      team: raw.team || raw.sport || undefined,
    }));

  useEffect(() => {
    const user = getAuthUser();
    if (user?.name) setUserInitial((user.name as string)[0]?.toUpperCase() ?? "");
    const tokenPayload = getTokenPayload();
    const username = (user?.username as string | undefined) ?? tokenPayload?.username;
    if (username) {
      profileApi.getProfileByUsername(username).then((profile) => {
        if (profile?.image) setProfilePicture(profile.image);
        if (!user?.name) {
          const display = profile?.name || profile?.username || username;
          if (display) setUserInitial((display as string)[0]?.toUpperCase() ?? "");
        }
      }).catch(() => {});
    } else if (tokenPayload?.email) {
      setUserInitial(tokenPayload.email[0]?.toUpperCase() ?? "");
    }
    coachApi.getCoachTeams().then(setTeams).catch(() => {});
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await coachApi.getActivityLogs({
          team_id: teamIdFromUrl,
          search,
          time_range: TIME_RANGE_MAP[timeFilter] ?? "all",
          page: 1,
        });
        setFeedItems(mapRawFeeds(res.logs));
        setHasMore(res.hasMore ?? false);
        setPage(1);
      } catch (err) {
        console.error("Failed to load activity logs:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [search, timeFilter, teamIdFromUrl]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const next = page + 1;
      const res = await coachApi.getActivityLogs({
        team_id: teamIdFromUrl,
        search,
        time_range: TIME_RANGE_MAP[timeFilter] ?? "all",
        page: next,
      });
      setFeedItems((prev) => [...prev, ...mapRawFeeds(res.logs)]);
      setHasMore(res.hasMore ?? false);
      setPage(next);
    } catch (err) {
      console.error("Failed to load more:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  // Merge real feed + dummy submissions, sort newest first
  const merged: ActivityItem[] = [...feedItems, ...DUMMY_SUBMISSIONS].sort(
    (a, b) => new Date(b.dateIso).getTime() - new Date(a.dateIso).getTime()
  );

  // Apply filters
  const filtered = merged.filter((a) => {
    const q = search.toLowerCase();
    const matchesSearch =
      a.player.toLowerCase().includes(q) || a.username.toLowerCase().includes(q);

    const matchesType =
      logType === "All Activity" || a.kind === logType;

    const matchesTeam = !teamIdFromUrl || a.team === teamIdFromUrl;

    if (timeFilter !== "All Time") {
      const d = new Date(a.dateIso);
      const now = new Date();
      if (timeFilter === "Today") {
        if (d.toDateString() !== now.toDateString()) return false;
      } else if (timeFilter === "This Week") {
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        if (d < weekAgo) return false;
      } else if (timeFilter === "Last 30 Days") {
        const thirtyAgo = new Date(now);
        thirtyAgo.setDate(now.getDate() - 30);
        if (d < thirtyAgo) return false;
      }
    }

    return matchesSearch && matchesType && matchesTeam;
  });

  const grouped = groupByDate(filtered);

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex overflow-x-hidden">
      <CoachSidebar
        profilePicture={profilePicture}
        userInitial={userInitial}
        onSwitchToPlayer={() => router.replace("/team/teams")}
        onLogOut={handleLogOut}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="md:ml-[220px] flex-1 min-w-0">
        {/* Sticky top bar */}
        <div className="bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm px-4 py-3 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-800 transition"
            >
              <Menu size={20} />
            </button>
            <div className="relative">
              <select
                value={logType}
                onChange={(e) => setLogType(e.target.value)}
                className="h-9 pl-3 pr-8 rounded-xl border border-gray-200 text-sm font-bold text-[#222] bg-white appearance-none outline-none focus:border-[#8B5CF6]"
              >
                {LOG_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-500" />
            </div>
          </div>

          <button onClick={() => router.back()} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-800 transition">
            <X size={20} />
          </button>
        </div>

        {/* Title nav */}
        {(() => {
          const idx = LOG_TYPES.indexOf(logType);
          const canPrev = idx > 0;
          const canNext = idx < LOG_TYPES.length - 1;
          return (
            <div className="flex items-center justify-center gap-6 py-4 bg-white border-b border-gray-100">
              <button
                onClick={() => canPrev && setLogType(LOG_TYPES[idx - 1])}
                className={`transition ${canPrev ? "text-gray-500 hover:text-[#8B5CF6]" : "text-gray-200 cursor-default"}`}
              >
                <ChevronLeft size={20} />
              </button>
              <h1 className="text-lg font-black text-[#8B5CF6] min-w-[160px] text-center">
                {logType === "All Activity" ? "All Activity" : logType}
              </h1>
              <button
                onClick={() => canNext && setLogType(LOG_TYPES[idx + 1])}
                className={`transition ${canNext ? "text-gray-500 hover:text-[#8B5CF6]" : "text-gray-200 cursor-default"}`}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          );
        })()}

        {/* Filters */}
        <div className="px-4 py-3 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or username"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 rounded-xl border border-gray-200 bg-white pl-8 pr-3 text-sm outline-none focus:border-[#8B5CF6] transition"
            />
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1 sm:flex-none">
              <select
                value={teamIdFromUrl}
                onChange={(e) => {
                  const id = e.target.value;
                  const params = new URLSearchParams(searchParams.toString());
                  if (id) params.set("team_id", id);
                  else params.delete("team_id");
                  router.push(`?${params.toString()}`);
                }}
                className="w-full sm:w-auto h-9 pl-3 pr-8 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-[#222] appearance-none outline-none sm:min-w-[120px]"
              >
                <option value="">All Teams</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-500" />
            </div>
            <div className="relative flex-1 sm:flex-none">
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="w-full sm:w-auto h-9 pl-3 pr-8 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-[#222] appearance-none outline-none sm:min-w-[130px]"
              >
                {TIME_FILTERS.map((t) => <option key={t}>{t}</option>)}
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-500" />
            </div>
          </div>
        </div>

        {/* Count */}
        <div className="px-4 mb-3">
          <span className="text-sm font-bold text-gray-600">
            {filtered.length} {filtered.length === 1 ? "item" : "items"}
            {hasMore && feedItems.length > 0 ? "+" : ""}
          </span>
        </div>

        {/* Feed */}
        <div className="px-4 pb-12">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={28} className="animate-spin text-[#8B5CF6]" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-[26px] p-12 text-center border border-[#ececf3] shadow-sm">
              <Activity size={44} className="mx-auto mb-3 text-gray-200" />
              <p className="text-gray-400 text-sm">No activity found.</p>
            </div>
          ) : (
            <>
              {grouped.map((group) => (
                <div key={group.label} className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-5 bg-[#6c3fef] rounded-full" />
                    <h3 className="text-base font-bold text-gray-800">{group.label}</h3>
                  </div>
                  {group.items.map((item) =>
                    isFeed(item) ? (
                      <WorkoutCard key={`feed-${item.id}`} item={item} />
                    ) : (
                      <SubmissionCard key={`sub-${item.id}`} item={item as SubmissionItem} />
                    )
                  )}
                </div>
              ))}

              {/* Load more (only when feed has more pages) */}
              {hasMore && (
                <div className="flex justify-center mt-2 mb-4">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="flex items-center gap-2 px-8 py-3 rounded-full bg-white border border-gray-200 text-sm font-semibold text-gray-600 shadow-sm hover:bg-gray-50 transition disabled:opacity-50"
                  >
                    {loadingMore ? <Loader2 size={16} className="animate-spin" /> : null}
                    {loadingMore ? "Loading..." : "Load More"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

    </div>
  );
}

export default function ActivityPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ActivityContent />
    </Suspense>
  );
}
