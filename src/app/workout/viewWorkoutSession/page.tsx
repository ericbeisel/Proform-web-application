"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  ArrowLeft,
  Play,
  ChevronRight,
  Users,
  Share2,
  ClipboardList,
  UserPlus,
  MapPin,
  X,
  Sparkles,
  Calendar,
  Eye,
  Search,
  Copy,
  Check,
  Link,
  Dumbbell,
  Lock,
  Loader2,
  Plus,
  CreditCard,
  AlertCircle,
} from "lucide-react";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import PowerSetTrackingModal, { type VelocitySet } from "./PowerSetTrackingModal";
import SessionViewsPanel from "./SessionViewsPanel";
import PurchaseCheckout from "../components/PurchaseCheckout";
import {
  getProgramPowerSets,
  getProgramOverview,
  getProgramGroupedWorkouts,
  getProgramPreview,
  getProgramTags,
  WorkoutGroup,
  WorkoutGroupItem,
  PowerSet,
  ProgramPreview,
} from "@/api/programs/route";
import {
  getIncompleteSessions,
  getWorkoutSectionFull,
  getTrackingLogs,
  createTrackingLog,
  getWorkoutStats,
  getWorkoutLoadRecords,
  getWorkoutSessionById,
  getPowerSetLogs,
  createWorkoutSession,
  createFeedPost,
  IncompleteSession,
  WorkoutStats,
  WorkoutLoadRecord,
} from "@/api/workouts/route";
import { dashboardApi, UserOtherDetail } from "@/api/dashboard/route";
import { feedApi, Advertisement } from "@/api/feed/route";
import { equipmentApi } from "@/api/location/route";
import { getAuthUser, getUserIdFromToken, hasAuthSession } from "@/lib/auth/session";
import { convertToUserUnit } from "@/lib/units";
import { resolveWixImage, sortWorkoutGroups } from "./helpers";

