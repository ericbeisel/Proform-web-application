"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft, Share2, Bookmark, X,
  Dumbbell, Zap, Plus, Eye, ChevronRight, Loader2
} from "lucide-react";
import { getProgramExercises, getProgramEquipment, getProgramPowerSets, getProgramWorkoutStats, getProgramIdByCode, getProgramTags, getProgramPreview, Exercise, Equipment, PowerSet, WorkoutStats, ChartBarDatum, ChartPieDatum, ProgramPreview } from "@/api/programs/route";
import { getCompletedUsers, CompletedUser } from "@/api/workouts/route";
interface WorkoutDetailProps {
  workoutId?: number | string;
  onClose?: () => void;
}

const MUSCLE_NAME_MAP: Record<string, string> = {
  chest: 'Chest',
  glutes: 'Glutes',
  abdominals: 'Abs',
  biceps: 'Biceps',
  triceps: 'Triceps',
  frontdelts: 'Front Delts',
  lateraldelts: 'Side Delts',
  reardelts: 'Rear Delts',
  traps: 'Traps',
  forearms: 'Forearms',
  calves: 'Calves',
  hamstrings: 'Hamstrings',
  adductors: 'Adductors',
  abuductorships: 'Abductors',
  quads: 'Quads',
  vmo: 'VMO',
  oblique: 'Obliques',
  scaps: 'Scaps',
  latsupperback: 'Lats/Upper Back',
  midlowback: 'Lower Back',
  neck: 'Neck',
};

const MUSCLE_COLOR_FALLBACK: Record<string, string> = {
  '#DC2626': 'Chest',
  '#A78BFA': 'Biceps',
  '#3B82F6': 'Triceps',
  '#D4B499': 'Lats',
  '#06B6D4': 'Quads',
  '#16A34A': 'Glutes',
};

function formatMuscleName(muscle: string, color?: string): string {
  const cleanMuscle = (muscle || '').trim().toLowerCase();
  if (MUSCLE_NAME_MAP[cleanMuscle]) return MUSCLE_NAME_MAP[cleanMuscle];
  if (color) {
    const mapped = MUSCLE_COLOR_FALLBACK[color.toUpperCase().trim()];
    if (mapped) return mapped;
  }
  return muscle || 'Other';
}

