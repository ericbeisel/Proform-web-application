"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Play,
  Pause,
  SkipForward,
  User,
  NotepadText,
  Settings,
  Share2,
  MapPin,
  Home,
  BarChart3,
  Info,
  Pen,
  Star,
  X,
  Plus,
  DollarSign,
  TrendingUp,
  Loader2,
  Pencil,
  Dumbbell,
  Search,
  CheckCircle2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import WorkoutSidebar from "./WorkoutSidebar";
import ShareSessionModal from "./ShareSessionModal";
import {
  getWorkoutSectionFull,
  SectionExercise,
  getTrackingLogs,
  createTrackingLog,
  getWorkoutLoadRecords,
  createWorkoutLoad,
  WorkoutLoadRecord,
  updateSessionLocation,
  getPowerSetDetails,
} from "@/api/workouts/route";
import { getProgramGroupedWorkouts, WorkoutGroup, getProgramPowerSets, PowerSet } from "@/api/programs/route";
import { sortWorkoutGroups } from "../viewWorkoutSession/helpers";
import { dashboardApi, UserOtherDetail } from "@/api/dashboard/route";
import { equipmentApi, LocationItem, Equipment } from "@/api/location/route";
import SwapExerciseModal from "./swapExerciseModal";
import PowerSetTrackingModal, { type VelocitySet } from "../viewWorkoutSession/PowerSetTrackingModal";
import { convertToUserUnit } from "@/lib/units";
import { feedApi, Advertisement } from "@/api/feed/route";

