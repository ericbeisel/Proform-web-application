"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Dumbbell,
  Heart,
  Users,
  X,
} from "lucide-react";
import FeedComments from "@/components/FeedComments";
import { FeedComment } from "@/api/feed/route";
import { useFeedLike } from "@/hooks/useFeedLike";
import { getAuthUser, getUserIdFromToken } from "@/lib/auth/session";
import {
  getWorkoutSessionById,
  getPublicWorkoutSession,
  getWorkoutStats,
  getPowerSetLogs,
  getTrackingLogs,
  getWorkoutLoadRecords,
  createWorkoutSession,
  createFeedPost,
  WorkoutSession,
  WorkoutStats,
  PowerSetLog,
  TrackingLog,
  WorkoutLoadRecord,
} from "@/api/workouts/route";
import { getProgramGroupedWorkouts, getProgramTags, WorkoutGroup } from "@/api/programs/route";

const getPowerSetLabel = (tag: string): string | null => {
  const t = tag.toUpperCase();
  if (t.includes("UES")) return "$Bench";
  if (t.includes("LES")) return "$Squat";
  if (t.includes("CCS")) return "$Clean";
  if (t.includes("HHP")) return "$Deadlift";
  return null;
};

export interface SessionDetailsContentProps {
  feedId: string;
  activityId: string;
  type: string;
  memberId: string;
  userName: string;
  userUsername: string;
  userImage: string;
  feedTitle: string;
  title2: string;
  date: string;
  initialLikeCount: number;
  initialLiked: boolean;
  joinedCountParam: number;
  isLoggedIn: boolean;
  loginUrl: string;
  compact?: boolean;
  /** Program code resolved at share-time (while the sharer was logged in) so
   * anonymous visitors can still preview a workout — /workouts/session/{id}
   * requires auth, but /programs/{code}/* endpoints don't. */
  programCode?: string;
}

