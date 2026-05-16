"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft, Share2, Bookmark, X,
  Dumbbell, Zap, Plus, ChevronRight, ChevronLeft, Loader2
} from "lucide-react";
import { getProgramExercises, getProgramEquipment, getProgramPowerSets, getProgramWorkoutStats, getProgramIdByCode, Exercise, Equipment, PowerSet, WorkoutStats } from "@/api/programs/route";
interface WorkoutDetailProps {
  workoutId?: number | string;
  onClose?: () => void;
}

export default function ResponsiveWorkoutUI({ workoutId, onClose }: WorkoutDetailProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const programUuid = searchParams.get('code');
  const workoutKey = searchParams.get('workoutKey');
  
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [powerSets, setPowerSets] = useState<PowerSet[]>([]);
  const [workoutStats, setWorkoutStats] = useState<WorkoutStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workoutTitle, setWorkoutTitle] = useState<string>("");
  const [programCode, setProgramCode] = useState<string>("");
  const [programId, setProgramId] = useState<string>("");
  const [showAddToQueueModal, setShowAddToQueueModal] = useState(false);
  const [includeSupplemental, setIncludeSupplemental] = useState(false);
  const [addingToQueue, setAddingToQueue] = useState(false);
  const exerciseScrollRef = useRef<HTMLDivElement>(null);
  const powerSetScrollRef = useRef<HTMLDivElement>(null);

  // Add this line at the top of the component, before any hooks
