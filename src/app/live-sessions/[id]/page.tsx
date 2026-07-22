"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Activity,
  Zap,
  Flame,
  Folder,
  MapPin,
  Radio,
  X,
  RotateCcw,
  Users,
  Play,
  CheckCircle2,
  Heart,
  MessageCircle,
} from "lucide-react";
import { getClosedSessionDetails, ClosedSessionDetails } from "@/api/workouts/route";
import { feedApi } from "@/api/feed/route";

// Hardcoded on mobile too (LiveSessionDetailScreen line 224-232) — not
// sourced from the API, so every session shows the same three tags.
const TAG_PILLS = ["Strength", "Hypertrophy", "Posterior Chain"];

// Web counterpart of mobile's LiveSessionDetailScreen (closed-session detail).
// "Resume" and "Set Tracking" are commented out/disabled on mobile too, so
// they're skipped here as well.
export default function LiveSessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [detail, setDetail] = useState<ClosedSessionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [likePending, setLikePending] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setNotFound(false);
    getClosedSessionDetails(id)
      .then((d) => {
        setDetail(d);
        setIsLiked(!!d.isLiked);
        setLikeCount(d.likeCount ?? 0);
        setCommentCount(d.commentCount ?? d.comments?.length ?? 0);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const toggleLike = async () => {
    if (!detail?.feedPostId || likePending) return;
    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setLikeCount((c) => (wasLiked ? c - 1 : c + 1));
    setLikePending(true);
    try {
      await (wasLiked ? feedApi.unlikeFeed(detail.feedPostId) : feedApi.likeFeed(detail.feedPostId));
    } catch {
      setIsLiked(wasLiked);
      setLikeCount((c) => (wasLiked ? c + 1 : c - 1));
    } finally {
      setLikePending(false);
    }
  };

  // Both pure navigation on mobile too — goBack() / navigate('WorkoutModule',
  // { isPlayMode: false }). isPlayMode: false is the key part: it opens the
  // workout module WITHOUT auto-starting/joining a session — the user still
  // has to press Start/Resume themselves once there.
  const handleClose = () => router.back();
  const handleNewSession = () => {
    if (!detail) return;
    const code = detail.workout_code || detail.program_id || "";
    if (code) {
      const upperCode = code.toUpperCase();
      localStorage.setItem("workoutProgramCode", code);
      localStorage.setItem("workoutTitle", title);
      localStorage.setItem("workoutName", detail.programName || "");
      // Clear any stale session pointer for this program so the overview
      // page treats this as a fresh browse (Start-a-Session state) instead
      // of silently rejoining/auto-engaging a previous session.
      localStorage.removeItem(`activeSessionId_${upperCode}`);
      localStorage.removeItem(`swappedExercises_${upperCode}`);
    }
    localStorage.removeItem("sessionActive");
    router.push("/workout/viewWorkoutSession");
  };

  const title = detail?.workoutTitle || "Workout Session";
  const coachName = detail?.prescribedBy?.name || null;
  const stats = detail?.stats;
  const metrics = detail?.sessionMetrics;
  const compareGroup = detail?.compareGroup;

  return (
    <div className="min-h-screen bg-[#f0eff4]">
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={28} className="animate-spin text-[#8B5CF6]" />
        </div>
      ) : notFound || !detail ? (
        <div className="p-5">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-500 hover:bg-gray-50 transition mb-6"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
            <p className="text-gray-400 text-sm font-medium">Session not found.</p>
          </div>
        </div>
      ) : (
        <>
          {/* Header — full-bleed purple gradient hero, matches the rest of the
              app's session-viewing surfaces (SessionViewsPanel's Results/
              Powersets/Map banners use the same gradient). Extends down to
              include the stat cards, same as mobile's LiveSessionDetailScreen. */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] px-5 sm:px-8 lg:px-12 pt-5 pb-8 lg:pt-8 lg:pb-10">
            <div className="pointer-events-none absolute -top-16 -right-16 w-72 h-72 rounded-full bg-white/[0.07]" />
            <div className="pointer-events-none absolute bottom-0 left-0 -translate-x-1/3 translate-y-1/3 w-56 h-56 rounded-full bg-white/[0.07]" />

            <div className="relative z-10 max-w-6xl mx-auto">
              {/* Back + LIVE badge row */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => router.back()}
                  className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition"
                >
                  <ArrowLeft size={16} />
                </button>
                <span className="inline-flex items-center gap-1.5 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                  </span>
                  Live
                </span>
                <div className="w-9" />
              </div>

              {/* Icon + title block — stacked on mobile, side-by-side on
                  desktop so wide viewports aren't just a centered narrow
                  column of empty space. */}
              <div className="flex flex-col lg:flex-row lg:items-center gap-5 lg:gap-8 mt-6 lg:mt-8">
                <div className="flex flex-col items-center text-center lg:items-start lg:text-left lg:shrink-0">
                  <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-white flex items-center justify-center shadow-md mb-4">
                    <Activity size={26} className="text-[#7c3aed]" />
                  </div>

                  {detail.programName && (
                    <p className="text-white/70 text-[11px] font-bold uppercase tracking-widest mb-1">
                      {detail.programName}
                    </p>
                  )}
                  <h1 className="text-white font-black text-2xl lg:text-4xl leading-tight uppercase">{title}</h1>

                  <div className="flex items-center justify-center lg:justify-start gap-1.5 flex-wrap text-white/70 text-[12px] font-medium mt-2.5">
                    {coachName && <span>Coach {coachName}</span>}
                    {coachName && detail.programName && <span className="opacity-50">&middot;</span>}
                    {detail.programName && (
                      <span className="flex items-center gap-1">
                        <Folder size={11} />
                        {detail.programName}
                      </span>
                    )}
                    {detail.locationName && (detail.programName || coachName) && <span className="opacity-50">&middot;</span>}
                    {detail.locationName && (
                      <span className="flex items-center gap-1">
                        <MapPin size={11} />
                        {detail.locationName}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-center lg:justify-start gap-1.5 flex-wrap mt-3.5">
                    {TAG_PILLS.map((tag) => (
                      <span
                        key={tag}
                        className="bg-white/15 text-white text-[11px] font-semibold px-3 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-3 gap-3 lg:gap-4 flex-1 lg:max-w-2xl">
                  {[
                    { label: "Load", value: stats?.load, accent: "#3B82F6", icon: <Activity size={20} /> },
                    { label: "Power", value: stats?.power, accent: "#F59E0B", icon: <Zap size={20} /> },
                    { label: "Calories", value: stats?.calories, accent: "#F97316", icon: <Flame size={20} /> },
                  ].map(({ label, value, accent, icon }) => (
                    <div
                      key={label}
                      className="rounded-2xl bg-white/15 p-4 lg:p-5 flex flex-col items-center justify-center text-white min-h-[100px] lg:min-h-[120px] border-b-[3px]"
                      style={{ borderBottomColor: accent }}
                    >
                      <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center mb-2">
                        {icon}
                      </div>
                      <p className="text-[24px] lg:text-[28px] font-black leading-none">{value ?? "—"}</p>
                      <p className="text-[11px] opacity-75 mt-1">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Below the fold — two columns on desktop so the page uses the
              full width instead of one narrow stacked column. */}
          <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-12 py-6">
            <div className="grid lg:grid-cols-2 gap-5">
              <div className="space-y-5">
                {/* Session Controls */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Radio size={16} className="text-[#7c3aed]" />
                    <p className="text-[14px] font-black text-[#1a1825]">Session Controls</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleClose}
                      className="flex items-center justify-center gap-1.5 bg-red-500 hover:bg-red-600 text-white font-bold text-[13px] py-3 rounded-xl transition"
                    >
                      <X size={14} />
                      Close
                    </button>
                    <button
                      onClick={handleNewSession}
                      className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#7c3aed] to-[#6D28D9] hover:opacity-90 text-white font-bold text-[13px] py-3 rounded-xl transition"
                    >
                      <RotateCcw size={14} />
                      New Session
                    </button>
                  </div>
                </div>

                {/* Session Metrics */}
                {metrics && (
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Viewed", value: metrics.viewed, bg: "bg-blue-50", color: "text-blue-500", icon: <Users size={16} /> },
                      { label: "Started", value: metrics.started, bg: "bg-amber-50", color: "text-amber-500", icon: <Play size={16} /> },
                      { label: "Completed", value: metrics.completed, bg: "bg-emerald-50", color: "text-emerald-500", icon: <CheckCircle2 size={16} /> },
                    ].map(({ label, value, bg, color, icon }) => (
                      <div key={label} className={`${bg} rounded-2xl py-4 flex flex-col items-center justify-center`}>
                        <div className={`${color} mb-1`}>{icon}</div>
                        <p className="text-[16px] font-black text-[#1a1825] leading-none">{value ?? 0}</p>
                        <p className="text-[10px] text-gray-400 font-semibold mt-0.5">{label}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-5">
                {/* Compare to Group */}
                {compareGroup && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Activity size={16} className="text-[#7c3aed]" />
                      <p className="text-[14px] font-black text-[#1a1825]">Compare to Group</p>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-[#f5f0ff] rounded-2xl py-4 text-center">
                        <p className="text-[18px] font-black text-[#7c3aed] leading-none">{compareGroup.yours ?? "—"}</p>
                        <p className="text-[10px] font-bold text-[#7c3aed] mt-1">YOURS</p>
                        <p className="text-[9px] text-gray-400 mt-0.5">lbs</p>
                      </div>
                      <div className="bg-gray-50 rounded-2xl py-4 text-center">
                        <p className="text-[18px] font-black text-[#1a1825] leading-none">{compareGroup.avg ?? "—"}</p>
                        <p className="text-[10px] font-bold text-gray-500 mt-1">AVG.</p>
                        <p className="text-[9px] text-gray-400 mt-0.5">lbs</p>
                      </div>
                      <div className="bg-amber-50 rounded-2xl py-4 text-center">
                        <p className="text-[18px] font-black text-amber-600 leading-none">{compareGroup.best ?? "—"}</p>
                        <p className="text-[10px] font-bold text-amber-600 mt-1">BEST</p>
                        <p className="text-[9px] text-gray-400 mt-0.5">lbs</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Likes & Comments */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-5">
                  <button
                    onClick={toggleLike}
                    disabled={!detail.feedPostId}
                    className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 transition disabled:opacity-50"
                  >
                    <Heart size={17} className={isLiked ? "fill-red-500 text-red-500" : "text-red-500"} />
                    <span className="text-[13px] font-semibold">{likeCount}</span>
                  </button>
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <MessageCircle size={17} />
                    <span className="text-[13px] font-semibold">{commentCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