export default function SessionDetailsContent({
  feedId,
  activityId,
  type,
  memberId,
  userName,
  userUsername,
  userImage,
  feedTitle,
  title2,
  date,
  initialLikeCount,
  initialLiked,
  joinedCountParam,
  isLoggedIn,
  loginUrl,
  compact = false,
  programCode,
}: SessionDetailsContentProps) {
  const router = useRouter();
  const [authPrompt, setAuthPrompt] = useState<"engage" | "join" | null>(null);

  const { liked: isLiked, count: likeCount, toggle: toggleLike } = useFeedLike(feedId, initialLiked, initialLikeCount);

  const currentUserId = getAuthUser()?.id ?? getUserIdFromToken();
  const isOwnWorkout = String(memberId) === String(currentUserId);
  const isCompleted = type?.includes("Complete");

  const [sessionProgramImage, setSessionProgramImage] = useState<string | null>(null);
  const [sessionWorkoutCategory, setSessionWorkoutCategory] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<WorkoutSession | null>(null);
  const [popupPowerTags, setPopupPowerTags] = useState<string[]>([]);
  const [popupWorkoutStats, setPopupWorkoutStats] = useState<WorkoutStats | null>(null);
  const [popupPowerSetLogs, setPopupPowerSetLogs] = useState<PowerSetLog[]>([]);
  const [popupTrackingLogs, setPopupTrackingLogs] = useState<TrackingLog[]>([]);
  const [popupRoundGroups, setPopupRoundGroups] = useState<WorkoutGroup[]>([]);
  const [popupLoadRecords, setPopupLoadRecords] = useState<WorkoutLoadRecord[]>([]);
  const [joiningSession, setJoiningSession] = useState(false);

  useEffect(() => {
    if (!activityId) return;
    // Logged-in viewers get the full session (joinedCount, participants, etc.);
    // anonymous share-link visitors can't hit that endpoint, so they use the
    // public preview endpoint instead. Also falls back to the public preview
    // if the authenticated lookup fails (e.g. viewer isn't a participant).
    const sessionPromise = isLoggedIn
      ? getWorkoutSessionById(activityId).catch(() => getPublicWorkoutSession(activityId))
      : getPublicWorkoutSession(activityId);

    sessionPromise
      .then((session) => {
        console.log("[SessionDetails] session fetch resolved:", {
          activityId,
          feedId,
          isLoggedIn,
          commentCount: (session as unknown as { comments?: unknown[] }).comments?.length ?? 0,
          rawComments: (session as unknown as { comments?: unknown[] }).comments,
        });
        setSessionProgramImage(session.workoutImage || null);
        setSessionWorkoutCategory(session.workoutCategory || null);
        setSessionData(session as unknown as WorkoutSession);

        const programCode = session.program_id || session.workout_code;
        if (programCode) {
          getProgramTags(programCode)
            .then((rawTags) => {
              const labels = (rawTags || []).map(getPowerSetLabel).filter(Boolean) as string[];
              setPopupPowerTags(labels);
            })
            .catch(() => setPopupPowerTags([]));

          getProgramGroupedWorkouts(programCode)
            .then((groups) => {
              const getSortKey = (label: string) => {
                const upper = (label || "").toUpperCase();
                const m = upper.match(/^ROUND\s+(\d+)/);
                if (m) return 1000 + parseInt(m[1], 10);
                if (upper.includes("FINISH")) return Infinity;
                return 0;
              };
              const sorted = [...groups].sort((a, b) => getSortKey(a.label) - getSortKey(b.label));
              setPopupRoundGroups(sorted);
            })
            .catch(() => setPopupRoundGroups([]));
        } else {
          setPopupRoundGroups([]);
          setPopupPowerTags([]);
        }
      })
      .catch(() => {
        setSessionProgramImage(null);
        setSessionWorkoutCategory(null);
        setSessionData(null);
        setPopupRoundGroups([]);
        setPopupPowerTags([]);
      });

    // Authenticated-only endpoints — skip entirely when logged out rather
    // than firing them and risking a delayed, degenerate (e.g. all-zero)
    // success response overwrite the correct public-data-derived Results/
    // Load Chart a moment after they first render correctly.
    if (isCompleted && isLoggedIn) {
      getWorkoutStats(activityId).then(setPopupWorkoutStats).catch(() => setPopupWorkoutStats(null));
      getPowerSetLogs(activityId).then(setPopupPowerSetLogs).catch(() => setPopupPowerSetLogs([]));
      getTrackingLogs({ sessionId: activityId }).then(setPopupTrackingLogs).catch(() => setPopupTrackingLogs([]));
      getWorkoutLoadRecords(activityId).then(setPopupLoadRecords).catch(() => setPopupLoadRecords([]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activityId]);

  const formatSessionDate = (dateStr?: string | null): string => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return (
      d.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }) +
      " @ " +
      d.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).toLowerCase()
    );
  };

  const stripPrefix = (val: string | number | undefined, prefix: string) => {
    const s = String(val ?? "");
    return s.toLowerCase().startsWith(prefix.toLowerCase()) ? s : `${prefix} ${s}`;
  };
  const weekDay = sessionData?.week && sessionData?.day
    ? `${stripPrefix(sessionData.week, "Week")} / ${stripPrefix(sessionData.day, "Day")}`
    : "Single Session";

  const rawCardTitle = sessionData?.title || sessionData?.workoutTitle || feedTitle || "Workout Session";
  const cardTitle = rawCardTitle.replace(/started a session/gi, "").trim() || "Workout Session";

  // The public preview endpoint's workoutLoads come back in round-code order
  // (APP3, BPP3, CPP3…), not creation order — sort chronologically so
  // cumulative deltas/final totals are meaningful (mirrors how the
  // authenticated popupLoadRecords are already assumed to be creation-ordered).
  const sortedWorkoutLoads = sessionData?.workoutLoads
    ? [...sessionData.workoutLoads].sort(
        (a, b) => new Date(a.createdDate || 0).getTime() - new Date(b.createdDate || 0).getTime(),
      )
    : [];

  // Query-string values come from whatever the sharer's client had on hand at
  // share time and are sometimes blank (e.g. no profile photo set) — the
  // session API's own owner record is the source of truth, so prefer it.
  const effectiveUserName = userName || sessionData?.owner?.name || "";
  const effectiveUserUsername = userUsername || sessionData?.owner?.username || "";
  const effectiveUserImage = userImage || sessionData?.owner?.image || "";

  // The public preview endpoint returns comments alongside the rest of the
  // session data (no auth needed) — hand these to FeedComments so anonymous
  // viewers see the real list instead of a "log in to view" wall.
  const publicComments: FeedComment[] | undefined = sessionData?.comments?.map((c, idx) => ({
    id: (c.id as string) ?? `public-${idx}`,
    text: c.text ?? (c as { comment?: string }).comment,
    created_at: c.createdAt ?? (c as { created_at?: string }).created_at,
    user: c.user
      ? { id: 0, name: c.user.name ?? "", username: c.user.username ?? "", image: c.user.image }
      : undefined,
  }));
  console.log("[SessionDetails] derived publicComments passed to FeedComments:", publicComments, "| feedId:", feedId, "| requireLogin:", !isLoggedIn);

  const handleJoinSession = async () => {
    if (joiningSession) return;
    if (!isLoggedIn) {
      setAuthPrompt("join");
      return;
    }
    if (type === "CompleteCardio") {
      const p = new URLSearchParams({
        feedId: String(feedId),
        userName: effectiveUserName,
        userUsername: effectiveUserUsername,
        userImage: effectiveUserImage,
        title: feedTitle,
        date,
      });
      router.push(`/feed/cardio-session?${p.toString()}`);
      return;
    }

    const code = sessionData?.program_id || sessionData?.workout_code || "";
    const hostSessionId = activityId || feedId;
    localStorage.setItem("workoutProgramCode", code);
    localStorage.setItem("workoutTitle", sessionData?.title || feedTitle || "");
    localStorage.setItem("workoutName", sessionData?.programName || "");
    localStorage.setItem("workoutIsFree", "true");

    if (!isOwnWorkout && !isCompleted) {
      setJoiningSession(true);
      try {
        const created = await createWorkoutSession({
          workoutLibraryId: code,
          refSessionId: hostSessionId,
        });
        const newSessionId = created.session?.id;
        if (newSessionId) {
          await createFeedPost({ sessionId: newSessionId, workoutLibraryId: code }).catch(() => {});
          if (code) localStorage.setItem(`activeSessionId_${code.toUpperCase()}`, newSessionId);
          localStorage.setItem("sessionActive", "true");
          localStorage.setItem("returningFromAthenaWorkout", "true");
          router.push("/workout/viewWorkoutSession");
          return;
        }
      } catch {
        // Fall through to reopening the host's session below if creating
        // a linked session failed, rather than leaving the button inert.
      } finally {
        setJoiningSession(false);
      }
    }

    if (code) localStorage.setItem(`activeSessionId_${code.toUpperCase()}`, hostSessionId);
    localStorage.setItem("sessionActive", "true");
    localStorage.setItem("returningFromAthenaWorkout", "true");
    router.push("/workout/viewWorkoutSession");
  };

  const AUTH_PROMPT_COPY = {
    engage: { heading: "Join the conversation", subtitle: "Log in or sign up to like and comment" },
    join: { heading: "View this workout", subtitle: "Log in or sign up to start the session" },
  } as const;

  const AuthPromptModal = () => {
    if (!authPrompt) return null;
    const copy = AUTH_PROMPT_COPY[authPrompt];
    return (
      <div
        className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={() => setAuthPrompt(null)}
      >
        <div
          className="relative w-full max-w-3xl overflow-hidden rounded-3xl px-6 py-10 md:px-12 md:py-14 shadow-2xl"
          style={{ background: "linear-gradient(135deg, #8B5CF6, #6202AC)" }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setAuthPrompt(null)}
            className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition"
          >
            <X size={15} className="text-white" />
          </button>

          <div className="relative z-10 max-w-xs md:max-w-sm">
            <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center mb-4">
              <AlertCircle size={20} className="text-white" />
            </div>
            <h3 className="text-white font-medium text-3xl md:text-4xl mb-2">{copy.heading}</h3>
            <p className="text-white/80 text-sm md:text-base mb-6">{copy.subtitle}</p>
            <button
              onClick={() => router.push(loginUrl)}
              className="bg-white text-purple-700 font-bold text-sm px-5 py-3 rounded-full hover:bg-gray-50 transition"
            >
              Log in or Sign up
            </button>
          </div>

          {/* Decorative phone-in-ring graphic — bottom-anchored so the phone's
              bottom edge is never clipped by the card */}
          <img
            src="/images/Visual.png"
            alt=""
            className="hidden sm:block absolute right-2 md:right-6 bottom-0 w-64 md:w-80 pointer-events-none select-none"
          />
        </div>
      </div>
    );
  };

  return (
    <>
      <div className={`bg-white rounded-3xl border border-gray-100 shadow-sm ${compact ? "p-4" : "p-5 md:p-8"}`}>
        {/* AVATAR + USERNAME — centered */}
        <div className={`flex flex-col items-center ${compact ? "mb-3" : "mb-4"}`}>
          <button
            onClick={() => effectiveUserUsername && router.push(`/profile/${encodeURIComponent(effectiveUserUsername)}`)}
            className={`${compact ? "w-14 h-14" : "w-20 h-20"} rounded-full overflow-hidden flex items-center justify-center shadow-md ring-4 ring-purple-50 cursor-pointer`}
            style={{ background: "linear-gradient(135deg,#8b5cf6,#6366f1)" }}
          >
            {effectiveUserImage ? (
              <img src={effectiveUserImage} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className={`text-white font-bold ${compact ? "text-lg" : "text-2xl"}`}>
                {(effectiveUserName || effectiveUserUsername || "U").charAt(0).toUpperCase()}
              </span>
            )}
          </button>
          <p className={`font-bold text-gray-900 leading-tight mt-2 ${compact ? "text-sm" : "text-base mt-3"}`}>
            {effectiveUserName || effectiveUserUsername || "User"}
          </p>
          <button
            onClick={() => effectiveUserUsername && router.push(`/profile/${encodeURIComponent(effectiveUserUsername)}`)}
            className="text-purple-500 text-sm hover:underline cursor-pointer"
          >
            @{effectiveUserUsername || "user"}
          </button>
        </div>

        {/* Completed badge */}
        {isCompleted && (
          <div className={`flex justify-center ${compact ? "mb-3" : "mb-4"}`}>
            <div className={`flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 font-bold rounded-full ${compact ? "text-[11px] px-3 py-1" : "text-[12px] px-3.5 py-1.5"}`}>
              <CheckCircle2 size={compact ? 12 : 14} />
              Workout Completed
            </div>
          </div>
        )}

        {/* WORKOUT CARD */}
        <button
          onClick={handleJoinSession}
          className={`group relative w-full rounded-2xl overflow-hidden block text-left bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg transition-transform hover:scale-[1.01] ${compact ? "h-36 mb-3" : "h-52 md:h-64 mb-5"}`}
        >
          {sessionProgramImage ? (
            <img src={sessionProgramImage} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
          ) : (
            <Dumbbell size={compact ? 64 : 96} className="absolute inset-0 m-auto text-white/20 rotate-[-20deg]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

          <div className={`absolute ${compact ? "top-2.5 right-2.5" : "top-4 right-4"}`}>
            <span className={`bg-white/20 backdrop-blur-sm text-white font-bold rounded-full uppercase tracking-wide truncate inline-block ${compact ? "text-[9px] px-2 py-1 max-w-[110px]" : "text-[10px] px-3 py-1.5 max-w-[140px]"}`}>
              {(sessionData?.franchiseCode || type || "WORKOUT").toUpperCase()}
            </span>
          </div>

          <div className={`absolute bottom-0 left-0 right-0 ${compact ? "p-3" : "p-5"}`}>
            <p className="text-white/80 text-[11px] font-bold uppercase tracking-wide mb-1">
              {sessionData?.programName || type}
            </p>
            <p className={`text-white font-bold leading-snug mb-2 line-clamp-2 ${compact ? "text-sm" : "text-lg md:text-xl"}`}>
              {cardTitle}
            </p>
            {popupPowerTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {popupPowerTags.map((label, idx) => (
                  <span key={idx} className="bg-blue-500 text-white text-[11px] font-bold px-3 py-1 rounded-full">
                    {label}
                  </span>
                ))}
              </div>
            )}
            {(sessionWorkoutCategory || title2) && (
              <p className="text-white/90 text-sm font-semibold">
                {sessionWorkoutCategory || title2}
              </p>
            )}
          </div>
        </button>

        {/* Info row: week/day pill + like + people count */}
        <div className={`flex items-center justify-between ${compact ? "mb-3" : "mb-4"}`}>
          <span className={`bg-blue-50 text-blue-600 font-bold rounded-full border border-blue-100 ${compact ? "text-[11px] px-3 py-1" : "text-[12px] px-3.5 py-1.5"}`}>
            {weekDay}
          </span>
          <div className={`flex items-center ${compact ? "gap-3" : "gap-4"}`}>
            <button
              onClick={() => (isLoggedIn ? toggleLike() : setAuthPrompt("engage"))}
              className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 transition"
            >
              <Heart size={compact ? 15 : 17} className={isLiked ? "fill-red-500 text-red-500" : "text-red-500"} />
              <span className={`font-semibold ${compact ? "text-[12px]" : "text-[13px]"}`}>{likeCount}</span>
            </button>
            <div className="flex items-center gap-1.5 text-gray-500">
              <Users size={compact ? 15 : 17} />
              <span className={`font-semibold ${compact ? "text-[12px]" : "text-[13px]"}`}>{sessionData?.joinedCount ?? joinedCountParam}</span>
            </div>
            {!!sessionData?.liveUserCount && (
              <div className="flex items-center gap-1.5 text-gray-500">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                </span>
                <span className={`font-semibold ${compact ? "text-[12px]" : "text-[13px]"}`}>{sessionData.liveUserCount} live</span>
              </div>
            )}
          </div>
        </div>

        {/* Date box */}
        <div className={`flex items-center gap-2 bg-gray-50 rounded-xl border border-gray-100 ${compact ? "px-3 py-2.5 mb-3" : "px-4 py-3 mb-5"}`}>
          <CalendarDays size={compact ? 13 : 15} className="text-gray-400 flex-shrink-0" />
          <span className={`text-gray-500 font-medium ${compact ? "text-[12px]" : "text-[13px]"}`}>
            {formatSessionDate(date)}
          </span>
        </div>

      {/* Results section — prefers the authenticated per-round records, then
          authenticated workout stats, then falls back to the public preview
          endpoint's workoutLoads (final chronological entry = the session's
          true cumulative totals; sessionData.stats turned out to just mirror
          the first round logged, not the totals, so it's the last resort). */}
      {isCompleted && (popupLoadRecords.length > 0 || popupWorkoutStats?.thisWorkout || sortedWorkoutLoads.length > 0 || sessionData?.stats) && (() => {
        const lastRecord = popupLoadRecords[popupLoadRecords.length - 1];
        const lastPublicLoad = sortedWorkoutLoads[sortedWorkoutLoads.length - 1];
        // A viewer without real access to this session's stats can still get
        // a successful (not erroring) response here that's just all zeros —
        // truthy, so `??` alone would let it beat the correct public-data
        // fallback below the moment it resolves. Only trust it if it's
        // actually non-degenerate.
        const workoutStatsTotals = popupWorkoutStats?.thisWorkout;
        const hasRealStats = !!workoutStatsTotals && (
          (workoutStatsTotals.load ?? 0) > 0 || (workoutStatsTotals.power ?? 0) > 0 || (workoutStatsTotals.cals ?? 0) > 0
        );
        const totals = lastRecord
          ? {
              load: Number(lastRecord.load) || 0,
              power: Number(lastRecord.power) || 0,
              cals: Number(lastRecord.kcal) || 0,
            }
          : hasRealStats
            ? workoutStatsTotals!
            : (
              lastPublicLoad
                ? {
                    load: Number(lastPublicLoad.load) || 0,
                    power: Number(lastPublicLoad.power) || 0,
                    cals: Number(lastPublicLoad.kcal) || 0,
                  }
                : sessionData?.stats
                  ? {
                      load: sessionData.stats.load ?? 0,
                      power: sessionData.stats.power ?? 0,
                      cals: sessionData.stats.calories ?? 0,
                    }
                  : { load: 0, power: 0, cals: 0 }
            );
        const hasLoggedData = totals.load > 0 || totals.power > 0 || totals.cals > 0
          || popupTrackingLogs.length > 0 || popupPowerSetLogs.length > 0;
        return (
          <div className="mb-4">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Results</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Load", value: totals.load },
                { label: "Power", value: totals.power },
                { label: "Kcal", value: totals.cals },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-2xl py-3 text-center border border-gray-100">
                  <p className="text-[20px] font-extrabold text-gray-900">
                    {!hasLoggedData ? "n/a" : value ?? "—"}
                  </p>
                  <p className="text-[10px] text-gray-400 font-medium mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Load chart (simple CSS bars) — same authenticated-first, public-preview-
          fallback ordering as the Results section above. */}
      {isCompleted && (
        popupLoadRecords.length > 0 ||
        popupRoundGroups.length > 0 ||
        popupTrackingLogs.length > 0 ||
        (popupWorkoutStats?.loadChart && popupWorkoutStats.loadChart.length > 0) ||
        sortedWorkoutLoads.length > 0 ||
        (sessionData?.loadChart && sessionData.loadChart.length > 0)
      ) && (
        <div className="mb-4">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Load Chart</p>
          <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100">
            {(() => {
              const normalize = (s: string) => (s || "").toUpperCase().replace(/[^A-Z0-9]/g, "");

              const bars = popupLoadRecords.length > 0
                ? popupLoadRecords.map((r, i) => {
                    const prev = i > 0 ? Number(popupLoadRecords[i - 1].load) || 0 : 0;
                    const value = Math.max(0, (Number(r.load) || 0) - prev);
                    const label = popupRoundGroups.length === popupLoadRecords.length
                      ? popupRoundGroups[i].label
                      : r.title || `R${i + 1}`;
                    return { label, value };
                  })
                : popupRoundGroups.length > 0 && popupTrackingLogs.length > 0
                  ? popupRoundGroups.map((group) => {
                      const key = normalize(group.label);
                      const value = popupTrackingLogs
                        .filter((log) => {
                          const logKey = normalize(log.title);
                          return logKey && key && (logKey.startsWith(key) || key.startsWith(logKey));
                        })
                        .reduce((sum, log) => sum + (log.load ?? 0), 0);
                      return { label: group.label, value };
                    })
                  : popupTrackingLogs.length > 0
                    ? popupTrackingLogs.map((log, i) => ({ label: log.title || `R${i + 1}`, value: log.load ?? 0 }))
                    : popupWorkoutStats?.loadChart && popupWorkoutStats.loadChart.length > 0
                      ? popupWorkoutStats.loadChart.map((val, i) => ({ label: `R${i + 1}`, value: val }))
                      : sortedWorkoutLoads.length > 0
                        ? sortedWorkoutLoads.map((w, i) => {
                            const prev = i > 0 ? Number(sortedWorkoutLoads[i - 1].load) || 0 : 0;
                            const value = Math.max(0, (Number(w.load) || 0) - prev);
                            const label = popupRoundGroups.length === sortedWorkoutLoads.length
                              ? popupRoundGroups[i].label
                              : w.title || `R${i + 1}`;
                            return { label, value };
                          })
                        : (sessionData?.loadChart || []).map((val, i) => ({ label: `R${i + 1}`, value: val }));

              const rawMax = Math.max(...bars.map((b) => b.value), 1);
              const magnitude = Math.pow(10, Math.floor(Math.log10(rawMax)));
              const steps = [1, 1.5, 2, 3, 4, 5, 10];
              const step = steps.find((s) => rawMax <= s * magnitude) ?? 10;
              const axisMax = step * magnitude;
              const ticks = [4, 3, 2, 1, 0].map((n) => Math.round((axisMax * n) / 4));

              return (
                <div className="flex gap-2">
                  <div className="flex flex-col justify-between h-16 mt-[17px] text-[9px] text-gray-400 font-medium text-right">
                    {ticks.map((t, i) => (
                      <span key={i}>{t}</span>
                    ))}
                  </div>
                  <div className="flex-1 flex items-end gap-1.5 min-w-0">
                    {bars.map((b, i) => (
                      <div key={i} className="flex-1 min-w-0 flex flex-col items-center">
                        <span className="text-[9px] font-bold text-gray-600 mb-1">{b.value}</span>
                        <div className="w-full h-16 flex items-end">
                          <div
                            className="w-full rounded-t-md bg-cyan-400"
                            style={{ height: `${Math.max(4, (b.value / axisMax) * 64)}px` }}
                          />
                        </div>
                        <span className="text-[8px] text-gray-400 truncate w-full text-center uppercase mt-1" title={b.label}>
                          {b.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Power Set Logs */}
      {isCompleted && popupPowerSetLogs.length > 0 && (
        <div className="mb-4">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">$ Sets</p>
          <div className="grid grid-cols-2 gap-2">
            {popupPowerSetLogs.map((log, idx) => (
              <div key={idx} className="bg-gray-50 rounded-2xl p-3 border border-gray-100">
                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center mb-1.5">
                  <span className="text-[11px] font-extrabold text-purple-700">$</span>
                </div>
                <p className="text-[11px] font-bold text-gray-800 leading-tight mb-1 uppercase">{log.exercise || log.title}</p>
                {log.weight != null && <p className="text-[12px] font-extrabold text-gray-900">{log.weight} kg</p>}
                {log.reps != null && <p className="text-[10px] text-gray-400">{log.reps} reps</p>}
                {log.opm && <p className="text-[10px] text-gray-400 mt-0.5">{log.opm}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View/Join button — hidden only for your own completed session */}
      {(!isCompleted || !isOwnWorkout) && (
        <button
          onClick={handleJoinSession}
          disabled={joiningSession}
          className={`w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-60 text-white font-bold rounded-2xl transition shadow-md hover:shadow-lg mb-3 ${compact ? "py-3 text-[13px]" : "py-3.5 text-[15px]"}`}
        >
          {joiningSession ? "Joining..." : "View / Join Session"}
        </button>
      )}

        {/* Workout Preview — viewable without login, unlike joining/liking/commenting */}
        <button
          onClick={() => {
            const code = sessionData?.program_id || sessionData?.workout_code || programCode || "";
            const title = sessionData?.title || feedTitle || "";
            localStorage.setItem("workoutProgramCode", code);
            localStorage.setItem("workoutTitle", title);
            localStorage.setItem("workoutName", sessionData?.programName || "");
            localStorage.setItem("workoutIsFree", "true");
            const p = new URLSearchParams();
            if (code) p.set("code", code);
            if (title) p.set("workoutKey", title);
            router.push(`/workout/detail?${p.toString()}`);
          }}
          className={`w-full flex items-center justify-center gap-1.5 font-semibold transition ${compact ? "text-[13px]" : "text-sm"} ${
            isCompleted && isOwnWorkout ? "text-purple-600 hover:text-purple-700" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Workout Preview <ArrowRight size={compact ? 13 : 15} />
        </button>
      </div>

      {/* Comments — visible to everyone; logged-out users trying to comment
          get the auth-prompt popup instead of the input opening */}
      {feedId && (
        <div className={`bg-white rounded-3xl border border-gray-100 shadow-sm mt-5 ${compact ? "p-4" : "p-5 md:p-8"}`}>
          <FeedComments
            feedId={String(feedId)}
            requireLogin={!isLoggedIn}
            onRequireLogin={() => setAuthPrompt("engage")}
            publicComments={publicComments}
          />
        </div>
      )}

      <AuthPromptModal />
    </>
  );
}