console.log("=== WorkoutDetail mount ===");
console.log("localStorage workoutProgramId:", typeof window !== 'undefined' ? localStorage.getItem("workoutProgramId") : "SSR");
console.log("programUuid from URL:", programUuid);

  const scrollExercises = (dir: "left" | "right") => {
    const el = exerciseScrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "right" ? 220 : -220, behavior: "smooth" });
  };

  const scrollPowerSets = (dir: "left" | "right") => {
    const el = powerSetScrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "right" ? 220 : -220, behavior: "smooth" });
  };
  


  // Dummy data for static UI elements
  const dummyStats = [
    { label: 'Load', value: '97' },
    { label: 'Duration', value: '31:30' },
    { label: 'Movements', value: '24' }
  ];

  const dummyRecentlyCompleted = ['JD', 'SK', 'AM', 'LW', 'RG', 'TP', 'MK', 'BC'];

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

      if (workoutKey) setWorkoutTitle(workoutKey);

      // ← Read from localStorage first (set by programs/[id]/page.tsx)
      const storedId = localStorage.getItem("workoutProgramId");
      if (storedId) {
        console.log("✅ Program UUID from localStorage:", storedId);
        setProgramId(storedId);
      } else {
        console.warn("⚠️ No workoutProgramId in localStorage");
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

  // Get unique equipment names
  const uniqueEquipment = [...new Map(equipment.map(item => [item.name, item])).values()];

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
    <div className="min-h-screen bg-white font-sans text-slate-900 pb-32 overflow-x-hidden">
      
      <div className="max-w-[1200px] mx-auto p-4 md:p-8">
        
        {/* Navigation Row */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => onClose ? onClose() : router.back()}
            className="p-2 bg-slate-50 rounded-full hover:bg-slate-200 transition-all active:scale-90"
          >
            <ArrowLeft className="w-[18px] h-[18px] text-slate-600" />
          </button>

          <button onClick={() => router.push("/dashboard")} className="active:scale-90 transition-all">
            <img
              src="/images/proform-logo.jpg"
              alt="Proform"
              className="w-8 h-8 rounded-full object-cover"
            />
          </button>

          <div className="flex gap-2">
            <button className="p-2.5 bg-slate-50 rounded-xl text-slate-500 hover:bg-slate-100">
              <Bookmark className="w-[18px] h-[18px]" />
            </button>
            <button className="p-2.5 bg-slate-50 rounded-xl text-slate-500 hover:bg-slate-100">
              <Share2 className="w-[18px] h-[18px]" />
            </button>
            <button
              onClick={() => onClose ? onClose() : router.back()}
              className="p-2.5 bg-slate-50 rounded-xl text-slate-500 hover:bg-slate-100"
            >
              <X className="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>

        {/* Hero Title Area */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
          <div>
            <p className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-tight">This Workout:</p>
            <h1 className="text-2xl md:text-3xl font-black text-[#6D28D9] leading-none">
              {workoutTitle || (workoutKey ? workoutKey.split(',')[0] : 'RECONDITIONING')}
            </h1>
          
            <div className="flex flex-wrap gap-1.5">
              {['Long', 'Hard', 'Hard'].map((tag, i) => (
                <span key={i} className="px-4 md:px-5 py-1.5 bg-[#00B4D8] text-white text-[9px] font-black rounded-full uppercase">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <button 
onClick={() => {
  localStorage.setItem("workoutEquipment", JSON.stringify(uniqueEquipment));
  localStorage.setItem("workoutProgramCode", programCode);
  localStorage.setItem("workoutTitle", workoutTitle);
  router.push("/workout/viewWorkout");
}}            className="w-full md:w-auto bg-[#6D28D9] text-white px-8 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-purple-100 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            View Workout <ChevronRight size={14} />
          </button>
        </div>

        {/* MAIN RESPONSIVE GRID */}
        <div className="grid grid-cols-12 gap-6 md:gap-8">
          
          <div className="col-span-12 lg:col-span-7 space-y-8">
            {/* Dummy Chart Section - Keep as is */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
                <div className="flex gap-2 mb-6">
                  <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-pink-400"></div><span className="text-[8px] font-bold text-slate-400 uppercase">Workout</span></div>
                  <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-purple-700"></div><span className="text-[8px] font-bold text-slate-400 uppercase">Player Avg</span></div>
                </div>
                <div className="flex items-end justify-between h-24 md:h-28 px-2 gap-3 md:gap-4">
                  <div className="w-full bg-purple-700 rounded-t-lg h-[60%]"></div>
                  <div className="w-full bg-purple-700 rounded-t-lg h-[75%]"></div>
                  <div className="w-full bg-purple-700 rounded-t-lg h-[90%]"></div>
                </div>
                <div className="flex justify-between mt-3 text-[8px] font-bold text-slate-300 uppercase">
                  <span>Week 1</span><span>Week 2</span><span>Week 3</span>
                </div>
              </div>

              <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm flex items-center justify-center">
                 <div className="w-28 h-28 md:w-32 md:h-32 rounded-full border-[12px] md:border-[14px] border-slate-50 relative">
                    <div className="absolute inset-[-12px] md:inset-[-14px] rounded-full" 
                         style={{ background: 'conic-gradient(#22C55E 0% 18%, #EF4444 18% 40%, #8B5CF6 40% 55%, #3B82F6 55% 82%, #D2B48C 82% 100%)' }}></div>
                    <div className="absolute inset-0 bg-white rounded-full"></div>
                 </div>
              </div>
            </div>

            {/* Dummy Stats Section */}
            <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 border border-slate-100 shadow-sm flex flex-wrap md:flex-nowrap justify-around gap-4">
              {dummyStats.map((stat, i) => (
                <div key={i} className="text-center min-w-[80px]">
                  <p className="text-3xl md:text-5xl font-black text-slate-900 leading-none">{stat.value}</p>
                  <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase mt-2 tracking-widest">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Dummy Recently Completed */}
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-900 mb-4">Recently Completed:</h3>
              <div className="flex flex-wrap gap-2 md:gap-2.5">
                {dummyRecentlyCompleted.map((name, i) => (
                  <div key={i} className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center text-[9px] md:text-[10px] font-black text-white shadow-md
                    ${i % 3 === 0 ? 'bg-indigo-400' : i % 3 === 1 ? 'bg-blue-500' : 'bg-orange-400'}`}>
                    {name}
                  </div>
                ))}
              </div>
            </div>

            {/* REAL Exercises from Backend */}
            <div className="pt-4">
              <div className="flex justify-between items-center mb-6 px-1">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-900">
                  Exercises:
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    {filteredExercises.length} total
                  </span>
                  <button
                    onClick={() => scrollExercises("left")}
                    className="p-1.5 bg-slate-50 rounded-lg hover:bg-slate-100 active:scale-90 transition-all"
                  >
                    <ChevronLeft className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                  <button
                    onClick={() => scrollExercises("right")}
                    className="p-1.5 bg-slate-50 rounded-lg hover:bg-slate-100 active:scale-90 transition-all"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                </div>
              </div>
              <div
                ref={exerciseScrollRef}
                className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory"
                style={{ scrollbarWidth: "none" }}
              >
                {filteredExercises.map((ex, i) => (
                  <div
                    key={ex.id || i}
                    className="snap-start shrink-0 w-[110px] bg-white rounded-[1.5rem] p-4 shadow-sm border border-slate-50 flex flex-col items-center text-center"
                  >
                    <div className="w-11 h-11 rounded-xl mb-3 overflow-hidden bg-slate-100 border border-slate-100 shrink-0">
                      {ex.demoGif ? (
                        <img
                          src={resolveWixImage(ex.demoGif)}
                          alt={ex.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Dumbbell className="w-4 h-4 text-slate-400" />
                        </div>
                      )}
                    </div>
                    <p className="text-[8px] font-black leading-tight mb-1 uppercase line-clamp-2">
                      {ex.name}
                    </p>
                    <p className="text-[7px] font-bold text-slate-300 uppercase">
                      {ex.supplemental || 'Exercise'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-5 space-y-8">
            {/* REAL Equipment from Backend */}
            <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 border border-slate-100 shadow-sm">
              <h3 className="text-[11px] font-black mb-6 md:mb-8 uppercase tracking-widest">Eq. Needed:</h3>
              <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-5 gap-y-6 md:gap-y-8">
                {uniqueEquipment.length > 0 ? (
                  uniqueEquipment.map((item, i) => (
                    <div key={item.id || i} className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-50 rounded-xl md:rounded-2xl flex items-center justify-center border border-slate-100/50 overflow-hidden">
  {item.icon ? (
    <img src={item.icon} alt={item.name} className="w-full h-full object-cover rounded-xl" />
  ) : (
    <Dumbbell className="w-4 h-4 md:w-[18px] md:h-[18px] text-slate-400" />
  )}
</div>
                      <span className="text-[7px] md:text-[8px] font-bold text-slate-400 text-center uppercase tracking-tighter leading-tight">
                        {item.name}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="col-span-full text-center text-gray-400 text-sm">
                    No equipment required
                  </p>
                )}
              </div>
            </div>

            {/* Workout Stats */}
            {workoutStats && (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#FF8A48] rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 text-white flex flex-col justify-center min-h-[120px]">
                  <div className="flex items-center gap-1.5 mb-2 opacity-80">
                    <Zap className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Calories</span>
                  </div>
                  <p className="text-3xl md:text-5xl font-black leading-none">{workoutStats.calories}</p>
                </div>
                <div className="bg-gradient-to-br from-[#7C3AED] to-[#6366F1] rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 text-white flex flex-col justify-center min-h-[120px]">
                  <div className="flex items-center gap-1.5 mb-2 opacity-80">
                    <Zap className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Power</span>
                  </div>
                  <p className="text-3xl md:text-5xl font-black leading-none">{workoutStats.power}</p>
                </div>
              </div>
            )}

            {/* Power Sets */}
            {powerSets.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-500">
                      <Zap className="w-3 h-3" fill="currentColor" />
                    </div>
                    <span className="text-[9px] font-black uppercase text-indigo-500 tracking-widest">Power Sets</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{powerSets.length} sets</span>
                    <button onClick={() => scrollPowerSets("left")} className="p-1.5 bg-slate-50 rounded-lg hover:bg-slate-100 active:scale-90 transition-all">
                      <ChevronLeft className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                    <button onClick={() => scrollPowerSets("right")} className="p-1.5 bg-slate-50 rounded-lg hover:bg-slate-100 active:scale-90 transition-all">
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                  </div>
                </div>
                <div
                  ref={powerSetScrollRef}
                  className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory"
                  style={{ scrollbarWidth: "none" }}
                >
                  {powerSets.map((ps) => (
                    <div key={ps.id} className="snap-start shrink-0 w-[200px] bg-white rounded-[2rem] p-5 border border-slate-100 shadow-sm flex flex-col">
                      <div className="bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center text-slate-300 mb-3 border border-slate-100 overflow-hidden shrink-0">
                        {ps.demo_gif ? (
                          <img src={resolveWixImage(ps.demo_gif)} alt={ps.title_secondary} className="w-full h-full object-cover" />
                        ) : (
                          <Dumbbell className="w-6 h-6" />
                        )}
                      </div>
                      <p className="text-[8px] font-bold text-indigo-400 uppercase tracking-widest mb-0.5">{ps.title_primary}</p>
                      <p className="text-[10px] font-black uppercase leading-tight text-slate-900 mb-3">{ps.title_secondary}</p>
                      <div className="space-y-1.5 mt-auto">
                        {(ps.child_sets || []).map((s) => (
                          <div key={s.id} className="bg-slate-50 rounded-xl p-2.5 text-center border border-slate-100/80">
                            <p className="text-sm font-black text-slate-900 leading-none mb-0.5">{s.calculated_weight} {s.msrmt}</p>
                            <p className="text-[8px] font-bold text-slate-400">{s.label} · {s.reps} reps</p>
                          </div>
                        ))}
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
  console.log("=== Opening modal ===");
  console.log("programId state:", programId);
  console.log("localStorage now:", localStorage.getItem("workoutProgramId"));
  setShowAddToQueueModal(true);
}}          className="pointer-events-auto w-full max-w-[280px] md:max-w-xs bg-[#6D28D9] text-white py-4 rounded-full font-black text-[10px] uppercase tracking-[0.25em] shadow-2xl shadow-purple-400/50 flex items-center justify-center gap-2.5 transition-all active:scale-90 border border-white/10 hover:bg-[#5B21B6]">
          <Plus className="w-4 h-4" strokeWidth={4} /> Add to Queue
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

         {/* Add workout again */}
<button
  disabled={addingToQueue}
  onClick={async () => {
    const resolvedProgramId = programId || localStorage.getItem("workoutProgramId");
    if (!resolvedProgramId) {
      alert("Unable to add to queue. Please go back and try again.");
      return;
    }
    setAddingToQueue(true);
    try {
      const { startProgram } = await import("@/api/programs/route");
      await startProgram({ 
        programId: resolvedProgramId,
        type: "Workout", 
        addSuggested: includeSupplemental ? 1 : 0 
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
    const resolvedProgramId = programId || localStorage.getItem("workoutProgramId");
    if (!resolvedProgramId) {
      alert("Unable to add to queue. Please go back and try again.");
      return;
    }
    setAddingToQueue(true);
    try {
      const { startProgram } = await import("@/api/programs/route");
      await startProgram({ 
        programId: resolvedProgramId,
        type: "Workout", 
        addSuggested: includeSupplemental ? 1 : 0 
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