// Exact port of mobile's ExerciseTrackingModal parseHeightInches — handles
// both a plain number and a "5'10"" style string.
function parseHeightInches(heightStr: string | number | null | undefined): number {
  if (!heightStr) return 0;
  const str = String(heightStr).trim();
  if (/^\d+(\.\d+)?$/.test(str)) return parseFloat(str);
  const match = str.match(/(\d+)\s*['’`‘ft]*\s*(\d+)?/);
  if (match) {
    const feet = parseInt(match[1], 10) || 0;
    const inches = parseInt(match[2], 10) || 0;
    return feet * 12 + inches;
  }
  return parseFloat(str) || 0;
}

// Exact port of mobile's ExerciseTrackingModal.handleSaveSet load formula —
// previously this file used a much simpler (userWeight*userHeight +
// reps*weight)/2600 that dropped the loadMeter/repVariant multipliers
// entirely and didn't parse height strings, producing different load
// values than mobile for the same set.
function computeTrackingLoad(
  userDetail: UserOtherDetail | null,
  exercise: WorkoutGroupItem | null,
  weightNum: number,
  repsNum: number,
): number {
  const measurementUnit = (userDetail?.measurementUnit || "lbs").toLowerCase().trim();
  const isKg = measurementUnit === "kg";
  const weightConv = (val: number) => (isKg ? val * 2.2046 : val);
  const rawWeight = parseFloat(String(userDetail?.currentWeight || 0)) || 0;
  const weight = weightConv(rawWeight);
  const height = parseHeightInches(userDetail?.height);
  const data1 = weight * height;
  const ex = exercise as unknown as { loadMeter?: number; rep_variant?: number; repVariant?: number } | null;
  const E = parseInt(String(ex?.loadMeter ?? 3)) || 3;
  const e = parseFloat(String(ex?.repVariant ?? ex?.rep_variant ?? 1)) || 1;
  // Mobile always treats the typed weight as kg for this calculation,
  // converting to lbs regardless of the account's display unit.
  const wt = weightNum * 2.20462262;
  const data2 = E * (repsNum * e) * 1 * wt;
  return Math.ceil((data1 + data2) / 2600);
}

function ViewWorkoutSessionContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Anonymous visitors can browse this page's preview (few exercises,
  // rejoin banner, etc.) same as /workout/detail — login is only required
  // once they try to actually act on a session (start/rejoin/invite).
  const isLoggedIn = hasAuthSession();
  const loginUrl = `/auth/login?next=${encodeURIComponent(`${pathname}?${searchParams.toString()}`)}`;
  const [authPrompt, setAuthPrompt] = useState(false);

  // Existing state
  const [location, setLocation] = useState<string | null>(null);
  // Supports deep-linking straight to the Session Details modal — e.g.
  // athenaWorkout.tsx's sidebar "Session" item links to ?openSession=true.
  const [showSessionModal, setShowSessionModal] = useState(searchParams.get("openSession") === "true");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [sessionLinkCopied, setSessionLinkCopied] = useState(false);
  const [followerSearch, setFollowerSearch] = useState("");
  // Supports deep-linking straight into a tab — e.g. athenaWorkout.tsx's
  // "This Workout" stats panel links to ?view=Results (mobile's
  // topStatsRowHeader navigates directly to the Results tab the same way).
  const [activeView, setActiveView] = useState(searchParams.get("view") || "Overview");
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
  // "Workout" | "Supplemental" | "Field Workout" | "Conditioning" — set by
  // whichever queue tab/dashboard the user launched this session from (see
  // workoutDashboardMain.tsx's handleSessionClick), and used only to pick
  // the right pending-activities list on completion. Mirrors mobile's
  // resolvedWorkoutData.type (MapScreen.tsx's proceedCompleteWorkout).
  const [workoutType, setWorkoutType] = useState<string>("Workout");
  const [programTags, setProgramTags] = useState<string[]>([]);
  const [previewData, setPreviewData] = useState<ProgramPreview | null>(null);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [purchaseExpiresAt, setPurchaseExpiresAt] = useState<string | null>(null);
  const [purchaseTimeRemaining, setPurchaseTimeRemaining] = useState<string>("");
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  // Drives the same Stripe PurchaseCheckout flow used in viewWorkoutDetail.tsx
  // — this modal previously just flipped hasPurchased locally with no real
  // charge, unlike the paywall on that other page.
  const [checkoutStarted, setCheckoutStarted] = useState(false);
  const [programCodeForPurchase, setProgramCodeForPurchase] = useState<string | null>(null);
  // Mirrors mobile's exercise-tap-before-session-starts modal — mobile's
  // version doesn't actually render exercise-specific details despite
  // storing them, it's just a "Ready to Start?" confirmation, so no need to
  // track which exercise was tapped.
  const [showStartSessionPrompt, setShowStartSessionPrompt] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [incompleteSessions, setIncompleteSessions] = useState<
    IncompleteSession[]
  >([]);
  const incompleteSession = incompleteSessions[0] ?? null;
  const [showRejoinModal, setShowRejoinModal] = useState(false);
  const [myUserId, setMyUserId] = useState<string | number | null>(null);
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
  // Server-persisted default location id (from /default-location) — used to
  // detect when it changes (e.g. edited on another tab/device) so the
  // location-based swap can be refreshed, mirroring mobile's focus-driven
  // re-sync in OverviewScreen.
  const defaultLocationIdRef = useRef<string | number | null>(null);
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
          // Always start editable, even if the backend's `isCompleted` is
          // true from a past save — that flag reflects history, not this
          // modal instance's local edit state. Seeding `recorded` from it
          // forced an unnecessary "click Edit, then Save" dance on sets
          // that already had backend data, and since createTrackingLog only
          // ever creates (never updates), that extra edit-then-save round
          // trip was quietly producing a second, duplicate log entry for
          // the same set instead of just letting the user type once.
          recorded: false,
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
    // activeSession is only populated by matching against the *incomplete*
    // sessions list — once every round is done and Finalize is tapped, the
    // backend may no longer report this session as incomplete, so that
    // match can legitimately come back empty. Fall back to the same
    // localStorage session id every other flow (athenaWorkout.tsx etc.)
    // already relies on, so the Map view's data still loads for a just-
    // completed session.
    const code = localStorage.getItem("workoutProgramCode")?.toUpperCase();
    const sid =
      activeSession?.id ??
      (activeSession as any)?.session_id ??
      (code ? localStorage.getItem(`activeSessionId_${code}`) : null);
    if (!sid) return;
    setMapLoading(true);
    Promise.all([
      getTrackingLogs({ sessionId: sid }).catch(() => [] as any[]),
      getPowerSetLogs(sid).catch(() => [] as any[]),
      getWorkoutLoadRecords(sid).catch(() => [] as WorkoutLoadRecord[]),
    ]).then(([stdLogs, psLogs, loads]) => {
      // Exact port of mobile's MapScreen: power-set logs are used only to
      // flag the matching standard tracking log as isPowerSetLog (cross-
      // referenced via each power-set log's `tracking_log` id) — they're
      // never added as separate log entries. A set only renders green if a
      // real standard log exists for it AND a power-set log references that
      // exact log id; previously every power-set log was unconditionally
      // pushed in as its own entry, which could color/duplicate sets that
      // mobile's basis would not.
      const powerSetTrackingLogIds = new Set<string>(
        (psLogs as any[])
          .map((l: any) => String(l.tracking_log || ""))
          .filter(Boolean)
      );
      const allLogs = (stdLogs as any[]).map((log: any) => {
        const logId = String(log.id || "");
        return logId && powerSetTrackingLogIds.has(logId) ? { ...log, isPowerSetLog: true } : log;
      });
      setMapSessionLogs(allLogs);
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

  // Mirrors mobile's OverviewScreen: passing locationId into the overview
  // call itself is what makes the backend swap in exercises matching that
  // location's equipment — this does NOT go through the per-exercise
  // swap-exercise endpoint (that's a separate, user-initiated single-swap
  // feature, unrelated to location-based filtering).
  const handleLocationFilter = async (checked: boolean) => {
    setFilterByLocation(checked);
    if (!checked) return;

    const code = localStorage.getItem("workoutProgramCode");
    if (!code) {
      setFilterByLocation(false);
      return;
    }

    const sid =
      activeSession?.id ??
      localStorage.getItem(`activeSessionId_${code.toUpperCase()}`) ??
      undefined;
    const locationId = defaultLocationIdRef.current;

    setLocationFilterLoading(true);
    try {
      const overview = await getProgramOverview(code.toLowerCase(), {
        sessionId: sid || undefined,
        locationId: locationId != null ? String(locationId) : undefined,
      });
      setLocationFilteredGroups(sortWorkoutGroups(Array.isArray(overview.rounds) ? overview.rounds : []));
    } catch {
      setFilterByLocation(false);
    } finally {
      setLocationFilterLoading(false);
    }
  };

  useEffect(() => {
    equipmentApi.getLocationList()
      .then((list) => console.log("[viewWorkoutSession] location list:", list))
      .catch(() => {});
  }, []);

  // Track the server-persisted default location and re-run the location
  // filter if it changes while this tab has focus — mirrors mobile's
  // getDefaultLocation-on-focus re-sync in OverviewScreen. Web has no
  // equivalent of this endpoint wired up elsewhere, so it's fetched here.
  useEffect(() => {
    const checkDefaultLocation = async () => {
      try {
        const res = await equipmentApi.getDefaultLocation();
        const newId = res?.data?.id ?? null;
        const changed =
          defaultLocationIdRef.current !== null &&
          String(defaultLocationIdRef.current) !== String(newId);
        defaultLocationIdRef.current = newId;
        // Update the visible "Location:" text too — not just the id used
        // for the filter — so switching your default on /location and
        // coming back reflects it without a manual page refresh.
        if (res?.data?.name) {
          setLocation(res.data.name);
          localStorage.setItem("workoutLocationName", res.data.name);
        }
        if (changed && filterByLocation) {
          handleLocationFilter(true);
        }
      } catch {
      }
    };

    checkDefaultLocation();
    window.addEventListener("focus", checkDefaultLocation);
    return () => window.removeEventListener("focus", checkDefaultLocation);
  }, [filterByLocation]);

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
    if (!item.exercise_id) {
      return;
    }

    setLogsLoading(true);
    try {
      // 1. All-time records for Last / Best (no sessionId filter — matches mobile)
      const allLogs = await getTrackingLogs({ exercise_id: item.exercise_id });
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
    } catch {
    } finally {
      setLogsLoading(false);
    }
  };

  const totalExercises = workoutGroups.reduce(
    (sum, g) => sum + g.workouts.length,
    0,
  );
  const isLocked = !hasPurchased;
  // Mirrors mobile's programDetails.price || .amount || .cost || '1' fallback
  // chain (OverviewScreen.tsx:1800) — this is a display-only estimate, the
  // actual charge is whatever the backend's create-intent PaymentIntent sets.
  const displayPrice = String(
    (previewData?.price ?? previewData?.amount ?? previewData?.cost ?? "1") as string | number,
  );
  // Absolute end date/time alongside the relative countdown, so the user
  // doesn't have to do "22h 4m from... when?" math themselves.
  const purchaseEndDateLabel =
    hasPurchased && purchaseExpiresAt
      ? new Date(purchaseExpiresAt).toLocaleString(undefined, {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })
      : "";

  // Ticks the 24h purchase countdown every minute and flips the paywall back
  // on once it lapses — mirrors mobile's OverviewScreen.tsx:444-469. This is
  // just a client-side display/safety net: the next overview fetch would
  // re-derive the correct locked/unlocked state from the backend regardless.
  useEffect(() => {
    if (!purchaseExpiresAt || !hasPurchased) {
      setPurchaseTimeRemaining("");
      return;
    }

    const updateRemaining = () => {
      const diff = new Date(purchaseExpiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setPurchaseTimeRemaining("Expired");
        setHasPurchased(false);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setPurchaseTimeRemaining(`${hours}h ${minutes}m remaining`);
      }
    };

    updateRemaining();
    const interval = setInterval(updateRemaining, 60000);
    return () => clearInterval(interval);
  }, [purchaseExpiresAt, hasPurchased]);

  // Tapping an exercise before a session exists — mirrors mobile's
  // preview-modal branch (isLocked -> purchase prompt, else -> "Ready to
  // Start?" confirmation before actually starting a session).
  const handleExerciseTapWithoutSession = () => {
    if (isLocked) {
      setShowPurchaseModal(true);
    } else {
      setShowStartSessionPrompt(true);
    }
  };

  const openInviteModal = () => {
    if (!isLoggedIn) {
      setAuthPrompt(true);
      return;
    }
    setShowInviteModal(true);
  };

  const startNewSession = () => {
    if (!isLoggedIn) {
      setAuthPrompt(true);
      return;
    }
    const code = (localStorage.getItem("workoutProgramCode") || "unknown").toUpperCase();
    localStorage.setItem("pendingSessionCode", code);
    localStorage.setItem("pendingWorkoutGroups", JSON.stringify(workoutGroups));
    router.push("/workout/equipmentNeeded");
  };

  // workoutGroups is already stored pre-sorted via sortWorkoutGroups (warmup
  // first, then ROUND numerically, then alphabetical) — re-sorting here
  // alphabetically-only, as an earlier version of this did, both duplicates
  // that work and gets the order wrong.
  const getRoundLabel = (roundValue: number | string | undefined): string => {
    if (!workoutGroups || workoutGroups.length === 0) return `ROUND ${roundValue ?? 1}`;
    return workoutGroups[Number(roundValue ?? 1) - 1]?.label || `ROUND ${roundValue ?? 1}`;
  };

  // The power-sets API's own `round` field is unreliable (mobile's own
  // PowersetsScreen comment) — resolve the true round by matching this power
  // set's exercise against the actual workout structure instead, falling
  // back to the (unreliable) round-index lookup only if no match is found.
  const getRoundLabelForSet = (set: any): string => {
    if (workoutGroups && workoutGroups.length > 0) {
      const matchedGroup = workoutGroups.find((g) =>
        (g.workouts || []).some(
          (w: any) =>
            w.id === set.id ||
            w.exercise_id === set.exercise_uuid ||
            w.exercise_id === set.exercise_id ||
            w.exercise?.exercise_uuid === set.exercise_uuid,
        ),
      );
      if (matchedGroup) return matchedGroup.label;
    }
    return getRoundLabel(set.round || 1);
  };

  const handleRejoin = async (session: IncompleteSession) => {
    if (!isLoggedIn) {
      setAuthPrompt(true);
      return;
    }
    setSessionStarted(true);
    setActiveSession(session);
    // Engagement itself still isn't persisted across a fresh visit — matches
    // mobile: a new mount re-derives it from rejoinSessions and always shows
    // the banner for a session it hasn't seen engaged before. The sessionStorage
    // stamp below exists solely so a same-tab browser *refresh* (detected via
    // the Navigation Timing API on the next mount) can skip re-showing the
    // banner for a session already engaged with, without affecting a genuine
    // fresh navigation back to this page (e.g. from /workout/detail).
    setIsSessionEngaged(true);
    sessionStorage.setItem(`sessionEngaged_${session.id}`, "true");
    setRejoinLoading(true);

    // This session's exercises are already location/session-scoped
    // server-side — getProgramOverview(code, { sessionId }) already returns
    // workoutGroups with any swaps baked in (confirmed via a live capture:
    // the overview's exercise_name for a swapped slot already matches the
    // post-swap name /workouts/section returns). No separate diffing needed.
    //
    // A previous version of this function fetched each round via
    // getWorkoutSection and paired its array positionally against
    // group.workouts to detect swaps — but /workouts/section's raw order
    // does NOT match group.workouts' `.order`-sorted sequence, so that
    // positional pairing attributed swap data to the wrong exercise
    // entirely (e.g. swap info for the exercise at `.order === 4` got
    // written against whichever exercise happened to sit at array index 0).
    // That's what caused completely different exercises to render.
    const sessionLocationName = (session as unknown as { locationName?: string }).locationName;
    if (sessionLocationName) {
      setLocation(sessionLocationName);
      localStorage.setItem("workoutLocationName", sessionLocationName);
    }
    const programCode = localStorage
      .getItem("workoutProgramCode")
      ?.toUpperCase();
    localStorage.setItem(`activeSessionId_${programCode}`, session.id);
    if (programCode) {
      localStorage.removeItem(`swappedExercises_${programCode}`);
    }
    setSwappedExercises(new Map());
    setRejoinLoading(false);
  };

  const getActualExercise = (original: WorkoutGroupItem): WorkoutGroupItem => {
    const swapped = swappedExercises.get(original.exercise_id);
    if (swapped) {
      return swapped;
    }
    return original;
  };

  // Mirrors mobile's handleJoinOrCreateSession: pressing Start/Resume on a
  // session you don't own creates your own linked session (via
  // refSessionId) instead of operating directly on the owner's session —
  // otherwise a non-host joiner would silently hijack the host's session.
  // Hosts (or a freshly self-created session) just resume directly.
  const handleStartWorkout = async () => {
    if (!activeSession) return;
    const code = localStorage.getItem("workoutProgramCode");
    try {
      if (!isHost(activeSession)) {
        const created = await createWorkoutSession({
          workoutLibraryId: code || "",
          locationId: activeSession.location_id || undefined,
          refSessionId: activeSession.id,
        });
        const newSessionId = created.session?.id;
        if (newSessionId) {
          try {
            await createFeedPost({ sessionId: newSessionId, workoutLibraryId: code || "" });
          } catch {
          }
          if (code) {
            localStorage.setItem(`activeSessionId_${code.toUpperCase()}`, newSessionId);
          }
          setActiveSession({ ...activeSession, id: newSessionId, session_id: newSessionId });
        }
      } else {
        try {
          await createFeedPost({ sessionId: activeSession.id, workoutLibraryId: code || "" });
        } catch {
        }
      }
    } catch {
    } finally {
      localStorage.setItem("sessionActive", "true");
      // Lateral tab-switch (the sidebar's Train Session/Start Workout CTA),
      // not a forward "drill in" — replace so it doesn't stack a history
      // entry every time you bounce back and forth via the sidebar.
      router.replace("/workout/athenaWorkout");
    }
  };

  // Fetch real data (from 1st code)
  useEffect(() => {
    const initializeWorkout = async () => {
      // A logged-out visitor still sees this page's preview (mirrors
      // /workout/detail) — getAuthUser()/getUserIdFromToken() below simply
      // resolve to null without a token, and the session-scoped fetches
      // (incomplete sessions, stats) degrade to "nothing to resume" rather
      // than failing. Login is only required at the point of actually
      // starting/rejoining/inviting (see authPrompt below).

      // Computed synchronously (not inside applyIncompleteSessions, which
      // only runs once the overview fetch resolves) so isHost has a value
      // immediately — otherwise a host clicking Start Workout before that
      // fetch finishes would be misidentified as a non-host joiner.
      const myUserIdEarly = getAuthUser()?.id ?? getUserIdFromToken();
      setMyUserId(myUserIdEarly ?? null);

      // Distinguishes an actual browser refresh from a normal navigation
      // back to this page (e.g. from /workout/detail's "View Workout") —
      // both land on the same URL/session, but only a real reload should be
      // allowed to silently restore engagement via the sessionStorage stamp
      // below; a fresh navigation must still show the rejoin banner.
      const isReload =
        typeof performance !== "undefined" &&
        performance.getEntriesByType("navigation")[0] &&
        (performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming).type === "reload";

      // Tracks whether a session was resolved via the shared-link deep-link
      // path below — that path's session may legitimately no longer be
      // reported "incomplete" by the backend, so applyIncompleteSessions
      // finding zero incomplete sessions must not undo sessionStarted in
      // that case (see the sessions.length === 0 branch there).
      let resolvedViaSharedLink = false;

      // Arriving via a shared "Copy URL" link (?sessionId=...) — always resolve
      // fresh from the session itself, since no normal in-app navigation to
      // this page ever includes a sessionId query param (they all rely on
      // localStorage already being set correctly). Skipping this whenever
      // workoutProgramCode already existed meant a browser that had ever
      // viewed a *different* program before would keep showing that stale
      // program/exercises instead of the one actually being shared.
      const urlSessionId = searchParams.get("sessionId");
      if (urlSessionId) {
        try {
          const session = await getWorkoutSessionById(urlSessionId);
          const resolvedCode = session?.workout_code || session?.program_id;
          if (resolvedCode) {
            localStorage.setItem("workoutProgramCode", resolvedCode);
          }
          const resolvedTitle = session?.workoutTitle || session?.title;
          if (resolvedTitle) localStorage.setItem("workoutTitle", resolvedTitle);
          // These are re-derived below from a fresh getProgramOverview call
          // (workoutIsFree from preview.free) or simply don't apply to a
          // session we didn't set up ourselves — clear them so a value left
          // over from a previously-viewed, different program can't leak
          // through as this session's free/purchase status or subtitle.
          localStorage.removeItem("workoutIsFree");
          localStorage.removeItem("workoutName");
          // Not derivable from the shared session itself (unlike title/code) —
          // clear it rather than let a stale value from whatever this browser
          // last browsed leak into this session's completion flow.
          localStorage.removeItem("workoutType");

          // Activate this specific session immediately, regardless of
          // ownership — mirrors mobile's autoActivateSession deep-link path.
          // Without this, a non-host opening someone else's shared link
          // would never see this session at all, since the ownership filter
          // in applyIncompleteSessions (below) deliberately excludes
          // sessions the viewer doesn't own/belong to. The actual
          // host-vs-non-host decision (resume directly vs. create a linked
          // session) happens later, on Start Workout press.
          const rawSession = session as unknown as {
            owner_id?: string;
            member_id?: string;
          };
          setActiveSession({
            id: session.id,
            session_id: session.id,
            title: session.title || "",
            workout_name: session.workoutCategory || "",
            program_name: session.programName || "",
            program_id: resolvedCode || "",
            created_at: session.createdAt || session.started_at || "",
            updated_at: session.createdAt || session.started_at || "",
            owner_id: rawSession.owner_id || "",
            member_id: rawSession.member_id || rawSession.owner_id || "",
            url: "",
            status: false,
            location_id: session.location_id,
            team_id: null,
            save_data: null,
          });
          setIsSessionEngaged(true);
          sessionStorage.setItem(`sessionEngaged_${session.id}`, "true");
          resolvedViaSharedLink = true;
          if (resolvedCode) {
            localStorage.setItem(
              `activeSessionId_${resolvedCode.toUpperCase()}`,
              session.id,
            );
          }
        } catch {
        }
      }

      const savedLocation = localStorage.getItem("workoutLocationName");
      if (savedLocation) setLocation(savedLocation);

      const programCode = localStorage.getItem("workoutProgramCode");
      setProgramCodeForPurchase(programCode);
      const title = localStorage.getItem("workoutTitle");
      if (title) setWorkoutTitle(title);
      const name = localStorage.getItem("workoutName");
      if (name) setWorkoutName(name);
      const type = localStorage.getItem("workoutType");
      if (type) setWorkoutType(type);

      const isFree = localStorage.getItem("workoutIsFree");
      if (isFree === "true") setHasPurchased(true);

      // A shared "Copy URL" link carries ?sessionId=... so anyone opening it
      // loads that specific session, regardless of their own local session state.
      const storedSessionId =
        searchParams.get("sessionId") ??
        localStorage.getItem(`activeSessionId_${programCode?.toUpperCase()}`) ??
        localStorage.getItem("summarySessionId");
      if (storedSessionId) {
        setSessionStarted(true);

        // Fetch stats + load records together, then override
        // thisWorkout.load/power/cals with the locally-computed max from the
        // session's actual load records — mirrors mobile's ResultsScreen
        // exactly, which never trusts getWorkoutStats' own thisWorkout
        // numbers outright (falling back to them only if the local max is 0).
        Promise.all([
          getWorkoutStats(storedSessionId).catch(() => null),
          getWorkoutLoadRecords(storedSessionId).catch(() => []),
        ]).then(([stats, records]) => {
          setLoadRecords(records);
          if (!stats) return;
          const totalLoad = records.length ? Math.max(...records.map((r) => r.load || 0)) : 0;
          const totalPower = records.length ? Math.max(...records.map((r) => r.power || 0)) : 0;
          const totalCals = records.length ? Math.max(...records.map((r) => r.kcal || 0)) : 0;
          setWorkoutStats({
            ...stats,
            thisWorkout: {
              ...stats.thisWorkout,
              load: totalLoad || stats.thisWorkout?.load || 0,
              power: totalPower || stats.thisWorkout?.power || 0,
              cals: totalCals || stats.thisWorkout?.cals || 0,
            },
          });
        });
      }

      if (!programCode) {
        setLoading(false);
        return;
      }

      const normalizedCode = programCode.toUpperCase();

      // Shared by both the overview's bundled rejoinSessions and the
      // standalone getIncompleteSessions fallback below — the two return the
      // exact same record shape (confirmed via a live capture: rejoinSessions
      // entries have identical id/owner_id/member_id/session_id/location_id
      // fields to getIncompleteSessions' response).
      const applyIncompleteSessions = (allSessions: IncompleteSession[]) => {
        // The API returns incomplete sessions for the whole program, not
        // scoped to the caller — filter to sessions this account actually
        // owns/started, otherwise viewing someone else's shared session
        // link surfaces a "Rejoin" banner for THEIR session. getAuthUser()
        // (set directly from the login response) is more reliable than
        // decoding the JWT, since not every token here is guaranteed to
        // carry a usable sub/id claim.
        const myUserId = getAuthUser()?.id ?? getUserIdFromToken();
        setMyUserId(myUserId ?? null);
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
          if (matched) {
            setActiveSession(matched);
            // isSessionEngaged otherwise stays false here — mirrors mobile:
            // merely finding a still-incomplete session on a fresh mount
            // surfaces the rejoin banner, it doesn't silently resume it.
            // Engagement only becomes true via an explicit Rejoin/Start tap —
            // except when this mount is a genuine browser refresh of a
            // session already engaged with (stamped in sessionStorage), in
            // which case re-showing the banner would just be an annoyance.
            if (isReload && sessionStorage.getItem(`sessionEngaged_${matched.id}`) === "true") {
              setIsSessionEngaged(true);
            }
          }
        } else if (!resolvedViaSharedLink) {
          // Truly nothing to resume: no incomplete session for this program
          // at all, and we didn't arrive via a shared session link either
          // (whose session may legitimately no longer be reported
          // "incomplete"). Correct the optimistic sessionStarted=true set
          // earlier from a merely-present (possibly stale) localStorage
          // session id — otherwise the sidebar/header wrongly show for a
          // session that no longer exists.
          setSessionStarted(false);
        }
      };

      // Single consolidated call replaces separate tags/preview/power-sets/
      // grouped-workouts requests — the backend returns everything needed
      // for this view (optionally scoped to storedSessionId) in one response.
      // /overview requires auth though (401s for a logged-out visitor) — an
      // anonymous preview visitor instead gets the same public
      // tags/preview/grouped-workouts endpoints /workout/detail already uses,
      // just enough to render the first section before login is required.
      setPowerSetsLoading(true);
      if (!isLoggedIn) {
        Promise.all([
          getProgramPreview(programCode.toLowerCase()),
          getProgramGroupedWorkouts(programCode.toLowerCase()).catch(() => []),
          getProgramTags(programCode.toLowerCase()),
        ])
          .then(([preview, groups, tags]) => {
            setProgramTags(tags);
            setPreviewData(preview);
            setWorkoutGroups(sortWorkoutGroups(Array.isArray(groups) ? groups : []));
            if (preview?.free) {
              localStorage.setItem("workoutIsFree", "true");
              setHasPurchased(true);
            }
          })
          .catch(() => {})
          .finally(() => {
            setPowerSetsLoading(false);
            setLoading(false);
          });
        return;
      }
      getProgramOverview(programCode.toLowerCase(), { sessionId: storedSessionId })
        .then((overview) => {
          setProgramTags(Array.isArray(overview.tags) ? overview.tags : []);
          setPreviewData(overview.preview ?? null);
          setPowerSets(Array.isArray(overview.powerSets) ? overview.powerSets : []);

          // A shared-link visitor never goes through the "browse program"
          // flow that normally sets workoutIsFree in localStorage, so a
          // free program would otherwise show a "requires purchase" paywall.
          console.log("[viewWorkout] Workout is", overview.preview?.free ? "FREE" : "PAID");
          if (overview.preview?.free) {
            localStorage.setItem("workoutIsFree", "true");
            setHasPurchased(true);
            setPurchaseExpiresAt(null);
          } else {
            // Otherwise a stale "true" left over from a previously-viewed
            // *different* free program would leak in via the early
            // localStorage read above and incorrectly hide this paid
            // program's paywall.
            localStorage.removeItem("workoutIsFree");
            // The backend is the source of truth for whether *this account*
            // already has an active purchase — mirrors mobile's
            // OverviewScreen.tsx fetchData (res.isPurchased / res.expiresAt).
            // Without this, a real purchase would only live in this
            // component's in-memory state and evaporate on the next reload.
            setHasPurchased(Boolean(overview.isPurchased));
            setPurchaseExpiresAt(overview.expiresAt ?? null);
          }

          const groups = sortWorkoutGroups(Array.isArray(overview.rounds) ? overview.rounds : []);
          setWorkoutGroups(groups);

          // Seeds the location display before a session/section fetch takes
          // over (that's the authoritative source once a session exists —
          // see athenaWorkout.tsx's per-section override).
          if (overview.selectedLocation?.name) {
            setLocation(overview.selectedLocation.name);
            localStorage.setItem("workoutLocationName", overview.selectedLocation.name);
          }

          // The backend only populates rejoinSessions when the overview is
          // fetched without a sessionId (i.e. before a session is chosen) —
          // confirmed via a live capture, it's absent once a sessionId is
          // passed. Use it directly when present instead of firing a second,
          // redundant request for the same data; fall back otherwise.
          if (Array.isArray(overview.rejoinSessions) && overview.rejoinSessions.length > 0) {
            applyIncompleteSessions(overview.rejoinSessions as unknown as IncompleteSession[]);
          } else {
            getIncompleteSessions(normalizedCode)
              .then(applyIncompleteSessions)
              .catch(() => {});
          }
        })
        .catch(() => {})
        .finally(() => {
          setPowerSetsLoading(false);
          setLoading(false);
        });

      const justCreated = localStorage.getItem("sessionJustCreated") === "true";
      if (justCreated) {
        localStorage.removeItem("sessionJustCreated");
        // One-shot signal from equipmentNeeded.tsx's session-creation flow —
        // not indefinite persistence like the flag removed above. This is
        // the same page boundary problem as athenaWorkout: the session
        // becomes active on a *different* page (equipmentNeeded), so this
        // mount needs telling once, immediately after, that it's engaged.
        setIsSessionEngaged(true);
        if (storedSessionId) sessionStorage.setItem(`sessionEngaged_${storedSessionId}`, "true");
      }
      // Same one-shot pattern for "Return to Workout" from athenaWorkout —
      // mobile's onGoBack keeps activeSession/isSessionActivated intact
      // since it never unmounts; this is the closest web equivalent given
      // it's a genuinely different route.
      const returningFromAthena = localStorage.getItem("returningFromAthenaWorkout") === "true";
      if (returningFromAthena) {
        localStorage.removeItem("returningFromAthenaWorkout");
        setIsSessionEngaged(true);
        if (storedSessionId) sessionStorage.setItem(`sessionEngaged_${storedSessionId}`, "true");
      }
      const returningFromLocation = localStorage.getItem("returningFromLocation") === "true";
      if (returningFromLocation) {
        localStorage.removeItem("returningFromLocation");
        setIsSessionEngaged(true);
        if (storedSessionId) sessionStorage.setItem(`sessionEngaged_${storedSessionId}`, "true");
      }
      const sessionActive = localStorage.getItem("sessionActive") === "true";

      // Load saved swaps on first visit after session creation OR when returning from athenaWorkout
      if (justCreated || sessionActive) {
        const savedSwaps = localStorage.getItem(
          `swappedExercises_${normalizedCode}`,
        );
        if (savedSwaps) {
          try {
            const entries: [string, WorkoutGroupItem][] =
              JSON.parse(savedSwaps);
            setSwappedExercises(new Map(entries));
          } catch {}
        }
      }
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

    setRoundLoads(computed);
  }, [loadRecords, workoutGroups]);

  useEffect(() => {
    const code = localStorage.getItem("workoutProgramCode");
    // activeSessionId_${code} first, matching athenaWorkout.tsx's resolution
    // exactly — activeSession is derived FROM this same localStorage value
    // (see applyIncompleteSessions), but if that match against the freshly
    // fetched incomplete-sessions list ever fails/races, activeSession can end
    // up stale while athenaWorkout always reads localStorage fresh, which was
    // making this round-completion check disagree with what it showed there.
    const sid =
      (code ? localStorage.getItem(`activeSessionId_${code.toUpperCase()}`) : null) ??
      activeSession?.id ??
      (activeSession as any)?.session_id;
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
      if (cancelled) return;
      setCompletedSectionsCount(results.filter(Boolean).length);
      // Feed the same authoritative per-round completion flag athenaWorkout.tsx
      // reads back into workoutGroups, so the Powersets/Map round check marks
      // match what you see when you actually open that round.
      setWorkoutGroups((prev) => {
        const changed = prev.some((g, i) => g.isCompleted !== results[i]);
        if (!changed) return prev;
        return prev.map((g, i) => (g.isCompleted === results[i] ? g : { ...g, isCompleted: results[i] }));
      });
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

  // Mirrors mobile's isSessionActive = (isPlayMode || isSessionActivated) &&
  // activeSession !== null. activeSession alone isn't enough to gate
  // "jump into a round/exercise" affordances — it also gets set just from
  // finding a matching still-incomplete session on mount (that's what
  // drives the rejoin banner), before the user has actually joined/rejoined.
  const isSessionActive = !!activeSession && isSessionEngaged;

  // Whether the current viewer created this session — mirrors mobile's isHost.
  // Only owner_id is used (not member_id): confirmed via a live capture that
  // every self-owned session has owner_id === member_id === the creator's own
  // id, but member_id's value for a genuine non-owner joiner is unverified,
  // so it's deliberately excluded to avoid a false-positive "host" match.
  const isHost = (session: IncompleteSession | null | undefined): boolean =>
    !!session && myUserId != null && String(session.owner_id) === String(myUserId);

  return (
    <>
      <SessionViewsPanel
        sessionStarted={sessionStarted}
        showRejoinBanner={showRejoinBanner}
        loading={loading}
        activeView={activeView}
        setActiveView={setActiveView}
        setShowSessionModal={setShowSessionModal}
        router={router}
        handleStartWorkout={handleStartWorkout}
        handleExerciseTapWithoutSession={handleExerciseTapWithoutSession}
        isSessionActive={isSessionActive}
        isLocked={isLocked}
        activeSession={activeSession}
        workoutGroups={workoutGroups}
        workoutTitle={workoutTitle}
        workoutName={workoutName}
        workoutType={workoutType}
        completedSectionsCount={completedSectionsCount}
        workoutStats={workoutStats}
        powerSets={powerSets}
        powerSetsLoading={powerSetsLoading}
        expandedPowerSets={expandedPowerSets}
        togglePowerSet={togglePowerSet}
        openVelocityModal={openVelocityModal}
        getRoundLabelForSet={getRoundLabelForSet}
        userOtherDetail={userOtherDetail}
        mapLoadRecords={mapLoadRecords}
        mapSessionLogs={mapSessionLogs}
        mapLoading={mapLoading}
        collapsedRounds={collapsedRounds}
        toggleRound={toggleRound}
        rejoinLoading={rejoinLoading}
        filterByLocation={filterByLocation}
        locationFilteredGroups={locationFilteredGroups}
        setShowPurchaseModal={setShowPurchaseModal}
        getActualExercise={getActualExercise}
        onEditExercise={openTracking}
        isLoggedIn={isLoggedIn}
        onRequireAuth={() => setAuthPrompt(true)}
      >
        {/* HEADER — only shown on the Overview view; Results/Powersets/Map
            get a dedicated view without the title/tags/ad-banner/session-box
            clutter, matching the Location/Start-Session row below it which
            was already Overview-only. */}
        {activeView === "Overview" && (
        <div className="bg-white border-b border-[#ececf2] px-4 sm:px-6 lg:px-10 py-4 flex-shrink-0 z-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <button onClick={() => router.back()} className="text-gray-500">
                <ArrowLeft size={20} />
              </button>
              <div>
                {/* Franchise name — shown first, above program name. */}
                {(() => {
                  const franchiseName = previewData?.franchise_name || previewData?.franchise || previewData?.franchiseCode;
                  if (!franchiseName) return null;
                  return (
                    <span className="inline-block px-2 py-0.5 bg-[#7C3AED] text-white text-[9px] font-black rounded-full uppercase mb-1">
                      {franchiseName}
                    </span>
                  );
                })()}
                {/* Program name (e.g. "Reconditioning") — mobile shows this
                    as a subtitle above the main workout title, sourced from
                    the active/incomplete session's program_name. */}
                {(activeSession?.program_name || incompleteSession?.program_name) && (
                  <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 leading-none">
                    {activeSession?.program_name || incompleteSession?.program_name}
                  </p>
                )}
                <h1 className="text-xl font-black text-[#3b82f6] tracking-tight leading-none uppercase mt-0.5">
                  {workoutTitle || "Formula-1"}
                </h1>
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

                  if (!powerSetTags.length) return null;

                  return (
                    <div className="flex flex-wrap gap-1 mt-1.5">
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
              {!isLocked && (
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
                    onClick={openInviteModal}
                    className="w-8 h-8 rounded-full bg-[#7c3aed] text-white flex items-center justify-center"
                  >
                    <Share2 size={15} />
                  </button>
                </div>
              )}

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

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto sm:ml-auto">
                  {isLocked ? (
                    <div className="flex items-center gap-2 text-[12px] font-semibold text-gray-400">
                      <MapPin size={14} className="text-gray-400" />
                      <span className="text-gray-400">Location :</span>
                      <span>{location || "None"}</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        // Same one-shot signal pattern as returningFromAthenaWorkout
                        // — only set it if actually engaged already, otherwise
                        // clicking Location before ever joining would wrongly
                        // mark the next mount as engaged.
                        if (isSessionEngaged) {
                          localStorage.setItem("returningFromLocation", "true");
                        }
                        router.push("/location");
                      }}
                      className="flex items-center gap-2 text-[12px] font-semibold text-gray-500 hover:opacity-75 transition"
                    >
                      <MapPin size={14} className="text-[#7c3aed]" />
                      <span className="text-[#7c3aed]">Location :</span>
                      <span>{location || "None"}</span>
                    </button>
                  )}

                  {/* Once a session is active, its location is already locked
                      in (see handleRejoin) — mirrors mobile, which hides this
                      toggle rather than letting the exercise list diverge
                      from what the session was actually created for. */}
                  {!activeSession && (
                    <label className={`flex items-center gap-1.5 select-none ${isLocked ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}>
                      <input
                        type="checkbox"
                        checked={filterByLocation}
                        disabled={locationFilterLoading || isLocked}
                        onChange={(e) => handleLocationFilter(e.target.checked)}
                        className="w-3.5 h-3.5 accent-[#7c3aed] rounded"
                      />
                      <span className="text-[11px] font-semibold text-[#7c3aed]">
                        {locationFilterLoading
                          ? "Loading..."
                          : "Show exercises based on default location"}
                      </span>
                    </label>
                  )}

                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-2">
                      {!isLocked ? (
                        <button
                          onClick={startNewSession}
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
                          className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5"
                        >
                          Buy Session <Lock size={12} />
                        </button>
                      )}
                      {!isLocked && (
                        <button
                          onClick={openInviteModal}
                          className="border border-[#7c3aed] text-[#7c3aed] px-4 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5"
                        >
                          <UserPlus size={14} />
                          Invite User
                        </button>
                      )}
                    </div>

                    <p
                      className={`text-[11px] font-semibold ${isLocked ? "text-yellow-600" : "text-emerald-500"}`}
                    >
                      {isLocked
                        ? "• This workout requires purchase"
                        : purchaseTimeRemaining
                          ? `• Unlocked — ${purchaseTimeRemaining}`
                          : "• This workout is free"}
                    </p>
                    {!isLocked && purchaseEndDateLabel && (
                      <p className="text-[10px] text-gray-400">
                        Ends {purchaseEndDateLabel}
                      </p>
                    )}
                  </div>
                </div>
              </div>
        </div>
        )}

        {/* REJOIN BANNER — shows whenever there's a session to resume and the user
            hasn't explicitly engaged with it yet (created it or pressed Rejoin).
            Knowing about a session (activeSession) is not the same as being
            engaged with it — mirrors the mobile app's isSessionActive gate.
            Only shown on the Overview (rounds/exercises) view — Results,
            Powersets, and Map don't need the rejoin prompt cluttering them. */}
        {showRejoinBanner && activeView === "Overview" && (() => {
          const bannerSession = activeSession || incompleteSession;
          const bannerIsHost = isHost(bannerSession);
          const actionLabel = isLocked ? "Unlock" : bannerIsHost ? "Rejoin" : "Join";
          return (
            <div className="px-4 sm:px-6 lg:px-10 pt-4 flex-shrink-0">
              <div className="bg-gradient-to-r from-[#ff6b6b] to-[#ff5757] rounded-2xl px-4 sm:px-5 py-3 sm:py-4 flex items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse flex-shrink-0" />
                  <div className="min-w-0">
                    <h3 className="text-white font-semibold text-xs sm:text-sm leading-none truncate">
                      {bannerSession
                        ? `${actionLabel} Live Session: ${bannerSession.id.slice(0, 6)}`
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
                    onClick={() => isLocked ? setShowPurchaseModal(true) : handleRejoin(bannerSession!)}
                    className="bg-white hover:bg-gray-100 transition px-4 py-2 rounded-xl text-[#ef4444] text-xs font-bold shadow-sm"
                  >
                    {actionLabel}
                  </button>
                  {/* Hidden while locked — otherwise a user without access
                      could join a different incomplete session from this
                      list instead of purchasing. */}
                  {!isLocked && bannerIsHost && incompleteSessions.length > 0 && (
                    <button
                      onClick={() => setShowRejoinModal(true)}
                      className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition flex items-center justify-center"
                    >
                      <ChevronRight size={16} className="text-white" />
                    </button>
                  )}
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

      </SessionViewsPanel>

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
                ID: {(activeSession || incompleteSession)?.id?.slice(0, 6) || "pending"}
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
                    {(activeSession || incompleteSession)?.id?.slice(0, 6) || "pending"}
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
                {(() => {
                  // incompleteSession is just incompleteSessions[0] — the first
                  // unfinished session for this whole program, which may not be
                  // the one currently in view. Prefer the session actually
                  // engaged with (activeSession), same priority used for the
                  // rejoin banner elsewhere on this page.
                  const shareSession = activeSession || incompleteSession;
                  return (
                    <>
                      <div className="border border-gray-200 rounded-2xl px-4 py-3 mb-3">
                        <div className="flex items-center gap-2">
                          <Link size={12} className="text-gray-400 flex-shrink-0" />
                          <p className="text-[11px] text-gray-400 truncate">
                            {`https://paxlete.com/workout/viewWorkoutSession?sessionId=${shareSession?.id || "pending"}`}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (!shareSession?.id) return;
                          const url = `https://paxlete.com/workout/viewWorkoutSession?sessionId=${shareSession.id}`;
                          navigator.clipboard.writeText(url);
                          setSessionLinkCopied(true);
                          setTimeout(() => setSessionLinkCopied(false), 2000);
                        }}
                        disabled={!shareSession?.id}
                        className="w-full bg-[#3b82f6] text-white py-3.5 rounded-2xl font-bold text-[13px] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {sessionLinkCopied ? <Check size={14} /> : <Copy size={14} />}
                        {sessionLinkCopied ? "Copied!" : "Copy URL"}
                      </button>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AUTH PROMPT — gates starting/rejoining/inviting for anonymous
          preview visitors; browsing the preview itself never triggers this. */}
      {authPrompt && (
        <div
          className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setAuthPrompt(false)}
        >
          <div
            className="relative w-full max-w-3xl overflow-hidden rounded-3xl px-6 py-10 md:px-12 md:py-14 shadow-2xl"
            style={{ background: "linear-gradient(135deg, #8B5CF6, #6202AC)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setAuthPrompt(false)}
              className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition"
            >
              <X size={15} className="text-white" />
            </button>

            <div className="relative z-10 max-w-xs md:max-w-sm">
              <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center mb-4">
                <AlertCircle size={20} className="text-white" />
              </div>
              <h3 className="text-white font-medium text-3xl md:text-4xl mb-2">Start your Session</h3>
              <p className="text-white/80 text-sm md:text-base mb-6">Log in or sign up to begin the workout</p>
              <button
                onClick={() => router.push(loginUrl)}
                className="bg-white text-purple-700 font-bold text-sm px-5 py-3 rounded-full hover:bg-gray-50 transition"
              >
                Log in or Sign up
              </button>
            </div>

            <img
              src="/images/Visual.png"
              alt=""
              className="hidden sm:block absolute right-2 md:right-6 bottom-0 w-64 md:w-80 pointer-events-none select-none"
            />
          </div>
        </div>
      )}

      {/* PURCHASE MODAL — "Premium Session" paywall, mirrors mobile's spec
          exactly (purple header band with decorative clipped circles, amber
          lock badge, price row, included-with-purchase list). */}
      {showPurchaseModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-6"
          onClick={() => {
            setShowPurchaseModal(false);
            setCheckoutStarted(false);
          }}
        >
          <div
            className="bg-white w-full max-w-[380px] rounded-[24px] shadow-[0_8px_20px_rgba(0,0,0,0.2)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {checkoutStarted && programCodeForPurchase ? (
              <div className="p-4">
                <PurchaseCheckout
                  workoutId={programCodeForPurchase}
                  workoutTitle={workoutTitle}
                  onSuccess={() => {
                    console.log("[viewWorkoutSession] payment flow succeeded — unlocking", { programCode: programCodeForPurchase, workoutTitle });
                    setHasPurchased(true);
                    // Optimistic estimate so the countdown shows immediately
                    // instead of "This workout is free" until the next
                    // getProgramOverview fetch — the backend grants a fixed
                    // 24h window, and the next natural refetch (remount/focus)
                    // will overwrite this with the authoritative expiresAt.
                    setPurchaseExpiresAt(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString());
                    setShowPurchaseModal(false);
                    setCheckoutStarted(false);
                  }}
                  onCancel={() => {
                    console.log("[viewWorkoutSession] payment flow closed without unlocking", { programCode: programCodeForPurchase });
                    setShowPurchaseModal(false);
                    setCheckoutStarted(false);
                  }}
                />
              </div>
            ) : (
              <>
                {/* Header band */}
                <div className="relative overflow-hidden bg-[#7C3AED] pt-[22px] pb-[18px] px-6">
                  <div className="absolute w-[120px] h-[120px] rounded-full bg-white/[0.07] -left-[30px] -bottom-[30px]" />
                  <div className="absolute w-[160px] h-[160px] rounded-full bg-white/[0.07] -right-[60px] -top-[40px]" />

                  <div className="relative flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-white/[0.18] flex items-center justify-center mb-3">
                      <div className="w-12 h-12 rounded-full bg-[#F59E0B] flex items-center justify-center">
                        <Lock size={22} className="text-white" />
                      </div>
                    </div>
                    <h2 className="text-[20px] font-bold text-white">Premium Session</h2>
                    <p className="text-[11px] font-bold text-white/75 tracking-[1.2px] uppercase text-center mt-1 line-clamp-2">
                      {workoutTitle || "WORKOUT"}
                    </p>
                  </div>
                </div>

                {/* Body */}
                <div className="p-4 flex flex-col items-center gap-[10px]">
                  <div className="flex items-end gap-1">
                    <span className="text-[32px] font-bold text-[#111827] leading-none">${displayPrice}</span>
                    <span className="text-[13px] font-semibold text-[#6B7280] mb-0.5 ml-1">USD</span>
                  </div>

                  <p className="text-[14px] text-[#6B7280] text-center leading-[21px]">
                    This is a premium session. Purchase to unlock full access and start your workout.
                  </p>

                  <div className="w-full bg-[#F9FAFB] rounded-xl p-[10px] flex flex-col gap-1.5">
                    <p className="text-[14px] font-bold text-[#111827]">Included with purchase:</p>
                    {["Full workout access", "Set tracking", "Unlimited Sessions"].map((label) => (
                      <div key={label} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] shrink-0" />
                        <span className="text-[13px] font-medium text-[#374151]">{label}</span>
                      </div>
                    ))}
                  </div>

                  <p className="text-[14px] font-bold text-[#111827] text-center">View Purchase Options:</p>

                  <button
                    onClick={() => {
                      console.log("[viewWorkoutSession] Purchase button tapped", { programCode: programCodeForPurchase, workoutTitle });
                      setCheckoutStarted(true);
                    }}
                    disabled={!programCodeForPurchase}
                    className="w-full bg-[#7C3AED] hover:bg-[#6d28d9] disabled:opacity-60 text-white font-bold text-[14px] py-3 rounded-[14px] flex items-center justify-center gap-2 transition"
                  >
                    <CreditCard size={16} />
                    Purchase for ${displayPrice}
                  </button>

                  <button
                    onClick={() => {
                      setShowPurchaseModal(false);
                      setCheckoutStarted(false);
                    }}
                    className="w-full py-2 text-[15px] font-semibold text-[#6B7280] hover:text-gray-700 transition"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* READY TO START MODAL — shown when tapping an exercise before any
          session exists (free branch), mirrors mobile's spec: same header
          band shell as the Premium Session modal, with a play-icon badge,
          close button, and a green "FREE" banner. */}
      {showStartSessionPrompt && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-6"
          onClick={() => setShowStartSessionPrompt(false)}
        >
          <div
            className="bg-white w-full max-w-[380px] rounded-[24px] shadow-[0_8px_20px_rgba(0,0,0,0.2)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header band */}
            <div className="relative overflow-hidden bg-[#7C3AED] pt-[22px] pb-[18px] px-6">
              <div className="absolute w-[120px] h-[120px] rounded-full bg-white/[0.07] -left-[30px] -bottom-[30px]" />
              <div className="absolute w-[160px] h-[160px] rounded-full bg-white/[0.07] -right-[60px] -top-[40px]" />

              <button
                onClick={() => setShowStartSessionPrompt(false)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition z-10"
              >
                <X size={14} className="text-white" />
              </button>

              <div className="relative flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mb-3">
                  <div className="w-[60px] h-[60px] rounded-full bg-white/20 flex items-center justify-center">
                    <Play size={24} fill="white" className="text-white ml-1" />
                  </div>
                </div>
                <h2 className="text-[20px] font-bold text-white">Ready to Start?</h2>
                <p className="text-[11px] font-bold text-white/75 tracking-[1.2px] uppercase text-center mt-1 line-clamp-2">
                  {workoutTitle || "WORKOUT"}
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="p-4 flex flex-col items-center gap-[10px]">
              <p className="text-[15px] font-bold text-[#10B981] text-center">
                ✦ This session is FREE! ✦
              </p>

              <p className="text-[14px] text-[#6B7280] text-center leading-[21px]">
                Click below to begin your workout session and start tracking your progress.
              </p>

              <button
                onClick={() => {
                  setShowStartSessionPrompt(false);
                  startNewSession();
                }}
                className="w-full bg-[#4C1D95] hover:bg-[#3b1573] text-white font-bold text-[14px] py-4 rounded-2xl flex items-center justify-center gap-2 transition"
              >
                <Play size={16} fill="white" />
                Start Session Now
              </button>
              <button
                onClick={() => setShowStartSessionPrompt(false)}
                className="w-full bg-[#F3F4F6] hover:bg-gray-200 text-[#6B7280] font-semibold text-[15px] py-3.5 rounded-2xl transition"
              >
                Maybe Later
              </button>
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
                // Exact port of mobile's ExerciseTrackingModal suggested-weight
                // logic. Two bugs fixed here: (1) the lift-max map (wMap) must
                // NOT be unit-converted — mobile uses the raw r_back_squat/etc
                // values directly, same fix already applied to
                // PowerSetTrackingModal/swapExerciseModal/athenaWorkout
                // earlier; (2) the no-lift-adjustment fallback previously
                // just relabeled the raw weight with the unit string instead
                // of actually converting it via convertToUserUnit.
                const userUnit = (
                  userOtherDetail?.measurementUnit || "lbs"
                ).toLowerCase().trim();
                const wMap: Record<string, number> = {
                  "of InputBarbellSquat": parseFloat(String(userOtherDetail?.r_back_squat || 0)) || 0,
                  "of InputDeadlift": parseFloat(String(userOtherDetail?.r_deadlift || 0)) || 0,
                  "of InputBenchPress": parseFloat(String(userOtherDetail?.r_bench_press || 0)) || 0,
                  "of InputPowerClean": parseFloat(String(userOtherDetail?.r_power_clean || 0)) || 0,
                  "of BodyWeight": parseFloat(String(userOtherDetail?.currentWeight || 0)) || 0,
                };
                const weightAdj = (trackingItem.weight_adj || "").trim();
                const weightValue = trackingItem.weight || "0";
                const dWeight = trackingItem.calculated_weight ?? trackingItem.weight ?? null;
                const msrmt = (trackingItem as unknown as { msrmt?: string }).msrmt;

                let displaySuggestedWeight = "";
                const hasAdj = weightAdj !== "" && wMap[weightAdj] !== undefined && wMap[weightAdj] > 0;
                if (hasAdj) {
                  const baseValue = wMap[weightAdj];
                  const multiplier = parseFloat(String(weightValue)) || 0;
                  const calculated = Math.ceil(baseValue * multiplier);
                  displaySuggestedWeight = calculated > 0 ? `${calculated} ${userUnit}` : "";
                } else if (dWeight != null) {
                  const dWeightStr = String(dWeight).trim();
                  const numericWeight = parseFloat(dWeightStr) || 0;
                  if (numericWeight > 0) {
                    displaySuggestedWeight = convertToUserUnit(dWeightStr, userUnit, msrmt || "lbs");
                  }
                }
                const displayWeight =
                  displaySuggestedWeight ||
                  (weightValue && String(weightValue) !== "0"
                    ? convertToUserUnit(weightValue, userUnit, "lbs")
                    : "");
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
                          Weight ({(userOtherDetail?.measurementUnit || "lbs").toLowerCase()})
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
                          // Matches mobile's handleSaveSet validation — it
                          // shows an alert and refuses to save rather than
                          // silently persisting a 0/0 set.
                          if (weightNum <= 0 || repsNum <= 0) {
                            alert("Weight and reps must be greater than 0.");
                            return;
                          }
                          const computedLoad = computeTrackingLoad(
                            userOtherDetail,
                            trackingItem,
                            weightNum,
                            repsNum,
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
                          setSavingSetIndex(i);
                          try {
                            const result = await createTrackingLog(payload);
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
                          } catch {
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
                    // Matches mobile's handleSave: a set is only included if
                    // it has weight AND/OR reps typed in — a set left
                    // completely blank is skipped rather than saved as 0/0.
                    // Suggested-weight/defaultReps fill in whichever of the
                    // two was left blank, same as mobile.
                    const defaultReps =
                      parseInt(
                        (String(trackingItem.reps || "").split("-").pop() || "").replace(/\D/g, ""),
                        10,
                      ) || 15;
                    const defaultWeight = parseFloat(String(userOtherDetail?.currentWeight || 0)) || 0;
                    const payloads = sets
                      .map((set, i) => ({ set, setNumber: i + 1 }))
                      .filter(({ set }) => !set.saved && (set.weight || set.reps))
                      .map(({ set, setNumber }) => {
                        const weightNum = parseFloat(set.weight) || defaultWeight;
                        const repsNum = parseInt(set.reps) || defaultReps;
                        return {
                          title: `Set ${setNumber}`,
                          exerciseId: trackingItem.exercise_id,
                          sessionId,
                          workoutLibraryId: code,
                          weight: weightNum,
                          repetitions: repsNum,
                          status: true,
                          tag: "/e",
                          load: computeTrackingLoad(userOtherDetail, trackingItem, weightNum, repsNum),
                        };
                      });
                    if (payloads.length > 0) {
                      await Promise.all(
                        payloads.map((p) => createTrackingLog(p)),
                      );
                    }
                  } catch {
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
    </>
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
