"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronRight, Users, Lock, FileText, X, Dumbbell, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getProgramGroupedWorkouts, WorkoutGroup, WorkoutGroupItem } from "@/api/programs/route";

function resolveWixImage(url?: string): string {
  if (!url) return "";
  if (url.startsWith("wix:image://v1/")) {
    const mediaId = url.replace("wix:image://v1/", "").split("#")[0].split("/")[0];
    return `https://static.wixstatic.com/media/${mediaId}`;
  }
  return url;
}

export default function ViewWorkoutPage() {
  const router = useRouter();
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [location, setLocation] = useState<string | null>(null);
  const [workoutGroups, setWorkoutGroups] = useState<WorkoutGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [workoutTitle, setWorkoutTitle] = useState<string>("");
  const [filterByLocation, setFilterByLocation] = useState(false);
  const isLocked = !hasPurchased;
  const [sessionStarted, setSessionStarted] = useState(false);
  const [trackingItem, setTrackingItem] = useState<WorkoutGroupItem | null>(null);
  const [sets, setSets] = useState<{ weight: string; reps: string }[]>([{ weight: "", reps: "" }]);

  const addSet = () => setSets((prev) => [...prev, { weight: "", reps: "" }]);
  const removeSet = (i: number) => setSets((prev) => prev.filter((_, idx) => idx !== i));
  const updateSet = (i: number, field: "weight" | "reps", val: string) =>
    setSets((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: val } : s)));

  const openTracking = (item: WorkoutGroupItem) => {
    setTrackingItem(item);
    setSets([{ weight: "", reps: "" }]);
  };

  const totalExercises = workoutGroups.reduce((sum, g) => sum + g.workouts.length, 0);

  useEffect(() => {
    const savedLocation = localStorage.getItem("selectedLocation");
    if (savedLocation) setLocation(savedLocation);

    const programCode = localStorage.getItem("workoutProgramCode");
    const title = localStorage.getItem("workoutTitle");
    if (title) setWorkoutTitle(title);

    const isFree = localStorage.getItem("workoutIsFree");
    if (isFree === "true") setHasPurchased(true);

    const activeSession = localStorage.getItem(`activeSessionId_${programCode}`);
    if (activeSession) setSessionStarted(true);


    if (!programCode) {
      setLoading(false);
      return;
    }

    getProgramGroupedWorkouts(programCode)
      .then((res) => setWorkoutGroups(Array.isArray(res) ? res : []))
      .catch((err) => console.error("Failed to fetch grouped workouts:", err))
      .finally(() => setLoading(false));
  }, []);

