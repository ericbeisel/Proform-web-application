"use client";

import { useRouter, useSearchParams } from "next/navigation";
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
  Check,
  Link,
  Zap,
  Flame,
  BarChart2,
  ChevronUp,
  ChevronDown,
  Dumbbell,
  CheckCircle2,
  Lock,
  Loader2,
  Plus,
  FileText,
  Award,
  TrendingUp,
} from "lucide-react";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import PowerSetTrackingModal, { type VelocitySet } from "./PowerSetTrackingModal";
import {
  getProgramPowerSets,
  getProgramOverview,
  WorkoutGroup,
  WorkoutGroupItem,
  PowerSet,
  ProgramPreview,
} from "@/api/programs/route";
import {
  getIncompleteSessions,
  getWorkoutSection,
  getWorkoutSectionFull,
  swapExercise,
  getTrackingLogs,
  createTrackingLog,
  getWorkoutStats,
  getWorkoutLoadRecords,
  getWorkoutSessionById,
  getPowerSetLogs,
  IncompleteSession,
  WorkoutStats,
  WorkoutLoadRecord,
} from "@/api/workouts/route";
import { dashboardApi, UserOtherDetail } from "@/api/dashboard/route";
import { feedApi, Advertisement } from "@/api/feed/route";
import { getUserIdFromToken } from "@/lib/auth/session";

function getSectionColor(label: string, index: number): string {
  const l = (label || "").toLowerCase();
  if (l.includes("warm") || l.includes("pre")) return "#F97316";
  if (l.includes("round 1")) return "#8B5CF6";
  if (l.includes("round 2")) return "#3B82F6";
  if (l.includes("round 3")) return "#10B981";
  const colors = ["#F97316", "#8B5CF6", "#3B82F6", "#10B981", "#EC4899"];
  return colors[index % colors.length];
}

function resolveWixImage(url?: string): string {
  if (!url) return "";
  if (url.startsWith("wix:image://v1/")) {
    const mediaId = url
      .replace("wix:image://v1/", "")
      .split("#")[0]
      .split("/")[0];
    return `https://static.wixstatic.com/media/${mediaId}`;
  }
  return url;
}

function ViewWorkoutSessionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Existing state
  const [location, setLocation] = useState<string | null>(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [sessionLinkCopied, setSessionLinkCopied] = useState(false);
  const [followerSearch, setFollowerSearch] = useState("");
  const [activeView, setActiveView] = useState("Overview");
  const [selectedSets, setSelectedSets] = useState<Set<string>>(new Set());
  const [selectedCards, setSelectedCards] = useState<Set<number>>(new Set());
  const [selectedExercises, setSelectedExercises] = useState<Set<number>>(
    new Set(),
  );
  const [collapsedRounds, setCollapsedRounds] = useState<Set<number>>(
    new Set(),
  );
  const [expandedPowerSets, setExpandedPowerSets] = useState<Set<number>>(
    new Set(),
  );
  const [swappedExercises, setSwappedExercises] = useState<
    Map<string, WorkoutGroupItem>
  >(new Map());
  // New state from 1st code
  const [activeSession, setActiveSession] = useState<IncompleteSession | null>(
    null,
  );
  // True only once the user has explicitly engaged with a session (created it or
  // pressed Rejoin) — as opposed to merely having a matching session ID sitting in
  // localStorage. Scoped per-session-id so it self-heals once a session completes.
  const [isSessionEngaged, setIsSessionEngaged] = useState(false);
  const [workoutGroups, setWorkoutGroups] = useState<WorkoutGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejoinLoading, setRejoinLoading] = useState(false);
  const [workoutTitle, setWorkoutTitle] = useState<string>("");
  const [workoutName, setWorkoutName] = useState<string>("");
  const [programTags, setProgramTags] = useState<string[]>([]);
  const [previewData, setPreviewData] = useState<ProgramPreview | null>(null);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [incompleteSessions, setIncompleteSessions] = useState<
    IncompleteSession[]
  >([]);
  const incompleteSession = incompleteSessions[0] ?? null;
  const [showRejoinModal, setShowRejoinModal] = useState(false);
  const [trackingItem, setTrackingItem] = useState<WorkoutGroupItem | null>(
    null,
  );
  const [sets, setSets] = useState<
    { weight: string; reps: string; saved: boolean; load?: number }[]
  >([{ weight: "", reps: "", saved: false }]);
  const [lastRecord, setLastRecord] = useState<{
    weight: number;
    reps: number;
  } | null>(null);
  const [bestRecord, setBestRecord] = useState<{
    weight: number;
    reps: number;
  } | null>(null);
  const [logsLoading, setLogsLoading] = useState(false);
  const [savingLogs, setSavingLogs] = useState(false);
  const [savingSetIndex, setSavingSetIndex] = useState<number | null>(null);
  const [userOtherDetail, setUserOtherDetail] =
    useState<UserOtherDetail | null>(null);
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [adIndex, setAdIndex] = useState(0);
  const [selectedAd, setSelectedAd] = useState<Advertisement | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [workoutStats, setWorkoutStats] = useState<WorkoutStats | null>(null);
  const [loadRecords, setLoadRecords] = useState<WorkoutLoadRecord[]>([]);
  const [roundLoads, setRoundLoads] = useState<number[]>([]);
  const [completedSectionsCount, setCompletedSectionsCount] = useState(0);
  const [filterByLocation, setFilterByLocation] = useState(false);
  const [locationFilteredGroups, setLocationFilteredGroups] = useState<
    WorkoutGroup[]
  >([]);
  const [locationFilterLoading, setLocationFilterLoading] = useState(false);
  const [powerSets, setPowerSets] = useState<PowerSet[]>([]);
  const [powerSetsLoading, setPowerSetsLoading] = useState(false);
  const [velocityExercise, setVelocityExercise] = useState<PowerSet | null>(null);
  const [velocitySets, setVelocitySets] = useState<VelocitySet[]>([]);
  const velocitySetsCache = useRef<Record<string, VelocitySet[]>>({});
  const [mapSessionLogs, setMapSessionLogs] = useState<any[]>([]);
  const [mapLoadRecords, setMapLoadRecords] = useState<WorkoutLoadRecord[]>([]);
  const [mapLoading, setMapLoading] = useState(false);

  const openVelocityModal = useCallback((ps: PowerSet) => {
    setVelocityExercise(ps);
    const cached = velocitySetsCache.current[ps.id];
    if (cached) {
      setVelocitySets(cached);
    } else {
      setVelocitySets(
        (ps.child_sets ?? []).map((s) => ({
          weight: "",
          reps: s.reps ? String(s.reps).replace(/\D/g, "") : "",
          unit: s.msrmt || "lbs",
          recorded: s.isCompleted || false,
          suggestedWeight: s.calculated_weight ? String(s.calculated_weight) : undefined,
          suggestedReps: s.reps ? String(s.reps) : undefined,
          pwrst_wt: s.multiplier,
          weight_adjust: (ps as any).weight_adj,
          min_reps: s.min_reps ?? undefined,
          power_id: s.id,
        }))
      );
    }
  }, []);

  const addVelocitySet = useCallback(() => {
    setVelocitySets((prev) => [
      ...prev,
      { weight: "", reps: "", unit: "lbs", recorded: false, isCustom: true },
    ]);
  }, []);

  const updateVelocitySet = useCallback((index: number, field: string, value: any) => {
    setVelocitySets((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }, []);

  const toggleRecordVelocitySet = useCallback((index: number) => {
    setVelocitySets((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], recorded: !next[index].recorded };
      return next;
    });
  }, []);

  const refreshPowerSets = useCallback(async () => {
    const code = localStorage.getItem("workoutProgramCode");
    const sid = activeSession?.id ?? activeSession?.session_id;
    if (!code) return;
    setPowerSetsLoading(true);
    getProgramPowerSets(code, sid)
      .then(setPowerSets)
      .catch(() => {})
      .finally(() => setPowerSetsLoading(false));
  }, [activeSession]);

  useEffect(() => {
    if (activeView !== "Map") return;
    const sid = activeSession?.id ?? (activeSession as any)?.session_id;
    if (!sid) return;
    setMapLoading(true);
    Promise.all([
      getTrackingLogs({ sessionId: sid }).catch(() => [] as any[]),
      getPowerSetLogs(sid).catch(() => [] as any[]),
      getWorkoutLoadRecords(sid).catch(() => [] as WorkoutLoadRecord[]),
    ]).then(([stdLogs, psLogs, loads]) => {
      const mappedPsLogs = (psLogs as any[]).map((l: any) => ({
        ...l,
        exerciseId: l.individual_exercise_id || l.exerciseId,
        specializedWorkoutId: l.specialized_workout_id || l.specializedWorkoutId,
        weight: l.new_weight ?? l.member_weight_rmp ?? 0,
        repetitions: l.reps,
        title: l.title || "Power Set",
        isPowerSetLog: true,
      }));
      setMapSessionLogs([...(stdLogs as any[]), ...mappedPsLogs]);
      setMapLoadRecords(loads as WorkoutLoadRecord[]);
    }).finally(() => setMapLoading(false));
  }, [activeView, activeSession]);

  // Existing handlers
  const toggleCard = (i: number) => {
    setSelectedCards((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const toggleExercise = (id: number) => {
    setSelectedExercises((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleRound = (id: number) => {
    setCollapsedRounds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const togglePowerSet = (id: number) => {
    setExpandedPowerSets((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSet = (key: string) => {
    setSelectedSets((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const handleLocationFilter = async (checked: boolean) => {
    setFilterByLocation(checked);
    if (!checked) return;

    const code = localStorage.getItem("workoutProgramCode");
    const sid =
      activeSession?.id ??
      (code
        ? localStorage.getItem(`activeSessionId_${code.toUpperCase()}`)
        : null);
    if (!workoutGroups.length || !sid) {
      setFilterByLocation(false);
      return;
    }

    setLocationFilterLoading(true);
    try {
      const filtered = await Promise.all(
        workoutGroups.map(async (group) => {
          const existingExercises = group.workouts
            .map((w) => w.exercise_id)
            .filter(Boolean);
          const swappedWorkouts = await Promise.all(
            group.workouts.map(async (item): Promise<WorkoutGroupItem> => {
              const result = await swapExercise({
                exerciseId: item.exercise_id,
                sessionId: sid,
                section: group.label,
                existingExercises,
              });
              if (result.swapped) {
                return {
                  ...item,
                  exercise_id: result.exercise.exercise_id,
                  exercise_name: result.exercise.name,
                  demo_gif: result.exercise.demoGif,
                  supplemental: result.exercise.supplemental,
                  reps: result.exercise.defaultReps || item.reps,
                };
              }
              return item;
            }),
          );
          return { ...group, workouts: swappedWorkouts };
        }),
      );
      setLocationFilteredGroups(filtered);
    } catch (err) {
      console.error("[location filter] Failed:", err);
      setFilterByLocation(false);
    } finally {
      setLocationFilterLoading(false);
    }
  };

  // New handlers from 1st code
  const addSet = () =>
    setSets((prev) => [
      ...prev,
      { weight: prev[prev.length - 1]?.weight || "", reps: "", saved: false },
    ]);
  const updateSet = (i: number, field: "weight" | "reps", val: string) =>
    setSets((prev) =>
      prev.map((s, idx) => (idx === i ? { ...s, [field]: val } : s)),
    );

  const openTracking = async (item: WorkoutGroupItem) => {
    setTrackingItem(item);
    setSets([{ weight: "", reps: "", saved: false }]);
    setLastRecord(null);
    setBestRecord(null);

    const code = localStorage.getItem("workoutProgramCode")?.toUpperCase();
    const sessionId = code
      ? localStorage.getItem(`activeSessionId_${code}`)
      : null;
    console.log(
      "[tracking] openTracking — code:",
      code,
      "sessionId:",
      sessionId,
      "exerciseId:",
      item.exercise_id,
    );

    if (!item.exercise_id) {
      console.warn("[tracking] ✗ No exercise_id on item — skipping fetch");
      return;
    }

    setLogsLoading(true);
    try {
      // 1. All-time records for Last / Best (no sessionId filter — matches mobile)
      const allLogs = await getTrackingLogs({ exercise_id: item.exercise_id });
      console.log("[tracking] All-time logs:", allLogs.length);
      if (allLogs.length > 0) {
        // API returns desc by date — index 0 is most recent
        setLastRecord({
          weight: allLogs[0].weight,
          reps: allLogs[0].repetitions,
        });
        const best = allLogs.reduce(
          (b, r) => (r.weight > b.weight ? r : b),
          allLogs[0],
        );
        setBestRecord({ weight: best.weight, reps: best.repetitions });
      }

      // 2. Session-specific records to pre-populate set inputs
      if (sessionId) {
        const sessionLogs = await getTrackingLogs({
          sessionId,
          exercise_id: item.exercise_id,
        });
        console.log(
          "[tracking] Session logs:",
          sessionLogs.length,
          sessionLogs,
        );
        if (sessionLogs.length > 0) {
          const sorted = [...sessionLogs].sort((a, b) => {
            const numA = parseInt(a.title?.replace(/\D/g, "") || "0");
            const numB = parseInt(b.title?.replace(/\D/g, "") || "0");
            return numA - numB;
          });
          setSets(
            sorted.map((log) => ({
              weight: String(log.weight ?? ""),
              reps: String(log.repetitions ?? ""),
              saved: log.status === true,
              load: log.load,
            })),
          );
        }
      }
    } catch (err) {
      console.error("[tracking] ✗ Failed to fetch logs:", err);
    } finally {
      setLogsLoading(false);
    }
  };

  const totalExercises = workoutGroups.reduce(
    (sum, g) => sum + g.workouts.length,
    0,
  );
  const isLocked = !hasPurchased;

  const getRoundLabel = (roundValue: number | string | undefined): string => {
    if (!workoutGroups || workoutGroups.length === 0) return `ROUND ${roundValue ?? 1}`;
    const alphaSorted = [...workoutGroups].sort((a, b) =>
      (a.label || "").localeCompare(b.label || "")
    );
    return alphaSorted[Number(roundValue ?? 1) - 1]?.label || `ROUND ${roundValue ?? 1}`;
  };

  const handleRejoin = async (session: IncompleteSession) => {
    setSessionStarted(true);
    setActiveSession(session);
    setIsSessionEngaged(true);
    localStorage.setItem(`sessionEngaged_${session.id}`, "true");
    setRejoinLoading(true);
    const programCode = localStorage
      .getItem("workoutProgramCode")
      ?.toUpperCase();
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
          const isSwapped =
            !!sectionEx.original_exercise_name &&
            sectionEx.original_exercise_name !== "null";
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
        localStorage.setItem(
          `swappedExercises_${programCode}`,
          JSON.stringify(newSwapsMap),
        );
      }
    } catch (err) {
      console.error("[rejoin] Failed to fetch swaps:", err);
      const savedSwaps = programCode
        ? localStorage.getItem(`swappedExercises_${programCode}`)
        : null;
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
      // Arriving via a shared "Copy URL" link (?sessionId=...) on a browser with
      // no local session state — resolve the program code/title from the
      // session itself so the rest of this function (which reads from
      // localStorage) can proceed exactly as it does for the normal in-app flow.
      const urlSessionId = searchParams.get("sessionId");
      if (urlSessionId && !localStorage.getItem("workoutProgramCode")) {
        try {
          const session = await getWorkoutSessionById(urlSessionId);
          const resolvedCode = session?.workout_code || session?.program_id;
          if (resolvedCode) {
            localStorage.setItem("workoutProgramCode", resolvedCode);
          }
          const resolvedTitle = session?.workoutTitle || session?.title;
          if (resolvedTitle) localStorage.setItem("workoutTitle", resolvedTitle);
        } catch (err) {
          console.error("[viewWorkout] failed to resolve session for shared link:", err);
        }
      }

      const savedLocation = localStorage.getItem("workoutLocationName");
      if (savedLocation) setLocation(savedLocation);

      const programCode = localStorage.getItem("workoutProgramCode");
      const title = localStorage.getItem("workoutTitle");
      if (title) setWorkoutTitle(title);
      const name = localStorage.getItem("workoutName");
      if (name) setWorkoutName(name);

      const isFree = localStorage.getItem("workoutIsFree");
      if (isFree === "true") setHasPurchased(true);

      // A shared "Copy URL" link carries ?sessionId=... so anyone opening it
      // loads that specific session, regardless of their own local session state.
      const storedSessionId =
        searchParams.get("sessionId") ??
        localStorage.getItem(`activeSessionId_${programCode?.toUpperCase()}`) ??
        localStorage.getItem("summarySessionId");
      console.log(
        "[viewWorkout] programCode:",
        programCode,
        "| storedSessionId:",
        storedSessionId,
      );
      if (storedSessionId) {
        setSessionStarted(true);
        getWorkoutStats(storedSessionId)
          .then(setWorkoutStats)
          .catch(console.error);

        // Fetch load records and compute per-round totals
        getWorkoutLoadRecords(storedSessionId)
          .then((records) => {
            setLoadRecords(records);
            console.log("[viewWorkout] load records:", records);
          })
          .catch(console.error);
      } else {
        console.warn("[viewWorkout] no sessionId found — stats will not load");
      }

      if (!programCode) {
        setLoading(false);
        return;
      }

      // Single consolidated call replaces separate tags/preview/power-sets/
      // grouped-workouts requests — the backend returns everything needed
      // for this view (optionally scoped to storedSessionId) in one response.
      setPowerSetsLoading(true);
      getProgramOverview(programCode.toLowerCase(), { sessionId: storedSessionId })
        .then((overview) => {
          setProgramTags(Array.isArray(overview.tags) ? overview.tags : []);
          setPreviewData(overview.preview ?? null);
          setPowerSets(Array.isArray(overview.powerSets) ? overview.powerSets : []);

          // A shared-link visitor never goes through the "browse program"
          // flow that normally sets workoutIsFree in localStorage, so a
          // free program would otherwise show a "requires purchase" paywall.
          if (overview.preview?.free) {
            localStorage.setItem("workoutIsFree", "true");
            setHasPurchased(true);
          }

          const groups = Array.isArray(overview.rounds) ? overview.rounds : [];
          const getRoundNum = (label: string) => {
            const m = label.match(/^ROUND\s+(\d+)/i);
            return m ? parseInt(m[1], 10) : Infinity;
          };
          groups.sort((a, b) => getRoundNum(a.label) - getRoundNum(b.label));
          setWorkoutGroups(groups);
        })
        .catch((err) => console.error("Failed to fetch program overview:", err))
        .finally(() => {
          setPowerSetsLoading(false);
          setLoading(false);
        });

      const normalizedCode = programCode.toUpperCase();
      const justCreated = localStorage.getItem("sessionJustCreated") === "true";
      if (justCreated) localStorage.removeItem("sessionJustCreated");
      const sessionActive = localStorage.getItem("sessionActive") === "true";

      console.log(
        "[mount] justCreated:",
        justCreated,
        "| sessionActive:",
        sessionActive,
        "| normalizedCode:",
        normalizedCode,
      );

      // Load saved swaps on first visit after session creation OR when returning from athenaWorkout
      if (justCreated || sessionActive) {
        const savedSwaps = localStorage.getItem(
          `swappedExercises_${normalizedCode}`,
        );
        console.log(
          "[mount] loading swaps from localStorage (justCreated:",
          justCreated,
          "| sessionActive:",
          sessionActive,
          "):",
          savedSwaps ? "found" : "not found",
        );
        if (savedSwaps) {
          try {
            const entries: [string, WorkoutGroupItem][] =
              JSON.parse(savedSwaps);
            setSwappedExercises(new Map(entries));
          } catch {}
        }
      }

      getIncompleteSessions(normalizedCode)
        .then((allSessions) => {
          console.log(
            "[mount] incompleteSessions returned:",
            allSessions.length,
            allSessions.map((s) => s.id),
          );
          // The API returns incomplete sessions for the whole program, not
          // scoped to the caller — filter to sessions this account actually
          // owns/started, otherwise viewing someone else's shared session
          // link surfaces a "Rejoin" banner for THEIR session.
          const myUserId = getUserIdFromToken();
          const sessions = myUserId
            ? allSessions.filter(
                (s) =>
                  String(s.owner_id) === String(myUserId) ||
                  String(s.member_id) === String(myUserId),
              )
            : allSessions;
          if (sessions.length > 0) {
            setIncompleteSessions(sessions);
            // Only auto-connect to a session that is verifiably still incomplete per
            // the API and matches the ID scoped to this program. Never guess (e.g. by
            // falling back to sessions[0]) — "sessionActive" is a sticky flag that's
            // never cleared, so trusting it for a blind fallback would permanently
            // hijack the wrong session and hide the rejoin banner.
            const storedId = localStorage.getItem(
              `activeSessionId_${normalizedCode}`,
            );
            const matched = storedId
              ? sessions.find((s) => s.id === storedId)
              : null;
            console.log(
              "[mount] storedId:",
              storedId,
              "| matched:",
              matched?.id ?? "none",
            );
            if (matched) {
              setActiveSession(matched);
              setIsSessionEngaged(
                localStorage.getItem(`sessionEngaged_${matched.id}`) === "true",
              );
            }
          }
        })
        .catch((err) => console.error("[rejoin] API error:", err));
    };

    initializeWorkout();

    dashboardApi
      .getDashboardData()
      .then((res) => setUserOtherDetail(res.user.OtherDetail))
      .catch(() => {
        /* non-critical */
      });

    feedApi
      .getAdvertisements()
      .then((all) => {
        const shuffled = [...all].sort(() => Math.random() - 0.5).slice(0, 4);
        setAds(shuffled);
      })
      .catch(() => {});
  }, []);

  // Compute per-round load from load records + workout groups
  useEffect(() => {
    if (!loadRecords.length || !workoutGroups.length) return;
    // Build sorted records (one per round) by matching workoutId → exercise id
    const roundRecords = workoutGroups.map((group) => {
      const exerciseIds = new Set(
        group.workouts.map((w: any) => w.id).filter(Boolean),
      );
      const match = loadRecords.find(
        (r) => r.workoutId && exerciseIds.has(r.workoutId),
      );
      return match ? Number(match.load) : 0;
    });

    // Records store cumulative session totals — compute individual round loads as differences
    const computed = roundRecords.map((cumulative, i) => {
      const prev = i === 0 ? 0 : roundRecords[i - 1];
      return Math.max(0, cumulative - prev);
    });

    console.log("[viewWorkout] cumulative roundRecords:", roundRecords);
    console.log("[viewWorkout] individual roundLoads:", computed);
    setRoundLoads(computed);
  }, [loadRecords, workoutGroups]);

  useEffect(() => {
    const sid = activeSession?.id;
    const code = localStorage.getItem("workoutProgramCode");
    if (!sid || !code || workoutGroups.length === 0) return;
    let cancelled = false;
    Promise.all(
      workoutGroups.map((g) =>
        getWorkoutSectionFull({
          sessionId: sid,
          programCode: code,
          section: g.label,
        })
          .then((r) => r.isCompleted === true)
          .catch(() => false),
      ),
    ).then((results) => {
      if (!cancelled) setCompletedSectionsCount(results.filter(Boolean).length);
    });
    return () => {
      cancelled = true;
    };
  }, [activeSession, workoutGroups]);

  useEffect(() => {
    if (ads.length === 0) return;
    const timer = setInterval(
      () => setAdIndex((i) => (i + 1) % ads.length),
      3500,
    );
    return () => clearInterval(timer);
  }, [ads]);

  // Dynamic ExerciseCard that uses real data
  const DynamicExerciseCard = ({
    item,
    locked = false,
    sessionStarted = false,
    onCardClick,
    rounds,
  }: {
    item: WorkoutGroupItem;
    locked?: boolean;
    sessionStarted?: boolean;
    onCardClick?: () => void;
    rounds?: string;
  }) => {
    const actualItem = getActualExercise(item);
    const isSwapped = swappedExercises.has(item.exercise_id);

    return (
      <div
        onClick={!locked && onCardClick ? onCardClick : undefined}
        className={`bg-white rounded-[24px] border border-[#e8e8ef] relative transition-all p-4 min-h-[170px] ${locked ? "opacity-60 blur-[1px] pointer-events-none" : "hover:shadow-md"} ${!locked && onCardClick ? "cursor-pointer" : ""}`}
      >
        <div className="absolute top-2 left-2 flex items-center gap-1">
          {actualItem.is_power_set && (
            <span className="text-[9px] font-black text-white bg-emerald-500 rounded-full px-1.5 py-0.5 leading-none">
              $
            </span>
          )}
          {isSwapped && <Home size={12} className="text-emerald-500" />}
        </div>

        {!locked && sessionStarted && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              openTracking(actualItem);
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

        <h3 className="text-[12px] font-semibold text-center text-[#222] leading-tight min-h-[22px] flex items-center justify-center">
          {actualItem.exercise_name}
        </h3>

        <div className="mt-1 text-center">
          <p className="text-[16px] leading-none font-black tracking-tight text-[#222]">
            {actualItem.reps || "—"}
          </p>
          {rounds && (
            <p className="text-[10px] font-bold text-[#7c3aed] mt-0.5">
              {rounds}
            </p>
          )}
        </div>

        {actualItem.weight !== undefined && (
          <p className="text-[10px] font-bold text-red-500 text-center mt-0.5">
            @ {actualItem.weight} kg
          </p>
        )}

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

  // Shows whenever there's a session to resume that the user hasn't explicitly
  // engaged with yet — the sidebar (session nav/progress) is hidden while it's up
  // since there's nothing to navigate until the user rejoins or starts fresh.
  const showRejoinBanner =
    !isSessionEngaged && (!!activeSession || incompleteSessions.length > 0);

  return (
    <div className="h-screen overflow-hidden bg-[#f7f7fa] flex">
      {/* SIDEBAR — only visible once session is started, and not while the rejoin banner is up */}
      {sessionStarted && !showRejoinBanner && (
        <div className="hidden lg:flex w-[220px] bg-gradient-to-b from-[#8b5cf6] to-[#6d28d9] text-white flex-col p-6 flex-shrink-0">
          <div className="bg-white/10 rounded-[24px] p-4 mb-8">
            <h2 className="text-[11px] font-black leading-tight break-words uppercase tracking-wide">
              {workoutTitle || "RECONDITIONING"}
            </h2>
            <p className="text-[10px] uppercase mt-1 opacity-70">Workout</p>
            <div className="mt-4 h-2 rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{
                  width: `${workoutGroups.length > 0 ? Math.round((completedSectionsCount / workoutGroups.length) * 100) : 0}%`,
                }}
              />
            </div>
            <div className="text-right text-[10px] mt-2 font-bold">
              {workoutGroups.length > 0
                ? Math.round(
                    (completedSectionsCount / workoutGroups.length) * 100,
                  )
                : 0}
              %
            </div>
          </div>

          <div className="space-y-3">
            {[
              { label: "Overview", Icon: Home },
              { label: "Session", Icon: Users },
              { label: "Results", Icon: BarChart2 },
              { label: "Powersets", Icon: Zap },
              { label: "Map", Icon: MapPin },
            ].map(({ label, Icon }) => (
              <button
                key={label}
                onClick={() => {
                  if (label === "Session") setShowSessionModal(true);
                  else setActiveView(label);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition
              ${activeView === label ? "bg-white text-[#7c3aed]" : "bg-white/10 hover:bg-white/20"}`}
              >
                <Icon size={16} />
                {label}
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
    ${
      activeSession
        ? "bg-white text-[#7c3aed]"
        : "bg-white/20 text-white/40 cursor-not-allowed"
    }`}
          >
            <Play size={16} fill="currentColor" />
            Start Workout
          </button>
        </div>
      )}

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
                {workoutName && (
                  <p className="text-[11px] font-black uppercase tracking-widest text-[#6c5ce7] mt-0.5">
                    {workoutName}
                  </p>
                )}
                <p className="text-[12px] font-black uppercase tracking-wide text-[#222] mt-1">
                  {totalExercises} Exercises
                </p>
                {(() => {
                  const tagLabel = (tag: string): string | null => {
                    const t = tag.toUpperCase();
                    if (t.includes('UES')) return 'Bench';
                    if (t.includes('LES')) return 'Squat';
                    if (t.includes('CCS')) return 'Clean';
                    if (t.includes('HHP')) return 'Deadlift';
                    return null;
                  };
                  const powerSetTags = programTags.map(tagLabel).filter(Boolean) as string[];
                  const franchiseName = previewData?.franchise_name || previewData?.franchise || previewData?.franchiseCode;

                  if (!powerSetTags.length && !franchiseName) return null;

                  return (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {franchiseName && (
                        <span className="px-2 py-0.5 bg-[#7C3AED] text-white text-[9px] font-black rounded-full uppercase">
                          {franchiseName}
                        </span>
                      )}
                      {powerSetTags.map((label, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-[#00B4D8] text-white text-[9px] font-black rounded-full uppercase"
                        >
                          ${label}
                        </span>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Ad banner beside session box */}
              {ads.length > 0 && (
                <button
                  onClick={() => setSelectedAd(ads[adIndex])}
                  className="hidden md:flex w-72 relative h-14 rounded-xl overflow-hidden items-center text-left flex-shrink-0"
                >
                  <img
                    src={ads[adIndex].image}
                    alt="ad"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/25" />
                  <span className="relative z-10 ml-2 bg-black/60 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">
                    Sponsored
                  </span>
                  <div className="relative z-10 ml-auto mr-2 flex gap-1">
                    {ads.map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 rounded-full transition-all ${i === adIndex ? "bg-white w-3" : "bg-white/50 w-1"}`}
                      />
                    ))}
                  </div>
                </button>
              )}

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
                        {new Date(activeSession.created_at)
                          .toLocaleString("en-US", {
                            month: "numeric",
                            day: "numeric",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          })
                          .replace(",", "")}
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

          {activeView !== "Results" &&
            activeView !== "Powersets" &&
            activeView !== "Map" && (
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto sm:ml-auto">
                  <button
                    onClick={() => router.push("/location")}
                    className="flex items-center gap-2 text-[12px] font-semibold text-gray-500 hover:opacity-75 transition"
                  >
                    <MapPin size={14} className="text-[#7c3aed]" />
                    <span className="text-[#7c3aed]">Location :</span>
                    <span>{location || "None"}</span>
                  </button>

                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={filterByLocation}
                      disabled={locationFilterLoading}
                      onChange={(e) => handleLocationFilter(e.target.checked)}
                      className="w-3.5 h-3.5 accent-[#7c3aed] rounded"
                    />
                    <span className="text-[11px] font-semibold text-[#7c3aed]">
                      {locationFilterLoading
                        ? "Loading..."
                        : "Show exercises based on default location"}
                    </span>
                  </label>

                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-2">
                      {!isLocked ? (
                        <button
                          onClick={() => {
                            const code = (
                              localStorage.getItem("workoutProgramCode") ||
                              "unknown"
                            ).toUpperCase();
                            localStorage.setItem("pendingSessionCode", code);
                            localStorage.setItem(
                              "pendingWorkoutGroups",
                              JSON.stringify(workoutGroups),
                            );
                            router.push("/workout/equipmentNeeded");
                          }}
                          className="bg-[#7c3aed] text-white px-4 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5"
                        >
                          {activeSession || incompleteSession
                            ? "Start a New Session"
                            : "Start a Session"}
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

                    <p
                      className={`text-[11px] font-semibold ${isLocked ? "text-red-500" : "text-emerald-500"}`}
                    >
                      {isLocked
                        ? "• This workout requires purchase"
                        : "• This workout is free"}
                    </p>
                  </div>
                </div>
              </div>
            )}
        </div>

        {/* REJOIN BANNER — shows whenever there's a session to resume and the user
            hasn't explicitly engaged with it yet (created it or pressed Rejoin).
            Knowing about a session (activeSession) is not the same as being
            engaged with it — mirrors the mobile app's isSessionActive gate. */}
        {showRejoinBanner && (() => {
          const bannerSession = activeSession || incompleteSession;
          return (
            <div className="px-4 sm:px-6 lg:px-10 pt-4 flex-shrink-0">
              <div className="bg-gradient-to-r from-[#ff6b6b] to-[#ff5757] rounded-2xl px-4 sm:px-5 py-3 sm:py-4 flex items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse flex-shrink-0" />
                  <div className="min-w-0">
                    <h3 className="text-white font-semibold text-xs sm:text-sm leading-none truncate">
                      {bannerSession
                        ? `Rejoin Live Session: ${bannerSession.id.slice(0, 6)}`
                        : "Active Session In Progress"}
                    </h3>
                    <p className="text-white/80 text-[10px] mt-1 font-medium">
                      {bannerSession
                        ? `Started ${new Date(bannerSession.created_at).toLocaleString()}`
                        : "You have an ongoing workout session"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleRejoin(bannerSession!)}
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
          );
        })()}

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
                  <h2 className="text-[16px] font-black text-gray-900">
                    Incomplete Sessions
                  </h2>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {incompleteSessions.length} session
                    {incompleteSessions.length > 1 ? "s" : ""} waiting
                  </p>
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
                          Started{" "}
                          {new Date(session.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setShowRejoinModal(false);
                        handleRejoin(session);
                      }}
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
                            icon: <Activity size={18} />,
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
                          muscle.replace(/([A-Z])/g, " $1").trim().toUpperCase();
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
                        const roundLabel = getRoundLabel(ps.round);
                        const isGray = ps.is_gray;
                        const targetUnit = (userOtherDetail?.measurementUnit || "lbs").toLowerCase();
                        return (
                          <div
                            key={ps.id || gi}
                            onClick={() => openVelocityModal(ps)}
                            className={`rounded-[20px] border-2 overflow-hidden cursor-pointer ${
                              isGray
                                ? "bg-[#f5f5f7] border-gray-200"
                                : "bg-white border-[#ede9fe]"
                            }`}
                          >
                            {/* Card header — click collapses, outer div click opens modal */}
                            <button
                              onClick={(e) => { e.stopPropagation(); togglePowerSet(gi); }}
                              className="w-full flex items-center gap-3 p-4 text-left transition hover:brightness-95"
                            >
                              {/* Thumbnail / emoji */}
                              <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden shrink-0 border border-gray-200">
                                {thumb ? (
                                  <img src={thumb} alt={ps.title_secondary} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-2xl">{ps.emoji || "🏋️‍♂️"}</span>
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                {/* Tags row */}
                                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                                  <span className="bg-[#7c3aed] text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                                    {roundLabel}
                                  </span>
                                  {ps.is_money_set && (
                                    <span className="bg-emerald-500 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wide flex items-center gap-1">
                                      ★ MONEY SET
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

                              <div className="shrink-0 text-gray-400">
                                {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                              </div>
                            </button>

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
                                    const weightText = displayWeight
                                      ? `${displayWeight} ${targetUnit}`
                                      : s.label || "—";
                                    return (
                                      <div
                                        key={s.id || si}
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
                                          <span className="text-[9px] font-black bg-emerald-500 text-white px-1.5 py-0.5 rounded-full shrink-0">
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
                            style={{ border: `1.5px solid ${isRoundComplete ? "#10B981" : isExpanded ? roundColor : "#E5E7EB"}` }}
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
                                  const weightUnit = anyEx.msrmt || "lbs";
                                  const slotCount = Math.max(powerSetChips?.length || plannedSets || 1, sortedLogs.length);

                                  return (
                                    <button
                                      key={exIdx}
                                      type="button"
                                      onClick={() => {
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
                                          <div className="flex items-center gap-1.5 flex-wrap">
                                            <p className="text-[12px] font-black text-[#111] truncate">{ex.exercise_name}</p>
                                            {isMoneySet && (
                                              <span className="text-[9px] font-black bg-emerald-500 text-white w-4 h-4 rounded-full flex items-center justify-center shrink-0">$</span>
                                            )}
                                          </div>
                                          {ex.supplemental && (
                                            <p className="text-[9px] font-bold text-gray-400 uppercase truncate">{ex.supplemental}</p>
                                          )}
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
                                                key={log.id || i}
                                                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${pillClass}`}
                                              >
                                                <span>{logTitle}: {reps} @ {parseFloat(String(weight)) || weight} {weightUnit}</span>
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
                                          const weightDisplay = plannedWeight ? ` @ ${plannedWeight} ${weightUnit}` : "";
                                          return (
                                            <div key={i} className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white border border-gray-200 text-gray-400">
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

                  {/* Complete Workout button */}
                  <button
                    disabled={isLocked}
                    className={`w-full h-12 rounded-2xl font-black text-[14px] text-white transition ${isLocked ? "bg-gray-400 cursor-not-allowed" : "bg-[#7c3aed] hover:bg-[#6d28d9]"}`}
                    onClick={() => {
                      const code = (localStorage.getItem("workoutProgramCode") || "unknown").toUpperCase();
                      localStorage.setItem("pendingSessionCode", code);
                      localStorage.setItem("pendingWorkoutGroups", JSON.stringify(workoutGroups));
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
                  {(filterByLocation
                    ? locationFilteredGroups
                    : workoutGroups
                  ).map((group, groupIdx) => {
                    const isGroupLocked = isLocked && groupIdx > 0;
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
                            <button
                              disabled={!activeSession}
                              onClick={() => {
                                localStorage.setItem("sessionActive", "true");
                                router.push(
                                  `/workout/athenaWorkout?section=${encodeURIComponent(group.label)}`,
                                );
                              }}
                              className="ml-auto w-7 h-7 rounded-full bg-[#7c3aed] flex items-center justify-center shadow hover:bg-[#6d28d9] transition disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-[#7c3aed]"
                            >
                              <Play
                                size={12}
                                fill="white"
                                className="text-white ml-0.5"
                              />
                            </button>
                          )}
                        </div>

                        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                          {previewItems.map((item, i) => (
                            <DynamicExerciseCard
                              key={item.exercise_id || i}
                              item={item}
                              locked={isGroupLocked}
                              sessionStarted={sessionStarted}
                              rounds={group.rounds}
                              onCardClick={
                                activeSession
                                  ? () => {
                                      localStorage.setItem(
                                        "sessionActive",
                                        "true",
                                      );
                                      router.push(
                                        `/workout/athenaWorkout?section=${encodeURIComponent(group.label)}&exercise=${i}`,
                                      );
                                    }
                                  : undefined
                              }
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
                                Get access to all exercises, detailed form
                                videos, progression systems, and advanced
                                athlete coaching tools.
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
                  <span className="text-[14px] font-black">
                    Session Details
                  </span>
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
                  <p className="text-[10px] font-black">{location || "None"}</p>
                </div>
              </div>
            </div>

            <div className="bg-white px-5 py-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[13px] font-black text-[#222]">
                  Participants
                </span>
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
                  <h2 className="text-[18px] font-black text-[#7c3aed]">
                    Share This Session:
                  </h2>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Session ID:{" "}
                    {incompleteSession?.id?.slice(0, 6) || "pending"}
                  </p>
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
                  <svg
                    width="100"
                    height="100"
                    viewBox="0 0 100 100"
                    className="text-[#1e1e22]"
                  >
                    <rect
                      x="0"
                      y="0"
                      width="40"
                      height="40"
                      rx="4"
                      fill="currentColor"
                    />
                    <rect
                      x="60"
                      y="0"
                      width="40"
                      height="40"
                      rx="4"
                      fill="currentColor"
                    />
                    <rect
                      x="0"
                      y="60"
                      width="40"
                      height="40"
                      rx="4"
                      fill="currentColor"
                    />
                    <rect
                      x="8"
                      y="8"
                      width="24"
                      height="24"
                      rx="2"
                      fill="white"
                    />
                    <rect
                      x="68"
                      y="8"
                      width="24"
                      height="24"
                      rx="2"
                      fill="white"
                    />
                    <rect
                      x="8"
                      y="68"
                      width="24"
                      height="24"
                      rx="2"
                      fill="white"
                    />
                    <rect
                      x="16"
                      y="16"
                      width="8"
                      height="8"
                      fill="currentColor"
                    />
                    <rect
                      x="76"
                      y="16"
                      width="8"
                      height="8"
                      fill="currentColor"
                    />
                    <rect
                      x="16"
                      y="76"
                      width="8"
                      height="8"
                      fill="currentColor"
                    />
                    <rect
                      x="52"
                      y="4"
                      width="6"
                      height="6"
                      fill="currentColor"
                    />
                    <rect
                      x="62"
                      y="4"
                      width="6"
                      height="6"
                      fill="currentColor"
                    />
                    <rect
                      x="52"
                      y="14"
                      width="6"
                      height="6"
                      fill="currentColor"
                    />
                    <rect
                      x="4"
                      y="52"
                      width="6"
                      height="6"
                      fill="currentColor"
                    />
                    <rect
                      x="14"
                      y="52"
                      width="6"
                      height="6"
                      fill="currentColor"
                    />
                    <rect
                      x="24"
                      y="52"
                      width="6"
                      height="6"
                      fill="currentColor"
                    />
                    <rect
                      x="52"
                      y="52"
                      width="6"
                      height="6"
                      fill="currentColor"
                    />
                    <rect
                      x="62"
                      y="62"
                      width="6"
                      height="6"
                      fill="currentColor"
                    />
                    <rect
                      x="74"
                      y="52"
                      width="6"
                      height="6"
                      fill="currentColor"
                    />
                    <rect
                      x="84"
                      y="62"
                      width="6"
                      height="6"
                      fill="currentColor"
                    />
                    <rect
                      x="52"
                      y="74"
                      width="6"
                      height="6"
                      fill="currentColor"
                    />
                    <rect
                      x="64"
                      y="84"
                      width="6"
                      height="6"
                      fill="currentColor"
                    />
                    <rect
                      x="84"
                      y="84"
                      width="6"
                      height="6"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <p className="text-[11px] text-gray-400 font-medium">
                  Scan this code to join the session
                </p>
              </div>

              <div>
                <p className="text-[13px] font-black text-[#222] mb-3">
                  Share with Followers:
                </p>
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
                    <div
                      key={u.initials}
                      className="flex flex-col items-center gap-1 flex-shrink-0"
                    >
                      <div
                        className={`w-10 h-10 rounded-full ${u.color} flex items-center justify-center text-white text-[11px] font-black`}
                      >
                        {u.initials}
                      </div>
                      <span className="text-[9px] text-gray-400 font-medium">
                        {u.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[13px] font-black text-[#222] mb-3">
                  Invite via Link
                </p>
                <div className="border border-gray-200 rounded-2xl px-4 py-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Link size={12} className="text-gray-400 flex-shrink-0" />
                    <p className="text-[11px] text-gray-400 truncate">
                      {`https://paxlete.com/workout/viewWorkoutSession?sessionId=${incompleteSession?.id || "pending"}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (!incompleteSession?.id) return;
                    const url = `https://paxlete.com/workout/viewWorkoutSession?sessionId=${incompleteSession.id}`;
                    navigator.clipboard.writeText(url);
                    setSessionLinkCopied(true);
                    setTimeout(() => setSessionLinkCopied(false), 2000);
                  }}
                  disabled={!incompleteSession?.id}
                  className="w-full bg-[#3b82f6] text-white py-3.5 rounded-2xl font-bold text-[13px] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sessionLinkCopied ? <Check size={14} /> : <Copy size={14} />}
                  {sessionLinkCopied ? "Copied!" : "Copy URL"}
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
                  You can access this program and all other workouts/programs in
                  this package by purchasing a Franchise License.
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

      {/* AD DETAIL POPUP */}
      {selectedAd && (
        <div
          className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => {
            setSelectedAd(null);
            setLinkCopied(false);
          }}
        >
          <div
            className="relative bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setSelectedAd(null);
                setLinkCopied(false);
              }}
              className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
            >
              <X size={14} className="text-gray-600" />
            </button>
            <div className="p-5">
              <p className="font-bold text-gray-800 text-sm mb-3">
                Ad Details:
              </p>
              <div className="rounded-2xl overflow-hidden mb-4 bg-gray-100 h-44">
                <img
                  src={selectedAd.image}
                  alt="ad"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-yellow-300 text-gray-800 text-[11px] font-bold px-2 py-0.5 rounded shrink-0">
                  Link :
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedAd.link);
                    setLinkCopied(true);
                    setTimeout(() => setLinkCopied(false), 2000);
                  }}
                  className="text-blue-500 text-[12px] underline truncate max-w-[180px] text-left"
                >
                  {selectedAd.link}
                </button>
                {linkCopied && (
                  <span className="text-[10px] text-green-600 font-semibold shrink-0">
                    Copied!
                  </span>
                )}
              </div>
              <button
                onClick={() =>
                  window.open(selectedAd.link, "_blank", "noopener,noreferrer")
                }
                className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-2xl text-[14px] transition mb-3"
              >
                Redirect
              </button>
              <p className="text-center text-[12px] font-semibold text-gray-700 mb-3">
                Go Ad-Free and Get 2x Points
              </p>
              <button className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold py-3 rounded-2xl text-[13px] transition">
                Only $8.95/mo →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXERCISE TRACKING MODAL (from 1st code) */}
      {trackingItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[3px] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-[480px] rounded-t-[28px] sm:rounded-[28px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100 flex-shrink-0">
              <h2 className="text-[15px] font-black text-gray-900">
                Exercise Tracking
              </h2>
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
                    <img
                      src={resolveWixImage(trackingItem.demo_gif)}
                      alt={trackingItem.exercise_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Dumbbell className="w-7 h-7 text-gray-300" />
                  )}
                </div>
                <p className="text-[13px] font-black text-gray-800 uppercase tracking-wide leading-snug">
                  {trackingItem.exercise_name}
                </p>
              </div>

              {(() => {
                const userUnit = (
                  userOtherDetail?.measurementUnit || "lbs"
                ).toLowerCase();
                const toUnit = (val: string) => {
                  const n = parseFloat(val) || 0;
                  return userUnit === "kg" ? n / 2.20462 : n;
                };
                const wMap: Record<string, number> = userOtherDetail
                  ? {
                      "of InputBarbellSquat": toUnit(
                        userOtherDetail.r_back_squat,
                      ),
                      "of InputDeadlift": toUnit(userOtherDetail.r_deadlift),
                      "of InputBenchPress": toUnit(
                        userOtherDetail.r_bench_press,
                      ),
                      "of InputPowerClean": toUnit(
                        userOtherDetail.r_power_clean,
                      ),
                      "of BodyWeight": toUnit(userOtherDetail.currentWeight),
                    }
                  : {};
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
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                          Last
                        </p>
                        {logsLoading ? (
                          <Loader2
                            size={14}
                            className="animate-spin text-gray-300 mx-auto"
                          />
                        ) : lastRecord ? (
                          <>
                            <p className="text-[13px] font-black text-gray-700">
                              {lastRecord.weight}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              {userUnit}
                            </p>
                            <p className="text-[11px] font-bold text-gray-500">
                              ×{lastRecord.reps} reps
                            </p>
                          </>
                        ) : (
                          <p className="text-[12px] font-bold text-gray-400">
                            No records yet
                          </p>
                        )}
                      </div>
                      <div className="bg-gray-50 rounded-2xl p-4 text-center border border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                          Best
                        </p>
                        {logsLoading ? (
                          <Loader2
                            size={14}
                            className="animate-spin text-gray-300 mx-auto"
                          />
                        ) : bestRecord ? (
                          <>
                            <p className="text-[13px] font-black text-gray-700">
                              {bestRecord.weight}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              {userUnit}
                            </p>
                            <p className="text-[11px] font-bold text-gray-500">
                              ×{bestRecord.reps} reps
                            </p>
                          </>
                        ) : (
                          <p className="text-[12px] font-bold text-gray-400">
                            No records yet
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-1">
                          Suggested
                        </p>
                        <p className="text-[13px] font-black text-purple-700">
                          {suggestedSets}x {suggestedReps}
                        </p>
                      </div>
                      {displayWeight && (
                        <p className="text-[13px] font-black text-purple-700">
                          {displayWeight}
                        </p>
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
                  <div
                    key={i}
                    className="bg-gray-50 rounded-2xl p-4 border border-gray-100"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">
                        Set {i + 1}
                      </span>
                      {set.saved && set.load != null && (
                        <span className="text-[10px] font-bold text-gray-400">
                          Load: {set.load}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 pl-1">
                          Weight (lbs)
                        </p>
                        <input
                          type="number"
                          value={set.weight}
                          onChange={(e) =>
                            updateSet(i, "weight", e.target.value)
                          }
                          placeholder="0"
                          disabled={set.saved}
                          className={`w-full rounded-xl border px-3 py-2.5 text-[15px] font-bold outline-none transition placeholder:text-gray-300 ${set.saved ? "bg-gray-100 border-gray-200 cursor-not-allowed text-gray-400" : "bg-white border-gray-200 text-gray-800 focus:border-purple-400 focus:ring-2 focus:ring-purple-100"}`}
                        />
                      </div>
                      <X
                        size={12}
                        className="text-gray-300 flex-shrink-0 mt-5"
                      />
                      <div className="flex-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 pl-1">
                          Reps /e
                        </p>
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
                          const code = localStorage
                            .getItem("workoutProgramCode")
                            ?.toUpperCase();
                          const sessionId = code
                            ? localStorage.getItem(`activeSessionId_${code}`)
                            : null;
                          if (!sessionId || !code) return;
                          const setNumber = i + 1;
                          const weightNum = parseFloat(set.weight) || 0;
                          const repsNum = parseInt(set.reps) || 0;
                          const userWeight =
                            parseFloat(userOtherDetail?.currentWeight || "0") ||
                            0;
                          const userHeight =
                            parseFloat(userOtherDetail?.height || "0") || 0;
                          const computedLoad = Math.ceil(
                            (userWeight * userHeight + repsNum * weightNum) /
                              2600,
                          );
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
                          console.log(
                            "[tracking] Saving set",
                            setNumber,
                            payload,
                          );
                          setSavingSetIndex(i);
                          try {
                            const result = await createTrackingLog(payload);
                            console.log(
                              "[tracking] Set",
                              setNumber,
                              "saved:",
                              result,
                            );
                            setSets((prev) =>
                              prev.map((s, idx) =>
                                idx === i
                                  ? {
                                      ...s,
                                      saved: true,
                                      load: result.load ?? computedLoad,
                                    }
                                  : s,
                              ),
                            );
                          } catch (err) {
                            console.error(
                              "[tracking] Failed to save set",
                              setNumber,
                              err,
                            );
                          } finally {
                            setSavingSetIndex(null);
                          }
                        }}
                        className="mt-3 w-full bg-white border border-gray-200 rounded-xl py-2 text-[11px] font-bold text-gray-600 hover:bg-gray-100 transition disabled:opacity-60 flex items-center justify-center gap-1"
                      >
                        {savingSetIndex === i ? (
                          <>
                            <Loader2 size={11} className="animate-spin" />{" "}
                            Saving...
                          </>
                        ) : (
                          "Save"
                        )}
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
                  const code = localStorage
                    .getItem("workoutProgramCode")
                    ?.toUpperCase();
                  const sessionId = code
                    ? localStorage.getItem(`activeSessionId_${code}`)
                    : null;
                  if (!sessionId || !code) {
                    setTrackingItem(null);
                    return;
                  }
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
                    console.log(
                      "[tracking] Saving",
                      payloads.length,
                      "unsaved set(s):",
                      payloads,
                    );
                    if (payloads.length > 0) {
                      const results = await Promise.all(
                        payloads.map((p) => createTrackingLog(p)),
                      );
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
                {savingLogs ? (
                  <>
                    <Loader2 size={15} className="animate-spin" /> Saving...
                  </>
                ) : (
                  "Save"
                )}
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

      {/* ── Power Set Tracking Modal ── */}
      {velocityExercise && (
        <PowerSetTrackingModal
          exercise={velocityExercise}
          sets={velocitySets}
          sessionId={activeSession?.id ?? activeSession?.session_id}
          workoutLibraryId={localStorage.getItem("workoutProgramCode") ?? undefined}
          userOtherDetail={userOtherDetail}
          onClose={() => {
            if (velocityExercise?.id) {
              velocitySetsCache.current[velocityExercise.id] = velocitySets;
            }
            setVelocityExercise(null);
          }}
          onAddSet={addVelocitySet}
          onUpdateSet={updateVelocitySet}
          onToggleRecordSet={toggleRecordVelocitySet}
          onSetSets={setVelocitySets}
          onSave={async (savedSets) => {
            const savedExercise = velocityExercise;
            await refreshPowerSets();
            if (savedExercise) {
              setPowerSets((prev) =>
                prev.map((ps) => {
                  if (ps.id !== savedExercise.id) return ps;
                  return {
                    ...ps,
                    child_sets: ps.child_sets?.map((cs, i) => ({
                      ...cs,
                      isCompleted: savedSets[i]?.recorded ? true : cs.isCompleted,
                    })) ?? [],
                  };
                })
              );
            }
          }}
        />
      )}
    </div>
  );
}

export default function ViewWorkoutSessionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#7c3aed]" />
      </div>
    }>
      <ViewWorkoutSessionContent />
    </Suspense>
  );
}