function parseHeightInches(h: string | number | null | undefined): number {
  if (!h) return 0;
  const str = String(h).trim();
  if (/^\d+(\.\d+)?$/.test(str)) return parseFloat(str);
  const match = str.match(/(\d+)\s*[''`'ft]*\s*(\d+)?/);
  if (match) return (parseInt(match[1], 10) || 0) * 12 + (parseInt(match[2], 10) || 0);
  return parseFloat(str) || 0;
}

function parseRepsVal(repsStr: string | number | null | undefined): number {
  if (!repsStr) return 0;
  const cleaned = String(repsStr).trim().split("-").pop()?.trim() || "";
  const val = parseInt(cleaned.replace(/\D/g, ""), 10);
  return isNaN(val) ? 0 : val;
}

function cleanReps(repsStr: string | number | null | undefined): string {
  if (repsStr === null || repsStr === undefined) return "";
  const str = String(repsStr).trim();
  const part = str.split("-").pop()?.trim() || "";
  return part.replace(/\D/g, "");
}

type ExerciseBadge = "UES" | "LES" | "CCS" | "HHP" | null;

// Ported exactly from mobile's getExerciseBadge/getBadgeLabel
// (WorkoutSessionScreen.tsx) — the "Target" chip shown beside Reps.
function getExerciseBadge(exercise: any): ExerciseBadge {
  if (!exercise) return null;
  const ex = exercise.exercise || exercise;
  const name = (ex.name || ex.exercise_name || ex.title || "").toLowerCase();

  if (name.includes("clean")) return "CCS";
  if (name.includes("deadlift")) return "HHP";

  const upperBody =
    (parseFloat(ex.chest) || 0) +
    (parseFloat(ex.biceps) || 0) +
    (parseFloat(ex.triceps) || 0) +
    (parseFloat(ex.frontDelts) || 0) +
    (parseFloat(ex.lateralDelts) || 0) +
    (parseFloat(ex.rearDelts) || 0) +
    (parseFloat(ex.traps) || 0) +
    (parseFloat(ex.forearms) || 0) +
    (parseFloat(ex.scaps) || 0) +
    (parseFloat(ex.latsUpperBack) || 0);

  const lowerBody =
    (parseFloat(ex.glutes) || 0) +
    (parseFloat(ex.calves) || 0) +
    (parseFloat(ex.hamstrings) || 0) +
    (parseFloat(ex.adductors) || 0) +
    (parseFloat(ex.abuductorsHips) || 0) +
    (parseFloat(ex.quads) || 0);

  if (upperBody > 0 || lowerBody > 0) {
    return upperBody >= lowerBody ? "UES" : "LES";
  }

  const lowerKeywords = [
    "squat", "leg", "glute", "calf", "hamstring", "quad", "lunge",
    "toe", "heel", "hip", "knee", "adductor", "abductor", "thrust", "step up",
  ];
  const upperKeywords = [
    "chest", "bench", "press", "pushup", "pullup", "chinup", "row", "fly",
    "bicep", "tricep", "arm", "curl", "delt", "shoulder", "trap", "shrug",
    "raise", "pulldown", "dip", "apart", "wrist",
  ];

  for (const kw of lowerKeywords) if (name.includes(kw)) return "LES";
  for (const kw of upperKeywords) if (name.includes(kw)) return "UES";
  return null;
}

function getBadgeLabel(badge: ExerciseBadge): string {
  switch (badge) {
    case "UES": return "$Bench";
    case "LES": return "$Squat";
    case "CCS": return "$Clean";
    case "HHP": return "$Deadlift";
    default: return "";
  }
}

// Ported exactly from mobile's getExerciseWeightToDisplay
// (WorkoutSessionScreen.tsx) — prefers the backend's pre-computed
// calculated_weight, else falls back to the raw weight field (labeled with
// its own msrmt unit), then converts the result to the user's actual unit.
function getExerciseWeightToDisplay(exercise: any, userDetail: UserOtherDetail | null): string | null {
  if (!exercise) return null;
  let weightVal = "";
  if (exercise.calculated_weight) {
    weightVal = exercise.calculated_weight;
  } else {
    const rawWeight = exercise.weight;
    if (rawWeight && rawWeight !== "0" && rawWeight !== "0.0" && String(rawWeight).trim() !== "") {
      const unit = exercise.msrmt || "lbs";
      if (String(rawWeight).toLowerCase().includes("lbs") || String(rawWeight).toLowerCase().includes("kg")) {
        weightVal = rawWeight;
      } else {
        weightVal = `${rawWeight} ${unit}`;
      }
    }
  }
  const userUnit = (userDetail?.measurementUnit || "lbs").toLowerCase().trim();
  return weightVal ? convertToUserUnit(weightVal, userUnit, exercise.msrmt || "lbs") : null;
}

// Backend's section-exercises response isn't reliably pre-sorted — mobile
// always re-sorts by `.order` before rendering (WorkoutSessionScreen.tsx),
// so this must match exactly or exercises show in the wrong sequence.
function sortByOrder(exercises: SectionExercise[]): SectionExercise[] {
  return [...exercises].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

function computeExerciseLoad(
  exercise: SectionExercise & Record<string, unknown>,
  userDetail: UserOtherDetail | null,
  sectionRounds: string | undefined,
): { load: number; power: number; kcal: number } {
  if (!userDetail) return { load: 0, power: 0, kcal: 0 };

  const isKg = (userDetail.measurementUnit || "lbs").toLowerCase().trim() === "kg";
  const toLbs = (v: number) => isKg ? v * 2.2046 : v;

  const userWeight = toLbs(parseFloat(String(userDetail.currentWeight || 0)) || 0);
  const userHeight = parseHeightInches(userDetail.height);

  const wMap: Record<string, number> = {
    "of InputBarbellSquat": toLbs(parseFloat(String(userDetail.r_back_squat || 0)) || 0),
    "of InputDeadlift":     toLbs(parseFloat(String(userDetail.r_deadlift || 0)) || 0),
    "of InputBenchPress":   toLbs(parseFloat(String(userDetail.r_bench_press || 0)) || 0),
    "of InputPowerClean":   toLbs(parseFloat(String(userDetail.r_power_clean || 0)) || 0),
    "of BodyWeight":        userWeight,
  };

  const data1 = userWeight * userHeight;
  const E = parseInt(String(exercise.loadMeter ?? exercise.load_meter ?? 3)) || 3;
  const value = parseRepsVal(exercise.reps);
  const e = parseFloat(String(exercise.repVariant ?? exercise.rep_variant ?? 1)) || 1;
  const setsCount = parseInt(String(exercise.sets || sectionRounds || "1").replace(/\D/g, "")) || 1;

  const weightAdj = (exercise.weight_adj || "").trim();
  let baseWeight = userWeight;
  if (weightAdj.includes("Squat") || weightAdj.includes("InputBarbellSquat"))      baseWeight = wMap["of InputBarbellSquat"];
  else if (weightAdj.includes("Deadlift") || weightAdj.includes("InputDeadlift"))  baseWeight = wMap["of InputDeadlift"];
  else if (weightAdj.includes("BenchPress") || weightAdj.includes("InputBenchPress")) baseWeight = wMap["of InputBenchPress"];
  else if (weightAdj.includes("PowerClean") || weightAdj.includes("InputPowerClean")) baseWeight = wMap["of InputPowerClean"];
  else if (weightAdj.includes("BodyWeight") || weightAdj.includes("currentWeight")) baseWeight = wMap["of BodyWeight"];

  const exWt = parseFloat(String(exercise.weight || 0)) || 0;
  const wt = exWt > 5 ? baseWeight * (exWt / 100) : exWt > 0 ? baseWeight * exWt : baseWeight * 0.20;

  const data2 = E * (value * e) * setsCount * wt;
  const load  = Math.ceil((data1 + data2) / 2600);
  const power = Math.ceil((userWeight + data2) / 1300);
  const kcal  = Math.ceil((66 + userWeight * 6.2 + userHeight * 12.7 * load) / 4000);

  return { load, power, kcal };
}

// Checks whether every required "money set" ($) across this round's power-set
// exercises has been recorded — mirrors mobile's verifyPowerSetsCompletion.
// PowerSetDetailSet doesn't declare min_reps/power_id (the type lags the real
// API response), so those are read defensively. If no set on a given exercise
// is flagged via min_reps, fall back to treating the LAST set as the money
// set — the same convention /workout/dollarSet itself uses to show the $ icon
// — so verification still works even if min_reps isn't populated for this
// endpoint.
async function verifyPowerSetsCompletedFor(
  exercises: SectionExercise[],
  sessionId: string | null,
): Promise<boolean> {
  if (!sessionId) return true;
  const powerSetExercises = exercises.filter((ex) => ex.is_power_set);
  if (powerSetExercises.length === 0) return true;

  try {
    for (const ex of powerSetExercises) {
      const details = await getPowerSetDetails({ specializedWorkoutId: ex.id, sessionId });
      const allSets = details.sets || [];
      if (allSets.length === 0) continue;

      const flaggedMoneySets = allSets.filter(
        (s) => (s as unknown as { min_reps?: number | null }).min_reps !== undefined
          && (s as unknown as { min_reps?: number | null }).min_reps !== null,
      );
      const moneySets = flaggedMoneySets.length > 0 ? flaggedMoneySets : [allSets[allSets.length - 1]];

      if (!moneySets.every((s) => s.recorded === true)) {
        return false;
      }
    }
    return true;
  } catch {
    return true;
  }
}

function resolveMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("wix:image://")) {
    // wix:image://v1/{hash}/{filename}#... → https://static.wixstatic.com/media/{hash}
    const hash = url.replace("wix:image://v1/", "").split("/")[0];
    return `https://static.wixstatic.com/media/${hash}`;
  }
  return url;
}

export default function AthenaWorkoutPage() {
  const router = useRouter();
  const [isNotePopupOpen, setIsNotePopupOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [shareWithCoach, setShareWithCoach] = useState(false);
  const [isVelocityPopupOpen, setIsVelocityPopupOpen] = useState(false);
  const [velocitySets, setVelocitySets] = useState([
    { id: 1, weight: 9, reps: "12-15", maxV: 1.0, unit: "m/s" },
  ]);
  const SETUP_DURATION = 15;
  const WORK_DURATION = 45;

  const [isRunning, setIsRunning] = useState(true);
  const [timerPhase, setTimerPhase] = useState<"setup" | "work">("setup");
  const [timeRemaining, setTimeRemaining] = useState(SETUP_DURATION);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerStateRef = useRef({ phase: "setup" as "setup" | "work", remaining: SETUP_DURATION, totalExercises: 0 });

  const [sections, setSections] = useState<WorkoutGroup[]>([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [sectionExercises, setSectionExercises] = useState<SectionExercise[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [dataLoading, setDataLoading] = useState(true);
  const [workoutCode, setWorkoutCode] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Opens the shared ShareSessionModal (src/app/workout/components), from
  // the header's Share icon.
  const [showShareModal, setShowShareModal] = useState(false);

  const [locationName, setLocationName] = useState<string>("Temporary Location");
  const [locationId, setLocationId] = useState<string | null>(null);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [sidebarActiveView, setSidebarActiveView] = useState("Overview");

  // Location popup — mirrors mobile's LocationBottomSheet: browsing/selecting
  // a row only stages it locally (tempSelectedLocationId); the change isn't
  // applied (session update + exercise refetch) until "Select Location" is
  // confirmed. setAsDefaultLocation mirrors its "Set as Default" checkbox.
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [swappingLocation, setSwappingLocation] = useState(false);
  const [locationEquipments, setLocationEquipments] = useState<Map<number, string[]>>(new Map());
  const [tempSelectedLocationId, setTempSelectedLocationId] = useState<string | null>(null);
  const [setAsDefaultLocation, setSetAsDefaultLocation] = useState(false);
  const [confirmingLocation, setConfirmingLocation] = useState(false);

  // Create/Edit location popup — reused for both, mirrors mobile's
  // "CreateLocation" screen being navigated to with locationData for edits.
  const [showCreateLocationPopup, setShowCreateLocationPopup] = useState(false);
  const [allEquipment, setAllEquipment] = useState<Equipment[]>([]);
  const [allEquipLoading, setAllEquipLoading] = useState(false);
  const [createSearch, setCreateSearch] = useState("");
  const [createSelectedIds, setCreateSelectedIds] = useState<Set<number>>(new Set());
  const [createTitle, setCreateTitle] = useState("");
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [editingLocationId, setEditingLocationId] = useState<number | null>(null);
  const [editingLocationLoading, setEditingLocationLoading] = useState(false);
  const [createSetAsDefault, setCreateSetAsDefault] = useState(false);

  // Round completion — mirrors mobile's handleToggleComplete/verifyPowerSetsCompletion
  const [isCurrentRoundCompleted, setIsCurrentRoundCompleted] = useState(false);
  const [powerSetsCompleted, setPowerSetsCompleted] = useState(true);
  // True while a fresh verifyPowerSetsCompletedFor call is in flight for the
  // current round — the completion checkbox must stay disabled during this
  // window, since powerSetsCompleted can still hold a stale value from the
  // previous round until it resolves.
  const [verifyingPowerSets, setVerifyingPowerSets] = useState(false);
  const [showMoneySetModal, setShowMoneySetModal] = useState(false);
  const [isCountingRoundStats, setIsCountingRoundStats] = useState(false);
  const [loadRecords, setLoadRecords] = useState<WorkoutLoadRecord[]>([]);

  const refreshLoadRecords = async (sid: string | null) => {
    if (!sid) return;
    const records = await getWorkoutLoadRecords(sid);
    setLoadRecords(records);
  };

  // Sponsored ad banner — mirrors mobile's BannerFittedSlider/SponsoredSlider
  // at the top of WorkoutSessionScreen (adType "Workout Banner").
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [adIndex, setAdIndex] = useState(0);
  const [selectedAd, setSelectedAd] = useState<Advertisement | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  // Exercise tracking
  const [trackingExercise, setTrackingExercise] = useState<SectionExercise | null>(null);
  const [trackingSets, setTrackingSets] = useState<{ weight: string; reps: string; saved: boolean; load?: number }[]>([{ weight: "", reps: "", saved: false }]);
  const [lastRecord, setLastRecord] = useState<{ weight: number; reps: number } | null>(null);
  const [bestRecord, setBestRecord] = useState<{ weight: number; reps: number } | null>(null);
  const [logsLoading, setLogsLoading] = useState(false);
  const [savingLogs, setSavingLogs] = useState(false);
  const [savingSetIndex, setSavingSetIndex] = useState<number | null>(null);
  const [userOtherDetail, setUserOtherDetail] = useState<UserOtherDetail | null>(null);

  // "Complete the $ Set" modal — mirrors mobile's
  // selectedExerciseForVelocity/isVelocityModalVisible when opened for a
  // power-set exercise (PowerSetTrackingModal branch).
  const [moneySetExercise, setMoneySetExercise] = useState<SectionExercise | null>(null);
  const [moneySetSets, setMoneySetSets] = useState<VelocitySet[]>([]);

  const openMoneySetModal = useCallback((exercise: SectionExercise) => {
    setMoneySetExercise(exercise);
    setMoneySetSets([
      { weight: "", reps: cleanReps(exercise?.reps || "8-12"), unit: "", recorded: false },
    ]);
  }, []);

  const addMoneySetSet = useCallback(() => {
    setMoneySetSets((prev) => [
      ...prev,
      { weight: "", reps: "", unit: "", recorded: false, isCustom: true },
    ]);
  }, []);

  const updateMoneySetSet = useCallback((index: number, field: string, value: any) => {
    setMoneySetSets((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }, []);

  const toggleRecordMoneySetSet = useCallback((index: number) => {
    setMoneySetSets((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], recorded: !next[index].recorded };
      return next;
    });
  }, []);

  // Keep ref in sync so the interval always reads fresh values
  useEffect(() => {
    timerStateRef.current = { phase: timerPhase, remaining: timeRemaining, totalExercises: sectionExercises.length };
  });

  useEffect(() => {
    if (!isRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      const { phase, remaining } = timerStateRef.current;
      if (remaining > 1) {
        setTimeRemaining(remaining - 1);
      } else if (phase === "setup") {
        // Setup done → start work phase
        setTimerPhase("work");
        setTimeRemaining(WORK_DURATION);
      } else {
        // Work done → loop back to first exercise when at the end
        setCurrentExerciseIndex((i) => {
          const total = timerStateRef.current.totalExercises;
          return total > 0 ? (i + 1) % total : 0;
        });
      }
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRunning]);

  // Reset to setup phase on exercise change
  useEffect(() => {
    setTimerPhase("setup");
    setTimeRemaining(SETUP_DURATION);
  }, [currentExerciseIndex]);


  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const handleSkip = () => {
    if (timerPhase === "setup") {
      // Setup → jump straight to work phase
      setTimerPhase("work");
      setTimeRemaining(WORK_DURATION);
    } else {
      // Work → loop back to first exercise when at the end
      setCurrentExerciseIndex((i) => sectionExercises.length > 0 ? (i + 1) % sectionExercises.length : 0);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const code = localStorage.getItem("workoutProgramCode");
        if (!code) { setDataLoading(false); return; }
        setWorkoutCode(code);

        const sid = localStorage.getItem(`activeSessionId_${code?.toUpperCase()}`);
        setSessionId(sid);
        refreshLoadRecords(sid);
        const loc = localStorage.getItem("workoutLocationName");
        if (loc) setLocationName(loc);
        const locId = localStorage.getItem("workoutLocationId");
        if (locId) setLocationId(locId);
        const rawGroups = await getProgramGroupedWorkouts(code);
        const groups = sortWorkoutGroups(rawGroups);
        setSections(groups);

        const urlParams = new URLSearchParams(window.location.search);
        const startLabel = urlParams.get("section");
        const startExerciseIdx = parseInt(urlParams.get("exercise") || "0", 10) || 0;
        const startIdx = startLabel
          ? Math.max(0, groups.findIndex((g) => g.label.trim() === startLabel.trim()))
          : 0;

        if (startIdx > 0) setCurrentSectionIndex(startIdx);

        if (groups.length > 0) {
          const sectionRes = await getWorkoutSectionFull({
            sessionId: sid,
            programCode: code,
            section: groups[startIdx]?.label || groups[0].label,
          });
          const exercises = sortByOrder(sectionRes.exercises || sectionRes.workouts || []);
          setSectionExercises(exercises);
          setIsCurrentRoundCompleted(!!sectionRes.isCompleted);
          // The session's own location is the source of truth once it
          // exists server-side — same endpoint mobile reads locationName
          // from on every section fetch.
          if (sectionRes.locationName) {
            setLocationName(sectionRes.locationName);
            localStorage.setItem("workoutLocationName", sectionRes.locationName);
          }
          setVerifyingPowerSets(true);
          verifyPowerSetsCompletedFor(exercises, sid)
            .then(setPowerSetsCompleted)
            .finally(() => setVerifyingPowerSets(false));
          if (startExerciseIdx > 0 && startExerciseIdx < exercises.length) {
            setCurrentExerciseIndex(startExerciseIdx);
          }
        }
      } catch {
      } finally {
        setDataLoading(false);
      }
    };
    loadData();
  }, []);

  const loadSectionExercises = useCallback(
    async (sectionIndex: number, code: string | null, sid: string | null, groups: WorkoutGroup[], preserveIndex?: number) => {
      if (!groups[sectionIndex] || !code) return;
      setDataLoading(true);
      if (preserveIndex === undefined) setCurrentExerciseIndex(0);
      try {
        const sectionRes = await getWorkoutSectionFull({
          sessionId: sid,
          programCode: code,
          section: groups[sectionIndex].label,
        });
        const exercises = sortByOrder(sectionRes.exercises || sectionRes.workouts || []);
        setSectionExercises(exercises);
        setIsCurrentRoundCompleted(!!sectionRes.isCompleted);
        if (sectionRes.locationName) {
          setLocationName(sectionRes.locationName);
          localStorage.setItem("workoutLocationName", sectionRes.locationName);
        }
        setVerifyingPowerSets(true);
        verifyPowerSetsCompletedFor(exercises, sid)
          .then(setPowerSetsCompleted)
          .finally(() => setVerifyingPowerSets(false));
        refreshLoadRecords(sid);
        if (preserveIndex !== undefined) setCurrentExerciseIndex(preserveIndex);
      } catch {
      } finally {
        setDataLoading(false);
      }
    },
    [],
  );

  const currentSection = sections[currentSectionIndex];
  const currentExercise = sectionExercises[currentExerciseIndex];

  useEffect(() => {
    if (!currentSection) return;
    console.log(`[athena] Round "${currentSection.label}" completed:`, isCurrentRoundCompleted);
  }, [currentSection, isCurrentRoundCompleted]);

  // "Power Sets (if any)" inline cards shown while a power-set exercise is
  // active — mirrors mobile's inlinePowerSets fetch/match exactly.
  const [inlinePowerSets, setInlinePowerSets] = useState<PowerSet[]>([]);
  useEffect(() => {
    const powerSetExercises = sectionExercises.filter((ex) => ex.is_power_set);
    if (powerSetExercises.length === 0 || !workoutCode) {
      setInlinePowerSets([]);
      return;
    }
    getProgramPowerSets(workoutCode, sessionId || undefined)
      .then((allPowerSets) => {
        const matched = (allPowerSets || []).filter((ps) =>
          powerSetExercises.some(
            (ex) => ps.id === ex.id || (ps as unknown as { exercise_uuid?: string }).exercise_uuid === ex.exercise_id,
          ),
        );
        setInlinePowerSets(matched.length > 0 ? matched : allPowerSets || []);
      })
      .catch(() => setInlinePowerSets([]));
  }, [sectionExercises, workoutCode, sessionId]);

  // Sum of this round's exercises — mirrors mobile's currentRoundStats
  const currentRoundStats = useMemo(() => {
    return sectionExercises.reduce(
      (acc, ex) => {
        const { load, power, kcal } = computeExerciseLoad(
          ex as SectionExercise & Record<string, unknown>,
          userOtherDetail,
          currentSection?.rounds,
        );
        return { load: acc.load + load, power: acc.power + power, kcal: acc.kcal + kcal };
      },
      { load: 0, power: 0, kcal: 0 },
    );
  }, [sectionExercises, userOtherDetail, currentSection]);

  // Cumulative stats carried forward from the nearest previously-completed
  // round — mirrors mobile's previousRoundStats.
  const previousRoundStats = useMemo(() => {
    for (let i = currentSectionIndex - 1; i >= 0; i--) {
      const label = sections[i]?.label;
      const match = loadRecords.find(
        (r) =>
          (r.workout_complete === true || (r as unknown as { workoutComplete?: boolean }).workoutComplete === true) &&
          r.title === label,
      );
      if (match) {
        return { load: match.load || 0, power: match.power || 0, kcal: match.kcal || 0 };
      }
    }
    return { load: 0, power: 0, kcal: 0 };
  }, [sections, currentSectionIndex, loadRecords]);

  // The saved record for the CURRENT round specifically (whether or not it's
  // complete) — mirrors mobile's currentSavedStats.
  const currentSavedStats = useMemo(() => {
    if (!currentSection) return null;
    const label = currentSection.label;
    const match = loadRecords.find((r) => r.title === label);
    if (match) return { load: match.load || 0, power: match.power || 0, kcal: match.kcal || 0 };
    return null;
  }, [currentSection, loadRecords]);

  // What the "This Workout" tiles actually show — mirrors mobile's
  // displayStats exactly: once the current round is saved/completed, show
  // its own (already-cumulative) record; otherwise show the nearest
  // previously-completed round's cumulative record. Each saved record is
  // already a running total (see loadToSave below), so summing every record
  // together (the old workoutLoads/getWorkoutLoads approach) double-counted
  // as soon as more than one round was completed.
  const displayStats = useMemo(() => {
    if (isCurrentRoundCompleted && currentSavedStats) return currentSavedStats;
    return previousRoundStats;
  }, [isCurrentRoundCompleted, currentSavedStats, previousRoundStats]);

  const handleToggleRoundComplete = async (checked: boolean) => {
    if (checked && !powerSetsCompleted) {
      setShowMoneySetModal(true);
      return;
    }
    if (!sessionId || !currentSection) return;

    setIsCountingRoundStats(true);
    try {
      const loadToSave = checked ? previousRoundStats.load + currentRoundStats.load : undefined;
      const powerToSave = checked ? previousRoundStats.power + currentRoundStats.power : undefined;
      const kcalToSave = checked ? previousRoundStats.kcal + currentRoundStats.kcal : undefined;

      await createWorkoutLoad({
        sessionId,
        workoutId: sectionExercises[0]?.id || currentSection.label,
        title: currentSection.label,
        workoutComplete: checked,
        program: workoutCode?.toUpperCase(),
        load: loadToSave,
        power: powerToSave,
        kcal: kcalToSave,
      });
      setIsCurrentRoundCompleted(checked);
      await refreshLoadRecords(sessionId);
    } catch {
    } finally {
      setIsCountingRoundStats(false);
    }
  };

  // Auto-complete the round the moment its money sets become fully recorded
  // (e.g. returning from the $-set page) — mirrors mobile's effect keyed off
  // powerSetsCompleted.
  useEffect(() => {
    const hasPowerSets = sectionExercises.some((ex) => ex.is_power_set);
    if (powerSetsCompleted && hasPowerSets && !isCurrentRoundCompleted && !isCountingRoundStats && sessionId) {
      handleToggleRoundComplete(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [powerSetsCompleted]);

  // Re-verify money-set completion when the tab regains focus — covers
  // navigating to /workout/dollarSet and back via full page navigation.
  useEffect(() => {
    const onFocus = () => {
      if (!sessionId) return;
      setVerifyingPowerSets(true);
      verifyPowerSetsCompletedFor(sectionExercises, sessionId)
        .then(setPowerSetsCompleted)
        .finally(() => setVerifyingPowerSets(false));
      refreshLoadRecords(sessionId);
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [sectionExercises, sessionId]);

  // Matches mobile's cardRepsTextNew formatting exactly: "{rounds}x {reps}"
  // (e.g. "3x 8-12"), not reps alone.
  const roundsForSidebar = currentSection?.rounds || "1";
  const roundsFormattedForSidebar = String(roundsForSidebar).toLowerCase().includes("x")
    ? String(roundsForSidebar).toLowerCase()
    : `${roundsForSidebar}x`;
  const exercisesForSidebar = sectionExercises.map((ex, i) => ({
    id: i + 1,
    title: ex.exercise_name || ex.title,
    subtitle: `${roundsFormattedForSidebar} ${ex.reps || "8-12"}`,
    supplemental: ex.supplemental,
    weightDisplay: getExerciseWeightToDisplay(ex, userOtherDetail),
    isCurrent: i === currentExerciseIndex,
    gifUrl: resolveMediaUrl(ex.demo_gif || ex.demoGif),
    isPowerSet: ex.is_power_set,
    isSwapped: ex.swapped || !!ex.original_demo_gif,
  }));

  const addNewSet = () => {
    const newId = velocitySets.length + 1;
    setVelocitySets([
      ...velocitySets,
      { id: newId, weight: 0, reps: "", maxV: 0, unit: "m/s" },
    ]);
  };

  // Fetch user detail once on mount for weight calculations
  useEffect(() => {
    dashboardApi.getDashboardData()
      .then((res) => setUserOtherDetail(res.user.OtherDetail))
      .catch(() => {});

    feedApi
      .getAdvertisements("Workout Banner")
      .then((all) => {
        const shuffled = [...all].sort(() => Math.random() - 0.5).slice(0, 4);
        setAds(shuffled);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (ads.length === 0) return;
    const timer = setInterval(() => setAdIndex((i) => (i + 1) % ads.length), 4500);
    return () => clearInterval(timer);
  }, [ads]);

  // Sidebar tab navigation — mirrors mobile's WorkoutTabNavigator, where
  // Overview/Session/Results/Powersets/Map are all tabs within one screen.
  // Web splits "Session" (this active-workout page) out into its own route,
  // while the other four are tabs inside viewWorkoutSession/page.tsx;
  // router.push is a client-side transition in the Next.js App Router (no
  // full page reload), so this is the closest equivalent without merging
  // the two pages into one. Uses the same one-shot "still engaged" signal
  // as "Return to Workout" — without it, viewWorkoutSession's mount effect
  // shows the rejoin banner instead of the requested tab.
  const navigateToTab = (label: string) => {
    setSidebarActiveView(label);
    localStorage.setItem("returningFromAthenaWorkout", "true");
    // Lateral tab-switch, not a forward "drill in" — replace so bouncing
    // between sidebar tabs doesn't stack up browser history entries that
    // turn the back button into a loop through both pages.
    if (label === "Session") {
      router.replace("/workout/viewWorkoutSession?openSession=true");
      return;
    }
    router.replace(`/workout/viewWorkoutSession?view=${encodeURIComponent(label)}`);
  };

  const openTracking = async (ex: SectionExercise) => {
    setTrackingExercise(ex);
    setTrackingSets([{ weight: "", reps: "", saved: false }]);
    setLastRecord(null);
    setBestRecord(null);
    if (!ex.exercise_id) return;
    setLogsLoading(true);
    try {
      const allLogs = await getTrackingLogs({ exercise_id: ex.exercise_id });
      if (allLogs.length > 0) {
        setLastRecord({ weight: allLogs[0].weight, reps: allLogs[0].repetitions });
        const best = allLogs.reduce((b, r) => r.weight > b.weight ? r : b, allLogs[0]);
        setBestRecord({ weight: best.weight, reps: best.repetitions });
      }
      if (sessionId) {
        const sessionLogs = await getTrackingLogs({ sessionId, exercise_id: ex.exercise_id });
        if (sessionLogs.length > 0) {
          const sorted = [...sessionLogs].sort((a, b) => {
            const numA = parseInt(a.title?.replace(/\D/g, "") || "0");
            const numB = parseInt(b.title?.replace(/\D/g, "") || "0");
            return numA - numB;
          });
          setTrackingSets(sorted.map((log) => ({
            weight: String(log.weight ?? ""),
            reps: String(log.repetitions ?? ""),
            saved: log.status === true,
            load: log.load,
          })));
        }
      }
    } catch {
    } finally {
      setLogsLoading(false);
    }
  };

  const addTrackingSet = () =>
    setTrackingSets((prev) => [...prev, { weight: prev[prev.length - 1]?.weight || "", reps: "", saved: false }]);

  const updateTrackingSet = (i: number, field: "weight" | "reps", val: string) =>
    setTrackingSets((prev) => prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s));

  const openLocationPopup = async () => {
    setShowLocationPopup(true);
    setTempSelectedLocationId(locationId);
    setSetAsDefaultLocation(false);
    if (locations.length === 0) {
      setLocationsLoading(true);
      try {
        const locs = await equipmentApi.getLocationList();
        setLocations(locs);
        // Fetch equipment details for all locations in parallel
        const details = await Promise.allSettled(
          locs.map((loc) => equipmentApi.getLocationDetail(loc.id))
        );
        const eqMap = new Map<number, string[]>();
        details.forEach((result, i) => {
          if (result.status === "fulfilled") {
            eqMap.set(locs[i].id, (result.value.equipmentList || []).map((e) => e.name));
          } else {
            eqMap.set(locs[i].id, (locs[i].equipmentList || []).map((e) => e.name));
          }
        });
        setLocationEquipments(eqMap);
      } catch {
      } finally {
        setLocationsLoading(false);
      }
    }
  };

  const openCreateLocationPopup = async () => {
    setShowLocationPopup(false);
    setShowCreateLocationPopup(true);
    setEditingLocationId(null);
    setCreateTitle("");
    setCreateSelectedIds(new Set());
    setCreateSearch("");
    setCreateSetAsDefault(false);
    if (allEquipment.length === 0) {
      setAllEquipLoading(true);
      try {
        const eq = await equipmentApi.getAllEquipment();
        setAllEquipment(eq);
      } catch {
      } finally {
        setAllEquipLoading(false);
      }
    }
  };

  // Mirrors mobile's onEditLocation — reuses the same create-location screen
  // pre-filled with the location's existing name/equipment, in edit mode.
  const openEditLocationPopup = async (loc: LocationItem) => {
    setShowLocationPopup(false);
    setShowCreateLocationPopup(true);
    setEditingLocationId(loc.id);
    setCreateTitle(loc.name);
    setCreateSearch("");
    setCreateSelectedIds(new Set((loc.equipmentList || []).map((e) => e.id)));
    setCreateSetAsDefault(loc.default_location === "1" || Number(loc.default_location) === 1);
    if (allEquipment.length === 0) {
      setAllEquipLoading(true);
      try {
        const eq = await equipmentApi.getAllEquipment();
        setAllEquipment(eq);
      } catch {
      } finally {
        setAllEquipLoading(false);
      }
    }
    // Refresh from the full location detail in case the list's cached
    // equipmentList is stale/partial.
    setEditingLocationLoading(true);
    try {
      const detail = await equipmentApi.getLocationDetail(loc.id);
      setCreateSelectedIds(new Set((detail.equipmentList || []).map((e) => e.id)));
    } catch {
    } finally {
      setEditingLocationLoading(false);
    }
  };

  const handleCreateLocation = async () => {
    if (!createTitle.trim()) return;
    setCreateSubmitting(true);
    try {
      let savedLocationId: number | null = null;
      if (editingLocationId != null) {
        await equipmentApi.updateLocation({
          id: editingLocationId,
          location_name: createTitle.trim(),
          equipments: Array.from(createSelectedIds).join(","),
        });
        savedLocationId = editingLocationId;
        // If the edited location is the one currently in use, refresh its
        // displayed name too.
        if (String(editingLocationId) === locationId) {
          setLocationName(createTitle.trim());
          localStorage.setItem("workoutLocationName", createTitle.trim());
        }
      } else {
        const data = await equipmentApi.createLocation({
          location_name: createTitle.trim(),
          equipments: Array.from(createSelectedIds).join(","),
        });
        savedLocationId = data.id;
        // Auto-select newly created location
        setLocationName(createTitle.trim());
        setLocationId(String(data.id));
        localStorage.setItem("workoutLocationName", createTitle.trim());
        localStorage.setItem("workoutLocationId", String(data.id));
      }

      // Mirrors mobile's CreateLocationScreen: applies to both create and
      // edit, fires after the location itself is saved.
      if (createSetAsDefault && savedLocationId != null) {
        await equipmentApi.selectDefaultLocation(savedLocationId).catch(() => {});
      }

      // Reset location list cache so it refreshes next time
      setLocations([]);
      setLocationEquipments(new Map());
      setShowCreateLocationPopup(false);
      setEditingLocationId(null);
    } catch {
    } finally {
      setCreateSubmitting(false);
    }
  };

  // Mirrors mobile's WorkoutSessionScreen.handleSelectLocation: persist the
  // location on the session server-side, then re-fetch the current section
  // so its exercises come back already substituted for the new location's
  // equipment — not a per-exercise swapExercise loop (that's the unrelated
  // manual single-exercise-swap feature, same mistake fixed in
  // viewWorkoutSession's handleLocationFilter). loc === null clears the
  // session's location (mobile's "None (No Location)" option).
  const handleLocationSelect = async (loc: LocationItem | null) => {
    setShowLocationPopup(false);
    const newLocName = loc ? loc.name : "No Location";
    const newLocId = loc ? String(loc.id) : "";
    setLocationName(newLocName);
    setLocationId(loc ? newLocId : null);
    if (loc) {
      localStorage.setItem("workoutLocationName", newLocName);
      localStorage.setItem("workoutLocationId", newLocId);
    } else {
      localStorage.removeItem("workoutLocationName");
      localStorage.removeItem("workoutLocationId");
    }

    if (!sessionId || !workoutCode || !currentSection) return;
    setSwappingLocation(true);
    try {
      await updateSessionLocation(sessionId, newLocId);
      const sectionRes = await getWorkoutSectionFull({
        sessionId,
        programCode: workoutCode,
        section: currentSection.label,
      });
      setSectionExercises(sortByOrder(sectionRes.exercises || sectionRes.workouts || []));
      if (sectionRes.locationName) {
        setLocationName(sectionRes.locationName);
        localStorage.setItem("workoutLocationName", sectionRes.locationName);
      }
    } catch {
    } finally {
      setSwappingLocation(false);
    }
  };

  // Confirm button in the location modal — mirrors mobile's handleConfirm:
  // persists "set as default" first (if checked), then commits the staged
  // selection via handleLocationSelect.
  const handleConfirmLocationSelect = async () => {
    const loc = tempSelectedLocationId != null
      ? locations.find((l) => String(l.id) === tempSelectedLocationId) ?? null
      : null;
    setConfirmingLocation(true);
    try {
      if (loc && setAsDefaultLocation) {
        await equipmentApi.selectDefaultLocation(loc.id).catch(() => {});
      }
      await handleLocationSelect(loc);
    } finally {
      setConfirmingLocation(false);
    }
  };

  return (
    // Changed h-screen to min-h-screen for mobile safety, but kept h-screen for desktop
    <div className="h-screen bg-[#fcfdfe] flex flex-row font-sans overflow-hidden">

      {/* Shared sidebar (also used by viewWorkoutSession's SessionViewsPanel)
          — collapsible here since this is the in-workout play screen; the
          bottom CTA always says "Overview" since that's the "go back"
          action from inside an active workout. */}
      <WorkoutSidebar
        collapsible
        title={workoutCode || "WORKOUT"}
        subtitle="Active Session"
        progressPercent={sections.length > 0 ? Math.round((currentSectionIndex / sections.length) * 100) : 0}
        activeView={sidebarActiveView}
        onNavClick={navigateToTab}
        bottomLabel="Overview"
        onBottomClick={() => navigateToTab("Overview")}
        BottomIcon={Home}
      />

      {/* MAIN COLUMN — headers + content + footer */}
      <div className="flex-1 flex flex-col overflow-hidden">

      {/* Scrolls as one column on mobile (header scrolls away with content);
          on desktop (lg:) this is a no-op wrapper — overflow-hidden here plus
          SECTION 2's own overflow-hidden reproduce the original fixed two-pane layout.
          pb-16 keeps content clear of the fixed timer bar below (lg: it's static, no offset needed). */}
      <div className="flex-1 flex flex-col overflow-y-auto lg:overflow-hidden pb-16 lg:pb-0">

      {/* SECTION 1: Fixed Headers */}
      <div className="flex flex-col shrink-0">
        <header className="bg-[#6202AC] text-white py-2 px-4 flex items-center justify-between">
          <button
            onClick={() => {
              // One-shot signal, consumed immediately on the next mount —
              // mirrors mobile's onGoBack, which explicitly re-passes
              // currentSessionId (not null) to setPlayMode, keeping
              // activeSession/isSessionActivated intact since it never
              // actually leaves the mounted screen. Web can't avoid a real
              // unmount crossing this route boundary, so this signals
              // "still engaged" for the very next viewWorkoutSession mount,
              // as opposed to genuinely backing out of the workout entirely.
              // Navigates to an explicit route rather than router.back() —
              // browser history can land elsewhere (e.g. /workout/detail)
              // depending on how this screen was reached.
              localStorage.setItem("returningFromAthenaWorkout", "true");
              router.replace("/workout/viewWorkoutSession");
            }}
            className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider hover:opacity-80 transition"
          >
            <ChevronLeft size={16} strokeWidth={3} />
            <span className="hidden sm:inline">Return to Workout</span>
            <span className="inline sm:hidden">Back</span>
          </button>

          {/* Compact location badge — matches mobile's locationBadgeGreen
              exactly (small icon + text, no banner), replacing the old
              "Exercises customized to your location" banner mobile doesn't have. */}
          <button
            onClick={openLocationPopup}
            className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 hover:opacity-80 transition"
          >
            <MapPin size={14} />
            {swappingLocation ? (
              <span>Updating...</span>
            ) : (
              <span>
                Location: <span className="font-bold">{locationName || "No Location"}</span>
              </span>
            )}
          </button>

          <div className="flex items-center gap-3">
            <button className="p-1 hover:opacity-80">
              <User size={18} />
            </button>
            <button className="p-1 hover:opacity-80">
              <NotepadText size={18} />
            </button>
            <button className="p-1 hover:opacity-80">
              <Settings size={18} />
            </button>
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-[11px] font-bold border border-white/30">
              AM
            </div>
            <button className="p-1 hover:opacity-80" onClick={() => setShowShareModal(true)}>
              <Share2 size={18} />
            </button>
          </div>
        </header>

        <div className="bg-white border-b border-gray-100 px-4 py-2 flex items-center justify-between gap-3">
          <div className="shrink-0">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-700" />
              <h2 className="font-bold text-sm md:text-base tracking-tight">
                {dataLoading && !currentSection ? (
                  <Loader2 size={14} className="animate-spin inline mr-1" />
                ) : null}
                {currentSection
                  ? `${currentSection.label} ${currentSection.rounds || ""}`
                  : "Loading..."}
              </h2>
            </div>
            <p className="text-gray-500 text-[10px] md:text-[11px] mt-0.5">
              Complete the following sets in order
            </p>
          </div>

          {/* Sponsored ad banner — mirrors mobile's BannerFittedSlider,
              shrunk to a compact inline banner beside the round title. */}
          {ads.length > 0 && (
            <button
              onClick={() => setSelectedAd(ads[adIndex])}
              className="hidden sm:block relative flex-1 h-10 rounded-xl overflow-hidden"
            >
              <img
                src={ads[adIndex].image}
                alt="ad"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20" />
              <span className="absolute top-1 left-1.5 bg-black/55 text-white text-[7px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-widest">
                Ad
              </span>
              {ads.length > 1 && (
                <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-0.5">
                  {ads.map((_, i) => (
                    <div
                      key={i}
                      className={`h-0.5 rounded-full transition-all ${i === adIndex ? "bg-white w-2" : "bg-white/50 w-0.5"}`}
                    />
                  ))}
                </div>
              )}
            </button>
          )}
        </div>

        {/* This Workout stats — mobile only, sits directly below the round
            location row (aside's copy is hidden on mobile so it isn't shown twice) */}
        <div className="lg:hidden px-4 pt-2 pb-2 bg-white border-b border-gray-100">
          <button
            onClick={() => {
              localStorage.setItem("returningFromAthenaWorkout", "true");
              router.replace("/workout/viewWorkoutSession?view=Results");
            }}
            className="w-full text-left"
          >
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1.5">This Workout</p>
            <div className="grid grid-cols-3 gap-1">
              {[
                { label: "Load", value: displayStats.load },
                { label: "Power", value: displayStats.power },
                { label: "Kcal", value: displayStats.kcal },
              ].map((stat) => (
                <div key={stat.label} className="bg-[#f8f5ff] rounded-lg p-1.5 text-center border border-[#ede9fe]">
                  <p className="text-[13px] font-black text-[#6202AC] leading-none">{stat.value}</p>
                  <p className="text-[7px] font-bold text-gray-400 mt-0.5 uppercase tracking-wide">{stat.label}</p>
                </div>
              ))}
            </div>
          </button>
        </div>
      </div>

      {/* SECTION 2: Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row lg:overflow-hidden">
        {/* Left: Main Exercise */}
        <div className="w-full lg:w-[58%] lg:overflow-hidden p-3 md:p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            {/* Title + Star */}
            <div className="flex items-center gap-2">
              <Star size={18} className="text-yellow-500" />

              <h1 className="text-lg md:text-xl font-black tracking-tighter uppercase truncate mr-2">
                {currentExercise?.exercise_name || currentExercise?.title || (dataLoading ? "Loading..." : "—")}
              </h1>
            </div>

            {/* 1/N counter */}
            <span className="text-sm font-bold text-gray-600 shrink-0">
              {sectionExercises.length > 0 ? `${currentExerciseIndex + 1}/${sectionExercises.length}` : "—"}
            </span>
          </div>

          {/* Adjusted aspect ratio for mobile vs desktop */}
          <div className="relative h-64 lg:h-auto lg:flex-1 lg:min-h-0 rounded-md flex items-center justify-center overflow-hidden">
            {resolveMediaUrl(currentExercise?.demo_gif || currentExercise?.demoGif) ? (
              <img
                src={resolveMediaUrl(currentExercise.demo_gif || currentExercise.demoGif)!}
                alt={currentExercise.exercise_name}
                className="w-full h-full object-contain"
              />
            ) : (
              <>
                <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                  <div className="w-5 h-5 bg-white rounded-full" />
                </div>
                {!dataLoading && (
                  <p className="absolute bottom-1.5 text-[7px] font-black text-gray-400 tracking-wider uppercase">
                    No preview available
                  </p>
                )}
              </>
            )}
            {dataLoading && (
              <div className="absolute inset-0 bg-[#e4ebf3]/80 flex items-center justify-center">
                <Loader2 size={24} className="animate-spin text-gray-400" />
              </div>
            )}

            <button
              onClick={() => setCurrentExerciseIndex((i) => Math.max(0, i - 1))}
              disabled={currentExerciseIndex === 0}
              className="absolute left-1.5 top-1/2 -translate-y-1/2 bg-white/90 p-0.5 rounded-full shadow-sm hover:bg-white transition disabled:opacity-30"
            >
              <ChevronLeft size={25} />
            </button>
            <button
              onClick={() => setCurrentExerciseIndex((i) => Math.min(sectionExercises.length - 1, i + 1))}
              disabled={currentExerciseIndex >= sectionExercises.length - 1}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-white/90 p-0.5 rounded-full shadow-sm hover:bg-white transition disabled:opacity-30"
            >
              <ChevronRight size={25} />
            </button>

            {/* Top-right: swap thumbnail — always visible, click to open swap modal */}
            {currentExercise && (
              <button
                onClick={() => setShowSwapModal(true)}
                disabled={isCurrentRoundCompleted}
                className="absolute top-2 right-2 w-14 h-14 bg-white rounded-2xl shadow-md flex items-center justify-center overflow-hidden border border-gray-100 hover:scale-105 transition-transform disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {(() => {
                  const thumbnailGif =
                    resolveMediaUrl(currentExercise.original_demo_gif) ||
                    resolveMediaUrl(currentExercise.demo_gif || currentExercise.demoGif);
                  return thumbnailGif ? (
                    <img src={thumbnailGif} alt="swap" className="w-full h-full object-contain" />
                  ) : null;
                })()}
              </button>
            )}

            {/* Bottom-left icons - scaled for mobile */}
            <div className="absolute bottom-2 left-2 flex items-center gap-2 md:gap-3">
              <NotepadText
                size={32}
                className="text-white bg-gradient-to-br from-orange-400 to-orange-600 p-2 md:p-3 md:w-10 md:h-10 rounded-full shadow-xl hover:scale-110 transition-transform cursor-pointer"
                onClick={() => setIsNotePopupOpen(true)}
              />
              <BarChart3
                size={32}
                onClick={() => setIsVelocityPopupOpen(true)}
                className="text-white bg-gradient-to-br from-blue-400 to-blue-600 p-2 md:p-3 md:w-10 md:h-10 rounded-full shadow-xl hover:scale-110 transition-transform"
              />

              {isVelocityPopupOpen && (
                <div
                  className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4"
                  onClick={() => setIsVelocityPopupOpen(false)}
                >
                  <div
                    className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Header */}
                    <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-[#6202AC] rounded-lg shadow-sm">
                          <BarChart3 size={18} className="text-white" />
                        </div>
                        <h2 className="text-lg font-black tracking-tight text-[#6202AC]">
                          Load Velocity
                        </h2>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-gray-700">
                          {currentExercise?.exercise_name || "—"}
                        </p>
                        <button
                          onClick={() => setIsVelocityPopupOpen(false)}
                          className="p-1 hover:bg-gray-100 rounded-full transition"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      {/* Black placeholder image */}
                      <div className="flex flex-col items-center mb-4">
                        <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center shadow">
                          <div className="w-6 h-6 bg-white rounded-full" />
                        </div>
                        <p className="mt-2 text-[10px] font-semibold text-gray-500 text-center">
                          Plug your velocity results to save and compare data.
                        </p>
                      </div>

                      {/* Last / Best chips */}
                      <div className="flex items-center gap-2 mb-4">
                        <span className="flex items-center gap-1 text-[11px] font-bold text-red-500 underline border border-red-200 bg-red-50 px-2.5 py-1 rounded-full">
                          <TrendingUp size={11} />
                          Last
                        </span>
                        <span className="flex items-center gap-1 text-[11px] font-bold text-green-600 underline border border-green-200 bg-green-50 px-2.5 py-1 rounded-full">
                          <TrendingUp size={11} />
                          Best
                        </span>
                      </div>

                      {/* Sets */}
                      {velocitySets.map((set, idx) => (
                        <div
                          key={set.id}
                          className="mb-6 border border-gray-200 rounded-xl p-4 bg-gray-50/30"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-sm text-gray-700">
                                Set {idx + 1}
                              </h3>
                            </div>
                            {/* Remove button — hidden for first set */}
                            {idx !== 0 && (
                              <button
                                onClick={() => {
                                  const newSets = velocitySets.filter(
                                    (_, i) => i !== idx,
                                  );
                                  setVelocitySets(newSets);
                                }}
                                className="p-1 hover:bg-red-100 rounded-full transition"
                              >
                                <X size={16} className="text-red-500" />
                              </button>
                            )}
                          </div>

                          {/* Horizontal layout */}
                          <div className="grid grid-cols-4 gap-3 text-sm">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs font-semibold text-gray-500">Weight (lbs)</span>
                              <input
                                type="number"
                                value={set.weight}
                                className="w-full px-2 py-1 border border-gray-300 rounded-lg text-xs text-right focus:outline-none focus:ring-1 focus:ring-purple-500"
                                onChange={(e) => {
                                  const newSets = [...velocitySets];
                                  newSets[idx].weight = parseInt(e.target.value) || 0;
                                  setVelocitySets(newSets);
                                }}
                              />
                            </div>

                            <div className="flex flex-col gap-1">
                              <span className="text-xs font-semibold text-gray-500">Reps</span>
                              <input
                                type="text"
                                value={set.reps}
                                className="w-full px-2 py-1 border border-gray-300 rounded-lg text-xs text-right focus:outline-none focus:ring-1 focus:ring-purple-500"
                                onChange={(e) => {
                                  const newSets = [...velocitySets];
                                  newSets[idx].reps = e.target.value;
                                  setVelocitySets(newSets);
                                }}
                              />
                            </div>

                            <div className="flex flex-col gap-1">
                              <span className="text-xs font-semibold text-gray-500">Max V.</span>
                              <input
                                type="number"
                                step="0.01"
                                value={set.maxV}
                                className="w-full px-2 py-1 border border-gray-300 rounded-lg text-xs text-right focus:outline-none focus:ring-1 focus:ring-purple-500"
                                onChange={(e) => {
                                  const newSets = [...velocitySets];
                                  newSets[idx].maxV = parseFloat(e.target.value) || 0;
                                  setVelocitySets(newSets);
                                }}
                              />
                            </div>

                            <div className="flex flex-col gap-1">
                              <span className="text-xs font-semibold text-gray-500">Unit</span>
                              <select
                                value={set.unit}
                                className="w-full px-2 py-1 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                                onChange={(e) => {
                                  const newSets = [...velocitySets];
                                  newSets[idx].unit = e.target.value;
                                  setVelocitySets(newSets);
                                }}
                              >
                                <option>m/s</option>
                                <option>ft/s</option>
                                <option>km/h</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Add Another Set Button */}
                      <button
                        onClick={addNewSet}
                        className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-purple-300 rounded-xl text-purple-600 font-semibold text-sm hover:bg-purple-50 transition mb-5"
                      >
                        <Plus size={18} />
                        Add Another Set
                      </button>

                      {/* Save Button */}
                      <button
                        onClick={() => {
                          setIsVelocityPopupOpen(false);
                        }}
                        className="w-full bg-[#6202AC] text-white font-bold py-3 rounded-xl hover:bg-[#4d0187] transition flex items-center justify-center gap-2"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {isNotePopupOpen && (
                <div
                  className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4"
                  onClick={() => setIsNotePopupOpen(false)}
                >
                  <div
                    className="bg-white rounded-2xl w-full max-w-[500px] shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Header */}
                    <div className="p-6 pb-2">
                      <h2 className="text-xl font-black tracking-tight text-gray-900">
                        Add a Note
                      </h2>
                    </div>

                    {/* Description */}
                    <div className="px-6 pb-4">
                      <p className="text-sm text-gray-500 leading-relaxed">
                        Create a note to this exercise or this round of
                        exercises to share with your followers or your coach.
                        You can edit or remove these notes before completing
                        your workout from the workout review page.
                      </p>
                    </div>

                    {/* Textarea */}
                    <div className="px-6 pb-4">
                      <textarea
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="Add your message here..."
                        className="w-full h-32 px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      />
                    </div>

                    {/* Checkbox */}
                    <div className="px-6 pb-6">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={shareWithCoach}
                          onChange={(e) => setShareWithCoach(e.target.checked)}
                          className="w-4 h-4 accent-[#6202AC] rounded"
                        />
                        <span className="text-sm text-gray-700">
                          Share this note with your coach
                        </span>
                      </label>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-200"></div>

                    {/* Add to Workout Button */}
                    <div className="p-6">
                      <button
                        onClick={() => {
                          setIsNotePopupOpen(false);
                          setNoteText("");
                          setShareWithCoach(false);
                        }}
                        className="w-full bg-[#6202AC] text-white font-bold py-3 rounded-xl hover:bg-[#4d0187] transition text-sm"
                      >
                        Add to Workout
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Bar - wrapping for small screens */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 pb-1">
            <div className="flex-1 bg-white rounded-lg p-2.5 border border-gray-100 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={isCurrentRoundCompleted}
                      disabled={isCurrentRoundCompleted || isCountingRoundStats || verifyingPowerSets}
                      className="w-3.5 h-3.5 accent-[#6202AC] rounded disabled:opacity-60"
                      onChange={(e) => handleToggleRoundComplete(e.target.checked)}
                    />
                    <p className="text-[9px] font-bold text-gray-400">
                      {isCountingRoundStats ? "Saving..." : verifyingPowerSets ? "Checking $ sets..." : "Check when completed"}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-purple-600">
                    What's Next?
                  </span>
                </div>

                <div className="flex items-center gap-2 md:gap-4">
                  <div className="text-center">
                    <p className="text-[9px] md:text-[10px] font-bold text-gray-400">Sets</p>
                    <span className="text-xs font-black text-gray-700">
                      {currentSection?.rounds || "1x"}
                    </span>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] md:text-[10px] font-bold text-gray-400">Reps</p>
                    <span className="text-xs font-black text-gray-700">{currentExercise?.reps || "—"}</span>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] md:text-[10px] font-bold text-gray-400">Weight</p>
                    <span className="text-xs font-black text-gray-700">
                      {getExerciseWeightToDisplay(currentExercise, userOtherDetail) || "—"}
                    </span>
                  </div>
                  {(() => {
                    const badge = getExerciseBadge(currentExercise);
                    if (!badge) return null;
                    return (
                      <div className="text-center">
                        <p className="text-[9px] md:text-[10px] font-bold text-gray-400">Target</p>
                        <span className="text-xs font-black text-emerald-500">
                          {getBadgeLabel(badge)}
                        </span>
                      </div>
                    );
                  })()}
                  <div className="flex items-center gap-1 md:gap-2">
                    {currentExercise?.is_power_set ? (
                      <button
                        disabled={isCurrentRoundCompleted}
                        onClick={() => currentExercise && !isCurrentRoundCompleted && openMoneySetModal(currentExercise)}
                        className={`bg-emerald-500 text-white p-1.5 md:p-2 rounded-full shadow transition ${
                          isCurrentRoundCompleted ? "opacity-40 cursor-not-allowed" : "hover:shadow-md"
                        }`}
                      >
                        <DollarSign size={14} />
                      </button>
                    ) : (
                      <button
                        onClick={() => currentExercise && openTracking(currentExercise)}
                        className="bg-gray-500 text-white p-1.5 md:p-2 rounded-full shadow hover:shadow-md transition"
                      >
                        <Pen size={14} />
                      </button>
                    )}
                    <button className="bg-gray-500 text-white p-1.5 md:p-2 rounded-full shadow hover:shadow-md transition">
                      <Info size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* $ set message + Power Sets (if any) — stacked full-width on mobile so the
                  power set cards get enough row width to sit side by side instead of stacking
                  vertically one-per-row; side by side (desktop's original layout) from sm: up */}
              {currentExercise?.is_power_set && (
                <div className="flex flex-col sm:flex-row sm:items-start gap-2.5">
                  <div className="bg-purple-50 rounded-lg px-3 py-2 flex flex-col gap-0.5 w-full sm:w-fit sm:shrink-0">
                    <p className="text-[11px] font-semibold text-purple-600">
                      complete the <span className="text-green-500 font-bold">$</span> set to continue
                    </p>
                    <p className="text-[11px] font-semibold text-green-500">
                      Complete the required set-tracking
                    </p>
                  </div>

                  {inlinePowerSets.length > 0 && (
                    <div className="w-full sm:flex-1 sm:min-w-0">
                      <p className="text-[8px] font-black text-gray-500 uppercase tracking-wide mb-1">
                        Power Sets (if any):
                      </p>
                      <div className="flex flex-wrap justify-center sm:justify-start gap-1.5 pb-1">
                        {inlinePowerSets.flatMap((ps) => {
                          const sortedSets = [...(ps.child_sets || [])].sort((a, b) => {
                            const aIsMoney = a.min_reps != null ? 1 : 0;
                            const bIsMoney = b.min_reps != null ? 1 : 0;
                            return aIsMoney - bIsMoney;
                          });
                          const targetUnit = (userOtherDetail?.measurementUnit || "lbs").toLowerCase();
                          return sortedSets.map((s, idx) => {
                            const isMoneySet = s.min_reps != null;
                            const sourceUnit = (s.msrmt || "lbs").toLowerCase();
                            let displayWeight = s.calculated_weight || 0;
                            if (sourceUnit === "lbs" && targetUnit === "kg") {
                              displayWeight = Math.round(displayWeight * 0.45359237);
                            } else if (sourceUnit === "kg" && targetUnit === "lbs") {
                              displayWeight = Math.round(displayWeight / 0.45359237);
                            }
                            return (
                              <button
                                key={`${ps.id}-${idx}`}
                                onClick={() => currentExercise && openMoneySetModal(currentExercise)}
                                className={`relative shrink-0 min-w-[62px] rounded-lg border px-2 pt-2.5 pb-1.5 text-center ${
                                  isMoneySet ? "bg-[#FEF9C3] border-[#FDE68A]" : "bg-gray-100 border-gray-200"
                                }`}
                              >
                                {isMoneySet && (
                                  <span className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full bg-emerald-500 text-white text-[8px] font-black flex items-center justify-center">
                                    $
                                  </span>
                                )}
                                <p className="text-[8px] font-bold text-gray-500 uppercase tracking-wide">Set {idx + 1}</p>
                                <p className="text-[11px] font-bold text-gray-900 mt-0.5">{displayWeight} {targetUnit}</p>
                                <p className="text-[9px] font-medium text-gray-600">{s.reps || "8-12"}</p>
                              </button>
                            );
                          });
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {currentSectionIndex >= sections.length - 1 && sections.length > 0 ? (
              <button
                onClick={() => {
                  // Mirrors mobile's handleFinalizeWorkout ->
                  // navigation.navigate('Map') — viewWorkoutSession's own
                  // Map tab is the equivalent "Workout Map" view, already
                  // self-sufficient (fetches its own data), not the separate
                  // /workout/workoutSummary page.
                  localStorage.setItem("returningFromAthenaWorkout", "true");
                  router.replace("/workout/viewWorkoutSession?view=Map");
                }}
                className="bg-[#0FCC91] hover:bg-[#0ab87e] text-white font-black uppercase tracking-widest px-6 py-3 rounded-lg text-[11px] shadow transition shrink-0"
              >
                Finalize Workout
              </button>
            ) : (
              <button
                onClick={() => {
                  const next = currentSectionIndex + 1;
                  if (next < sections.length) {
                    setCurrentSectionIndex(next);
                    loadSectionExercises(next, workoutCode, sessionId, sections);
                  }
                }}
                className="bg-[#6202AC] hover:bg-[#4d0187] text-white font-black uppercase tracking-widest px-6 py-3 rounded-lg text-[11px] shadow transition shrink-0"
              >
                {sections.length > 0 ? `ROUND ${currentSectionIndex + 1}/${sections.length}` : "ROUND 1"}
              </button>
            )}
          </div>
        </div>

        {/* Right Panel: Exercise Overview */}
        {/* Hidden on very small screens or shown as a bottom section */}
        <aside className="w-full lg:flex-1 border-t lg:border-t-0 lg:border-l border-gray-100 bg-white flex flex-col lg:overflow-hidden h-auto lg:h-full">
          <div className="flex flex-col h-auto lg:h-full">
            {/* This Workout stats — clicking navigates to Live Results,
                mirrors mobile's topStatsRowHeader -> navigation.navigate('Results').
                Hidden on mobile since it now renders above, below the round location row. */}
            <div className="hidden lg:block px-3 pt-3 pb-2 shrink-0">
              <button
                onClick={() => {
                  // Same one-shot signal as the "Return to Workout" button —
                  // without it, viewWorkoutSession's mount effect thinks the
                  // session was never joined and shows the rejoin banner
                  // instead of the Results view.
                  localStorage.setItem("returningFromAthenaWorkout", "true");
                  router.replace("/workout/viewWorkoutSession?view=Results");
                }}
                className="w-full text-left"
              >
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1.5">This Workout</p>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { label: "Load", value: displayStats.load },
                    { label: "Power", value: displayStats.power },
                    { label: "Kcal", value: displayStats.kcal },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-[#f8f5ff] rounded-lg p-1.5 text-center border border-[#ede9fe]">
                      <p className="text-[13px] font-black text-[#6202AC] leading-none">{stat.value}</p>
                      <p className="text-[7px] font-bold text-gray-400 mt-0.5 uppercase tracking-wide">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </button>

            </div>

            <div className="p-3 pb-2 shrink-0">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-sm">Exercise Overview</h3>
                <span className="text-[9px] font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
                  {sectionExercises.length > 0 ? `${currentExerciseIndex + 1}/${sectionExercises.length}` : "—"}
                </span>
              </div>
            </div>

            <div className="lg:flex-1 lg:overflow-y-auto px-3 custom-scrollbar">
              <div className="grid grid-cols-3 gap-1.5 pt-3 pb-2">
                {dataLoading && exercisesForSidebar.length === 0 ? (
                  <div className="col-span-3 flex justify-center py-6">
                    <Loader2 size={24} className="animate-spin text-gray-300" />
                  </div>
                ) : (
                  exercisesForSidebar.map((ex, idx) => (
                    <div
                      key={ex.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setCurrentExerciseIndex(idx)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") setCurrentExerciseIndex(idx);
                      }}
                      className={`rounded-lg border p-1.5 flex flex-col items-center justify-center relative transition-all h-28 md:h-32 w-full cursor-pointer ${
                        ex.isCurrent
                          ? "border-[#6202AC] bg-[#f8f5ff] shadow-sm"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <div
                        className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold border border-white shadow-sm ${
                          ex.isCurrent
                            ? "bg-[#6202AC] text-white"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {idx + 1}
                      </div>
                      {ex.isPowerSet && (
                        <button
                          disabled={isCurrentRoundCompleted}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isCurrentRoundCompleted) openMoneySetModal(sectionExercises[idx]);
                          }}
                          className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center shadow-sm transition ${
                            isCurrentRoundCompleted ? "opacity-40 cursor-not-allowed" : "hover:bg-green-600"
                          }`}
                        >
                          <DollarSign size={9} className="text-white" />
                        </button>
                      )}
                      {ex.isSwapped && (
                        <div className="absolute bottom-1 left-1 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center shadow-sm">
                          <Home size={9} className="text-white" />
                        </div>
                      )}
                      {!ex.isPowerSet && (
                        <button
                          onClick={(e) => { e.stopPropagation(); openTracking(sectionExercises[idx]); }}
                          className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-gray-400 flex items-center justify-center shadow-sm hover:bg-gray-600 transition"
                        >
                          <Pencil size={8} className="text-white" />
                        </button>
                      )}
                      {ex.gifUrl ? (
                        <div className="w-full h-16 md:h-20 mb-1 rounded-md flex items-center justify-center overflow-hidden">
                          <img
                            src={ex.gifUrl}
                            alt={ex.title}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ) : (
                        <div
                          className={`w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center mb-1 border ${
                            ex.isCurrent ? "bg-black border-black" : "bg-gray-200 border-gray-300"
                          }`}
                        >
                          <div className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full ${ex.isCurrent ? "bg-white" : "bg-gray-400"}`} />
                        </div>
                      )}
                      <div className="text-center">
                        {ex.supplemental && (
                          <p className="text-[7px] md:text-[8px] font-bold text-gray-500 uppercase line-clamp-1">
                            {ex.supplemental}
                          </p>
                        )}
                        <p className="font-bold text-[9px] md:text-[10px] leading-tight tracking-tight line-clamp-1">
                          {ex.title}
                        </p>
                        <p className="text-[8px] md:text-[9px] mt-0.5 font-medium text-gray-400">
                          {ex.subtitle}
                        </p>
                        {ex.weightDisplay && (
                          <p className="text-[8px] md:text-[9px] font-bold text-red-500 mt-0.5">
                            @ {ex.weightDisplay}
                          </p>
                        )}
                        {ex.isPowerSet && (() => {
                          const badge = getExerciseBadge(sectionExercises[idx]);
                          if (!badge) return null;
                          return (
                            <p className="text-[8px] md:text-[9px] font-black text-emerald-500 mt-0.5">
                              {getBadgeLabel(badge)}
                            </p>
                          );
                        })()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>{/* end SECTION 2 */}

      </div>{/* end mobile-scroll wrapper */}

      {/* SECTION 3: Sticky Timer Bar — truly fixed to the viewport bottom on
          mobile so it can't drift as the browser address bar shows/hides
          during scroll; desktop keeps it as a normal flex-flow footer. */}
      <footer className="fixed inset-x-0 bottom-0 lg:static lg:inset-auto shrink-0 bg-white border-t border-gray-200 shadow-[0_-1px_6px_rgba(0,0,0,0.04)] z-50">
        <div className="max-w-[1440px] mx-auto px-2 py-1.5 flex items-center gap-2">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 transition shrink-0"
          >
            {isRunning ? (
              <Pause size={14} fill="#1a1c1e" />
            ) : (
              <Play size={14} fill="#1a1c1e" className="ml-0.5" />
            )}
          </button>

          <div className="flex-1 relative h-7 md:h-8 bg-gray-100 rounded-md overflow-hidden border border-gray-200">
            <div
              className={`absolute top-0 left-0 h-full transition-all duration-1000 ${
                timerPhase === "setup"
                  ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                  : "bg-gradient-to-r from-orange-500 to-red-500"
              }`}
              style={{
                width: `${(1 - timeRemaining / (timerPhase === "setup" ? SETUP_DURATION : WORK_DURATION)) * 100}%`,
              }}
            />
            <div className="absolute inset-0 flex items-center px-2 justify-between text-[11px] font-bold z-10">
              <div className="flex items-center gap-1">
                <Clock size={12} className="text-gray-500" />
                <span className="tabular-nums text-xs md:text-sm">{formatTime(timeRemaining)}</span>
                <span className={`text-[7px] hidden sm:inline font-black tracking-widest ml-1 uppercase ${
                  !isRunning ? "text-gray-400" : timerPhase === "setup" ? "text-yellow-600" : "text-emerald-600"
                }`}>
                  {!isRunning ? "PAUSED" : timerPhase === "setup" ? "SETUP" : "ACTIVE"}
                </span>
              </div>
              {timerPhase === "setup" && (
                <button
                  onClick={handleSkip}
                  disabled={sectionExercises.length === 0}
                  className="text-purple-600 font-black text-[9px] tracking-widest hover:underline uppercase disabled:opacity-30"
                >
                  Skip
                </button>
              )}
            </div>
          </div>

          <button
            onClick={handleSkip}
            disabled={sectionExercises.length === 0}
            className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center text-gray-400 hover:text-purple-600 transition shrink-0 disabled:opacity-30"
          >
            <SkipForward size={16} />
          </button>
        </div>
      </footer>

      {/* LOCATION PICKER POPUP */}
      {showLocationPopup && (
        <div
          className="fixed inset-0 z-[400] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setShowLocationPopup(false)}
        >
          <div
            className="bg-white w-full sm:max-w-[460px] rounded-t-[28px] sm:rounded-[28px] shadow-2xl overflow-hidden max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-[#7c3aed]" />
                <h2 className="text-[15px] font-black text-gray-900">Choose Location</h2>
              </div>
              <button
                onClick={() => setShowLocationPopup(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
              >
                <X size={14} />
              </button>
            </div>

            <div className="px-5 pt-4 pb-2 flex-shrink-0">
              <button
                onClick={openCreateLocationPopup}
                className="w-full flex items-center justify-center gap-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold text-sm py-3 rounded-2xl transition-all"
              >
                <Plus size={16} />
                Create Location
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-3">
              {locationsLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="animate-spin text-[#7c3aed]" size={24} />
                </div>
              ) : (
                <div className="space-y-2">
                  {/* "None (No Location)" — mirrors mobile's LocationBottomSheet */}
                  <button
                    onClick={() => setTempSelectedLocationId(null)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all text-left ${
                      tempSelectedLocationId === null
                        ? "bg-purple-50 border-[#7c3aed]"
                        : "bg-gray-50 border-gray-100 hover:border-[#7c3aed]/40 hover:bg-purple-50/40"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${tempSelectedLocationId === null ? "bg-[#7c3aed] text-white" : "bg-gray-200 text-gray-500"}`}>
                      <MapPin size={14} />
                    </div>
                    <span className={`font-semibold text-sm ${tempSelectedLocationId === null ? "text-[#7c3aed]" : "text-gray-800"}`}>
                      None (No Location)
                    </span>
                  </button>

                  {locations.length === 0 ? (
                    <p className="text-center text-sm text-gray-400 py-6">No locations found</p>
                  ) : (
                    locations.map((loc) => {
                      const isSelected = String(loc.id) === tempSelectedLocationId;
                      const isDefault = loc.default_location === "1" || Number(loc.default_location) === 1;
                      const eqNames = locationEquipments.get(loc.id) ?? [];
                      return (
                        <div
                          key={loc.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => setTempSelectedLocationId(String(loc.id))}
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setTempSelectedLocationId(String(loc.id)); }}
                          className={`w-full flex items-start gap-3 px-4 py-3.5 rounded-2xl border transition-all text-left cursor-pointer ${
                            isSelected
                              ? "bg-purple-50 border-[#7c3aed]"
                              : "bg-gray-50 border-gray-100 hover:border-[#7c3aed]/40 hover:bg-purple-50/40"
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${isSelected ? "bg-[#7c3aed] text-white" : "bg-gray-200 text-gray-500"}`}>
                            <MapPin size={14} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`font-semibold text-sm ${isSelected ? "text-[#7c3aed]" : "text-gray-800"}`}>{loc.name}</span>
                              {isDefault && (
                                <span className="text-[10px] font-bold text-[#7c3aed] bg-purple-100 px-2 py-0.5 rounded-full flex-shrink-0">Default</span>
                              )}
                            </div>
                            {eqNames.length > 0 ? (
                              <p className={`text-[10px] mt-0.5 leading-snug line-clamp-2 ${isSelected ? "text-purple-400" : "text-gray-400"}`}>
                                {eqNames.join(" · ")}
                              </p>
                            ) : locationEquipments.size === 0 ? (
                              <p className="text-[10px] text-gray-300 mt-0.5">Loading equipment...</p>
                            ) : (
                              <p className="text-[10px] text-gray-300 mt-0.5">No equipment listed</p>
                            )}
                          </div>
                          {/* Edit pencil — mirrors mobile's LocationBottomSheet editButton */}
                          <button
                            onClick={(e) => { e.stopPropagation(); openEditLocationPopup(loc); }}
                            className="w-7 h-7 rounded-full bg-purple-100 hover:bg-purple-200 flex items-center justify-center flex-shrink-0 transition"
                          >
                            <Pen size={12} className="text-[#7c3aed]" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Footer — mirrors mobile's footer/confirmButton exactly: a
                "Set as Default" checkbox (only for a non-default selected
                location) plus the confirm button that actually commits the
                staged selection. */}
            <div className="px-5 py-4 border-t border-gray-100 flex-shrink-0">
              {(() => {
                if (tempSelectedLocationId === null) return null;
                const loc = locations.find((l) => String(l.id) === tempSelectedLocationId);
                if (!loc) return null;
                const isDefault = loc.default_location === "1" || Number(loc.default_location) === 1;
                if (isDefault) return null;
                return (
                  <button
                    onClick={() => setSetAsDefaultLocation((v) => !v)}
                    className="w-full flex items-center gap-2.5 mb-3"
                  >
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${setAsDefaultLocation ? "bg-[#7c3aed] border-[#7c3aed]" : "border-gray-300"}`}>
                      {setAsDefaultLocation && <CheckCircle2 size={12} className="text-white" />}
                    </div>
                    <span className="text-[13px] font-semibold text-gray-700">
                      Set &quot;{loc.name}&quot; as Default Location
                    </span>
                  </button>
                );
              })()}
              <button
                onClick={handleConfirmLocationSelect}
                disabled={confirmingLocation}
                className="w-full h-[50px] rounded-2xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold text-sm transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {confirmingLocation ? <Loader2 size={16} className="animate-spin" /> : null}
                Select Location
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE LOCATION POPUP */}
      {showCreateLocationPopup && (
        <div
          className="fixed inset-0 z-[450] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => { setShowCreateLocationPopup(false); setEditingLocationId(null); setShowLocationPopup(true); }}
        >
          <div
            className="bg-white w-full sm:max-w-[560px] rounded-t-[28px] sm:rounded-[28px] shadow-2xl flex flex-col"
            style={{ maxHeight: "92vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-5 pt-5 pb-4 flex items-start justify-between border-b border-gray-100 flex-shrink-0">
              <div>
                <h2 className="text-[16px] font-black text-gray-900">{editingLocationId != null ? "Edit Location" : "Create Location"}</h2>
                <p className="text-[11px] text-gray-400 mt-0.5">Select equipment and give it a title</p>
              </div>
              <button
                onClick={() => { setShowCreateLocationPopup(false); setEditingLocationId(null); setShowLocationPopup(true); }}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
              >
                <X size={14} />
              </button>
            </div>

            {/* Selected count pill */}
            <div className="px-5 py-3 flex-shrink-0">
              <div className="inline-flex items-center gap-2 bg-[#7c3aed] text-white text-sm font-semibold px-4 py-2 rounded-full">
                <CheckCircle2 size={14} className="fill-white/30" />
                {createSelectedIds.size} equipment selected
              </div>
            </div>

            {/* Search */}
            <div className="px-5 pb-3 flex-shrink-0">
              <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2.5">
                <Search size={14} className="text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search equipment..."
                  value={createSearch}
                  onChange={(e) => setCreateSearch(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Equipment grid */}
            <div className="flex-1 overflow-y-auto px-5 pb-3 min-h-0">
              {allEquipLoading || editingLocationLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="animate-spin text-[#7c3aed]" size={28} />
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2.5">
                  {allEquipment
                    .filter((eq) => !createSearch || eq.name?.toLowerCase().includes(createSearch.toLowerCase()))
                    .map((eq) => {
                      const isSelected = createSelectedIds.has(eq.id);
                      return (
                        <button
                          key={eq.id}
                          type="button"
                          onClick={() =>
                            setCreateSelectedIds((prev) => {
                              const next = new Set(prev);
                              next.has(eq.id) ? next.delete(eq.id) : next.add(eq.id);
                              return next;
                            })
                          }
                          className={`relative flex flex-col items-center rounded-2xl p-2.5 border transition-all ${
                            isSelected
                              ? "border-[#7c3aed] bg-purple-50 ring-2 ring-[#7c3aed]/10"
                              : "border-gray-200 bg-white"
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 text-[#7c3aed]">
                              <CheckCircle2 size={13} fill="white" />
                            </div>
                          )}
                          <div className="h-9 w-9 mb-1.5 flex items-center justify-center bg-gray-50 rounded-xl p-1">
                            {eq.icon ? (
                              <img src={eq.icon} alt={eq.name} className="max-h-full max-w-full object-contain" />
                            ) : (
                              <Dumbbell size={16} className={isSelected ? "text-[#7c3aed]" : "text-gray-400"} />
                            )}
                          </div>
                          <p className={`text-[8px] font-bold uppercase tracking-wide text-center leading-tight ${isSelected ? "text-[#7c3aed]" : "text-gray-500"}`}>
                            {eq.name}
                          </p>
                        </button>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Title + submit */}
            <div className="px-5 pt-3 pb-7 flex-shrink-0 border-t border-gray-100">
              <input
                type="text"
                placeholder="Give this location a title (e.g., Home Gym)"
                value={createTitle}
                onChange={(e) => setCreateTitle(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#7c3aed] mb-3 mt-3"
              />
              {/* Set as default location — mirrors mobile's CreateLocationScreen checkbox, applies to both create and edit */}
              <button
                onClick={() => setCreateSetAsDefault((v) => !v)}
                className="w-full flex items-center gap-2.5 mb-3"
              >
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${createSetAsDefault ? "bg-[#7c3aed] border-[#7c3aed]" : "border-gray-300"}`}>
                  {createSetAsDefault && <CheckCircle2 size={12} className="text-white" />}
                </div>
                <span className="text-[13px] font-semibold text-gray-700">Set as Default Location</span>
              </button>
              <button
                onClick={handleCreateLocation}
                disabled={createSubmitting || !createTitle.trim()}
                className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold text-sm py-3.5 rounded-full flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createSubmitting ? (
                  <><Loader2 size={15} className="animate-spin" /> {editingLocationId != null ? "Saving..." : "Creating..."}</>
                ) : createTitle.trim() ? (
                  editingLocationId != null ? "Save Changes" : "Create Location"
                ) : (
                  "Select Equipment & Add Title"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSwapModal && currentExercise && (
        <SwapExerciseModal
          exercise={currentExercise}
          sessionId={sessionId}
          locationId={locationId}
          locationName={locationName}
          section={currentSection?.label || ""}
          sectionExercises={sectionExercises}
          userOtherDetail={userOtherDetail}
          onClose={() => setShowSwapModal(false)}
          onSwapSaved={() => {
            setShowSwapModal(false);
            if (workoutCode && currentSection) {
              loadSectionExercises(currentSectionIndex, workoutCode, sessionId, sections, currentExerciseIndex);
            }
          }}
        />
      )}

      <ShareSessionModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        sessionId={sessionId || ""}
      />

      {/* AD DETAIL POPUP */}
      {selectedAd && (
        <div
          className="fixed inset-0 z-[500] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => { setSelectedAd(null); setLinkCopied(false); }}
        >
          <div
            className="relative bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => { setSelectedAd(null); setLinkCopied(false); }}
              className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
            >
              <X size={14} className="text-gray-600" />
            </button>
            <div className="p-5">
              <p className="font-bold text-gray-800 text-sm mb-3">Ad Details:</p>
              <div className="rounded-2xl overflow-hidden mb-4 bg-gray-100 h-44">
                <img src={selectedAd.image} alt="ad" className="w-full h-full object-cover" />
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
                  <span className="text-[10px] text-green-600 font-semibold shrink-0">Copied!</span>
                )}
              </div>
              <button
                onClick={() => window.open(selectedAd.link, "_blank", "noopener,noreferrer")}
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

      {/* COMPLETE THE $ SET MODAL */}
      {moneySetExercise && (
        <PowerSetTrackingModal
          exercise={moneySetExercise}
          sets={moneySetSets}
          sessionId={sessionId || undefined}
          workoutLibraryId={workoutCode || undefined}
          userOtherDetail={userOtherDetail}
          onClose={() => {
            setMoneySetExercise(null);
            // Mirrors mobile's onClose, called after every save (or on a
            // bare close) — re-verify so the round can auto-complete the
            // moment its money sets are all recorded.
            setVerifyingPowerSets(true);
            verifyPowerSetsCompletedFor(sectionExercises, sessionId)
              .then(setPowerSetsCompleted)
              .finally(() => setVerifyingPowerSets(false));
            refreshLoadRecords(sessionId);
          }}
          onAddSet={addMoneySetSet}
          onUpdateSet={updateMoneySetSet}
          onToggleRecordSet={toggleRecordMoneySetSet}
          onSetSets={setMoneySetSets}
          onSave={async () => {}}
        />
      )}

      {/* MONEY SET INCOMPLETE MODAL */}
      {showMoneySetModal && (
        <div className="fixed inset-0 z-[400] bg-black/40 flex items-center justify-center p-6">
          <div className="bg-white/95 w-full max-w-sm rounded-[36px] px-6 pt-8 pb-6 text-center shadow-2xl">
            <h2 className="text-[22px] font-bold text-gray-900 mb-4">Money Set Incomplete</h2>
            <p className="text-[15px] text-gray-600 leading-snug mb-7">
              Please complete and save all money sets ($) for the power set exercises in this round before checking this round as completed.
            </p>
            <button
              onClick={() => setShowMoneySetModal(false)}
              className="w-full h-[54px] rounded-full bg-gray-200 text-gray-900 font-bold hover:bg-gray-300 transition"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* EXERCISE TRACKING MODAL */}
      {trackingExercise && (
        <div className="fixed inset-0 z-[300] bg-black/50 backdrop-blur-[3px] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-[480px] rounded-t-[28px] sm:rounded-[28px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100 flex-shrink-0">
              <h2 className="text-[15px] font-black text-gray-900">Exercise Tracking</h2>
              <button
                onClick={() => setTrackingExercise(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
              >
                <X size={14} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
              {/* Exercise info */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-[#efefef] rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {resolveMediaUrl(trackingExercise.demo_gif || trackingExercise.demoGif) ? (
                    <img
                      src={resolveMediaUrl(trackingExercise.demo_gif || trackingExercise.demoGif)!}
                      alt={trackingExercise.exercise_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Dumbbell className="w-7 h-7 text-gray-300" />
                  )}
                </div>
                <p className="text-[13px] font-black text-gray-800 uppercase tracking-wide leading-snug">
                  {trackingExercise.exercise_name}
                </p>
              </div>

              {/* Last / Best / Suggested */}
              {(() => {
                const userUnit = (userOtherDetail?.measurementUnit || "lbs").toLowerCase();
                // Exact port of mobile's ExerciseTrackingModal suggested-weight
                // logic: the lift-max map (wMap) must use RAW reference values
                // (no unit conversion) — same fix already applied to
                // PowerSetTrackingModal/swapExerciseModal/page.tsx elsewhere
                // this session.
                const wMap: Record<string, number> = userOtherDetail ? {
                  "of InputBarbellSquat": parseFloat(String(userOtherDetail.r_back_squat || 0)) || 0,
                  "of InputDeadlift": parseFloat(String(userOtherDetail.r_deadlift || 0)) || 0,
                  "of InputBenchPress": parseFloat(String(userOtherDetail.r_bench_press || 0)) || 0,
                  "of InputPowerClean": parseFloat(String(userOtherDetail.r_power_clean || 0)) || 0,
                  "of BodyWeight": parseFloat(String(userOtherDetail.currentWeight || 0)) || 0,
                } : {};
                const weightAdj = (trackingExercise.weight_adj || "").trim();
                const weightVal = trackingExercise.weight || "0";
                const dWeight = (trackingExercise as unknown as { calculated_weight?: string }).calculated_weight ?? trackingExercise.weight ?? null;
                const msrmt = (trackingExercise as unknown as { msrmt?: string }).msrmt || "lbs";
                let displayWeight = "";
                const hasAdj = weightAdj !== "" && wMap[weightAdj] !== undefined && wMap[weightAdj] > 0;
                if (hasAdj) {
                  const base = wMap[weightAdj];
                  const calc = Math.ceil(base * (parseFloat(weightVal) || 0));
                  if (calc > 0) displayWeight = `${calc} ${userUnit}`;
                } else if (dWeight != null) {
                  const numericWeight = parseFloat(String(dWeight)) || 0;
                  if (numericWeight > 0) displayWeight = convertToUserUnit(dWeight, userUnit, msrmt);
                }
                const cleanReps = (r: string | number | null | undefined) =>
                  (String(r ?? "").trim().split("-").pop()?.trim() || "").replace(/\D/g, "");
                const suggestedSets = trackingExercise.sets || "1";
                const suggestedReps = cleanReps(trackingExercise.reps) || "15";
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

              {/* Sets */}
              <div className="space-y-3">
                {trackingSets.map((set, i) => (
                  <div key={i} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Set {i + 1}</span>
                      {set.saved && set.load != null && (
                        <span className="text-[10px] font-bold text-gray-400">Load: {set.load}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 pl-1">Weight ({(userOtherDetail?.measurementUnit || "lbs").toLowerCase()})</p>
                        <input
                          type="number"
                          value={set.weight}
                          onChange={(e) => updateTrackingSet(i, "weight", e.target.value)}
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
                          onChange={(e) => updateTrackingSet(i, "reps", e.target.value)}
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
                          if (!trackingExercise || !sessionId) return;
                          const code = workoutCode?.toUpperCase();
                          if (!code) return;
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

                          // Exact port of mobile's load formula.
                          const isKg = (userOtherDetail?.measurementUnit || "lbs").toLowerCase() === "kg";
                          const rawWeight = parseFloat(String(userOtherDetail?.currentWeight ?? 0)) || 0;
                          const userWeight = isKg ? rawWeight * 2.2046 : rawWeight;
                          const userHeight = parseHeightInches(userOtherDetail?.height);
                          const E = parseInt(String((trackingExercise as unknown as { loadMeter?: number }).loadMeter ?? 3)) || 3;
                          const e = parseFloat(String((trackingExercise as unknown as { rep_variant?: number; repVariant?: number }).repVariant ?? (trackingExercise as unknown as { rep_variant?: number }).rep_variant ?? 1)) || 1;
                          const wt = weightNum * 2.20462262;
                          const data1 = userWeight * userHeight;
                          const data2 = E * (repsNum * e) * 1 * wt;
                          const computedLoad = Math.ceil((data1 + data2) / 2600);
                          setSavingSetIndex(i);
                          try {
                            const result = await createTrackingLog({
                              title: `Set ${setNumber}`,
                              exerciseId: trackingExercise.exercise_id,
                              sessionId,
                              workoutLibraryId: code,
                              weight: weightNum,
                              repetitions: repsNum,
                              status: true,
                              tag: "/e",
                              load: computedLoad,
                            });
                            setTrackingSets((prev) => prev.map((s, idx) => idx === i ? { ...s, saved: true, load: result.load ?? computedLoad } : s));
                          } catch {
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
                onClick={addTrackingSet}
                className="w-full border-2 border-dashed border-purple-200 rounded-2xl py-3 flex items-center justify-center gap-2 text-[12px] font-bold text-purple-500 hover:bg-purple-50 transition"
              >
                <Plus size={15} />
                Add Set
              </button>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-gray-100 flex flex-col gap-2 flex-shrink-0">
              <button
                disabled={savingLogs}
                onClick={async () => {
                  if (!trackingExercise || !sessionId) { setTrackingExercise(null); return; }
                  const code = workoutCode?.toUpperCase();
                  if (!code) { setTrackingExercise(null); return; }
                  setSavingLogs(true);
                  try {
                    const unsaved = trackingSets
                      .map((s, i) => ({ s, i }))
                      .filter(({ s }) => !s.saved);
                    if (unsaved.length > 0) {
                      await Promise.all(unsaved.map(({ s, i }) => createTrackingLog({
                        title: `Set ${i + 1}`,
                        exerciseId: trackingExercise.exercise_id,
                        sessionId,
                        workoutLibraryId: code,
                        weight: parseFloat(s.weight) || 0,
                        repetitions: parseInt(s.reps) || 0,
                      })));
                    }
                  } catch {
                  } finally {
                    setSavingLogs(false);
                    setTrackingExercise(null);
                  }
                }}
                className="w-full bg-gradient-to-r from-purple-600 to-violet-600 text-white font-black py-3 rounded-xl text-[13px] hover:opacity-90 transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {savingLogs ? <><Loader2 size={15} className="animate-spin" /> Saving...</> : "Save"}
              </button>
              <button
                onClick={() => setTrackingExercise(null)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-700 font-bold py-3 rounded-xl text-[12px] hover:bg-gray-100 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