function resolveWixImage(url?: string | null): string {
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

function EquipmentIcon({ item }: { item: Equipment }) {
  const [failed, setFailed] = useState(false);
  const src = resolveWixImage(item.icon);
  if (!src || failed) {
    return <Dumbbell className="w-4 h-4 md:w-[18px] md:h-[18px] text-slate-400" />;
  }
  return (
    <img
      src={src}
      alt={item.name}
      className="w-full h-full object-cover rounded-2xl"
      onError={() => setFailed(true)}
    />
  );
}

function ExerciseThumb({ ex }: { ex: Exercise }) {
  const [failed, setFailed] = useState(false);
  const src = resolveWixImage(ex.demoGif);
  if (!src || failed) {
    return <Dumbbell className="w-4 h-4 text-slate-300" />;
  }
  return (
    <img
      src={src}
      alt={ex.name}
      className="w-full h-full object-cover"
      onError={() => setFailed(true)}
    />
  );
}

function PowerSetThumb({ ps }: { ps: PowerSet }) {
  const [failed, setFailed] = useState(false);
  const src = resolveWixImage(ps.demo_gif);
  if (!src || failed) {
    return <Dumbbell className="w-6 h-6" />;
  }
  return (
    <img
      src={src}
      alt={ps.title_secondary}
      className="w-full h-full object-contain"
      onError={() => setFailed(true)}
    />
  );
}

function CompletedAvatar({ user, index }: { user: CompletedUser; index: number }) {
  const [failed, setFailed] = useState(false);
  const src = resolveWixImage(user.image);
  if (!src || failed) {
    return (
      <div
        title={user.name}
        className={`w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-black text-white ring-2 ring-white shadow-sm
          ${index % 3 === 0 ? 'bg-indigo-400' : index % 3 === 1 ? 'bg-blue-500' : 'bg-orange-400'}`}
      >
        {user.name.slice(0, 2).toUpperCase()}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={user.name}
      title={user.name}
      className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm"
      onError={() => setFailed(true)}
    />
  );
}

export default function ResponsiveWorkoutUI({ workoutId, onClose }: WorkoutDetailProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const programUuid = searchParams.get('code');
  const workoutKey = searchParams.get('workoutKey');
  const queueProgramName = searchParams.get('programName') ||
    (typeof window !== 'undefined' ? localStorage.getItem('workoutProgramName') : null) || '';
  
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [powerSets, setPowerSets] = useState<PowerSet[]>([]);
  const [workoutStats, setWorkoutStats] = useState<WorkoutStats | null>(null);
  const [previewData, setPreviewData] = useState<ProgramPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workoutTitle, setWorkoutTitle] = useState<string>("");
  const [programCode, setProgramCode] = useState<string>("");
  const [programId, setProgramId] = useState<string>("");
  const [showAddToQueueModal, setShowAddToQueueModal] = useState(false);
  const [includeSupplemental, setIncludeSupplemental] = useState(false);
  const [addingToQueue, setAddingToQueue] = useState(false);
  const [completedUsers, setCompletedUsers] = useState<CompletedUser[]>([]);
  const [programTags, setProgramTags] = useState<string[]>([]);
  // Add this line at the top of the component, before any hooks
console.log("=== WorkoutDetail mount ===");
console.log("localStorage workoutProgramId:", typeof window !== 'undefined' ? localStorage.getItem("workoutProgramId") : "SSR");
console.log("programUuid from URL:", programUuid);



  // Fallback values shown only until GET /programs/{code}/workout-stats resolves
  const dummyStats = [
    { label: 'Load', value: '97' },
    { label: 'Duration', value: '31:30' },
    { label: 'Movements', value: '24' }
  ];

  const displayLoadStats = [
    { label: 'Load', value: workoutStats?.load ?? dummyStats[0].value },
    { label: 'Duration', value: workoutStats?.duration ?? dummyStats[1].value },
    { label: 'Movements', value: workoutStats?.movements ?? dummyStats[2].value },
  ];

  // Fallback data — same defaults the mobile app falls back to when
  // workoutStats.charts is missing.
  const barData: ChartBarDatum[] = [
    { value: 65, label: 'Week 1', frontColor: '#6202AC', roundedTop: true },
    { value: 75, label: 'Week 2', frontColor: '#6202AC', roundedTop: true },
    { value: 85, label: 'Week 3', frontColor: '#6202AC', roundedTop: true },
  ];

  const pieData: ChartPieDatum[] = [
    { value: 25, color: '#DC2626', label: 'Chest' },
    { value: 15, color: '#A78BFA', label: 'Biceps' },
    { value: 20, color: '#3B82F6', label: 'Triceps' },
    { value: 15, color: '#D4B499', label: 'Lats' },
    { value: 25, color: '#06B6D4', label: 'Quads' },
    { value: 10, color: '#16A34A', label: 'Glutes' },
  ];

useEffect(() => {
  const fetchWorkoutData = async () => {
    const code = programUuid || (workoutId ? String(workoutId) : null);

    if (!code) {
      setError("No program code provided");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const lowerCode = code.toLowerCase();

      const [exercisesData, equipmentData, powerSetsData, statsData] = await Promise.all([
        getProgramExercises(lowerCode, 1, 100),
        getProgramEquipment(lowerCode, false),
        getProgramPowerSets(lowerCode).catch(() => []),
        getProgramWorkoutStats(lowerCode).catch(() => null),
      ]);

      setExercises(exercisesData.data || []);
      setEquipment(equipmentData || []);
      setPowerSets(Array.isArray(powerSetsData) ? powerSetsData : []);
      setWorkoutStats(statsData);
      setProgramCode(lowerCode);
      getProgramTags(lowerCode).then(setProgramTags).catch(() => {});
      getProgramPreview(lowerCode).then((preview) => {
        setPreviewData(preview);
        // Fall back to the preview title when the URL didn't carry a
        // workoutKey, mirroring mobile's workoutData/previewData fallback chain.
        if (!workoutKey) {
          const fallbackName = (preview?.workout_title as string | undefined) || preview?.title;
          if (fallbackName) {
            getCompletedUsers(fallbackName).then(setCompletedUsers).catch(() => {});
          }
        }
      }).catch(() => {});

      if (workoutKey) setWorkoutTitle(workoutKey);

      if (workoutKey) {
        getCompletedUsers(workoutKey)
          .then(setCompletedUsers)
          .catch(() => {});
      }

      // ← Read from localStorage first, fall back to API lookup
      const storedId = localStorage.getItem("workoutProgramId");
      if (storedId) {
        console.log("✅ Program UUID from localStorage:", storedId);
        setProgramId(storedId);
      } else {
        console.warn("⚠️ No workoutProgramId in localStorage — fetching via API");
        const resolvedId = await getProgramIdByCode(lowerCode).catch(() => null);
        if (resolvedId) {
          console.log("✅ Program UUID resolved:", resolvedId);
          setProgramId(resolvedId);
          localStorage.setItem("workoutProgramId", resolvedId);
        } else {
          console.warn("⚠️ Could not resolve program UUID");
        }
      }

    } catch (err) {
      console.error("Error fetching workout data:", err);
      setError("Failed to load workout details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  fetchWorkoutData();
}, [programUuid, workoutKey, workoutId]);

// useEffect(() => {
//   const fetchWorkoutData = async () => {
//     const code = programUuid || (workoutId ? String(workoutId) : null) || localStorage.getItem("workoutProgramCode");

//     if (!code) {
//       setError("No program code provided");
//       setLoading(false);
//       return;
//     }

//     try {
//       setLoading(true);
//       const lowerCode = code.toLowerCase();

//       const [exercisesData, equipmentData, powerSetsData, statsData] = await Promise.all([
//         getProgramExercises(lowerCode, 1, 100),
//         getProgramEquipment(lowerCode, false),
//         getProgramPowerSets(lowerCode).catch(() => []),
//         getProgramWorkoutStats(lowerCode).catch(() => null),
//       ]);

//       setExercises(exercisesData.data || []);
//       setEquipment(equipmentData || []);
//       setPowerSets(Array.isArray(powerSetsData) ? powerSetsData : []);
//       setWorkoutStats(statsData);
//       setProgramCode(lowerCode);

//       // Resolve program UUID for startProgram API
//       const storedId = localStorage.getItem("workoutProgramId");
//       if (storedId) {
//         setProgramId(storedId);
//       } else {
//         const resolvedId = await getProgramIdByCode(lowerCode);
//         console.log("Resolved program UUID:", resolvedId);
//         if (resolvedId) {
//           setProgramId(resolvedId);
//           localStorage.setItem("workoutProgramId", resolvedId);
//         }
//       }
      
//       // workoutKey is now the readable title e.g. "LOWER BODY"
//       if (workoutKey) {
//         setWorkoutTitle(workoutKey);
//       }
      
//     } catch (err) {
//       console.error("Error fetching workout data:", err);
//       setError("Failed to load workout details. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   fetchWorkoutData();
// }, [programUuid, workoutKey, workoutId]);

  // Filter exercises for specific workout if workoutKey is provided
// Filter exercises for specific workout if workoutKey is provided
const filteredExercises = exercises;

  // The exercises grid below uses gridAutoFlow: "column" with 2 rows, so each
  // consecutive pair (2n, 2n+1) lands in the same column as (top, bottom).
  // Swap each pair here to flip which one displays on top vs. bottom.
  const displayExercises = filteredExercises.reduce<typeof filteredExercises>((acc, ex, i) => {
    if (i % 2 === 1) {
      acc.push(ex, filteredExercises[i - 1]);
    } else if (i === filteredExercises.length - 1) {
      acc.push(ex);
    }
    return acc;
  }, []);

  // Get unique equipment names
  const uniqueEquipment = [...new Map(equipment.map(item => [item.name, item])).values()];

  // Real bar/pie chart data from GET /programs/{code}/workout-stats, falling
  // back to the same static defaults the mobile app uses when charts is missing.
  const displayBarData: ChartBarDatum[] = workoutStats?.charts?.barData || barData;

  const displayPieData = useMemo(() => {
    const rawData = workoutStats?.charts?.pieData || pieData;
    const total = rawData.reduce((sum, item) => sum + (item.value || 0), 0);
    return rawData.map((item) => {
      const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
      return {
        ...item,
        label: formatMuscleName(item.label || item.muscle || '', item.color),
        percentage,
      };
    });
  }, [workoutStats]);

  const maxBarValue = Math.max(...displayBarData.map((d) => d.value), 1);

  const displayTitle = workoutTitle || (workoutKey ? workoutKey.split(',')[0] : 'RECONDITIONING');

  const displayProgramName = useMemo(() => {
    // Some programs only have a raw code (e.g. "BRC7") in `program_name` with no
    // human-readable name — skip code-like values and fall through to a real name.
    const isCodeLike = (t?: string) => !!t && /^[A-Z0-9]{2,6}$/i.test(t.trim()) && /\d/.test(t);
    const candidates = [
      // Carried over from the workout queue/dashboard the user navigated from —
      // mirrors mobile's `workoutData?.program_name` (a richer object passed via
      // navigation params, which web has no direct equivalent of).
      queueProgramName,
      previewData?.program_name,
      previewData?.workout_title as string | undefined,
      previewData?.description,
      previewData?.title,
    ];
    return candidates.find((t) => t && !isCodeLike(t) && t !== displayTitle) || '';
  }, [queueProgramName, previewData, displayTitle]);

  // The API only ever returns `franchiseCode` (e.g. "OPM") for this program —
  // franchise_name/franchise are kept as fallbacks in case other programs
  // return a full name instead.
  const franchiseName = previewData?.franchise_name || previewData?.franchise || previewData?.franchiseCode;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-3" />
          <p className="text-gray-500">Loading workout details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center bg-gray-50 p-6 rounded-2xl shadow max-w-md">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => onClose ? onClose() : router.back()} 
            className="bg-purple-600 text-white px-6 py-2 rounded-xl"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-32 overflow-x-hidden">

      <div className="max-w-[1200px] mx-auto p-4 md:p-8">

        {/* Navigation Row */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => onClose ? onClose() : router.back()}
            className="w-10 h-10 flex items-center justify-center bg-white rounded-full border border-slate-100 shadow-sm hover:bg-slate-50 transition-all active:scale-90"
          >
            <ArrowLeft className="w-[18px] h-[18px] text-slate-600" />
          </button>

          <div className="flex gap-2">
            {/* Mobile-only: Add to Queue lives here (top-right) instead of the
                full-width button under the title — desktop keeps that button. */}
            <button
              onClick={() => setShowAddToQueueModal(true)}
              className="flex md:hidden h-10 items-center justify-center gap-1 px-3.5 bg-violet-600 hover:bg-violet-700 rounded-full shadow-sm text-white text-[11px] font-bold uppercase tracking-wide whitespace-nowrap transition-all active:scale-90"
            >
              <Plus className="w-[14px] h-[14px]" strokeWidth={3} /> Add to Queue
            </button>
            <button className="w-10 h-10 flex items-center justify-center bg-white rounded-full border border-slate-100 shadow-sm text-slate-500 hover:bg-slate-50 transition-all active:scale-90">
              <Bookmark className="w-[18px] h-[18px]" />
            </button>
            <button className="w-10 h-10 flex items-center justify-center bg-white rounded-full border border-slate-100 shadow-sm text-slate-500 hover:bg-slate-50 transition-all active:scale-90">
              <Share2 className="w-[18px] h-[18px]" />
            </button>
            <button
              onClick={() => onClose ? onClose() : router.back()}
              className="w-10 h-10 flex items-center justify-center bg-white rounded-full border border-slate-100 shadow-sm text-slate-500 hover:bg-slate-50 transition-all active:scale-90"
            >
              <X className="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>

        {/* Hero Title Area */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
          <div>
            <p className="text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-widest">This Workout:</p>
            {!!franchiseName && (
              <span className="inline-block px-3 py-1 mb-1.5 bg-[#7C3AED] text-white text-[10px] font-black rounded-full tracking-wide uppercase">
                {franchiseName}
              </span>
            )}
            {!!displayProgramName && (
              <p className="text-[11px] font-semibold text-violet-400 uppercase tracking-wide mb-0.5">
                {displayProgramName}
              </p>
            )}
            {(() => {
              const [firstWord, ...rest] = displayTitle.split(' ');
              return (
                <h1 className="text-3xl md:text-4xl font-black leading-tight mb-3">
                  <span className="text-violet-600">{firstWord}</span>
                  {rest.length > 0 && <span className="text-slate-900"> {rest.join(' ')}</span>}
                </h1>
              );
            })()}

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
              const hasMoneySet = powerSets.some((ps) => ps.is_money_set);

              if (!powerSetTags.length && !hasMoneySet) return null;

              return (
                <div className="flex flex-wrap gap-1.5 mt-1.5 mb-0.5">
                  {hasMoneySet && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500 text-white text-[10px] font-black rounded-full tracking-wide">
                      ★ MONEY SET
                    </span>
                  )}
                  {powerSetTags.map((label, idx) => (
                    <span key={idx} className="px-3 py-1 bg-cyan-500 text-white text-[10px] font-black rounded-full tracking-wide">
                      ${label}
                    </span>
                  ))}
                </div>
              );
            })()}
          </div>
   <button
  onClick={() => {
    console.log("=== Opening modal ===");
    console.log("programId state:", programId);
    console.log("localStorage now:", localStorage.getItem("workoutProgramId"));
    setShowAddToQueueModal(true);
  }}
  className="hidden md:flex w-full md:w-auto bg-violet-600 hover:bg-violet-700 text-white px-8 py-3.5 rounded-full font-bold text-xs uppercase tracking-widest shadow-lg shadow-violet-200 transition-all active:scale-95 items-center justify-center gap-2"
>
  <Plus size={14} strokeWidth={3} /> Add to Queue
</button>

        </div>

        {/* MAIN RESPONSIVE GRID */}
        <div className="grid grid-cols-12 gap-5 md:gap-6">

          <div className="col-span-12 lg:col-span-7 space-y-6">
            {/* Bar chart (weekly load) + pie chart (muscle focus) — from GET /programs/{code}/workout-stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-pink-400"></div><span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Workout</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-violet-600"></div><span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Player Avg</span></div>
                </div>
                <div className="flex items-end justify-between h-20 md:h-24 px-1 gap-3 md:gap-4 border-b border-slate-100">
                  {displayBarData.map((bar, i) => (
                    <div key={`${bar.label}-${i}`} className="flex-1 flex flex-col items-center justify-end h-full gap-1.5">
                      <span className="text-[9px] font-bold text-slate-500">{bar.value}</span>
                      <div
                        className={bar.roundedTop === false ? "w-full" : "w-full rounded-t-xl"}
                        style={{
                          height: `${(bar.value / maxBarValue) * 100}%`,
                          backgroundColor: bar.frontColor || "#6202AC",
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-3 text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                  {displayBarData.map((bar, i) => (
                    <span key={`${bar.label}-label-${i}`}>{bar.label}</span>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-3">
                 <div className="w-28 h-28 md:w-32 md:h-32 rounded-full relative flex items-center justify-center">
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: (() => {
                          const total = displayPieData.reduce((sum, item) => sum + (item.value || 0), 0) || 1;
                          let cursor = 0;
                          const stops = displayPieData.map((item) => {
                            const start = (cursor / total) * 100;
                            cursor += item.value || 0;
                            const end = (cursor / total) * 100;
                            return `${item.color} ${start}% ${end}%`;
                          });
                          return `conic-gradient(${stops.join(", ")})`;
                        })(),
                      }}
                    />
                    <div className="absolute inset-[13px] md:inset-[15px] bg-white rounded-full shadow-inner"></div>
                    <span className="relative text-[9px] font-bold text-slate-400 uppercase tracking-widest">Focus</span>
                 </div>
                 <div className="flex flex-wrap justify-center gap-x-3 gap-y-1">
                   {displayPieData.filter((item) => item.label).slice(0, 5).map((item, idx) => (
                     <div key={`${item.label}-${idx}`} className="flex items-center gap-1.5">
                       <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                       <span className="text-[8px] font-bold text-slate-500">{item.label} {item.percentage}%</span>
                     </div>
                   ))}
                 </div>
              </div>
            </div>

            {/* Load / Duration / Movements — from GET /programs/{code}/workout-stats */}
            <div className="bg-white rounded-3xl p-6 md:p-7 border border-slate-100 shadow-sm flex flex-wrap md:flex-nowrap justify-around divide-x divide-slate-100">
              {displayLoadStats.map((stat, i) => (
                <div key={i} className="text-center min-w-[80px] flex-1 px-2">
                  <p className="text-3xl md:text-4xl font-black text-slate-900 leading-none">{stat.value}</p>
                  <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase mt-2 tracking-widest">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Recently Completed */}
            {completedUsers.length > 0 && (
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">
                  Recently Completed
                </h3>
                <div className="flex flex-wrap gap-2.5">
                  {completedUsers.map((user, i) => (
                    <CompletedAvatar key={user.id} user={user} index={i} />
                  ))}
                </div>
              </div>
            )}

            {/* REAL Exercises from Backend */}
            <div className="bg-white rounded-3xl p-6 md:p-7 border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  Exercises
                </h3>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  {filteredExercises.length} total
                </span>
              </div>
              <div className="relative">
                <div
                  className="grid gap-3 overflow-x-auto pb-2"
                  style={{ gridTemplateRows: "repeat(2, auto)", gridAutoFlow: "column", gridAutoColumns: "120px", scrollbarWidth: "none" }}
                >
                  {displayExercises.map((ex, i) => (
                    <div
                      key={`${ex.id ?? "ex"}-${i}`}
                      className="bg-slate-50/60 rounded-2xl p-4 border border-slate-100 flex flex-col items-center text-center hover:bg-slate-50 hover:border-slate-200 transition-colors"
                    >
                      <div className="w-12 h-12 rounded-xl mb-2.5 overflow-hidden bg-white border border-slate-100 shrink-0 flex items-center justify-center">
                        <ExerciseThumb ex={ex} />
                      </div>
                      <p className="text-[7px] font-bold text-slate-400 uppercase mb-1">
                        {ex.supplemental || 'Exercise'}
                      </p>
                      <p className="text-[8px] font-bold leading-tight uppercase line-clamp-2 text-slate-700">
                        {ex.name}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="pointer-events-none absolute top-0 right-0 bottom-2 w-10 bg-gradient-to-l from-white to-transparent" />
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-5 space-y-6">
            {/* REAL Equipment from Backend */}
            <div className="bg-white rounded-3xl p-6 md:p-7 border border-slate-100 shadow-sm">
              <h3 className="text-[11px] font-bold mb-6 uppercase tracking-widest text-slate-400">Equipment Needed</h3>
              <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-5 gap-y-6 gap-x-2">
                {uniqueEquipment.length > 0 ? (
                  uniqueEquipment.map((item, i) => (
                    <div key={item.id || i} className="flex flex-col items-center gap-2">
                    <div className="w-11 h-11 md:w-12 md:h-12 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 overflow-hidden">
  <EquipmentIcon item={item} />
</div>
                      <span className="text-[7px] md:text-[8px] font-bold text-slate-400 text-center uppercase tracking-tighter leading-tight">
                        {item.name}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="col-span-full text-center text-slate-400 text-sm">
                    No equipment required
                  </p>
                )}
              </div>
            </div>

            {/* Workout Stats */}
            {workoutStats && (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-3xl p-6 md:p-7 text-white flex flex-col justify-center min-h-[120px] shadow-lg shadow-orange-100">
                  <div className="flex items-center gap-1.5 mb-2 opacity-90">
                    <Zap className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-bold uppercase tracking-widest">Calories</span>
                  </div>
                  <p className={`text-3xl md:text-4xl font-black leading-none ${!workoutStats.calories ? 'opacity-40' : ''}`}>{workoutStats.calories || 0}</p>
                </div>
                <div className="bg-gradient-to-br from-violet-600 to-indigo-600 rounded-3xl p-6 md:p-7 text-white flex flex-col justify-center min-h-[120px] shadow-lg shadow-violet-100">
                  <div className="flex items-center gap-1.5 mb-2 opacity-90">
                    <Zap className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-bold uppercase tracking-widest">Power</span>
                  </div>
                  <p className={`text-3xl md:text-4xl font-black leading-none ${!workoutStats.power ? 'opacity-40' : ''}`}>{workoutStats.power || 0}</p>
                </div>
              </div>
            )}

            {/* Power Sets */}
            {powerSets.length > 0 && (
              <div className="bg-white rounded-3xl p-5 md:p-6 border border-slate-100 shadow-sm space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <div className="w-6 h-6 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-500">
                    <Zap className="w-3 h-3" fill="currentColor" />
                  </div>
                  <span className="text-[9px] font-bold uppercase text-indigo-500 tracking-widest">Power Sets</span>
                  <span className="text-[9px] font-bold text-slate-400 ml-auto">{powerSets.length} sets</span>
                </div>
                <div className="space-y-2.5">
                  {powerSets.map((ps) => (
                    <div key={ps.id} className="bg-slate-50/60 rounded-2xl border border-slate-100 flex gap-4 items-center p-3.5">
                      {/* Gif */}
                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 flex items-center justify-center text-slate-300 bg-white border border-slate-100">
                        <PowerSetThumb ps={ps} />
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[8px] font-bold text-indigo-400 uppercase tracking-widest mb-0.5 truncate">{ps.title_primary}</p>
                        <p className="text-[12px] font-black uppercase leading-tight text-slate-900 mb-2 truncate">{ps.title_secondary}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {(ps.child_sets || []).map((s) => (
                            <div key={s.id} className="bg-white rounded-lg px-2 py-1 border border-slate-100">
                              <p className={`text-[10px] font-black leading-none ${!s.calculated_weight ? 'text-slate-300' : 'text-slate-900'}`}>
                                {s.calculated_weight || 0} {s.msrmt}
                              </p>
                              <p className="text-[7px] font-bold text-slate-400">{s.label} · {s.reps}r</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fixed Bottom Button - Keep as is */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50 pointer-events-none px-6">
        <button
onClick={() => {
  // Use the URL-derived code directly rather than the `programCode` state
  // (only set once fetchWorkoutData's Promise.all succeeds) — if that fetch
  // hadn't finished yet or partially failed, `programCode` stays "" and this
  // silently skipped updating localStorage, leaving whatever *previous*
  // workout's code was already there (e.g. one actually purchased) — so
  // viewWorkoutSession would show that other workout's real unlock status
  // under this one's title.
  const code = programUuid || (workoutId ? String(workoutId) : programCode);
  if (code) localStorage.setItem("workoutProgramCode", code);
  const title = workoutTitle || workoutKey || "";
  if (title) localStorage.setItem("workoutTitle", title);
  // Appending the code also guarantees a distinct URL per workout, so
  // Next's client router cache can't reuse a previously-mounted
  // viewWorkoutSession instance (and its stale purchase state) for a
  // different workout when the destination path would otherwise be identical.
  router.push(`/workout/viewWorkoutSession${code ? `?code=${encodeURIComponent(code)}` : ""}`);
}}          className="pointer-events-auto w-full max-w-[280px] md:max-w-xs bg-violet-600 hover:bg-violet-700 text-white py-4 rounded-full font-black text-[10px] uppercase tracking-[0.25em] shadow-2xl shadow-violet-300/50 flex items-center justify-center gap-2.5 transition-all active:scale-90 border border-white/10">
          <Eye className="w-4 h-4" strokeWidth={4} /> View Workout
        </button>
      </div>

      {/* ADD TO QUEUE MODAL */}
      {showAddToQueueModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[3px] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-[360px] rounded-[24px] shadow-2xl relative p-7">

            {/* Close */}
            <button
              onClick={() => setShowAddToQueueModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
            >
              <X size={14} />
            </button>

            {/* Title */}
            <h2 className="text-[18px] font-black text-gray-900 text-center mb-3">
              Add to Queue:
            </h2>

            {/* Subtitle */}
            <p className="text-[13px] text-gray-400 text-center italic leading-snug mb-6">
              This workout is already in your Queue. Would you like to add it again?
            </p>

            {/* Supplemental checkbox */}
            <label className="flex items-center gap-3 mb-6 cursor-pointer">
              <input
                type="checkbox"
                checked={includeSupplemental}
                onChange={(e) => setIncludeSupplemental(e.target.checked)}
                className="w-4 h-4 rounded accent-[#6D28D9] cursor-pointer"
              />
              <span className="text-[13px] text-gray-700 font-medium">Include Supplemental Workouts</span>
            </label>

         {/* Add to top */}
<button
  disabled={addingToQueue}
  onClick={async () => {
    const title = workoutTitle || localStorage.getItem("workoutTitle");
    if (!title) {
      alert("Unable to add to queue. Please go back and try again.");
      return;
    }
    setAddingToQueue(true);
    try {
      const { addWorkoutToQueue } = await import("@/api/programs/route");
      await addWorkoutToQueue({
        workoutTitle: title,
        type: "Workout",
        priority: "top",
        includeSupplemental,
      });
      setShowAddToQueueModal(false);
      router.push("/workout");
    } catch (err) {
      console.error("Failed to add to queue:", err);
    } finally {
      setAddingToQueue(false);
    }
  }}
  className="w-full bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-black py-4 rounded-2xl text-[13px] mb-3 transition disabled:opacity-60"
>
  {addingToQueue ? "Adding..." : "Add workout in the queue again"}
</button>

{/* Add to bottom */}
<button
  disabled={addingToQueue}
  onClick={async () => {
    const title = workoutTitle || localStorage.getItem("workoutTitle");
    if (!title) {
      alert("Unable to add to queue. Please go back and try again.");
      return;
    }
    setAddingToQueue(true);
    try {
      const { addWorkoutToQueue } = await import("@/api/programs/route");
      await addWorkoutToQueue({
        workoutTitle: title,
        type: "Workout",
        priority: "bottom",
        includeSupplemental,
      });
      setShowAddToQueueModal(false);
      router.push("/workout");
    } catch (err) {
      console.error("Failed to add to queue:", err);
    } finally {
      setAddingToQueue(false);
    }
  }}
  className="w-full bg-black hover:bg-gray-900 text-white font-black py-4 rounded-2xl text-[13px] mb-5 transition disabled:opacity-60"
>
  Add to Queue (Bottom)
</button>

            {/* View Queue link */}
            <div className="text-center">
              <button
                onClick={() => { setShowAddToQueueModal(false); router.push("/workout"); }}
                className="text-[#3b82f6] font-black text-[13px] underline underline-offset-2 hover:opacity-80 transition"
              >
                View Queue
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}