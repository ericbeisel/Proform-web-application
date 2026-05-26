"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Play,
  ChevronRight,
  Users,
  Share2,
  ClipboardList,
  UserPlus,
  Home,
  Activity,
  MapPin,
  Edit,
  X,
  Sparkles,
  Calendar,
  Eye,
  Search,
  Copy,
  Link,
  Zap,
  Flame,
  ChevronUp,
  ChevronDown,
  Dumbbell,
  CheckCircle2,
  Lock,
  Loader2,
  Plus,
  FileText,
} from "lucide-react";

import { useEffect, useState } from "react";
import { getProgramGroupedWorkouts, WorkoutGroup, WorkoutGroupItem } from "@/api/programs/route";
import {
  getIncompleteSessions,
  getWorkoutSection,
  getTrackingLogs,
  createTrackingLog,
  IncompleteSession,
} from "@/api/workouts/route";
import { dashboardApi, UserOtherDetail } from "@/api/dashboard/route";

function resolveWixImage(url?: string): string {
  if (!url) return "";
  if (url.startsWith("wix:image://v1/")) {
    const mediaId = url.replace("wix:image://v1/", "").split("#")[0].split("/")[0];
    return `https://static.wixstatic.com/media/${mediaId}`;
  }
  return url;
}

export default function ViewWorkoutSessionPage() {
  const router = useRouter();

  // Existing state
  const [location, setLocation] = useState<string | null>(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [followerSearch, setFollowerSearch] = useState("");
  const [activeView, setActiveView] = useState("Overview");
  const [selectedSets, setSelectedSets] = useState<Set<string>>(new Set());
  const [selectedCards, setSelectedCards] = useState<Set<number>>(new Set());
  const [selectedExercises, setSelectedExercises] = useState<Set<number>>(new Set());
  const [collapsedRounds, setCollapsedRounds] = useState<Set<number>>(new Set());
const [swappedExercises, setSwappedExercises] = useState<Map<string, WorkoutGroupItem>>(new Map());
  // New state from 1st code
  const [activeSession, setActiveSession] = useState<IncompleteSession | null>(null);
  const [workoutGroups, setWorkoutGroups] = useState<WorkoutGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejoinLoading, setRejoinLoading] = useState(false);
  const [workoutTitle, setWorkoutTitle] = useState<string>("");
  const [hasPurchased, setHasPurchased] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [incompleteSessions, setIncompleteSessions] = useState<IncompleteSession[]>([]);
  const incompleteSession = incompleteSessions[0] ?? null;
  const [showRejoinModal, setShowRejoinModal] = useState(false);
  const [trackingItem, setTrackingItem] = useState<WorkoutGroupItem | null>(null);
  const [sets, setSets] = useState<{ weight: string; reps: string; saved: boolean; load?: number }[]>([{ weight: "", reps: "", saved: false }]);
  const [lastRecord, setLastRecord] = useState<{ weight: number; reps: number } | null>(null);
  const [bestRecord, setBestRecord] = useState<{ weight: number; reps: number } | null>(null);
  const [logsLoading, setLogsLoading] = useState(false);
  const [savingLogs, setSavingLogs] = useState(false);
  const [savingSetIndex, setSavingSetIndex] = useState<number | null>(null);
  const [userOtherDetail, setUserOtherDetail] = useState<UserOtherDetail | null>(null);

  // Existing handlers
  const toggleCard = (i: number) => {
    setSelectedCards(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const toggleExercise = (id: number) => {
    setSelectedExercises(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleRound = (id: number) => {
    setCollapsedRounds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSet = (key: string) => {
    setSelectedSets(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  // New handlers from 1st code
  const addSet = () => setSets((prev) => [...prev, { weight: prev[prev.length - 1]?.weight || "", reps: "", saved: false }]);
const updateSet = (i: number, field: "weight" | "reps", val: string) =>
    setSets((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: val } : s)));

  const openTracking = async (item: WorkoutGroupItem) => {
    setTrackingItem(item);
    setSets([{ weight: "", reps: "", saved: false }]);
    setLastRecord(null);
    setBestRecord(null);

    const code = localStorage.getItem("workoutProgramCode")?.toUpperCase();
    const sessionId = code ? localStorage.getItem(`activeSessionId_${code}`) : null;
    console.log("[tracking] openTracking — code:", code, "sessionId:", sessionId, "exerciseId:", item.exercise_id);

    if (!item.exercise_id) { console.warn("[tracking] ✗ No exercise_id on item — skipping fetch"); return; }

    setLogsLoading(true);
    try {
      // 1. All-time records for Last / Best (no sessionId filter — matches mobile)
      const allLogs = await getTrackingLogs({ exercise_id: item.exercise_id });
      console.log("[tracking] All-time logs:", allLogs.length);
      if (allLogs.length > 0) {
        // API returns desc by date — index 0 is most recent
        setLastRecord({ weight: allLogs[0].weight, reps: allLogs[0].repetitions });
        const best = allLogs.reduce((b, r) => r.weight > b.weight ? r : b, allLogs[0]);
        setBestRecord({ weight: best.weight, reps: best.repetitions });
      }

      // 2. Session-specific records to pre-populate set inputs
      if (sessionId) {
        const sessionLogs = await getTrackingLogs({ sessionId, exercise_id: item.exercise_id });
        console.log("[tracking] Session logs:", sessionLogs.length, sessionLogs);
        if (sessionLogs.length > 0) {
          const sorted = [...sessionLogs].sort((a, b) => {
            const numA = parseInt(a.title?.replace(/\D/g, "") || "0");
            const numB = parseInt(b.title?.replace(/\D/g, "") || "0");
            return numA - numB;
          });
          setSets(sorted.map((log) => ({
            weight: String(log.weight ?? ""),
            reps: String(log.repetitions ?? ""),
            saved: log.status === true,
            load: log.load,
          })));
        }
      }
    } catch (err) {
      console.error("[tracking] ✗ Failed to fetch logs:", err);
    } finally {
      setLogsLoading(false);
    }
  };


  const totalExercises = workoutGroups.reduce((sum, g) => sum + g.workouts.length, 0);
  const isLocked = !hasPurchased;

const handleRejoin = async (session: IncompleteSession) => {
    setSessionStarted(true);
    setActiveSession(session);
    setRejoinLoading(true);
    const programCode = localStorage.getItem("workoutProgramCode")?.toUpperCase();
    localStorage.setItem(`activeSessionId_${programCode}`, session.id);

    try {
      const newSwapsMap: [string, WorkoutGroupItem][] = [];
      for (const group of workoutGroups) {
        const sectionExercises = await getWorkoutSection({
          sessionId: session.id,
          section: group.label,
        });
        sectionExercises.forEach((sectionEx, i) => {
          const originalEx = group.workouts[i];
          const isSwapped = !!sectionEx.original_exercise_name && sectionEx.original_exercise_name !== "null";
          if (isSwapped && originalEx) {
            const swappedItem: WorkoutGroupItem = {
              ...originalEx,
              exercise_id: sectionEx.exercise_id,
              exercise_name: sectionEx.exercise_name,
              demo_gif: sectionEx.demo_gif || sectionEx.demoGif,
              reps: sectionEx.reps,
              sets: sectionEx.sets,
              supplemental: sectionEx.supplemental,
              weight: sectionEx.weight,
              weight_adj: sectionEx.weight_adj,
            };
            newSwapsMap.push([originalEx.exercise_id, swappedItem]);
          }
        });
      }
      setSwappedExercises(new Map(newSwapsMap));
      if (programCode) {
        localStorage.setItem(`swappedExercises_${programCode}`, JSON.stringify(newSwapsMap));
      }
    } catch (err) {
      console.error("[rejoin] Failed to fetch swaps:", err);
      const savedSwaps = programCode ? localStorage.getItem(`swappedExercises_${programCode}`) : null;
      if (savedSwaps) {
        try {
          const entries: [string, WorkoutGroupItem][] = JSON.parse(savedSwaps);
          setSwappedExercises(new Map(entries));
        } catch {}
      }
    } finally {
      setRejoinLoading(false);
    }
  };

const getActualExercise = (original: WorkoutGroupItem): WorkoutGroupItem => {
  const swapped = swappedExercises.get(original.exercise_id);
  if (swapped) {
    return swapped;
  }
  return original;
};

  // Fetch real data (from 1st code)
 useEffect(() => {
  const initializeWorkout = async () => {
    const savedLocation = localStorage.getItem("workoutLocationName");
    if (savedLocation) setLocation(savedLocation);

    const programCode = localStorage.getItem("workoutProgramCode");
    const title = localStorage.getItem("workoutTitle");
    if (title) setWorkoutTitle(title);

    const isFree = localStorage.getItem("workoutIsFree");
    if (isFree === "true") setHasPurchased(true);

    const storedSessionId = localStorage.getItem(`activeSessionId_${programCode?.toUpperCase()}`);
    if (storedSessionId) {
      setSessionStarted(true);
    }

    if (!programCode) {
      setLoading(false);
      return;
    }

    getProgramGroupedWorkouts(programCode)
      .then((res) => {
        const groups = Array.isArray(res) ? res : [];
        const getRoundNum = (label: string) => {
          const m = label.match(/^ROUND\s+(\d+)/i);
          return m ? parseInt(m[1], 10) : Infinity;
        };
        groups.sort((a, b) => getRoundNum(a.label) - getRoundNum(b.label));
        setWorkoutGroups(groups);
      })
      .catch((err) => console.error("Failed to fetch grouped workouts:", err))
      .finally(() => setLoading(false));

    const normalizedCode = programCode.toUpperCase();
  const justCreated = localStorage.getItem("sessionJustCreated") === "true";
  if (justCreated) localStorage.removeItem("sessionJustCreated");
  const sessionActive = localStorage.getItem("sessionActive") === "true";

  console.log("[mount] justCreated:", justCreated, "| sessionActive:", sessionActive, "| normalizedCode:", normalizedCode);

  // Load saved swaps on first visit after session creation OR when returning from athenaWorkout
  if (justCreated || sessionActive) {
    const savedSwaps = localStorage.getItem(`swappedExercises_${normalizedCode}`);
    console.log("[mount] loading swaps from localStorage (justCreated:", justCreated, "| sessionActive:", sessionActive, "):", savedSwaps ? "found" : "not found");
    if (savedSwaps) {
      try {
        const entries: [string, WorkoutGroupItem][] = JSON.parse(savedSwaps);
        setSwappedExercises(new Map(entries));
      } catch {}
    }
  }

  getIncompleteSessions(normalizedCode)
  .then((sessions) => {
    console.log("[mount] incompleteSessions returned:", sessions.length, sessions.map(s => s.id));
    if (sessions.length > 0) {
      setIncompleteSessions(sessions);
      if (justCreated || sessionActive) {
        const storedId = localStorage.getItem(`activeSessionId_${normalizedCode}`);
        const matched = storedId ? sessions.find(s => s.id === storedId) : null;
        console.log("[mount] storedId:", storedId, "| matched:", matched?.id ?? "none");
        if (matched) {
          setActiveSession(matched);
        } else if (sessionActive) {
          // Fallback: use first session if stored ID doesn't match
          console.log("[mount] sessionActive fallback — using sessions[0]:", sessions[0].id);
          setActiveSession(sessions[0]);
        }
      }
    }
  })
  .catch((err) => console.error("[rejoin] API error:", err));
  };

  initializeWorkout();

  dashboardApi.getDashboardData()
    .then((res) => setUserOtherDetail(res.user.OtherDetail))
    .catch(() => {/* non-critical */});
}, []);

  // Dynamic ExerciseCard that uses real data
const DynamicExerciseCard = ({
  item,
  locked = false,
  sessionStarted = false,
}: {
  item: WorkoutGroupItem;
  locked?: boolean;
  sessionStarted?: boolean;
}) => {
  const actualItem = getActualExercise(item);
  const isSwapped = swappedExercises.has(item.exercise_id);
  
  return (
    <div className={`bg-white rounded-[24px] border border-[#e8e8ef] relative transition-all p-4 min-h-[170px] ${locked ? "opacity-60 blur-[1px] pointer-events-none" : "hover:shadow-md"}`}>
      <div className="absolute top-2 left-2 flex items-center gap-1">
        {actualItem.is_power_set && (
          <span className="text-[9px] font-black text-[#7c3aed] bg-purple-50 border border-[#7c3aed]/20 rounded-full px-1.5 py-0.5 leading-none">$</span>
        )}
        {isSwapped && <Home size={12} className="text-emerald-500" />}
      </div>

      {!locked && sessionStarted && (
        <button
          onClick={(e) => { e.stopPropagation(); openTracking(actualItem); }}
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
          <img src={resolveWixImage(actualItem.demo_gif)} alt={actualItem.exercise_name} className="w-full h-full object-contain" />
        ) : (
          <div className="w-7 h-7 rounded-full bg-[#1e1e22]" />
        )}
      </div>

      <h3 className="text-[12px] font-semibold text-center text-[#222] leading-tight min-h-[22px] flex items-center justify-center">
        {actualItem.exercise_name}
      </h3>

      <div className="mt-1 text-center">
        <p className="text-[16px] leading-none font-black tracking-tight text-[#222]">
          {actualItem.reps || "—"}
        </p>
      </div>

      {actualItem.supplemental && (
        <div className="flex gap-2 justify-center mt-1 flex-wrap">
          <div className="px-2 py-0.5 rounded-md bg-[#f4f4f5] text-[7px] font-bold text-gray-500 uppercase">
            {actualItem.supplemental}
          </div>
        </div>
      )}
    </div>
  );
};

  // Transform workoutGroups to rounds format for the existing UI
  const transformToRounds = () => {
    return workoutGroups.map((group, idx) => ({
      id: idx + 1,
      label: group.label,
      rounds: group.rounds || "1x",
      exercises: group.workouts.map((item, exIdx) => ({
        id: exIdx + 1,
        name: item.exercise_name,
        reps: item.reps,
        supplemental: item.supplemental,
        demo_gif: item.demo_gif,
        order: item.order,
        loc: location === "Gym" ? "GYM" : "HOME", // Dynamic based on location
      })),
    }));
  };

  const rounds = transformToRounds();

  return (
    <div className="h-screen overflow-hidden bg-[#f7f7fa] flex">

      {/* SIDEBAR — only visible once session is started */}
      {sessionStarted && <div className="hidden lg:flex w-[220px] bg-gradient-to-b from-[#8b5cf6] to-[#6d28d9] text-white flex-col p-6 flex-shrink-0">

        <div className="bg-white/10 rounded-[24px] p-4 mb-8">
          <h2 className="text-[11px] font-black leading-tight break-words uppercase tracking-wide">
            {workoutTitle || "RECONDITIONING"}
          </h2>
          <p className="text-[10px] uppercase mt-1 opacity-70">Workout</p>
          <div className="mt-4 h-2 rounded-full bg-white/20 overflow-hidden">
            <div className="w-[35%] h-full bg-white rounded-full" />
          </div>
          <div className="text-right text-[10px] mt-2 font-bold">35%</div>
        </div>

        <div className="space-y-3">
          {["Overview", "Session", "Results", "Powersets", "Map"].map((item, i) => (
            <button
              key={i}
              onClick={() => {
                if (item === "Session") setShowSessionModal(true);
                else setActiveView(item);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition
              ${activeView === item ? "bg-white text-[#7c3aed]" : "bg-white/10 hover:bg-white/20"}`}
            >
              <Activity size={16} />
              {item}
            </button>
          ))}
        </div>

    <button
  onClick={() => {
    localStorage.setItem("sessionActive", "true");
    router.push("/workout/athenaWorkout");
  }}
  disabled={!activeSession}
  className={`mt-auto py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition
    ${activeSession
      ? "bg-white text-[#7c3aed]"
      : "bg-white/20 text-white/40 cursor-not-allowed"
    }`}
>
  <Play size={16} fill="currentColor" />
  Start Workout
</button>
      </div>}

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden pb-16 lg:pb-0">

        {/* HEADER */}
        <div className="bg-white border-b border-[#ececf2] px-4 sm:px-6 lg:px-10 py-4 flex-shrink-0 z-20">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-5">
              <button onClick={() => router.back()} className="text-gray-500">
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-xl font-black text-[#3b82f6] tracking-tight leading-none uppercase">
                  {workoutTitle || "Formula-1"}
                </h1>
                <p className="text-[12px] font-black uppercase tracking-wide text-[#222] mt-1">
                  {totalExercises} Exercises
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">

              {/* Session info + Share in a box */}
             <div className="hidden md:flex items-center gap-3 border border-gray-200 rounded-2xl px-4 py-2 bg-gray-50">
  <div className="text-right">
    <p className="text-[10px] font-bold text-gray-400">Session</p>
    {activeSession ? (
      <>
        <p className="text-[12px] font-black text-[#222]">
          {activeSession.id.slice(0, 8)}
        </p>
        <p className="text-[9px] text-gray-400">
          {new Date(activeSession.created_at).toLocaleString('en-US', {
            month: 'numeric', day: 'numeric', year: 'numeric',
            hour: 'numeric', minute: '2-digit', hour12: true,
          }).replace(',', '')}
        </p>
      </>
    ) : (
      <p className="text-[12px] font-black text-[#222]">
        {incompleteSession ? `In Progress` : "Not Started"}
      </p>
    )}
  </div>
  <button
    onClick={() => setShowInviteModal(true)}
    className="w-8 h-8 rounded-full bg-[#7c3aed] text-white flex items-center justify-center"
  >
    <Share2 size={15} />
  </button>
</div>

              <button className="w-9 h-9 rounded-full bg-[#f3f3f6] text-gray-500 flex items-center justify-center">
                <ClipboardList size={16} />
              </button>

              <button
                onClick={() => setShowSessionModal(true)}
                className="w-9 h-9 rounded-full bg-[#7c3aed] text-white flex items-center justify-center"
              >
                <Users size={16} />
              </button>
            </div>
          </div>

          {activeView !== "Results" && activeView !== "Powersets" && activeView !== "Map" && (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto sm:ml-auto">

                <div className="flex items-center gap-2 text-[12px] font-semibold text-gray-500">
                  <MapPin size={14} className="text-[#7c3aed]" />
                  <span className="text-[#7c3aed]">Location :</span>
                  <span>{location || "None"}</span>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-2">
                    {!isLocked ? (
                 <button
  onClick={() => {
    const code = (localStorage.getItem("workoutProgramCode") || "unknown").toUpperCase();
    localStorage.setItem("pendingSessionCode", code);
    localStorage.setItem("pendingWorkoutGroups", JSON.stringify(workoutGroups));
    router.push("/workout/equipmentNeeded");
  }}
  className="bg-[#7c3aed] text-white px-4 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5"
>
  {activeSession || incompleteSession ? "Start a New Session" : "Start a Session"}
  <ChevronRight size={14} />
</button>
                    ) : (
                      <button
                        onClick={() => setShowPurchaseModal(true)}
                        className="bg-[#7c3aed] text-white px-4 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5"
                      >
                        Buy Session <Lock size={12} />
                      </button>
                    )}
                    <button
                      onClick={() => setShowInviteModal(true)}
                      className="border border-[#7c3aed] text-[#7c3aed] px-4 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5"
                    >
                      <UserPlus size={14} />
                      Invite User
                    </button>
                  </div>

                  <p className={`text-[11px] font-semibold ${isLocked ? 'text-red-500' : 'text-emerald-500'}`}>
                    {isLocked ? "• This workout requires purchase" : "• This workout is free"}
                  </p>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* REJOIN BANNER */}
        {!activeSession && incompleteSessions.length > 0 &&  (
          <div className="px-4 sm:px-6 lg:px-10 pt-4 flex-shrink-0">
            <div className="bg-gradient-to-r from-[#ff6b6b] to-[#ff5757] rounded-2xl px-4 sm:px-5 py-3 sm:py-4 flex items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse flex-shrink-0" />
                <div className="min-w-0">
                  <h3 className="text-white font-semibold text-xs sm:text-sm leading-none truncate">
                    {incompleteSession
                      ? `Rejoin Live Session: ${incompleteSession.id.slice(0, 6)}`
                      : "Active Session In Progress"}
                  </h3>
                  <p className="text-white/80 text-[10px] mt-1 font-medium">
                    {incompleteSession
                      ? `Started ${new Date(incompleteSession.created_at).toLocaleString()}`
                      : "You have an ongoing workout session"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
               <button
  onClick={() => handleRejoin(incompleteSession!)}
  className="bg-white hover:bg-gray-100 transition px-4 py-2 rounded-xl text-[#ef4444] text-xs font-bold shadow-sm"
>
  Rejoin
</button>
                <button
                  onClick={() => setShowRejoinModal(true)}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition flex items-center justify-center"
                >
                  <ChevronRight size={16} className="text-white" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* REJOIN SESSIONS MODAL */}
        {showRejoinModal && (
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm px-4"
            onClick={() => setShowRejoinModal(false)}
          >
            <div
              className="w-full max-w-[420px] bg-white rounded-t-[28px] sm:rounded-[28px] shadow-2xl overflow-hidden max-h-[70vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-5 pt-5 pb-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                <div>
                  <h2 className="text-[16px] font-black text-gray-900">Incomplete Sessions</h2>
                  <p className="text-[11px] text-gray-400 mt-0.5">{incompleteSessions.length} session{incompleteSessions.length > 1 ? "s" : ""} waiting</p>
                </div>
                <button
                  onClick={() => setShowRejoinModal(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 px-5 py-4 space-y-3">
                {incompleteSessions.map((session) => (
                  <div
                    key={session.id}
                    className="bg-gradient-to-r from-[#ff6b6b] to-[#ff5757] rounded-2xl px-4 py-4 flex items-center justify-between gap-3 shadow-sm"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-2 h-2 rounded-full bg-white animate-pulse flex-shrink-0" />
                      <div className="min-w-0">
                        <h3 className="text-white font-semibold text-xs sm:text-sm leading-none truncate">
                          Rejoin Live Session: {session.id.slice(0, 6)}
                        </h3>
                        <p className="text-white/80 text-[10px] mt-1 font-medium">
                          Started {new Date(session.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => { setShowRejoinModal(false); handleRejoin(session); }}
                      className="bg-white hover:bg-gray-100 transition text-[#ef4444] text-[11px] font-bold px-4 py-2 rounded-xl flex-shrink-0 shadow-sm"
                    >
                      Rejoin
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SCROLLABLE CONTENT AREA */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-10 py-6">

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
          ) : (
            <>
              {activeView === "Results" ? (
                <div className="space-y-8">

                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#7c3aed] flex items-center justify-center text-white">
                      <Activity size={18} />
                    </div>
                    <div>
                      <h2 className="text-[20px] font-black text-[#222]">Live Results</h2>
                      <p className="text-[11px] text-gray-400">Real-time performance data</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[13px] font-black text-[#222] mb-4 flex items-center gap-2">
                      <Users size={14} className="text-gray-400" /> This Workout:
                    </p>
                    <div className="grid grid-cols-3 gap-2 sm:gap-4">
                      <div className="rounded-[20px] bg-gradient-to-br from-[#3b82f6] to-[#2563eb] p-5 text-white flex flex-col items-center justify-center min-h-[100px] sm:min-h-[130px]">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mb-3">
                          <Activity size={16} />
                        </div>
                        <p className="text-[32px] sm:text-[44px] font-black leading-none">{totalExercises}</p>
                        <p className="text-[11px] opacity-80 mt-1">Exercises</p>
                      </div>
                      <div className="rounded-[20px] bg-gradient-to-br from-[#7c3aed] to-[#6d28d9] p-5 text-white flex flex-col items-center justify-center min-h-[100px] sm:min-h-[130px]">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mb-3">
                          <Zap size={16} />
                        </div>
                        <p className="text-[32px] sm:text-[44px] font-black leading-none">{workoutGroups.length}</p>
                        <p className="text-[11px] opacity-80 mt-1">Rounds</p>
                      </div>
                      <div className="rounded-[20px] bg-gradient-to-br from-[#f97316] to-[#ea580c] p-5 text-white flex flex-col items-center justify-center min-h-[100px] sm:min-h-[130px]">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mb-3">
                          <Flame size={16} />
                        </div>
                        <p className="text-[32px] sm:text-[44px] font-black leading-none">0</p>
                        <p className="text-[11px] opacity-80 mt-1">Cals</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-[20px] border border-gray-100 overflow-hidden">
                    <div className="grid grid-cols-1 sm:grid-cols-2 sm:divide-x divide-gray-100">
                      <div className="p-5">
                        <p className="text-[11px] font-black text-[#222] mb-4">Your Progress:</p>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div>
                            <p className="text-[10px] text-gray-400 mb-1">Completed</p>
                            <p className="text-[22px] font-black text-[#3b82f6]">0</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400 mb-1">Remaining</p>
                            <p className="text-[22px] font-black text-[#7c3aed]">{totalExercises}</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-5 border-t sm:border-t-0 border-gray-100">
                        <p className="text-[11px] font-black text-[#222] mb-4 flex items-center gap-1">
                          <Users size={11} className="text-[#7c3aed]" /> Session Status:
                        </p>
                        <div className="text-center">
                          <p className="text-[13px] font-black text-gray-600">
                            {sessionStarted ? "Active Session" : "No Active Session"}
                          </p>
                          {incompleteSession && (
                            <button
                              onClick={() => router.push("/workout/viewWorkoutSession")}
                              className="mt-3 bg-[#7c3aed] text-white px-4 py-2 rounded-xl text-xs font-bold"
                            >
                              Rejoin Session
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : activeView === "Powersets" ? (
                <div className="space-y-6 pb-20">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-full bg-[#7c3aed] flex items-center justify-center text-white">
                      <Zap size={18} />
                    </div>
                    <div>
                      <h2 className="text-[20px] font-black text-[#222]">Power Sets</h2>
                      <p className="text-[11px] text-gray-400">Your strength movements</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] font-black text-[#7c3aed] uppercase tracking-widest">
                      {workoutTitle || "WORKOUT"}
                    </p>
                    <p className="text-[18px] font-black text-[#222]">
                      {totalExercises} total exercises
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {workoutGroups.slice(0, 4).map((group, gi) => (
                      <div key={gi} className="bg-white rounded-[20px] border-2 border-[#ede9fe] p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="bg-[#7c3aed] text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase">
                              {group.label}
                            </span>
                            {group.rounds && (
                              <span className="bg-emerald-500 text-white text-[9px] font-black px-2.5 py-1 rounded-full">
                                {group.rounds}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="space-y-2">
                          {group.workouts.slice(0, 3).map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-50">
                              <span className="text-[11px] font-semibold text-gray-700">{item.exercise_name}</span>
                              <span className="text-[10px] text-gray-400">{item.reps || "—"}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : activeView === "Map" ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#7c3aed] flex items-center justify-center text-white">
                        <MapPin size={20} />
                      </div>
                      <div>
                        <h2 className="text-[22px] font-black text-[#222]">Workout Map</h2>
                        <p className="text-[11px] text-gray-400">Exercise breakdown by rounds</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const code = (localStorage.getItem("workoutProgramCode") || "unknown").toUpperCase();
                        localStorage.setItem("pendingSessionCode", code);
                        localStorage.setItem("pendingWorkoutGroups", JSON.stringify(workoutGroups));
                        router.push("/workout/equipmentNeeded");
                      }}
                      disabled={isLocked}
                      className={`${isLocked ? 'bg-gray-400' : 'bg-emerald-500 hover:bg-emerald-600'} transition text-white font-black text-[13px] px-6 py-3 rounded-2xl disabled:opacity-60`}
                    >
                      Complete Workout
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {rounds.map((round) => {
                      const done = round.exercises.filter(e => selectedExercises.has(e.id)).length;
                      const collapsed = collapsedRounds.has(round.id);
                      return (
                        <div key={round.id} className="bg-white rounded-[20px] border border-gray-100 overflow-hidden shadow-sm">
                          <button
                            onClick={() => toggleRound(round.id)}
                            className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition"
                          >
                            <div className="w-8 h-8 rounded-full bg-[#7c3aed] flex items-center justify-center text-white text-[13px] font-black flex-shrink-0">
                              {round.id}
                            </div>
                            <div className="flex-1 text-left">
                              <p className="text-[13px] font-black text-[#222]">{round.label}</p>
                              <p className="text-[10px] text-gray-400">{round.rounds} · {done}/{round.exercises.length} exercises</p>
                            </div>
                            {collapsed ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronUp size={16} className="text-gray-400" />}
                          </button>

                          {!collapsed && (
                            <div className="px-4 pb-4 space-y-2">
                              {round.exercises.map((ex) => {
                                const sel = selectedExercises.has(ex.id);
                                return (
                                  <button
                                    key={ex.id}
                                    onClick={() => !isLocked && toggleExercise(ex.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${sel ? "bg-emerald-50 border border-emerald-200" : "bg-gray-50 border border-transparent hover:border-gray-200"} ${isLocked ? "opacity-60 cursor-not-allowed" : ""}`}
                                    disabled={isLocked}
                                  >
                                    <span className={`text-[11px] font-bold w-5 text-center flex-shrink-0 ${sel ? "text-emerald-500" : "text-gray-400"}`}>
                                      {ex.order || ex.id}
                                    </span>
                                    <span className={`flex-1 text-left text-[12px] font-semibold ${sel ? "text-emerald-600" : "text-[#222]"}`}>
                                      {ex.name}
                                    </span>
                                    <span className={`text-[9px] font-black px-2 py-1 rounded-full ${ex.loc === "HOME" ? "bg-gray-100 text-gray-500" : "bg-red-50 text-red-400"}`}>
                                      {ex.loc}
                                    </span>
                                    {sel
                                      ? <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" fill="white" />
                                      : <div className="w-[18px] h-[18px] rounded-full border-2 border-gray-300 flex-shrink-0" />
                                    }
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                // OVERVIEW - Dynamic from API
                <div className="space-y-10 relative">
                  {rejoinLoading && (
                    <div className="absolute inset-0 z-10 bg-white/80 flex flex-col items-center justify-center gap-3 rounded-2xl">
                      <Loader2 size={32} className="animate-spin text-purple-500" />
                      <p className="text-[13px] font-bold text-gray-500">Loading your session...</p>
                    </div>
                  )}
                  {workoutGroups.map((group, groupIdx) => {
                    const isGroupLocked = isLocked && groupIdx > 0;
                    const previewItems = isGroupLocked ? group.workouts.slice(0, 3) : group.workouts;
                    
                    return (
                      <section key={`${group.label}-${groupIdx}`}>
                        <div className="flex items-center gap-3 mb-6">
                          <div className={`w-8 h-1 rounded-full ${groupIdx === 0 ? 'bg-orange-400' : groupIdx === 1 ? 'bg-[#7c3aed]' : 'bg-emerald-500'}`} />
                          <h2 className="text-[11px] font-black uppercase tracking-wider text-gray-500">
                            {group.label} {group.rounds && `(${group.rounds})`}
                          </h2>
                          {isGroupLocked && <Lock size={12} className="text-gray-300 ml-auto" />}
                        </div>
                        
                        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                          {previewItems.map((item, i) => (
                            <DynamicExerciseCard
                              key={item.exercise_id || i}
                              item={item}
                              locked={isGroupLocked}
                              sessionStarted={sessionStarted}
                            />
                          ))}
                        </div>

                        {isGroupLocked && groupIdx === 1 && (
                          <div className="flex justify-center mt-8">
                            <div className="bg-white shadow-2xl border border-purple-100 rounded-3xl px-5 sm:px-10 py-8 sm:py-10 text-center max-w-xl w-full">
                              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-100 to-violet-200 flex items-center justify-center">
                                <Lock size={28} className="text-purple-700" />
                              </div>
                              <h2 className="text-xl sm:text-2xl font-black text-purple-700 mb-2">
                                Unlock Full Program
                              </h2>
                              <p className="text-sm text-gray-500 leading-relaxed mb-5">
                                Get access to all exercises, detailed form videos,
                                progression systems, and advanced athlete coaching tools.
                              </p>
                              <button
                                onClick={() => setShowPurchaseModal(true)}
                                className="bg-gradient-to-r from-purple-600 to-violet-600 text-white font-black px-8 py-3.5 rounded-2xl shadow-lg hover:shadow-xl transition flex items-center gap-3 mx-auto text-sm"
                              >
                                Buy Workout
                                <Lock size={16} />
                              </button>
                            </div>
                          </div>
                        )}
                      </section>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100 flex items-center">
        {["Overview", "Session", "Results", "Powersets", "Map"].map((item) => (
          <button
            key={item}
            onClick={() => {
              if (item === "Session") setShowSessionModal(true);
              else setActiveView(item);
            }}
            className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 text-[9px] font-bold uppercase tracking-wide transition-colors ${
              activeView === item ? "text-[#7c3aed]" : "text-gray-400"
            }`}
          >
            <Activity size={18} />
            {item}
          </button>
        ))}
        <button
          onClick={() => {
            localStorage.setItem("sessionActive", "true");
            router.push("/workout/athenaWorkout");
          }}
          disabled={!activeSession}
          className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 text-[9px] font-bold uppercase tracking-wide transition
            ${activeSession ? "text-[#7c3aed]" : "text-gray-300 cursor-not-allowed"}`}
        >
          <Play size={18} fill="currentColor" />
          Start
        </button>
      </div>

      {/* SESSION DETAILS MODAL */}
      {showSessionModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          onClick={() => setShowSessionModal(false)}
        >
          <div
            className="w-full max-w-[380px] rounded-[24px] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] px-5 pt-5 pb-5 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <Users size={15} />
                  </div>
                  <span className="text-[14px] font-black">Session Details</span>
                </div>
                <button
                  onClick={() => setShowSessionModal(false)}
                  className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition"
                >
                  <X size={13} />
                </button>
              </div>

              <div className="inline-flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1 text-[10px] font-bold mb-3">
                <Sparkles size={8} />
                ID: {incompleteSession?.id?.slice(0, 6) || "pending"}
              </div>

              <h2 className="text-[22px] leading-[24px] font-black uppercase mb-1">
                {workoutTitle || "RECONDITIONING"}
              </h2>

              <p className="text-[13px] opacity-75 mb-4">
                {totalExercises} exercises • {workoutGroups.length} rounds
              </p>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-white/15 rounded-2xl px-3.5 py-3">
                  <div className="flex items-center gap-1 text-[10px] font-bold uppercase opacity-70 mb-1">
                    <Calendar size={8} />
                    Status
                  </div>
                  <p className="text-[10px] font-black">
                    {sessionStarted ? "Active" : "Not Started"}
                  </p>
                </div>
                <div className="bg-white/15 rounded-2xl px-3.5 py-3">
                  <div className="flex items-center gap-1 text-[10px] font-bold uppercase opacity-70 mb-1">
                    <Users size={8} />
                    Location
                  </div>
                  <p className="text-[10px] font-black">
                    {location || "None"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white px-5 py-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[13px] font-black text-[#222]">Participants</span>
                <button className="w-8 h-8 rounded-full bg-[#7c3aed] text-white flex items-center justify-center">
                  <Share2 size={12} />
                </button>
              </div>

              <div className="bg-[#fafafa] border border-gray-100 rounded-[22px] p-5 text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-[#f0eeff] flex items-center justify-center mb-4">
                  <UserPlus size={24} className="text-[#7c3aed] opacity-70" />
                </div>
                <h3 className="text-[14px] font-black text-[#222] mb-1">
                  Waiting for teammates
                </h3>
                <p className="text-[10px] text-gray-400 leading-relaxed mb-5">
                  Share this workout session with your team.
                </p>
                <button className="w-full border border-dashed border-gray-300 text-gray-500 py-3 rounded-2xl text-[11px] font-bold hover:bg-gray-50 transition flex items-center justify-center gap-2">
                  <Eye size={14} />
                  Preview Mode
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INVITE / SHARE MODAL */}
      {showInviteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          onClick={() => setShowInviteModal(false)}
        >
          <div
            className="w-full max-w-[380px] flex flex-col bg-white rounded-[24px] overflow-hidden shadow-2xl"
            style={{ height: "520px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 pt-6 pb-4 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-[18px] font-black text-[#7c3aed]">Share This Session:</h2>
                  <p className="text-[11px] text-gray-400 mt-0.5">Session ID: {incompleteSession?.id?.slice(0, 6) || "pending"}</p>
                </div>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition mt-0.5"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1">
              <div className="bg-[#f5f5f7] rounded-2xl p-5 flex flex-col items-center">
                <div className="border-2 border-[#7c3aed] rounded-xl p-3 bg-white mb-3">
                  <svg width="100" height="100" viewBox="0 0 100 100" className="text-[#1e1e22]">
                    <rect x="0" y="0" width="40" height="40" rx="4" fill="currentColor"/>
                    <rect x="60" y="0" width="40" height="40" rx="4" fill="currentColor"/>
                    <rect x="0" y="60" width="40" height="40" rx="4" fill="currentColor"/>
                    <rect x="8" y="8" width="24" height="24" rx="2" fill="white"/>
                    <rect x="68" y="8" width="24" height="24" rx="2" fill="white"/>
                    <rect x="8" y="68" width="24" height="24" rx="2" fill="white"/>
                    <rect x="16" y="16" width="8" height="8" fill="currentColor"/>
                    <rect x="76" y="16" width="8" height="8" fill="currentColor"/>
                    <rect x="16" y="76" width="8" height="8" fill="currentColor"/>
                    <rect x="52" y="4" width="6" height="6" fill="currentColor"/>
                    <rect x="62" y="4" width="6" height="6" fill="currentColor"/>
                    <rect x="52" y="14" width="6" height="6" fill="currentColor"/>
                    <rect x="4" y="52" width="6" height="6" fill="currentColor"/>
                    <rect x="14" y="52" width="6" height="6" fill="currentColor"/>
                    <rect x="24" y="52" width="6" height="6" fill="currentColor"/>
                    <rect x="52" y="52" width="6" height="6" fill="currentColor"/>
                    <rect x="62" y="62" width="6" height="6" fill="currentColor"/>
                    <rect x="74" y="52" width="6" height="6" fill="currentColor"/>
                    <rect x="84" y="62" width="6" height="6" fill="currentColor"/>
                    <rect x="52" y="74" width="6" height="6" fill="currentColor"/>
                    <rect x="64" y="84" width="6" height="6" fill="currentColor"/>
                    <rect x="84" y="84" width="6" height="6" fill="currentColor"/>
                  </svg>
                </div>
                <p className="text-[11px] text-gray-400 font-medium">Scan this code to join the session</p>
              </div>

              <div>
                <p className="text-[13px] font-black text-[#222] mb-3">Share with Followers:</p>
                <div className="flex items-center gap-2 border border-gray-200 rounded-2xl px-4 py-2.5 mb-3">
                  <Search size={14} className="text-gray-400 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search Followers"
                    value={followerSearch}
                    onChange={(e) => setFollowerSearch(e.target.value)}
                    className="flex-1 text-[12px] outline-none text-gray-700 placeholder-gray-400 bg-transparent"
                  />
                </div>
                <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
                  {[
                    { initials: "JD", name: "johndoe", color: "bg-[#7c3aed]" },
                    { initials: "SK", name: "sarahk", color: "bg-blue-500" },
                    { initials: "AM", name: "alexm", color: "bg-orange-400" },
                    { initials: "LW", name: "lisawong", color: "bg-teal-400" },
                    { initials: "RG", name: "robg", color: "bg-green-500" },
                    { initials: "TP", name: "tompark", color: "bg-yellow-400" },
                    { initials: "MK", name: "marykay", color: "bg-red-400" },
                  ].map((u) => (
                    <div key={u.initials} className="flex flex-col items-center gap-1 flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full ${u.color} flex items-center justify-center text-white text-[11px] font-black`}>
                        {u.initials}
                      </div>
                      <span className="text-[9px] text-gray-400 font-medium">{u.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[13px] font-black text-[#222] mb-3">Invite via Link</p>
                <div className="border border-gray-200 rounded-2xl px-4 py-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Link size={12} className="text-gray-400 flex-shrink-0" />
                    <p className="text-[11px] text-gray-400 truncate">https://www.proformapp.com/session/{incompleteSession?.id?.slice(0, 6) || "pending"}</p>
                  </div>
                </div>
                <button className="w-full bg-[#3b82f6] text-white py-3.5 rounded-2xl font-bold text-[13px] flex items-center justify-center gap-2">
                  <Copy size={14} />
                  Copy URL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PURCHASE MODAL (from 1st code) */}
      {showPurchaseModal && (
        <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-[3px] flex items-center justify-center p-3">
          <div className="bg-white w-full max-w-[420px] rounded-[24px] shadow-2xl relative overflow-hidden">
            <button
              onClick={() => setShowPurchaseModal(false)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
            >
              <X size={14} />
            </button>

            <div className="px-5 py-6">
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-[18px] bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-md relative">
                  <FileText size={22} className="text-white" />
                  <div className="absolute -right-1 -bottom-1 w-6 h-6 rounded-full bg-blue-500 border-[3px] border-white" />
                </div>
              </div>

              <h2 className="text-[19px] font-black text-center text-gray-900 leading-snug">
                You don't have access to this
                <br />
                workout or program
              </h2>

              <p className="text-center text-gray-500 mt-3 text-[13px]">
                Purchase this Workout / Program
              </p>

              <p className="text-center text-gray-400 text-[11px] mt-1">
                (Expires in 30 days)
              </p>

              <div className="flex justify-center mt-5">
                <button
                  onClick={() => {
                    setHasPurchased(true);
                    setShowPurchaseModal(false);
                  }}
                  className="bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-700 hover:to-violet-800 text-white font-black text-[13px] px-6 py-2.5 rounded-xl shadow-md transition"
                >
                  Purchase for $19.95
                </button>
              </div>

              <div className="border-t border-gray-200 my-5" />

              <div className="bg-[#faf7ff] border border-purple-100 rounded-[20px] p-4 text-center">
                <div className="inline-flex items-center justify-center px-4 py-1 rounded-full bg-[#ff6b2c] text-white font-black text-[11px] mb-4">
                  OPM
                </div>
                <p className="text-gray-500 leading-relaxed text-[12px]">
                  You can access this program and all other workouts/programs
                  in this package by purchasing a Franchise License.
                </p>
                <p className="text-gray-400 text-[11px] mt-5">
                  View details and options below:
                </p>
                <button className="mt-4 text-[#00b7ff] font-black hover:opacity-80 transition inline-flex items-center gap-1.5 text-[13px]">
                  Other options
                  <ChevronRight size={14} />
                </button>
              </div>

              <div className="text-center mt-5">
                <button className="text-[#3b82f6] font-black hover:opacity-80 transition inline-flex items-center gap-1.5 text-[13px]">
                  View Franchise Details
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EXERCISE TRACKING MODAL (from 1st code) */}
      {trackingItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[3px] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-[480px] rounded-t-[28px] sm:rounded-[28px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100 flex-shrink-0">
              <h2 className="text-[15px] font-black text-gray-900">Exercise Tracking</h2>
              <button
                onClick={() => setTrackingItem(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
              >
                <X size={14} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-[#efefef] rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {trackingItem.demo_gif ? (
                    <img src={resolveWixImage(trackingItem.demo_gif)} alt={trackingItem.exercise_name} className="w-full h-full object-cover" />
                  ) : (
                    <Dumbbell className="w-7 h-7 text-gray-300" />
                  )}
                </div>
                <p className="text-[13px] font-black text-gray-800 uppercase tracking-wide leading-snug">
                  {trackingItem.exercise_name}
                </p>
              </div>

              {(() => {
                const userUnit = (userOtherDetail?.measurementUnit || "lbs").toLowerCase();
                const toUnit = (val: string) => {
                  const n = parseFloat(val) || 0;
                  return userUnit === "kg" ? n / 2.20462 : n;
                };
                const wMap: Record<string, number> = userOtherDetail ? {
                  "of InputBarbellSquat": toUnit(userOtherDetail.r_back_squat),
                  "of InputDeadlift": toUnit(userOtherDetail.r_deadlift),
                  "of InputBenchPress": toUnit(userOtherDetail.r_bench_press),
                  "of InputPowerClean": toUnit(userOtherDetail.r_power_clean),
                  "of BodyWeight": toUnit(userOtherDetail.currentWeight),
                } : {};
                const weightAdj = (trackingItem.weight_adj || "").trim();
                const weightVal = trackingItem.weight || "0";
                let displayWeight = "";
                const base = wMap[weightAdj];
                if (base !== undefined && base > 0) {
                  const calc = Math.ceil(base * (parseFloat(weightVal) || 0));
                  if (calc > 0) displayWeight = `${calc} ${userUnit}`;
                } else {
                  const n = parseFloat(weightVal) || 0;
                  if (n > 0) displayWeight = `${weightVal} ${userUnit}`;
                }
                const cleanReps = (r: string | number | null | undefined) => {
                  const s = String(r ?? "").trim();
                  return (s.split("-").pop()?.trim() || "").replace(/\D/g, "");
                };
                const suggestedSets = trackingItem.sets || "1";
                const suggestedReps = cleanReps(trackingItem.reps) || "15";

                return (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 rounded-2xl p-4 text-center border border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Last</p>
                        {logsLoading ? (
                          <Loader2 size={14} className="animate-spin text-gray-300 mx-auto" />
                        ) : lastRecord ? (
                          <>
                            <p className="text-[13px] font-black text-gray-700">{lastRecord.weight}</p>
                            <p className="text-[10px] text-gray-400">{userUnit}</p>
                            <p className="text-[11px] font-bold text-gray-500">×{lastRecord.reps} reps</p>
                          </>
                        ) : (
                          <p className="text-[12px] font-bold text-gray-400">No records yet</p>
                        )}
                      </div>
                      <div className="bg-gray-50 rounded-2xl p-4 text-center border border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Best</p>
                        {logsLoading ? (
                          <Loader2 size={14} className="animate-spin text-gray-300 mx-auto" />
                        ) : bestRecord ? (
                          <>
                            <p className="text-[13px] font-black text-gray-700">{bestRecord.weight}</p>
                            <p className="text-[10px] text-gray-400">{userUnit}</p>
                            <p className="text-[11px] font-bold text-gray-500">×{bestRecord.reps} reps</p>
                          </>
                        ) : (
                          <p className="text-[12px] font-bold text-gray-400">No records yet</p>
                        )}
                      </div>
                    </div>

                    <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-1">Suggested</p>
                        <p className="text-[13px] font-black text-purple-700">{suggestedSets}x {suggestedReps}</p>
                      </div>
                      {displayWeight && (
                        <p className="text-[13px] font-black text-purple-700">{displayWeight}</p>
                      )}
                    </div>
                  </>
                );
              })()}

              <p className="text-[11px] text-gray-400 text-center">
                Log your reps and weight to better track your progress
              </p>

              {/* <button className="w-full border border-gray-200 rounded-xl py-2.5 text-[12px] font-bold text-gray-600 hover:bg-gray-50 transition">
                Add custom exercise Standard
              </button> */}

              <div className="space-y-3">
                {sets.map((set, i) => (
                  <div key={i} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Set {i + 1}</span>
                      {set.saved && set.load != null && (
                        <span className="text-[10px] font-bold text-gray-400">Load: {set.load}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 pl-1">Weight (lbs)</p>
                        <input
                          type="number"
                          value={set.weight}
                          onChange={(e) => updateSet(i, "weight", e.target.value)}
                          placeholder="0"
                          disabled={set.saved}
                          className={`w-full rounded-xl border px-3 py-2.5 text-[15px] font-bold outline-none transition placeholder:text-gray-300 ${set.saved ? "bg-gray-100 border-gray-200 cursor-not-allowed text-gray-400" : "bg-white border-gray-200 text-gray-800 focus:border-purple-400 focus:ring-2 focus:ring-purple-100"}`}
                        />
                      </div>
                      <X size={12} className="text-gray-300 flex-shrink-0 mt-5" />
                      <div className="flex-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 pl-1">Reps /e</p>
                        <input
                          type="number"
                          value={set.reps}
                          onChange={(e) => updateSet(i, "reps", e.target.value)}
                          placeholder="0"
                          disabled={set.saved}
                          className={`w-full rounded-xl border px-3 py-2.5 text-[15px] font-bold outline-none transition placeholder:text-gray-300 ${set.saved ? "bg-gray-100 border-gray-200 cursor-not-allowed text-gray-400" : "bg-white border-gray-200 text-gray-800 focus:border-purple-400 focus:ring-2 focus:ring-purple-100"}`}
                        />
                      </div>
                    </div>
                    {!set.saved && (
                      <button
                        disabled={savingSetIndex === i}
                        onClick={async () => {
                          if (!trackingItem) return;
                          const code = localStorage.getItem("workoutProgramCode")?.toUpperCase();
                          const sessionId = code ? localStorage.getItem(`activeSessionId_${code}`) : null;
                          if (!sessionId || !code) return;
                          const setNumber = i + 1;
                          const weightNum = parseFloat(set.weight) || 0;
                          const repsNum = parseInt(set.reps) || 0;
                          const userWeight = parseFloat(userOtherDetail?.currentWeight || "0") || 0;
                          const userHeight = parseFloat(userOtherDetail?.height || "0") || 0;
                          const computedLoad = Math.ceil(((userWeight * userHeight) + repsNum * weightNum) / 2600);
                          const payload = {
                            title: `Set ${setNumber}`,
                            exerciseId: trackingItem.exercise_id,
                            sessionId,
                            workoutLibraryId: code,
                            weight: weightNum,
                            repetitions: repsNum,
                            status: true,
                            tag: "/e",
                            load: computedLoad,
                          };
                          console.log("[tracking] Saving set", setNumber, payload);
                          setSavingSetIndex(i);
                          try {
                            const result = await createTrackingLog(payload);
                            console.log("[tracking] Set", setNumber, "saved:", result);
                            setSets((prev) => prev.map((s, idx) => idx === i ? { ...s, saved: true, load: result.load ?? computedLoad } : s));
                          } catch (err) {
                            console.error("[tracking] Failed to save set", setNumber, err);
                          } finally {
                            setSavingSetIndex(null);
                          }
                        }}
                        className="mt-3 w-full bg-white border border-gray-200 rounded-xl py-2 text-[11px] font-bold text-gray-600 hover:bg-gray-100 transition disabled:opacity-60 flex items-center justify-center gap-1"
                      >
                        {savingSetIndex === i ? <><Loader2 size={11} className="animate-spin" /> Saving...</> : "Save"}
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={addSet}
                className="w-full border-2 border-dashed border-purple-200 rounded-2xl py-3 flex items-center justify-center gap-2 text-[12px] font-bold text-purple-500 hover:bg-purple-50 transition"
              >
                <Plus size={15} />
                Add Set
              </button>
            </div>

            <div className="px-5 py-4 border-t border-gray-100 flex flex-col gap-2 flex-shrink-0">
              <button
                disabled={savingLogs}
                onClick={async () => {
                  if (!trackingItem) return;
                  const code = localStorage.getItem("workoutProgramCode")?.toUpperCase();
                  const sessionId = code ? localStorage.getItem(`activeSessionId_${code}`) : null;
                  if (!sessionId || !code) { setTrackingItem(null); return; }
                  setSavingLogs(true);
                  try {
                    const payloads = sets
                      .map((set, i) => ({ set, setNumber: i + 1 }))
                      .filter(({ set }) => !set.saved)
                      .map(({ set, setNumber }) => ({
                        title: `Set ${setNumber}`,
                        exerciseId: trackingItem.exercise_id,
                        sessionId,
                        workoutLibraryId: code,
                        weight: parseFloat(set.weight) || 0,
                        repetitions: parseInt(set.reps) || 0,
                      }));
                    console.log("[tracking] Saving", payloads.length, "unsaved set(s):", payloads);
                    if (payloads.length > 0) {
                      const results = await Promise.all(payloads.map((p) => createTrackingLog(p)));
                      console.log("[tracking] Saved successfully:", results);
                    }
                  } catch (err) {
                    console.error("[tracking] Failed to save logs:", err);
                  } finally {
                    setSavingLogs(false);
                    setTrackingItem(null);
                  }
                }}
                className="w-full bg-gradient-to-r from-purple-600 to-violet-600 text-white font-black py-3 rounded-xl text-[13px] hover:opacity-90 transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {savingLogs ? <><Loader2 size={15} className="animate-spin" /> Saving...</> : "Save"}
              </button>
              <button
                onClick={() => setTrackingItem(null)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-700 font-bold py-3 rounded-xl text-[12px] hover:bg-gray-100 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}