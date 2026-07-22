"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Home,
  Users,
  Zap,
  MapPin,
  Play,
  Loader2,
  TrendingUp,
  Award,
  Flame,
  Dumbbell,
  Star,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Edit,
  Lock,
  Activity,
  X,
  Sparkles,
  Trophy,
  Share2,
  Camera,
  Check,
  Waves,
  Pill,
  CupSoda,
  Droplet,
  AlertTriangle,
  CreditCard,
  BarChart3,
} from "lucide-react";

import WorkoutSidebar from "../components/WorkoutSidebar";
import ShareSessionModal from "../components/ShareSessionModal";
import { WorkoutGroup, WorkoutGroupItem, PowerSet } from "@/api/programs/route";
import {
  IncompleteSession,
  WorkoutStats,
  WorkoutLoadRecord,
  getPendingActivities,
  completeActivity,
} from "@/api/workouts/route";
import { UserOtherDetail } from "@/api/dashboard/route";
import { convertToUserUnit } from "@/lib/units";
import { MUSCLE_LABEL_MAP, getSectionColor, resolveWixImage } from "./helpers";

type Props = {
  // Header + rejoin banner/modal JSX, unchanged from page.tsx — rendered
  // above the scrollable content area, inside the MAIN CONTENT wrapper this
  // component owns.
  children: React.ReactNode;

  // layout gating
  sessionStarted: boolean;
  showRejoinBanner: boolean;
  loading: boolean;

  // navigation / shared across sidebar + all views
  activeView: string;
  setActiveView: (v: string) => void;
  setShowSessionModal: (v: boolean) => void;
  router: ReturnType<typeof useRouter>;
  handleStartWorkout: () => Promise<void>;
  handleExerciseTapWithoutSession: () => void;
  isSessionActive: boolean;
  isLocked: boolean;
  activeSession: IncompleteSession | null;
  workoutGroups: WorkoutGroup[];
  workoutTitle: string;
  workoutName: string;
  // "Workout" | "Supplemental" | "Field Workout" | "Conditioning" — which
  // pending-activities list to offer credit against on completion.
  workoutType: string;

  // sidebar-only
  completedSectionsCount: number;

  // Results view
  workoutStats: WorkoutStats | null;

  // Powersets view
  powerSets: PowerSet[];
  powerSetsLoading: boolean;
  expandedPowerSets: Set<number>;
  togglePowerSet: (id: number) => void;
  openVelocityModal: (ps: PowerSet) => void;
  getRoundLabelForSet: (set: any) => string;
  userOtherDetail: UserOtherDetail | null;

  // Map view
  mapLoadRecords: WorkoutLoadRecord[];
  mapSessionLogs: any[];
  mapLoading: boolean;
  collapsedRounds: Set<number>;
  toggleRound: (id: number) => void;

  // Overview view / DynamicExerciseCard
  rejoinLoading: boolean;
  filterByLocation: boolean;
  locationFilteredGroups: WorkoutGroup[];
  setShowPurchaseModal: (v: boolean) => void;
  getActualExercise: (item: WorkoutGroupItem) => WorkoutGroupItem;
  onEditExercise: (item: WorkoutGroupItem) => void;

  // Anonymous preview gating — a logged-out visitor only sees the first
  // section; "View More" surfaces the login/signup prompt instead of the
  // rest of the workout.
  isLoggedIn: boolean;
  onRequireAuth: () => void;
};

function DynamicExerciseCard({
  item,
  locked = false,
  sessionStarted = false,
  onCardClick,
  rounds,
  getActualExercise,
  powerSets,
  openVelocityModal,
  isSessionActive,
  onEditExercise,
}: {
  item: WorkoutGroupItem;
  locked?: boolean;
  sessionStarted?: boolean;
  onCardClick?: () => void;
  rounds?: string;
  getActualExercise: (item: WorkoutGroupItem) => WorkoutGroupItem;
  powerSets: PowerSet[];
  openVelocityModal: (ps: PowerSet) => void;
  isSessionActive: boolean;
  onEditExercise: (item: WorkoutGroupItem) => void;
}) {
  const actualItem = getActualExercise(item);
  // Matches mobile's isHome={!!exercise.swapped_exercise_id} — the
  // backend already flags swapped exercises directly on the item, no
  // need for a separately-computed client-side swap map.
  const isSwapped = !!actualItem.swapped_exercise_id;
  // calculated_weight is the backend's already-computed, already-formatted
  // final weight (handles weight_adj% -> lift-max multiplication itself);
  // the raw `weight` field is sometimes just that multiplier (e.g. 0.65),
  // not an actual weight, so it must never be shown directly. Mirrors
  // mobile's getExerciseWeightToDisplay exactly: it returns
  // exercise.calculated_weight completely as-is with zero client-side
  // conversion or relabeling — whatever unit the backend baked in is
  // trusted outright, since re-deriving/re-converting it client-side (as
  // an earlier version of this fix did) produces wrong numbers.
  const rawCardWeight = (actualItem as unknown as { calculated_weight?: string | null; member_weight?: string | null }).calculated_weight
    ?? (actualItem as unknown as { member_weight?: string | null }).member_weight
    ?? null;
  const cardWeightDisplay =
    rawCardWeight != null && String(rawCardWeight).trim() !== "" && String(rawCardWeight).trim() !== "0"
      ? String(rawCardWeight).trim()
      : "";
  const matchingPowerSet = actualItem.is_power_set
    ? powerSets.find(
        (ps) =>
          ps.id === actualItem.exercise_id ||
          (ps as unknown as { exercise_uuid?: string }).exercise_uuid === actualItem.exercise_id,
      )
    : null;

  return (
    <div
      onClick={!locked && onCardClick ? onCardClick : undefined}
      className={`bg-white rounded-[24px] border border-[#e8e8ef] relative transition-all p-4 min-h-[170px] ${locked ? "opacity-60 blur-[1px] pointer-events-none" : "hover:shadow-md"} ${!locked && onCardClick ? "cursor-pointer" : ""}`}
    >
      <div className="absolute top-2 left-2 flex items-center gap-1">
        {actualItem.is_power_set && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (matchingPowerSet) openVelocityModal(matchingPowerSet);
            }}
            className="text-[9px] font-black text-white bg-emerald-500 rounded-full px-1.5 py-0.5 leading-none hover:bg-emerald-600 transition"
          >
            $
          </button>
        )}
        {isSwapped && <Home size={12} className="text-emerald-500" />}
      </div>

      {/* Matches mobile's showEdit={isPlayMode || isSessionActivated} —
          the pencil only shows once actually engaged in a session, not
          merely once the page has "started" rendering session UI. Power
          sets don't get the pencil at all — the $ badge above opens the
          dedicated PowerSetTrackingModal instead. */}
      {!locked && isSessionActive && !actualItem.is_power_set && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEditExercise(actualItem);
          }}
          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white shadow flex items-center justify-center hover:bg-purple-50 transition z-10"
        >
          <Edit size={11} className="text-[#7c3aed]" />
        </button>
      )}

      {locked && (
        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/90 shadow flex items-center justify-center">
          <Lock size={11} className="text-[#7c3aed]" />
        </div>
      )}

      <div className="w-full h-36 rounded-2xl mx-auto mb-2 mt-4 flex items-center justify-center overflow-hidden">
        {actualItem.demo_gif ? (
          <img
            src={resolveWixImage(actualItem.demo_gif)}
            alt={actualItem.exercise_name}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-[#1e1e22]" />
        )}
      </div>

      {actualItem.supplemental && (
        <div className="flex gap-2 justify-center mb-1 flex-wrap">
          <div className="px-2 py-0.5 rounded-md bg-[#f4f4f5] text-[9px] font-bold text-gray-500 uppercase">
            {actualItem.supplemental}
          </div>
        </div>
      )}

      <h3 className="text-[12px] font-semibold text-center text-[#222] leading-tight min-h-[22px] flex items-center justify-center">
        {actualItem.exercise_name}
      </h3>

      <div className="mt-1 text-center flex items-center justify-center gap-1.5">
        {rounds && (
          <span className="text-[16px] leading-none font-black tracking-tight text-[#7c3aed]">
            {(() => {
              // Same formatting as mobile's ExerciseCard `sets` prop —
              // "(3x)" -> "3x", otherwise strip the parens as a fallback.
              const matchVal = String(rounds).match(/\d+/);
              return matchVal ? `${matchVal[0]}x` : String(rounds).toLowerCase().replace(/[()]/g, "");
            })()}
          </span>
        )}
        <p className="text-[16px] leading-none font-black tracking-tight text-[#222]">
          {actualItem.reps || "—"}
        </p>
      </div>

      {cardWeightDisplay && (
        <p className="text-[10px] font-bold text-black text-center mt-0.5">
          {cardWeightDisplay}
        </p>
      )}

      {/* Per-set breakdown chips for power sets — mirrors mobile's
          ExerciseCard `tags` (child_sets sorted by multiplier, each
          rendered as "{reps} @ {pct}%"). */}
      {actualItem.is_power_set && matchingPowerSet?.child_sets && matchingPowerSet.child_sets.length > 0 && (
        <div className="flex flex-wrap gap-1 justify-center mt-1.5">
          {[...matchingPowerSet.child_sets]
            .sort((a, b) => (a.multiplier ?? 0) - (b.multiplier ?? 0))
            .map((s, idx) => (
              <span
                key={idx}
                className="text-[9px] font-medium text-gray-500 border border-gray-300 rounded-md px-1.5 py-0.5"
              >
                {s.reps} @ {Math.round((s.multiplier || 0) * 100)}%
              </span>
            ))}
        </div>
      )}
    </div>
  );
}