const ExerciseCard = ({
  item,
  locked = false,
  onEdit,
  sessionStarted = false,
}: {
  item: WorkoutGroupItem;
  locked?: boolean;
  onEdit?: (item: WorkoutGroupItem) => void;
  sessionStarted?: boolean;
}) => (
  <div className={`relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex flex-col text-center transition ${locked ? "opacity-60 blur-[1px] pointer-events-none" : "hover:shadow-md"}`}>
    {/* GIF */}
    <div className="w-full flex justify-center pt-4 pb-2">
      <div className="w-28 h-28 bg-[#efefef] rounded-2xl overflow-hidden flex items-center justify-center">
        {item.demo_gif ? (
          <img src={resolveWixImage(item.demo_gif)} alt={item.exercise_name} className="w-full h-full object-cover" />
        ) : (
          <Dumbbell className="w-7 h-7 text-gray-300" />
        )}
      </div>
    </div>

    {/* order badge */}
    <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-purple-600/80 backdrop-blur-sm flex items-center justify-center">
      <span className="text-[9px] font-black text-white">{item.order}</span>
    </div>

    {/* edit button — only visible during an active session */}
    {!locked && sessionStarted && (
      <button
        onClick={(e) => { e.stopPropagation(); onEdit?.(item); }}
        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white shadow flex items-center justify-center hover:bg-purple-50 transition"
      >
        <Pencil size={12} className="text-purple-600" />
      </button>
    )}

    {locked && (
      <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 shadow flex items-center justify-center">
        <Lock size={13} className="text-purple-600" />
      </div>
    )}

    {/* text below gif */}
    <div className="px-3 py-3 flex flex-col items-center">
      <h3 className="text-[11px] sm:text-[13px] font-bold text-gray-800 mb-2 leading-tight line-clamp-2 text-center">
        {item.exercise_name}
      </h3>

      <div className="flex flex-wrap gap-1 justify-center">
        {item.reps && (
          <span className="text-[9px] font-bold bg-blue-50 text-blue-500 px-2 py-0.5 rounded uppercase">
            {item.reps}
          </span>
        )}
        {item.supplemental && (
          <span className="text-[9px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded uppercase">
            {item.supplemental}
          </span>
        )}
      </div>
    </div>
  </div>
);

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 pb-20">

      {/* STICKY HEADER */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          {/* Row 1: back + title + right controls */}
          <div className="py-4 sm:py-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-6">
              <button onClick={() => router.back()} className="text-gray-900">
                <ArrowLeft size={22} strokeWidth={2.5} />
              </button>
              <div>
                <h1 className="text-xl font-black text-[#3b82f6] tracking-tight leading-none uppercase">
                  {workoutTitle || "Workout"}
                </h1>
                <p className="text-[10px] font-black text-gray-900 mt-1 uppercase tracking-tight">
                  {totalExercises} Exercises
                </p>
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="flex items-center gap-4 flex-wrap justify-end">
              <label className="hidden md:flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterByLocation}
                  onChange={(e) => setFilterByLocation(e.target.checked)}
                  className="w-3.5 h-3.5 accent-[#3b82f6] cursor-pointer"
                />
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-tighter">
                  Show exercises based on default location
                </span>
              </label>
              <p
                onClick={() => router.push("/location")}
                className="hidden md:block text-[11px] font-bold text-gray-400 uppercase tracking-tighter cursor-pointer hover:text-[#3b82f6] transition-colors"
              >
                location filter:{" "}
                <span className="text-gray-600">{location ? location : "none"}</span>
              </p>

              {/* <button onClick={() => router.push("/location")} className="bg-[#6d28d9] text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-semibold flex items-center gap-2 text-xs sm:text-sm hover:bg-[#5b21b6] transition-colors">Select Location <ChevronRight size={14} /></button> */}

              {!isLocked ? (
                <button
                  onClick={() => {
                    const code = localStorage.getItem("workoutProgramCode") || "unknown";
                    const sessionId = Math.random().toString(36).substring(2, 8).toUpperCase();
                    localStorage.setItem(`activeSessionId_${code}`, sessionId);
                    setSessionStarted(true);
                    router.push("/workout/equipmentNeeded");
                  }}
                  className="bg-[#3b82f6] text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-semibold flex items-center gap-2 text-xs sm:text-sm hover:bg-[#2563eb] transition-colors"
                >
                  Start Session
                </button>
              ) : (
                <button
                  onClick={() => setShowPurchaseModal(true)}
                  className="bg-[#6d28d9] text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-semibold flex items-center gap-2 text-xs sm:text-sm hover:bg-[#5b21b6] transition-colors"
                >
                  Buy Session <Lock size={14} />
                </button>
              )}

              {/* <button onClick={() => router.push("/workout/athenaWorkout")} className="w-9 h-9 sm:w-11 sm:h-11 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition"><Play size={16} fill="currentColor" /></button> */}

              <div className="p-2 bg-gray-100 rounded-lg text-gray-400">
                <Users size={18} />
              </div>
            </div>
          </div>

          {/* Row 2: Rejoin Live Session */}
          <div className="pb-3 sm:pb-4">
            <div className="bg-gradient-to-r from-[#ff6b6b] to-[#ff5757] rounded-2xl px-4 sm:px-5 py-3 sm:py-4 flex items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-3 min-w-0">
                <div className="min-w-0">
                  <h3 className="text-white font-semibold text-xs sm:text-sm leading-none truncate">
                    Rejoin Live Session: Bdb377
                  </h3>
                  <p className="text-white/90 text-[10px] mt-1 font-medium">
                    Started 3/26/2026, 4:44 AM
                  </p>
                </div>
              </div>
              <button
                onClick={() => router.push("/workout/liveSession")}
                className="bg-white hover:bg-gray-100 transition px-4 sm:px-6 py-2 rounded-xl text-[#ef4444] text-xs font-bold shadow-sm flex-shrink-0"
              >
                Go To Session
              </button>
            </div>
          </div>

        </div>
      </div>
      {/* WORKOUT SECTIONS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-6">

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        ) : (
          <>
            <div className="space-y-10 sm:space-y-14">
              {workoutGroups.map((group, groupIdx) => {
                const isGroupLocked = isLocked && groupIdx > 0;
                const previewItems = isGroupLocked ? group.workouts.slice(0, 3) : group.workouts;

                return (
                  <section key={`${group.label}-${groupIdx}`}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-1 w-6 bg-purple-500 rounded-full" />
                      <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{group.label}</h2>
                      {group.rounds && <span className="text-[10px] font-bold text-gray-300 uppercase">{group.rounds}</span>}
                      {isGroupLocked && <Lock size={12} className="text-gray-300 ml-auto" />}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
                      {previewItems.map((item, i) => (
                        <ExerciseCard key={item.exercise_id || i} item={item} locked={isGroupLocked} onEdit={openTracking} sessionStarted={sessionStarted} />
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
          </>
        )}
{/* PURCHASE MODAL */}
{showPurchaseModal && (
  <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-[3px] flex items-center justify-center p-3">

    <div className="bg-white w-full max-w-[420px] rounded-[24px] shadow-2xl relative overflow-hidden">

      {/* CLOSE */}
      <button
        onClick={() => setShowPurchaseModal(false)}
        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
      >
        <X size={14} />
      </button>

      <div className="px-5 py-6">

        {/* ICON */}
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-[18px] bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-md relative">

            <FileText size={22} className="text-white" />

            {/* BLUE BADGE */}
            <div className="absolute -right-1 -bottom-1 w-6 h-6 rounded-full bg-blue-500 border-[3px] border-white" />
          </div>
        </div>

        {/* TITLE */}
        <h2 className="text-[19px] font-black text-center text-gray-900 leading-snug">
          You don’t have access to this
          <br />
          workout or program
        </h2>

        {/* TEXT */}
        <p className="text-center text-gray-500 mt-3 text-[13px]">
          Purchase this Workout / Program
        </p>

        <p className="text-center text-gray-400 text-[11px] mt-1">
          (Expires in 30 days)
        </p>

        {/* BUTTON */}
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

        {/* DIVIDER */}
        <div className="border-t border-gray-200 my-5" />

        {/* PACKAGE CARD */}
        <div className="bg-[#faf7ff] border border-purple-100 rounded-[20px] p-4 text-center">

          {/* BADGE */}
          <div className="inline-flex items-center justify-center px-4 py-1 rounded-full bg-[#ff6b2c] text-white font-black text-[11px] mb-4">
            OPM
          </div>

          {/* DESCRIPTION */}
          <p className="text-gray-500 leading-relaxed text-[12px]">
            You can access this program and all other workouts/programs
            in this package by purchasing a Franchise License.
          </p>

          {/* SUBTEXT */}
          <p className="text-gray-400 text-[11px] mt-5">
            View details and options below:
          </p>

          {/* OPTIONS */}
          <button
            className="mt-4 text-[#00b7ff] font-black hover:opacity-80 transition inline-flex items-center gap-1.5 text-[13px]"
          >
            Other options
            <ChevronRight size={14} />
          </button>
        </div>

        {/* FRANCHISE */}
        <div className="text-center mt-5">
          <button
            className="text-[#3b82f6] font-black hover:opacity-80 transition inline-flex items-center gap-1.5 text-[13px]"
          >
            View Franchise Details
            <ChevronRight size={14} />
          </button>
        </div>

      </div>
    </div>
  </div>
)}

{/* EXERCISE TRACKING MODAL */}
{trackingItem && (
  <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[3px] flex items-end sm:items-center justify-center p-0 sm:p-4">
    <div className="bg-white w-full sm:max-w-[480px] rounded-t-[28px] sm:rounded-[28px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

      {/* Header */}
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

        {/* GIF + Exercise name */}
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

        {/* Last / Best boxes */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-2xl p-4 text-center border border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Last</p>
            <p className="text-[12px] font-bold text-gray-500">No records yet</p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-4 text-center border border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Best</p>
            <p className="text-[12px] font-bold text-gray-500">No records yet</p>
          </div>
        </div>

        {/* Suggested box */}
        <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-1">Suggested</p>
            <p className="text-[13px] font-black text-purple-700">{trackingItem.reps || "1x 8/e"}</p>
          </div>
          <div className="text-right">
            <p className="text-[13px] font-black text-purple-700">3 kg</p>
          </div>
        </div>

        <p className="text-[11px] text-gray-400 text-center">
          Log your reps and weight to better track your progress
        </p>

        {/* Add custom exercise button */}
        <button className="w-full border border-gray-200 rounded-xl py-2.5 text-[12px] font-bold text-gray-600 hover:bg-gray-50 transition">
          Add custom exercise Standard
        </button>

        {/* Sets */}
        <div className="space-y-3">
          {sets.map((set, i) => (
            <div key={i} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Set {i + 1}</span>
                {sets.length > 1 && (
                  <button onClick={() => removeSet(i)} className="text-gray-300 hover:text-red-400 transition">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3">
                {/* Weight */}
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 pl-1">Weight (lbs)</p>
                  <input
                    type="number"
                    value={set.weight}
                    onChange={(e) => updateSet(i, "weight", e.target.value)}
                    placeholder="0"
                    className="w-full bg-white rounded-xl border border-gray-200 px-3 py-2.5 text-[15px] font-bold text-gray-800 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition placeholder:text-gray-300"
                  />
                </div>
                <X size={12} className="text-gray-300 flex-shrink-0 mt-5" />
                {/* Reps */}
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 pl-1">Reps /e</p>
                  <input
                    type="number"
                    value={set.reps}
                    onChange={(e) => updateSet(i, "reps", e.target.value)}
                    placeholder="0"
                    className="w-full bg-white rounded-xl border border-gray-200 px-3 py-2.5 text-[15px] font-bold text-gray-800 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition placeholder:text-gray-300"
                  />
                </div>
              </div>
              <button className="mt-3 w-full bg-white border border-gray-200 rounded-xl py-2 text-[11px] font-bold text-gray-600 hover:bg-gray-100 transition">
                Save
              </button>
            </div>
          ))}
        </div>

        {/* Add set button */}
        <button
          onClick={addSet}
          className="w-full border-2 border-dashed border-purple-200 rounded-2xl py-3 flex items-center justify-center gap-2 text-[12px] font-bold text-purple-500 hover:bg-purple-50 transition"
        >
          <Plus size={15} />
          Add Set
        </button>

      </div>

      {/* Footer buttons */}
      <div className="px-5 py-4 border-t border-gray-100 flex flex-col gap-2 flex-shrink-0">
        <button
          onClick={() => setTrackingItem(null)}
          className="w-full bg-gradient-to-r from-purple-600 to-violet-600 text-white font-black py-3 rounded-xl text-[13px] hover:opacity-90 transition"
        >
          Save
        </button>
        <button
          onClick={() => setTrackingItem(null)}
          className="w-full bg-gray-50 border border-gray-200 text-gray-700 font-bold py-3 rounded-xl text-[12px] hover:bg-gray-100 transition"
        >
          Save and Add custom exercise Standard
        </button>
      </div>

    </div>
  </div>
)}
      </div>
    </div>
  );
}