export default function SessionViewsPanel({
  children,
  sessionStarted,
  showRejoinBanner,
  loading,
  activeView,
  setActiveView,
  setShowSessionModal,
  router,
  handleStartWorkout,
  handleExerciseTapWithoutSession,
  isSessionActive,
  isLocked,
  activeSession,
  workoutGroups,
  workoutTitle,
  workoutName,
  workoutType,
  completedSectionsCount,
  workoutStats,
  powerSets,
  powerSetsLoading,
  expandedPowerSets,
  togglePowerSet,
  openVelocityModal,
  getRoundLabelForSet,
  userOtherDetail,
  mapLoadRecords,
  mapSessionLogs,
  mapLoading,
  collapsedRounds,
  toggleRound,
  rejoinLoading,
  filterByLocation,
  locationFilteredGroups,
  setShowPurchaseModal,
  getActualExercise,
  onEditExercise,
  isLoggedIn,
  onRequireAuth,
}: Props) {
  // Mirrors mobile's Complete Workout flow exactly: proceedCompleteWorkout ->
  // WorkoutCompletionModal -> WorkoutCompleteModal, all as overlays directly
  // on the Map view — mobile never navigates to a separate summary page for
  // this, so neither should web (a prior version pushed to
  // /workout/workoutSummary instead; that page still exists but is no
  // longer reached from here).
  const [pendingActivities, setPendingActivities] = useState<{ id: number; label: string }[]>([]);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState<number | null>(null);
  const [completingWorkout, setCompletingWorkout] = useState(false);
  const [showCompleteCongrats, setShowCompleteCongrats] = useState(false);
  // Incomplete-rounds warning — mirrors mobile's Alert on "Complete Workout"
  // with unfinished rounds: "Go Back" (dismiss) or "Complete Anyway"
  // (proceed to the activity picker regardless).
  const [incompleteRoundNames, setIncompleteRoundNames] = useState<string[] | null>(null);
  // "Now what?" post-completion slide deck — same chain as
  // workoutSummary/page.tsx's Skip flow, ported here since completion no
  // longer navigates to that page at all.
  const [showNowWhat, setShowNowWhat] = useState(false);
  const [showNextSlide, setShowNextSlide] = useState(false);
  const [nutritionCount, setNutritionCount] = useState(12);
  const [showSupplementals, setShowSupplementals] = useState(false);
  const [showProgressPhoto, setShowProgressPhoto] = useState(false);
  const [showNextWorkout, setShowNextWorkout] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);

  // Opens the shared ShareSessionModal (src/app/workout/components) from the
  // congrats screen's "Share Workout" button.
  const [showShareModal, setShowShareModal] = useState(false);

  // activeSession can be null/stale even while a session is genuinely
  // active (e.g. after navigating away and back) — fall back to the same
  // localStorage key the rest of this page already treats as the
  // authoritative session id.
  const getCurrentSessionId = (): string => {
    if (typeof window === "undefined") return activeSession?.id ?? activeSession?.session_id ?? "";
    const code = (localStorage.getItem("workoutProgramCode") || "").toUpperCase();
    return activeSession?.id ?? activeSession?.session_id ?? (code ? localStorage.getItem(`activeSessionId_${code}`) : null) ?? "";
  };

  // Leaving to an external page (recovery dashboard, itinerary, supplementals,
  // etc.) from the "Now What" slide deck — same one-shot signal the "Return
  // to Workout" button uses, so that when the user navigates back here (via
  // the browser back button or that page's own back link), the mount effect
  // still treats the session as engaged instead of showing the rejoin
  // banner and hiding the sidebar.
  const navigateAway = (path: string) => {
    localStorage.setItem("returningFromAthenaWorkout", "true");
    router.push(path);
  };

  // Fetches pending activities and opens the completion (activity picker)
  // modal — shared by the "no incomplete rounds" path and the "Complete
  // Anyway" button on the incomplete-rounds warning.
  const openCompletionModal = async () => {
    setIncompleteRoundNames(null);
    try {
      const activities = await getPendingActivities({ type: workoutType || "Workout", workoutName: workoutTitle });
      setPendingActivities(
        activities.map((a) => ({
          id: a.id,
          label: [a.workoutTitle || a.name, a.day && a.time ? `${a.day} at ${a.time}` : a.day || a.time]
            .filter(Boolean)
            .join(" - ") || `Workout #${a.id}`,
        }))
      );
    } catch {
      setPendingActivities([]);
    }
    setSelectedActivityId(null);
    setShowCompletionModal(true);
  };

  const handleCompleteWorkout = async (activityId?: number | null) => {
    setCompletingWorkout(true);
    setShowCompletionModal(false);
    try {
      const code = (localStorage.getItem("workoutProgramCode") || "unknown").toUpperCase();
      const sessionId = getCurrentSessionId();
      await completeActivity({
        sessionId,
        workoutLibraryId: code,
        workoutName: workoutTitle,
        customActivityId: activityId ?? undefined,
      });
      setShowCompleteCongrats(true);
    } catch (err) {
      window.alert(`Error\n${err instanceof Error ? err.message : "Failed to complete workout. Please try again."}`);
    } finally {
      setCompletingWorkout(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-[#f7f7fa] flex">
      {/* Shared sidebar (also used by athenaWorkout.tsx) — only visible once
          session is started, and not while the rejoin banner is up. Stays
          static (non-collapsible) here, matching its original behavior. */}
      {sessionStarted && !showRejoinBanner && (
        <WorkoutSidebar
          title={workoutTitle || "RECONDITIONING"}
          subtitle="Workout"
          progressPercent={workoutGroups.length > 0 ? Math.round((completedSectionsCount / workoutGroups.length) * 100) : 0}
          activeView={activeView}
          onNavClick={(label) => {
            if (label === "Session") setShowSessionModal(true);
            else setActiveView(label);
          }}
          bottomLabel={activeView !== "Overview" ? "Overview" : "Train Session"}
          onBottomClick={activeView !== "Overview" ? () => setActiveView("Overview") : handleStartWorkout}
          bottomDisabled={activeView === "Overview" && !activeSession}
          BottomIcon={activeView !== "Overview" ? Home : Play}
          bottomIconFilled={activeView === "Overview"}
        />
      )}

      {/* MAIN CONTENT */}
      <div className={`flex-1 flex flex-col overflow-hidden ${isSessionActive ? "pb-16 lg:pb-0" : ""}`}>
        {children}

        {/* SCROLLABLE CONTENT AREA */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-10 py-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
          ) : (
            <>
              {activeView === "Results" ? (
                <div className="space-y-4">
                  {/* Banner */}
                  <div className="rounded-[24px] overflow-hidden bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] px-5 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                      <TrendingUp size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-[17px] font-black text-white">Live Results</p>
                      <p className="text-[12px] text-white/70">Real-time performance data</p>
                    </div>
                  </div>

                  {/* Workout Stats from API */}
                  {workoutStats && (
                    <div className="space-y-5">
                      {/* This Workout header */}
                      <div className="flex items-center gap-2">
                        <Award size={18} className="text-[#7c3aed]" />
                        <p className="text-[15px] font-black text-[#222]">This Workout:</p>
                      </div>

                      {/* This Workout — 3 colored cards */}
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          {
                            label: "Load",
                            value: workoutStats.thisWorkout.load,
                            color: "#3B82F6",
                            icon: <TrendingUp size={18} />,
                          },
                          {
                            label: "Power",
                            value: workoutStats.thisWorkout.power,
                            color: "#8B5CF6",
                            icon: <Zap size={18} />,
                          },
                          {
                            label: "Cals",
                            value: workoutStats.thisWorkout.cals,
                            color: "#F97316",
                            icon: <Flame size={18} />,
                          },
                        ].map(({ label, value, color, icon }) => (
                          <div
                            key={label}
                            style={{ backgroundColor: color }}
                            className="rounded-[20px] p-4 flex flex-col items-center justify-center text-white min-h-[110px]"
                          >
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mb-2">
                              {icon}
                            </div>
                            <p className="text-[32px] font-black leading-none">
                              {value}
                            </p>
                            <p className="text-[11px] opacity-80 mt-1">
                              {label}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* This Workout Avg */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Users size={18} className="text-[#7c3aed] shrink-0" />
                          <p className="text-[15px] font-black text-[#222]">
                            This Workout Avg. (all other users):
                          </p>
                        </div>
                        <div className="bg-white rounded-[20px] border border-gray-100 p-4 flex items-stretch">
                          {[
                            {
                              label: "Load",
                              value: workoutStats.overallAverage.load,
                              color: "text-[#3B82F6]",
                            },
                            {
                              label: "Power",
                              value: workoutStats.overallAverage.power,
                              color: "text-[#8B5CF6]",
                            },
                            {
                              label: "Cals",
                              value: workoutStats.overallAverage.cals,
                              color: "text-[#F97316]",
                            },
                          ].flatMap(({ label, value, color }, i) => {
                            const col = (
                              <div key={`col-${label}`} className="flex-1 text-center">
                                <p className="text-[10px] font-bold text-gray-400 mb-1">
                                  {label}
                                </p>
                                <p className={`text-[20px] font-black ${color}`}>
                                  {value}
                                </p>
                              </div>
                            );
                            return i > 0
                              ? [<div key={`div-${label}`} className="w-px self-stretch bg-gray-100 mx-2" />, col]
                              : [col];
                          })}
                        </div>
                      </div>

                      {/* Muscles Used */}
                      {workoutStats.thisWorkout.muscleTracking.length > 0 && (() => {
                        const formatLabel = (muscle: string) =>
                          MUSCLE_LABEL_MAP[muscle] || muscle.replace(/([A-Z])/g, " $1").trim().toUpperCase();
                        const sortedMuscles = [...workoutStats.thisWorkout.muscleTracking].sort(
                          (a, b) => Object.values(b)[0] - Object.values(a)[0],
                        );
                        const activeMuscles = sortedMuscles.filter(
                          (item) => Object.values(item)[0] > 0,
                        );
                        const chartMuscles =
                          activeMuscles.length > 0 ? activeMuscles : sortedMuscles.slice(0, 5);
                        const max = Math.max(
                          ...chartMuscles.map((m) => Object.values(m)[0]),
                          1,
                        );
                        const steps = [max, Math.round(max * 0.6), Math.round(max * 0.3), 0];

                        return (
                          <div className="bg-white rounded-[20px] border border-gray-100 p-5">
                            <p className="text-[15px] font-black text-[#222] mb-4">
                              Muscles Used:
                            </p>
                            <div className="grid grid-cols-3 gap-2">
                              {sortedMuscles.map((item, i) => {
                                const [muscle, value] = Object.entries(item)[0];
                                const label = formatLabel(muscle);
                                const displayValue = value.toFixed(2).replace(/\.00$/, "");
                                return (
                                  <div
                                    key={i}
                                    className="bg-gray-50 rounded-2xl border border-gray-100 py-3 px-2 flex flex-col items-center justify-center text-center"
                                  >
                                    <span className="text-[8px] font-black text-gray-500 tracking-wide truncate w-full">
                                      {label}
                                    </span>
                                    <span className="text-[14px] font-black text-[#222] mt-1">
                                      {displayValue}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Muscle Chart — bar chart */}
                            <div className="mt-6">
                              <p className="text-[15px] font-black text-[#222] mb-4">
                                Muscle Chart:
                              </p>
                              <div className="flex gap-2">
                                {/* Y-axis */}
                                <div
                                  className="flex flex-col justify-between text-[9px] text-gray-400 text-right pr-1 shrink-0"
                                  style={{ height: 120 }}
                                >
                                  {steps.map((s) => (
                                    <span key={s}>{s}</span>
                                  ))}
                                </div>
                                {/* Bars */}
                                <div className="flex-1">
                                  <div
                                    className="flex items-end gap-2"
                                    style={{ height: 120 }}
                                  >
                                    {chartMuscles.map((item, i) => {
                                      const [muscle, value] = Object.entries(item)[0];
                                      const pct = (value / max) * 100;
                                      const label = formatLabel(muscle).slice(0, 8);
                                      return (
                                        <div
                                          key={i}
                                          className="flex-1 flex flex-col items-center justify-end gap-1"
                                          style={{ height: "100%" }}
                                        >
                                          <div
                                            className="rounded-t-lg bg-[#A7F3D0]"
                                            style={{
                                              height: `${Math.max(pct, 2)}%`,
                                              width: "clamp(16px, 40%, 40px)",
                                            }}
                                          />
                                          <span className="text-[7px] text-gray-400 text-center leading-tight">
                                            {label}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              ) : activeView === "Powersets" ? (
                <div className="space-y-4 pb-20">
                  {/* Banner */}
                  <div className="rounded-[24px] overflow-hidden bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] px-5 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                      <Zap size={20} className="text-white" fill="white" />
                    </div>
                    <div>
                      <p className="text-[17px] font-black text-white">Power Sets</p>
                      <p className="text-[12px] text-white/70">Your strength movements</p>
                    </div>
                  </div>

                  {/* Title */}
                  <div className="px-1">
                    {workoutName && (
                      <p className="text-[11px] font-black text-[#7c3aed] uppercase tracking-widest">
                        {workoutName}
                      </p>
                    )}
                    <p className="text-[20px] font-black text-[#111]">{workoutTitle || "POWER SETS"}</p>
                    <p className="text-[12px] text-gray-400">
                      {powerSets.length} power set{powerSets.length !== 1 ? "s" : ""}
                    </p>
                  </div>

                  {powerSetsLoading ? (
                    <div className="flex justify-center py-16">
                      <Loader2 size={28} className="animate-spin text-[#7c3aed]" />
                    </div>
                  ) : powerSets.length === 0 ? (
                    <div className="bg-white rounded-[20px] border border-[#ede9fe] p-10 text-center">
                      <Dumbbell size={36} className="mx-auto mb-3 text-gray-200" />
                      <p className="text-sm text-gray-400">No power sets found for this program.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {powerSets.map((ps, gi) => {
                        const isCollapsed = !expandedPowerSets.has(gi);
                        const thumb = resolveWixImage(ps.demo_gif);
                        const roundLabel = getRoundLabelForSet(ps);
                        const isGray = ps.is_gray;
                        const targetUnit = (userOtherDetail?.measurementUnit || "lbs").toLowerCase();
                        // A power set is complete once its "money set" ($) is
                        // recorded — NOT once every set is, matching
                        // athenaWorkout.tsx's verifyPowerSetsCompletedFor /
                        // mobile's verifyPowerSetsCompletion: the money set is
                        // whichever child is flagged via min_reps, falling
                        // back to the heaviest (last, sorted by multiplier)
                        // set if none is flagged.
                        const sortedChildSets = [...(ps.child_sets ?? [])].sort(
                          (a, b) => (a.multiplier ?? 0) - (b.multiplier ?? 0),
                        );
                        const flaggedMoneySets = sortedChildSets.filter((s) => s.min_reps != null);
                        const moneySets =
                          flaggedMoneySets.length > 0
                            ? flaggedMoneySets
                            : sortedChildSets.length > 0
                            ? [sortedChildSets[sortedChildSets.length - 1]]
                            : [];
                        const isPowerSetComplete =
                          moneySets.length > 0 && moneySets.every((s) => s.isCompleted);
                        return (
                          <div
                            key={`${ps.id || "ps"}-${gi}`}
                            onClick={() => openVelocityModal(ps)}
                            className={`rounded-[20px] border-2 overflow-hidden cursor-pointer ${
                              isPowerSetComplete
                                ? "bg-emerald-50/40 border-emerald-300"
                                : isGray
                                ? "bg-[#f5f5f7] border-gray-200"
                                : "bg-white border-[#ede9fe]"
                            }`}
                          >
                            {/* Card header — click (anywhere except the
                                chevron) opens the modal via the outer card's
                                onClick; only the chevron toggles collapse. */}
                            <div className="w-full flex items-center gap-3 p-4 transition hover:brightness-95">
                              {/* Thumbnail / emoji */}
                              <div className="relative w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden shrink-0 border border-gray-200">
                                {thumb ? (
                                  <img src={thumb} alt={ps.title_secondary} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-2xl">{ps.emoji || "🏋️‍♂️"}</span>
                                )}
                                {isPowerSetComplete && (
                                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                                    <CheckCircle2 size={11} className="text-white" />
                                  </div>
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                {/* Tags row */}
                                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                                  <span className="bg-[#3B82F6] text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                                    {roundLabel}
                                  </span>
                                  {ps.is_money_set && (
                                    <span className="bg-[#8B5CF6] text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wide flex items-center gap-1">
                                      <Star size={10} className="fill-white" />
                                      MONEY SET
                                    </span>
                                  )}
                                  {isPowerSetComplete && (
                                    <span className="bg-emerald-500 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wide flex items-center gap-1">
                                      <CheckCircle2 size={10} />
                                      Completed
                                    </span>
                                  )}
                                </div>
                                <p className="text-[13px] font-black text-[#222] leading-tight">
                                  {ps.title_secondary || ps.title_primary}
                                </p>
                                {ps.child_sets?.length > 0 && (
                                  <p className="text-[11px] text-gray-400 mt-0.5">
                                    {ps.child_sets.length} sets
                                  </p>
                                )}
                              </div>

                              <button
                                onClick={(e) => { e.stopPropagation(); togglePowerSet(gi); }}
                                className="shrink-0 text-gray-400 p-1 -m-1"
                              >
                                {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                              </button>
                            </div>

                            {/* Sets list — shown when expanded */}
                            {!isCollapsed && ps.child_sets?.length > 0 && (
                              <div className="px-4 pb-4">
                                <div className="h-px bg-gray-200 mb-3" />
                                <div className="space-y-1">
                                  {ps.child_sets.map((s, si) => {
                                    const isMainPowerSet = s.min_reps != null;
                                    const repsText = s.reps
                                      ? String(s.reps).toLowerCase().includes("rep") ? s.reps : `${s.reps} reps`
                                      : "—";
                                    const sourceUnit = (s.msrmt || "lbs").toLowerCase();
                                    let displayWeight = s.calculated_weight || 0;
                                    if (sourceUnit === "lbs" && targetUnit === "kg") {
                                      displayWeight = Math.round(displayWeight * 0.45359237);
                                    } else if (sourceUnit === "kg" && targetUnit === "lbs") {
                                      displayWeight = Math.round(displayWeight / 0.45359237);
                                    }
                                    // Mobile's SetRow always shows the computed
                                    // weight unconditionally — no fallback to
                                    // s.label, which isn't a real weight label.
                                    const weightText = `${displayWeight} ${targetUnit}`;
                                    return (
                                      <div
                                        key={`${s.id || "s"}-${si}`}
                                        className="flex items-center gap-3 py-2.5 border-b border-gray-100 last:border-0"
                                      >
                                        {/* Set number circle */}
                                        <div className="w-7 h-7 rounded-full bg-[#ede9fe] flex items-center justify-center shrink-0">
                                          <span className="text-[11px] font-black text-[#7c3aed]">{si + 1}</span>
                                        </div>

                                        {/* Weight / reps stack */}
                                        <div className="flex-1 min-w-0">
                                          <p className="text-[13px] font-bold text-[#222] leading-tight">{weightText}</p>
                                          <p className="text-[11px] text-gray-400 leading-tight">{repsText}</p>
                                        </div>

                                        {isMainPowerSet && (
                                          <span className="text-[9px] font-black bg-[#00BDD6] text-white px-1.5 py-0.5 rounded-full shrink-0">
                                            $
                                          </span>
                                        )}

                                        {/* Completed check */}
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                          s.isCompleted
                                            ? "bg-emerald-500 border-emerald-500"
                                            : "border-gray-300"
                                        }`}>
                                          {s.isCompleted && (
                                            <CheckCircle2 size={12} className="text-white" />
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : activeView === "Map" ? (
                <div className="space-y-4 pb-4">
                  {/* Banner */}
                  <div className="rounded-[24px] overflow-hidden bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] px-5 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                      <MapPin size={20} className="text-white" fill="white" />
                    </div>
                    <div>
                      <p className="text-[17px] font-black text-white">Workout Map</p>
                      <p className="text-[12px] text-white/70">Complete overview</p>
                    </div>
                  </div>

                  {/* Completed-rounds Load/Power/Kcal — mirrors mobile's
                      completedRoundsStats, shown right below the banner. */}
                  {(() => {
                    const completedLoads = mapLoadRecords.filter(
                      (l) => l.workout_complete === true || (l as any).workoutComplete === true,
                    );
                    if (completedLoads.length === 0) return null;
                    const maxLoad = Math.max(...completedLoads.map((r) => r.load || 0));
                    const maxPower = Math.max(...completedLoads.map((r) => r.power || 0));
                    const maxKcal = Math.max(...completedLoads.map((r) => r.kcal || 0));
                    return (
                      <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl px-4 py-3 flex items-center justify-around">
                        <div className="text-center">
                          <p className="text-[11px] font-semibold text-[#64748B] mb-0.5">Load</p>
                          <p className="text-[18px] font-black" style={{ color: "#EF4444" }}>{maxLoad}</p>
                        </div>
                        <div className="w-px h-6 bg-[#CBD5E1]" />
                        <div className="text-center">
                          <p className="text-[11px] font-semibold text-[#64748B] mb-0.5">Power</p>
                          <p className="text-[18px] font-black" style={{ color: "#8E5DF5" }}>{maxPower}</p>
                        </div>
                        <div className="w-px h-6 bg-[#CBD5E1]" />
                        <div className="text-center">
                          <p className="text-[11px] font-semibold text-[#64748B] mb-0.5">Cal</p>
                          <p className="text-[18px] font-black" style={{ color: "#10B981" }}>{maxKcal}</p>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Title */}
                  <div className="px-1">
                    <p className="text-[20px] font-black text-[#111]">{workoutTitle || "WORKOUT"}</p>
                    <p className="text-[12px] text-gray-400">{workoutGroups.length} Rounds • Full Workout</p>
                  </div>

                  {/* Rounds */}
                  {mapLoading ? (
                    <div className="flex justify-center py-10">
                      <Loader2 size={28} className="animate-spin text-[#7c3aed]" />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {[...workoutGroups].sort((a, b) => {
                        const aL = (a.label || "").toUpperCase();
                        const bL = (b.label || "").toUpperCase();
                        if (aL.includes("WARM") && !bL.includes("WARM")) return -1;
                        if (!aL.includes("WARM") && bL.includes("WARM")) return 1;
                        if (aL.includes("ROUND") && !bL.includes("ROUND")) return -1;
                        if (!aL.includes("ROUND") && bL.includes("ROUND")) return 1;
                        const aNum = parseInt(aL.replace(/\D/g, ""), 10) || 0;
                        const bNum = parseInt(bL.replace(/\D/g, ""), 10) || 0;
                        return aNum !== bNum ? aNum - bNum : aL.localeCompare(bL);
                      }).map((group, gi) => {
                        const roundColor = getSectionColor(group.label, gi);
                        const isExpanded = !collapsedRounds.has(gi);
                        const roundLoad = mapLoadRecords.find((l) =>
                          l.title === group.label ||
                          (l as any).workoutId === (group.workouts?.[0] as any)?.id ||
                          l.title === (group.workouts?.[0] as any)?.title
                        );
                        const isRoundComplete = group.isCompleted ||
                          mapLoadRecords.some((l) =>
                            (l.workout_complete === true || (l as any).workoutComplete === true) &&
                            (l.title === group.label ||
                              (l as any).workoutId === (group.workouts?.[0] as any)?.id ||
                              l.workout_id === (group.workouts?.[0] as any)?.id)
                          );
                        const hasPowerSets = group.workouts.some((w) => w.is_power_set);

                        return (
                          <div
                            key={gi}
                            className="bg-white rounded-[20px] overflow-hidden"
                            style={{ border: `1.5px solid ${isRoundComplete ? "#10B981" : "#E5E7EB"}` }}
                          >
                            {/* Stats row — only shown when API returned a load record for this round */}
                            {roundLoad && (
                              <div className="flex items-center gap-4 px-4 pt-3 pb-1">
                                {[
                                  { label: "Load",  value: roundLoad.load  ?? (roundLoad as any).total_load  ?? "-" },
                                  { label: "Power", value: roundLoad.power ?? (roundLoad as any).total_power ?? "-" },
                                  { label: "Cal",   value: roundLoad.kcal  ?? (roundLoad as any).cal ?? (roundLoad as any).calories ?? "-" },
                                ].map(({ label, value }) => (
                                  <div key={label} className="flex items-center gap-1">
                                    <span className="text-[10px] text-gray-400 font-semibold">{label}:</span>
                                    <span className="text-[10px] font-black text-[#111]">{value}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Round header */}
                            <div className="flex items-center px-4 py-3 gap-3">
                              <button
                                type="button"
                                onClick={() => {
                                  // The Map tab is only reachable with an
                                  // active session already in progress (the
                                  // sidebar/tab itself is gated on that), so
                                  // no isSessionActive check is needed here —
                                  // just navigate to the round.
                                  localStorage.setItem("sessionActive", "true");
                                  router.push(`/workout/athenaWorkout?section=${encodeURIComponent(group.label)}`);
                                }}
                                className="flex items-center gap-3 flex-1 min-w-0 text-left"
                              >
                                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: isExpanded ? roundColor : "#F3F4F6" }}>
                                  <Dumbbell size={18} color={isExpanded ? "white" : "#9CA3AF"} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <p className="text-[13px] font-black text-[#111] truncate">{group.label}</p>
                                    {hasPowerSets && (
                                      <span className="text-[9px] font-black bg-emerald-500 text-white px-1.5 py-0.5 rounded-full">$</span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-gray-400">{group.rounds} • {group.workouts.length} exercises</p>
                                </div>
                              </button>
                              <div className="flex items-center gap-2 shrink-0">
                                {isRoundComplete
                                  ? <CheckCircle2 size={16} className="text-emerald-500" />
                                  : <div className="w-4 h-4 rounded-full border-2 border-gray-300" />}
                                <button onClick={() => toggleRound(gi)} className="p-1">
                                  {isExpanded
                                    ? <ChevronUp size={18} style={{ color: roundColor }} />
                                    : <ChevronDown size={18} className="text-gray-400" />}
                                </button>
                              </div>
                            </div>

                            {/* Exercise list */}
                            {isExpanded && (
                              <div className="border-t border-gray-100 px-4 pb-3">
                                {group.workouts.map((ex, exIdx) => {
                                  const anyEx = ex as any;
                                  const exId = ex.exercise_id || "";
                                  const matchingLogs = mapSessionLogs.filter((log: any) => {
                                    const logExId = String(log.exerciseId || "");
                                    const logSpecId = String(log.specializedWorkoutId || "");
                                    return logExId === exId || logSpecId === exId;
                                  });
                                  const sortedLogs = [...matchingLogs].sort((a: any, b: any) => {
                                    const aNum = parseInt((a.title || "").replace(/\D/g, "") || "0", 10);
                                    const bNum = parseInt((b.title || "").replace(/\D/g, "") || "0", 10);
                                    return aNum - bNum;
                                  });
                                  const imgUrl = resolveWixImage(ex.demo_gif);
                                  const isHome = !!anyEx.swapped_exercise_id;
                                  const isMoneySet = !!anyEx.is_money_set;

                                  const matchingPowerSet = ex.is_power_set
                                    ? powerSets.find((ps: any) => ps.id === anyEx.id || ps.exercise_uuid === exId)
                                    : null;
                                  const powerSetChips = matchingPowerSet?.child_sets
                                    ? [...matchingPowerSet.child_sets]
                                        .sort((a, b) => (a.multiplier ?? 0) - (b.multiplier ?? 0))
                                        .map((s) => ({ reps: s.reps, pct: Math.round((s.multiplier || 0) * 100) }))
                                    : null;

                                  const plannedSets = parseInt(String(ex.sets || group.rounds || "1").replace(/\D/g, ""), 10) || 1;
                                  const plannedWeight = anyEx.calculated_weight ?? anyEx.member_weight ?? ex.weight;
                                  // Matches mobile's ExerciseRow exactly: logged
                                  // sets are labeled with the user's actual unit
                                  // (they were entered in that unit already),
                                  // while the planned/fallback weight must be
                                  // converted from the exercise's own storage
                                  // unit via convertToUserUnit — not shown raw.
                                  const weightSourceUnit = anyEx.msrmt || "lbs";
                                  const mapUserUnit = (userOtherDetail?.measurementUnit || "lbs").toLowerCase();
                                  const slotCount = Math.max(powerSetChips?.length || plannedSets || 1, sortedLogs.length);

                                  return (
                                    <button
                                      key={exIdx}
                                      type="button"
                                      onClick={() => {
                                        if (!isSessionActive) {
                                          handleExerciseTapWithoutSession();
                                          return;
                                        }
                                        localStorage.setItem("sessionActive", "true");
                                        router.push(`/workout/athenaWorkout?section=${encodeURIComponent(group.label)}&exercise=${exIdx}`);
                                      }}
                                      className="flex flex-col py-3 border-b border-gray-50 last:border-0 w-full text-left"
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-[#ede9fe] flex items-center justify-center shrink-0">
                                          <span className="text-[10px] font-black text-[#7c3aed]">{exIdx + 1}</span>
                                        </div>
                                        {isHome && (
                                          <div className="w-4 h-4 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                                            <Home size={9} className="text-emerald-500" />
                                          </div>
                                        )}
                                        <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                                          {imgUrl ? (
                                            <img src={imgUrl} alt={ex.exercise_name} className="w-full h-full object-cover" />
                                          ) : (
                                            <span className="text-base">🏋️</span>
                                          )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          {ex.supplemental && (
                                            <p className="text-[10px] font-bold text-gray-400 uppercase truncate">{ex.supplemental}</p>
                                          )}
                                          <div className="flex items-center gap-1.5 flex-wrap">
                                            <p className="text-[12px] font-black text-[#111] truncate">{ex.exercise_name}</p>
                                            {isMoneySet && (
                                              <span className="text-[9px] font-black bg-emerald-500 text-white w-4 h-4 rounded-full flex items-center justify-center shrink-0">$</span>
                                            )}
                                          </div>
                                        </div>
                                        {ex.is_power_set && (
                                          <span className="text-[9px] font-black bg-emerald-500 text-white w-5 h-5 rounded-full flex items-center justify-center shrink-0">$</span>
                                        )}
                                      </div>
                                      <div className="flex flex-wrap gap-1.5 mt-2 ml-9">
                                        {Array.from({ length: slotCount }).map((_, i) => {
                                          const log: any = sortedLogs[i];
                                          if (log) {
                                            const reps = log.repetitions ?? log.reps ?? 0;
                                            const weight = log.weight ?? 0;
                                            const logTitle = log.title || `Set ${i + 1}`;
                                            const isPowerSetLog = !!log.isPowerSetLog;
                                            const isCompleted = log.status === true || (isPowerSetLog && weight > 0);
                                            const pillClass = isPowerSetLog
                                              ? "bg-emerald-50 border border-emerald-300 text-emerald-700"
                                              : isCompleted
                                              ? "bg-orange-50 border border-orange-300 text-orange-700"
                                              : "bg-gray-900 text-white";
                                            return (
                                              <div
                                                key={`${log.id || "log"}-${i}`}
                                                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${pillClass}`}
                                              >
                                                <span>{logTitle}: {reps} @ {parseFloat(String(weight)) || weight} {mapUserUnit}</span>
                                                {isPowerSetLog && <span className="text-emerald-500 font-black ml-0.5">$</span>}
                                              </div>
                                            );
                                          }
                                          if (powerSetChips && powerSetChips[i]) {
                                            const chip = powerSetChips[i];
                                            return (
                                              <div key={i} className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white border border-gray-200 text-gray-400">
                                                Set {i + 1}: {chip.reps} @ {chip.pct}%
                                              </div>
                                            );
                                          }
                                          const plannedWeightNum = parseFloat(String(plannedWeight || "0"));
                                          const weightDisplay = plannedWeightNum > 0
                                            ? ` @ ${convertToUserUnit(String(plannedWeightNum), mapUserUnit, weightSourceUnit)}`
                                            : "";
                                          return (
                                            <div key={i} className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white text-gray-400">
                                              Set {i + 1}: {ex.reps || "8–12"}{weightDisplay}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Progress card */}
                  {(() => {
                    const completedCount = workoutGroups.filter((g) =>
                      g.isCompleted || mapLoadRecords.some((l) =>
                        (l.workout_complete === true || (l as any).workoutComplete === true) &&
                        (l.title === g.label || (l as any).workoutId === (g.workouts?.[0] as any)?.id || l.workout_id === (g.workouts?.[0] as any)?.id)
                      )
                    ).length;
                    const pct = workoutGroups.length > 0 ? Math.round((completedCount / workoutGroups.length) * 100) : 0;
                    return (
                      <div className="bg-white rounded-[20px] border border-gray-100 px-5 py-4 flex items-center justify-between">
                        <div>
                          <p className="text-[11px] text-gray-400 font-semibold">Workout Progress</p>
                          <p className="text-[15px] font-black text-[#111]">{completedCount} / {workoutGroups.length} Rounds</p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-[#ede9fe] flex items-center justify-center">
                          <span className="text-[14px] font-black text-[#7c3aed]">{pct}%</span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Complete Workout button — mirrors mobile's MapScreen
                      exactly: warn about incomplete rounds first, then open
                      the completion (activity picker) modal directly here,
                      no page navigation. */}
                  <button
                    disabled={isLocked}
                    className={`w-full h-12 rounded-2xl font-black text-[14px] text-white transition ${isLocked ? "bg-gray-400 cursor-not-allowed" : "bg-[#7c3aed] hover:bg-[#6d28d9]"}`}
                    onClick={async () => {
                      const incompleteRounds = workoutGroups.filter((g) =>
                        !(g.isCompleted || mapLoadRecords.some((l) =>
                          (l.workout_complete === true || (l as any).workoutComplete === true) &&
                          (l.title === g.label || (l as any).workoutId === (g.workouts?.[0] as any)?.id || l.workout_id === (g.workouts?.[0] as any)?.id)
                        ))
                      );
                      if (incompleteRounds.length > 0) {
                        setIncompleteRoundNames(incompleteRounds.map((g) => g.label));
                        return;
                      }
                      await openCompletionModal();
                    }}
                  >
                    Complete Workout
                  </button>
                </div>
              ) : (
                // OVERVIEW - Dynamic from API
                <div className="space-y-10 relative">
                  {rejoinLoading && (
                    <div className="absolute inset-0 z-10 bg-white/80 flex flex-col items-center justify-center gap-3 rounded-2xl">
                      <Loader2
                        size={32}
                        className="animate-spin text-purple-500"
                      />
                      <p className="text-[13px] font-bold text-gray-500">
                        Loading your session...
                      </p>
                    </div>
                  )}
                  {(() => {
                    const allGroups = filterByLocation
                      ? locationFilteredGroups
                      : workoutGroups;
                    // Logged-out visitors only get the first section as a
                    // preview — "View More" below surfaces the login prompt
                    // instead of paging through the rest of the workout.
                    const visibleGroups = isLoggedIn ? allGroups : allGroups.slice(0, 1);
                    const hasMoreForAnon = !isLoggedIn && allGroups.length > visibleGroups.length;
                    return (
                      <>
                        {visibleGroups.map((group, groupIdx) => {
                          // Matches mobile's isRoundLocked = isLocked && index >= 2
                          // — the first TWO rounds stay unlocked, not just one.
                          const isGroupLocked = isLocked && groupIdx >= 2;
                          const previewItems = isGroupLocked
                            ? group.workouts.slice(0, 3)
                            : group.workouts;

                          return (
                            <section key={`${group.label}-${groupIdx}`}>
                              <div className="flex items-center gap-3 mb-6">
                                <div
                                  className={`w-8 h-1 rounded-full ${groupIdx === 0 ? "bg-orange-400" : groupIdx === 1 ? "bg-[#7c3aed]" : "bg-emerald-500"}`}
                                />
                                <h2 className="text-[11px] font-black uppercase tracking-wider text-gray-500">
                                  {group.label} {group.rounds && `(${group.rounds})`}
                                </h2>
                                {isGroupLocked ? (
                                  <Lock size={12} className="text-gray-300 ml-auto" />
                                ) : (
                                  // Matches mobile's SectionHeader — the play button
                                  // only renders once a session is actually
                                  // active (onPlayPress is undefined otherwise),
                                  // it's not just disabled/dimmed.
                                  isSessionActive && (
                                    <button
                                      onClick={() => {
                                        localStorage.setItem("sessionActive", "true");
                                        router.push(
                                          `/workout/athenaWorkout?section=${encodeURIComponent(group.label)}`,
                                        );
                                      }}
                                      className="ml-auto w-7 h-7 rounded-full bg-[#7c3aed] flex items-center justify-center shadow hover:bg-[#6d28d9] transition"
                                    >
                                      <Play
                                        size={12}
                                        fill="white"
                                        className="text-white ml-0.5"
                                      />
                                    </button>
                                  )
                                )}
                              </div>

                              <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                                {previewItems.map((item, i) => (
                                  <DynamicExerciseCard
                                    key={`${item.exercise_id || "item"}-${i}`}
                                    item={item}
                                    locked={isGroupLocked}
                                    sessionStarted={sessionStarted}
                                    rounds={group.rounds}
                                    getActualExercise={getActualExercise}
                                    powerSets={powerSets}
                                    openVelocityModal={openVelocityModal}
                                    isSessionActive={isSessionActive}
                                    onEditExercise={onEditExercise}
                                    onCardClick={
                                      isSessionActive
                                        ? () => {
                                            localStorage.setItem(
                                              "sessionActive",
                                              "true",
                                            );
                                            router.push(
                                              `/workout/athenaWorkout?section=${encodeURIComponent(group.label)}&exercise=${i}`,
                                            );
                                          }
                                        : handleExerciseTapWithoutSession
                                    }
                                  />
                                ))}
                              </div>

                              {isGroupLocked && groupIdx === 2 && (
                                <div className="flex justify-center mt-8">
                                  <div className="bg-white shadow-lg border border-gray-100 rounded-3xl px-6 py-7 text-center max-w-sm w-full">
                                    <Lock size={26} className="text-[#7c3aed] mx-auto mb-3" />
                                    <h2 className="text-[17px] font-black text-gray-900 mb-2">
                                      Unlock Full Workout
                                    </h2>
                                    <p className="text-[13px] text-gray-500 leading-relaxed mb-5">
                                      This is a premium workout session. Pay $1.00 via
                                      Stripe to get full access to all rounds,
                                      exercises, and interactive set logging for the
                                      next 24 hours.
                                    </p>
                                    <button
                                      onClick={() => setShowPurchaseModal(true)}
                                      className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold text-[14px] py-3 rounded-full shadow-md transition flex items-center justify-center gap-2"
                                    >
                                      <CreditCard size={16} />
                                      Unlock for $1.00
                                    </button>
                                  </div>
                                </div>
                              )}
                            </section>
                          );
                        })}

                        {hasMoreForAnon && (
                          <div className="flex justify-center pt-2">
                            <button
                              onClick={onRequireAuth}
                              className="flex items-center gap-1.5 text-[13px] font-bold text-[#7c3aed] hover:text-[#6d28d9] transition"
                            >
                              View More
                              <ChevronDown size={16} />
                            </button>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* MOBILE BOTTOM NAV — only once the user has actually started or
          rejoined a session; before that there's nothing for it to navigate.
          Center "Train" action is the same handleStartWorkout button as
          before, just restyled as a raised circular FAB overlapping the bar. */}
      {isSessionActive && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30">
          <div className="relative bg-white rounded-t-3xl border-t border-gray-100 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] flex items-center">
            <button
              onClick={() => setActiveView("Results")}
              className={`flex-1 flex flex-col items-center py-2.5 gap-1 text-[11px] font-bold transition-colors ${
                activeView === "Results" ? "text-[#7c3aed]" : "text-gray-400"
              }`}
            >
              <BarChart3 size={20} strokeWidth={activeView === "Results" ? 2.5 : 2} />
              Results
            </button>
            <button
              onClick={() => setShowSessionModal(true)}
              className={`flex-1 flex flex-col items-center py-2.5 gap-1 text-[11px] font-bold transition-colors ${
                activeView === "Session" ? "text-[#7c3aed]" : "text-gray-400"
              }`}
            >
              <Users size={20} strokeWidth={activeView === "Session" ? 2.5 : 2} />
              Session
            </button>

            {/* Center spacer — leaves room under the raised circle for its label */}
            <div
              className={`flex-1 flex flex-col items-center py-2.5 gap-1 text-[11px] font-bold transition-colors ${
                activeSession ? "text-[#7c3aed]" : "text-gray-400"
              }`}
            >
              <div className="h-5" />
              Train
            </div>

            <button
              onClick={() => setActiveView("Powersets")}
              className={`flex-1 flex flex-col items-center py-2.5 gap-1 text-[11px] font-bold transition-colors ${
                activeView === "Powersets" ? "text-[#7c3aed]" : "text-gray-400"
              }`}
            >
              <Zap size={20} strokeWidth={activeView === "Powersets" ? 2.5 : 2} />
              Powersets
            </button>
            <button
              onClick={() => setActiveView("Map")}
              className={`flex-1 flex flex-col items-center py-2.5 gap-1 text-[11px] font-bold transition-colors ${
                activeView === "Map" ? "text-[#7c3aed]" : "text-gray-400"
              }`}
            >
              <MapPin size={20} strokeWidth={activeView === "Map" ? 2.5 : 2} />
              Map
            </button>

            {/* Raised circular Train button — same handleStartWorkout as before */}
            <button
              onClick={handleStartWorkout}
              disabled={!activeSession}
              className={`absolute left-1/2 -translate-x-1/2 -top-8 w-14 h-14 rounded-full flex items-center justify-center shadow-lg ring-[6px] ring-white transition active:scale-95 ${
                activeSession ? "bg-[#3b82f6] hover:bg-[#2563eb]" : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              <Play size={22} className="text-white ml-0.5" fill="currentColor" />
            </button>
          </div>
        </div>
      )}

      {/* INCOMPLETE ROUNDS WARNING — mirrors mobile's MapScreen Alert:
          "Go Back" dismisses, "Complete Anyway" proceeds to the activity
          picker regardless. */}
      {incompleteRoundNames && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          onClick={() => setIncompleteRoundNames(null)}
        >
          <div
            className="bg-white w-full max-w-sm rounded-[28px] shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 pt-6 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mb-4">
                <AlertTriangle size={26} className="text-amber-500" />
              </div>
              <h2 className="text-[17px] font-black text-[#111]">Rounds Not Completed</h2>
              <p className="text-[13px] text-gray-500 mt-2 leading-relaxed">
                The following rounds are not yet completed:
              </p>
              <p className="text-[13px] font-bold text-[#7c3aed] mt-2 leading-relaxed">
                {incompleteRoundNames.join(", ")}
              </p>
              <p className="text-[13px] text-gray-500 mt-3 leading-relaxed">
                Are you sure you want to finish the workout?
              </p>
            </div>

            <div className="px-6 pt-6 pb-6 flex flex-col gap-3">
              <button
                onClick={async () => {
                  await openCompletionModal();
                }}
                className="w-full h-12 rounded-2xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition"
              >
                Complete Anyway
              </button>
              <button
                onClick={() => setIncompleteRoundNames(null)}
                className="w-full h-12 rounded-2xl border-2 border-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-50 transition"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WORKOUT COMPLETION MODAL — mirrors mobile's WorkoutCompletionModal:
          pick an existing pending activity to get credit toward, or log this
          as a standalone new one. */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm px-4 pb-4 sm:pb-0">
          <div className="bg-white w-full max-w-md max-h-[90vh] rounded-[28px] shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] px-5 pt-5 pb-5 text-white flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <CheckCircle2 size={16} />
                  </div>
                  <span className="text-[15px] font-black">Workout Completion</span>
                </div>
                <button
                  onClick={() => setShowCompletionModal(false)}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
                >
                  <X size={15} />
                </button>
              </div>
              <p className="text-[12px] text-white/75 leading-relaxed mt-3">
                Choose how you want to save this completed session on your itinerary page.
              </p>
            </div>

            <div className="px-5 py-5 flex flex-col gap-5 overflow-y-auto bg-[#f9f8fc]">
              {pendingActivities.length > 0 && (
                <div className="flex flex-col gap-3">
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-wide">
                    Get credit towards a scheduled workout <span className="text-[#7c3aed]">(choose one)</span>
                  </p>

                  <div className="flex flex-col gap-2">
                    {pendingActivities.map((a) => {
                      const isSelected = selectedActivityId === a.id;
                      return (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => setSelectedActivityId(a.id)}
                          className={`w-full flex items-center gap-3 rounded-2xl border-2 px-4 py-3.5 text-left transition ${
                            isSelected
                              ? "border-[#8B5CF6] bg-[#f3eefe]"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition ${
                              isSelected ? "border-[#8B5CF6]" : "border-gray-300"
                            }`}
                          >
                            {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6]" />}
                          </div>
                          <span className="text-[13px] font-bold text-[#222] uppercase leading-snug">{a.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handleCompleteWorkout(selectedActivityId)}
                    disabled={selectedActivityId === null || completingWorkout}
                    className="w-full h-14 rounded-2xl text-[15px] font-black transition disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 enabled:bg-[#8B5CF6] enabled:text-white enabled:hover:bg-[#7C3AED] enabled:shadow-lg enabled:shadow-purple-200 flex items-center justify-center gap-2"
                  >
                    {completingWorkout && selectedActivityId !== null && <Loader2 size={18} className="animate-spin" />}
                    Save Workout
                  </button>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-[11px] text-gray-400 font-black uppercase">or</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col gap-3">
                <p className="text-[12px] text-gray-500 text-center leading-relaxed">
                  Save as a new Workout session — this won&apos;t affect your Workout Completion this week.
                </p>

                <button
                  onClick={() => handleCompleteWorkout(null)}
                  disabled={completingWorkout}
                  className="w-full h-14 rounded-2xl bg-[#7c3aed] text-white text-[15px] font-black hover:bg-[#6d28d9] transition disabled:opacity-50 shadow-lg shadow-purple-200 flex items-center justify-center gap-2"
                >
                  {completingWorkout && selectedActivityId === null && <Loader2 size={18} className="animate-spin" />}
                  Create a New One
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WORKOUT COMPLETE CONGRATS MODAL — mirrors mobile's
          WorkoutCompleteModal. Closing it (via X or "View Results") switches
          to the Results view on this same page — mobile navigates to a
          separate Results tab for the same effect, but here Results is
          already just another tab of this page, so no navigation is needed. */}
      {showCompleteCongrats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white w-full max-w-sm h-[520px] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-[#8B5CF6] px-5 py-4 flex items-start justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Award size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-black text-sm">Workout Complete!</p>
                  <p className="text-white/70 text-xs">Great job today</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-white/90" />
                <button
                  onClick={() => {
                    setShowCompleteCongrats(false);
                    setActiveView("Results");
                  }}
                  className="text-white/80 hover:text-white transition"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="px-6 py-8 flex-1 overflow-y-auto flex flex-col items-center justify-center gap-3">
              <div className="w-20 h-20 rounded-full bg-[#F59E0B] flex items-center justify-center shadow-lg shadow-amber-200">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Trophy size={22} className="text-white" />
                </div>
              </div>

              <p className="text-[22px] font-black text-[#111] tracking-wide">CONGRATS!</p>
              <p className="text-sm text-gray-400">you&apos;ve completed</p>

              <p className="text-[18px] font-black text-[#8B5CF6] italic uppercase text-center">
                {workoutTitle || "WORKOUT"}
              </p>

              <p className="text-xs text-gray-500 font-semibold">Week 3 | Day 1</p>
            </div>

            <div className="px-5 pb-4 flex flex-col gap-3 flex-shrink-0">
              <button
                onClick={() => {
                  setShowCompleteCongrats(false);
                  setActiveView("Results");
                }}
                className="w-full h-12 rounded-2xl bg-[#1a1a1a] text-white text-sm font-bold hover:bg-black transition"
              >
                View Results
              </button>
              <button
                onClick={() => setShowShareModal(true)}
                className="w-full h-12 rounded-2xl border-2 border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 transition flex items-center justify-center gap-2"
              >
                <Share2 size={16} /> Share Workout
              </button>
            </div>
            <div className="flex justify-center pb-5 flex-shrink-0">
              <button
                onClick={() => { setShowCompleteCongrats(false); setShowNowWhat(true); }}
                className="text-[12px] font-bold text-gray-400 hover:text-gray-600 transition"
              >
                Skip →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NOW WHAT modal */}
      {showNowWhat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white w-full max-w-sm h-[520px] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-[#8B5CF6] px-5 py-4 flex items-start justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Award size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-black text-sm">Workout Complete!</p>
                  <p className="text-white/70 text-xs">Great job today</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-white/90" />
                <button onClick={() => navigateAway("/workout/main")} className="text-white/80 hover:text-white transition">
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="px-6 pt-8 pb-4 flex-1 overflow-y-auto flex flex-col items-center justify-center gap-1">
              <p className="text-[26px] font-black text-[#111] tracking-wide">NOW WHAT...</p>
              <p className="text-sm text-gray-400 mb-6">Training results:</p>

              <div className="flex items-center gap-3 w-full justify-center mb-6">
                {[
                  { label: "Power", value: workoutStats?.thisWorkout.power ?? 0, bg: "bg-[#8B5CF6]" },
                  { label: "Load",  value: workoutStats?.thisWorkout.load ?? 0,  bg: "bg-[#EF4444]" },
                  { label: "Kcal",  value: workoutStats?.thisWorkout.cals ?? 0,  bg: "bg-[#10B981]" },
                ].map((s) => (
                  <div key={s.label} className="flex flex-col items-center gap-1">
                    <div className={`w-16 h-16 rounded-2xl ${s.bg} flex items-center justify-center shadow-lg`}>
                      <span className="text-white text-[22px] font-black">{s.value}</span>
                    </div>
                    <span className="text-[11px] font-semibold text-gray-500">{s.label}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => navigateAway("/player-cards/upload")}
                className="w-full h-12 rounded-2xl bg-[#4C1D95] text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#3b1473] transition"
              >
                <Users size={16} /> Submit Player Card
              </button>
              <p className="text-[11px] text-[#3B82F6] font-semibold mt-2">Earn 2x points (limited once per week)</p>
            </div>

            <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 flex-shrink-0">
              <button
                onClick={() => { setShowNowWhat(false); setShowCompleteCongrats(true); }}
                className="text-sm font-bold text-gray-500 hover:text-gray-800 transition flex items-center gap-1"
              >
                <ChevronLeft size={16} /> Back
              </button>
              <div className="flex gap-1.5">
                {[0,1,2,3,4].map((i) => (
                  <div key={i} className={`h-1.5 rounded-full ${i === 1 ? "w-5 bg-[#8B5CF6]" : "w-1.5 bg-gray-200"}`} />
                ))}
              </div>
              <button
                onClick={() => { setShowNowWhat(false); setShowNextSlide(true); }}
                className="text-sm font-bold text-gray-500 hover:text-gray-800 transition flex items-center gap-1"
              >
                Skip <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* "Stack your Results" — nutrition tracking. Exact port of mobile's
          current WorkoutCompleteModal step 3 (renderStepNutrition) — an
          older, unrelated "Track It" (disabled Log/Visualise placeholder)
          previously lived here; that step doesn't exist in mobile anymore. */}
      {showNextSlide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white w-full max-w-sm h-[520px] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-[#8B5CF6] px-5 py-4 flex items-start justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Award size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-black text-sm">Workout Complete!</p>
                  <p className="text-white/70 text-xs">Great job today</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-white/90" />
                <button onClick={() => navigateAway("/workout/main")} className="text-white/80 hover:text-white transition">
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="px-6 pt-8 pb-4 flex-1 overflow-y-auto flex flex-col items-center justify-center gap-5">
              <div className="text-center">
                <p className="text-[26px] font-black text-[#111] tracking-wide">NOW WHAT...</p>
                <p className="text-sm text-gray-400 mt-1">Stack your Results:</p>
              </div>

              <div className="flex items-center justify-center gap-4 w-full">
                {[
                  { Icon: Pill, label: "Creatine", bg: "bg-[#10B981]" },
                  { Icon: CupSoda, label: "Protein", bg: "bg-[#EF4444]" },
                  { Icon: Droplet, label: "Hydration", bg: "bg-[#3B82F6]" },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col items-center gap-1.5">
                    <div className={`w-16 h-16 rounded-2xl ${item.bg} flex items-center justify-center shadow-md`}>
                      <item.Icon size={24} className="text-white" />
                    </div>
                    <span className="text-[11px] font-bold text-gray-500">{item.label}</span>
                  </div>
                ))}
              </div>

              <div className="bg-gray-100 rounded-2xl px-6 py-3 w-full flex flex-col items-center">
                <p className="text-[12px] font-semibold text-gray-600 mb-1">Today&apos;s nutrition:</p>
                <div className="flex items-center justify-center gap-6">
                  <button
                    onClick={() => setNutritionCount((v) => Math.max(0, v - 1))}
                    className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center text-gray-600 font-bold text-lg hover:bg-gray-50 transition"
                  >
                    −
                  </button>
                  <span className="text-[36px] font-black text-[#8B5CF6]">{nutritionCount}</span>
                  <button
                    onClick={() => setNutritionCount((v) => v + 1)}
                    className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center text-gray-600 font-bold text-lg hover:bg-gray-50 transition"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={() => navigateAway("/micros")}
                className="w-full h-12 rounded-2xl bg-[#6202AC] text-white text-sm font-bold hover:bg-[#4d0187] transition"
              >
                Log and Visualize
              </button>
              <p className="text-[11px] text-[#8B5CF6] font-semibold -mt-2">Earn 5 PP Bonus ProPoints (through end of day)</p>
            </div>

            <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 flex-shrink-0">
              <button
                onClick={() => { setShowNextSlide(false); setShowNowWhat(true); }}
                className="text-sm font-bold text-gray-500 hover:text-gray-800 transition flex items-center gap-1"
              >
                <ChevronLeft size={16} /> Back
              </button>
              <div className="flex gap-1.5">
                {[0,1,2,3,4].map((i) => (
                  <div key={i} className={`h-1.5 rounded-full ${i === 2 ? "w-5 bg-[#8B5CF6]" : "w-1.5 bg-gray-200"}`} />
                ))}
              </div>
              <button
                onClick={() => { setShowNextSlide(false); setShowSupplementals(true); }}
                className="text-sm font-bold text-gray-500 hover:text-gray-800 transition flex items-center gap-1"
              >
                Skip <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Supplementals slide */}
      {showSupplementals && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white w-full max-w-sm h-[520px] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-[#8B5CF6] px-5 py-4 flex items-start justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Award size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-black text-sm">Workout Complete!</p>
                  <p className="text-white/70 text-xs">Great job today</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-white/90" />
                <button onClick={() => navigateAway("/workout/main")} className="text-white/80 hover:text-white transition">
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="px-6 pt-6 pb-4 flex-1 overflow-y-auto flex flex-col items-center justify-center gap-4">
              <p className="text-[22px] font-black text-[#111]">NOW WHAT...</p>
              <p className="text-sm text-gray-400 -mt-2">Suggested Supplementals</p>

              <div className="w-full border border-gray-100 rounded-2xl p-4 flex flex-col items-center relative shadow-sm">
                <button className="absolute top-3 right-3 text-gray-300 hover:text-gray-500 transition">
                  <Star size={16} />
                </button>
                <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
                  <Dumbbell size={28} className="text-[#8B5CF6]" />
                </div>
                <p className="text-[14px] font-black text-[#111] uppercase tracking-tight text-center">KIN-STRETCH SERIES</p>
                <p className="text-[12px] text-[#8B5CF6] font-semibold mt-1">Click to begin</p>
              </div>

              <button
                onClick={() => navigateAway("/workout/main?tab=Supplemental")}
                className="w-full h-12 rounded-2xl bg-[#4C1D95] text-white text-sm font-bold hover:bg-[#3b1473] transition"
              >
                View your Supplementals
              </button>
            </div>

            <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 flex-shrink-0">
              <button
                onClick={() => { setShowSupplementals(false); setShowNextSlide(true); }}
                className="text-sm font-bold text-gray-500 hover:text-gray-800 transition flex items-center gap-1"
              >
                <ChevronLeft size={16} /> Back
              </button>
              <div className="flex gap-1.5">
                {[0,1,2,3,4].map((i) => (
                  <div key={i} className={`h-1.5 rounded-full ${i === 3 ? "w-5 bg-[#8B5CF6]" : "w-1.5 bg-gray-200"}`} />
                ))}
              </div>
              <button
                onClick={() => { setShowSupplementals(false); setShowProgressPhoto(true); }}
                className="text-sm font-bold text-gray-500 hover:text-gray-800 transition flex items-center gap-1"
              >
                Skip <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Progress Photo slide */}
      {showProgressPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white w-full max-w-sm h-[520px] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-[#8B5CF6] px-5 py-4 flex items-start justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Award size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-black text-sm">Workout Complete!</p>
                  <p className="text-white/70 text-xs">Great job today</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-white/90" />
                <button onClick={() => navigateAway("/workout/main")} className="text-white/80 hover:text-white transition">
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="px-6 pt-6 pb-4 flex-1 overflow-y-auto flex flex-col items-center justify-center gap-4">
              <p className="text-[22px] font-black text-[#111]">NOW WHAT...</p>
              <p className="text-sm text-gray-400 -mt-2">Take a new progress photo:</p>

              <div className="flex gap-4 w-full justify-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-28 h-28 rounded-2xl bg-gray-100 flex items-center justify-center">
                    <Activity size={36} className="text-gray-400" />
                  </div>
                  <p className="text-[13px] font-semibold text-gray-700">Compare</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="relative w-28 h-28 rounded-2xl bg-[#8B5CF6] flex items-center justify-center">
                    <Camera size={36} className="text-white" />
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center">
                      <Check size={10} className="text-white" strokeWidth={3} />
                    </div>
                  </div>
                  <p className="text-[13px] font-semibold text-[#8B5CF6]">Recent</p>
                </div>
              </div>

              <p className="text-[11px] text-gray-400">Last update: -</p>

              <button
                onClick={() => navigateAway("/player-progress")}
                className="w-full h-12 rounded-2xl bg-[#4C1D95] text-white text-sm font-bold hover:bg-[#3b1473] transition flex items-center justify-center gap-2"
              >
                <Camera size={16} />
                View/Share Profile Image
              </button>
            </div>

            <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 flex-shrink-0">
              <button
                onClick={() => { setShowProgressPhoto(false); setShowSupplementals(true); }}
                className="text-sm font-bold text-gray-500 hover:text-gray-800 transition flex items-center gap-1"
              >
                <ChevronLeft size={16} /> Back
              </button>
              <div className="flex gap-1.5">
                {[0,1,2,3,4].map((i) => (
                  <div key={i} className={`h-1.5 rounded-full ${i === 4 ? "w-5 bg-[#8B5CF6]" : "w-1.5 bg-gray-200"}`} />
                ))}
              </div>
              <button
                onClick={() => { setShowProgressPhoto(false); setShowNextWorkout(true); }}
                className="text-sm font-bold text-gray-500 hover:text-gray-800 transition flex items-center gap-1"
              >
                Skip <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Next Workout slide */}
      {showNextWorkout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white w-full max-w-sm h-[520px] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-[#8B5CF6] px-5 py-4 flex items-start justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Award size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-black text-sm">Workout Complete!</p>
                  <p className="text-white/70 text-xs">Great job today</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-white/90" />
                <button onClick={() => navigateAway("/workout/main")} className="text-white/80 hover:text-white transition">
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="px-6 pt-6 pb-4 flex-1 overflow-y-auto flex flex-col items-center justify-center gap-4">
              <p className="text-[22px] font-black text-[#111]">NOW WHAT...</p>
              <p className="text-sm text-gray-400 -mt-2">View the next workout:</p>

              <div className="w-full rounded-2xl bg-[#3D3D5C] px-6 py-6 flex flex-col items-center gap-1 text-white">
                <p className="text-[12px] font-medium opacity-70">Week 2</p>
                <p className="text-[20px] font-black uppercase tracking-tight text-center">
                  {activeSession?.program_name || workoutTitle || "RECONDITIONING"}
                </p>
                <p className="text-[12px] opacity-70 text-center mt-1">Back, Glutes, Arms</p>
              </div>

              <button
                onClick={() => navigateAway("/workout/main")}
                className="w-full h-12 rounded-2xl bg-[#6D28D9] text-white text-sm font-bold hover:bg-[#5b21b6] transition"
              >
                View All Workouts
              </button>
              <button
                onClick={() => navigateAway("/itinerary/itinerary-page")}
                className="w-full h-12 rounded-2xl border-2 border-[#6D28D9] text-[#6D28D9] text-sm font-bold hover:bg-purple-50 transition"
              >
                Go to Itinerary
              </button>
            </div>

            <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 flex-shrink-0">
              <button
                onClick={() => { setShowNextWorkout(false); setShowProgressPhoto(true); }}
                className="text-sm font-bold text-gray-500 hover:text-gray-800 transition flex items-center gap-1"
              >
                <ChevronLeft size={16} /> Back
              </button>
              <div className="flex gap-1.5">
                {[0,1,2,3,4].map((i) => (
                  <div key={i} className={`h-1.5 rounded-full ${i === 4 ? "w-5 bg-[#6D28D9]" : "w-1.5 bg-gray-200"}`} />
                ))}
              </div>
              <button
                onClick={() => { setShowNextWorkout(false); setShowRecovery(true); }}
                className="text-sm font-bold text-gray-500 hover:text-gray-800 transition flex items-center gap-1"
              >
                Skip <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recovery Zone slide */}
      {showRecovery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white w-full max-w-sm h-[520px] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-[#8B5CF6] px-5 py-4 flex items-start justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Award size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-black text-sm">Workout Complete!</p>
                  <p className="text-white/70 text-xs">Great job today</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-white/90" />
                <button onClick={() => navigateAway("/workout/main")} className="text-white/80 hover:text-white transition">
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="px-6 pt-6 pb-4 flex-1 overflow-y-auto flex flex-col items-center justify-center gap-5">
              <p className="text-[22px] font-black text-[#111]">NOW WHAT...</p>
              <p className="text-sm text-gray-400 -mt-3">Recovery Zone:</p>

              <div className="flex items-start justify-center gap-6 w-full">
                {[
                  { Icon: Flame, label: "Red-Light", sub: "Therapy", bg: "bg-red-400" },
                  { Icon: Waves, label: "HBOT", sub: "(Hyperbaric\nOxygen)", bg: "bg-[#0EA5E9]", active: true },
                  { Icon: Flame, label: "Red-Light", sub: "Mask", bg: "bg-red-400" },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div className={`w-16 h-16 rounded-full ${item.bg} flex items-center justify-center shadow-md ${item.active ? "ring-4 ring-[#0EA5E9]/30" : ""}`}>
                      <item.Icon size={26} className="text-white" />
                    </div>
                    <p className="text-[12px] font-semibold text-gray-700 text-center">{item.label}</p>
                    <p className={`text-[10px] text-center leading-tight whitespace-pre-line ${item.active ? "text-[#0EA5E9]" : "text-gray-400"}`}>{item.sub}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => navigateAway("/recovery/recovery-dashboard")}
                className="w-full h-12 rounded-2xl bg-[#6D28D9] text-white text-sm font-bold hover:bg-[#5b21b6] transition"
              >
                View All Recovery
              </button>
              <p className="text-[11px] text-[#6D28D9] font-semibold -mt-2">Earn 20 PF Bonus Pts (through March 15)</p>
            </div>

            <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 flex-shrink-0">
              <button
                onClick={() => { setShowRecovery(false); setShowNextWorkout(true); }}
                className="text-sm font-bold text-gray-500 hover:text-gray-800 transition flex items-center gap-1"
              >
                <ChevronLeft size={16} /> Back
              </button>
              <div className="flex gap-1.5">
                {[0,1,2,3,4,5].map((i) => (
                  <div key={i} className={`h-1.5 rounded-full ${i === 5 ? "w-5 bg-[#6D28D9]" : "w-1.5 bg-gray-200"}`} />
                ))}
              </div>
              <button
                onClick={() => {
                  setShowRecovery(false);
                  setActiveView("Results");
                }}
                className="text-sm font-bold text-[#6D28D9] hover:text-purple-800 transition flex items-center gap-1"
              >
                Done <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      <ShareSessionModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        sessionId={getCurrentSessionId()}
      />
    </div>
  );
}
