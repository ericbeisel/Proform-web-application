"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Play, ChevronRight, Users, Lock, FileText, X, Dumbbell, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getProgramExercises, Exercise } from "@/api/programs/route";

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
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [workoutTitle, setWorkoutTitle] = useState<string>("");
  const isLocked = !hasPurchased;

  useEffect(() => {
    const savedLocation = localStorage.getItem("selectedLocation");
    if (savedLocation) setLocation(savedLocation);

    const programCode = localStorage.getItem("workoutProgramCode");
    const title = localStorage.getItem("workoutTitle");
    if (title) setWorkoutTitle(title);

    const isFree = localStorage.getItem("workoutIsFree");
    if (isFree === "true") setHasPurchased(true);

    if (!programCode) {
      setLoading(false);
      return;
    }

    getProgramExercises(programCode, 1, 100)
      .then((res) => setExercises(res.data || []))
      .catch((err) => console.error("Failed to fetch exercises:", err))
      .finally(() => setLoading(false));
  }, []);

const ExerciseCard = ({
  ex,
  locked = false,
}: {
  ex: Exercise;
  locked?: boolean;
}) => (
  <div
    className={`relative bg-white rounded-2xl p-3 sm:p-5 border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center transition min-h-[160px] sm:min-h-[180px] ${
      locked ? "opacity-60 blur-[1px] pointer-events-none" : "hover:shadow-md"
    }`}
  >
    {locked && (
      <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center">
        <Lock size={14} className="text-purple-600" />
      </div>
    )}

    <div className="w-14 h-14 bg-[#efefef] rounded-2xl mb-4 overflow-hidden flex items-center justify-center">
      {ex.demoGif ? (
        <img src={resolveWixImage(ex.demoGif)} alt={ex.name} className="w-full h-full object-cover" />
      ) : (
        <Dumbbell className="w-6 h-6 text-gray-400" />
      )}
    </div>

    <h3 className="text-[11px] sm:text-[13px] font-bold text-gray-800 mb-2 sm:mb-3 leading-tight line-clamp-2 text-center">
      {ex.name}
    </h3>

    {ex.supplemental && (
      <span className="text-[9px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded uppercase">
        {ex.supplemental}
      </span>
    )}
  </div>
);

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 pb-2">
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
      {/* HEADER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between">
        {/* LIVE SESSION BANNER */}
{/* LIVE SESSION BANNER */}

        <div className="flex items-center gap-6">
          <button onClick={() => router.back()} className="text-gray-900">
            <ArrowLeft size={22} strokeWidth={2.5} />
          </button>

          <div>
            <h1 className="text-xl font-black text-[#3b82f6] tracking-tight leading-none uppercase">
              {workoutTitle || "Workout"}
            </h1>
            <p className="text-[10px] font-black text-gray-900 mt-1 uppercase tracking-tight">
              {exercises.length} Exercises
            </p>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-4">
          <p
            onClick={() => router.push("/location")}
            className="hidden md:block text-[11px] font-bold text-gray-400 uppercase tracking-tighter cursor-pointer hover:text-[#3b82f6] transition-colors"
          >
            location filter:{" "}
            <span className="text-gray-600">
              {location ? location : "none"}
            </span>
          </p>

          <div className="p-2 bg-gray-100 rounded-lg text-gray-400">
            <Users size={18} />
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS */}
   <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8 sm:mb-10 flex flex-wrap justify-end gap-2 sm:gap-3">
  <button
    onClick={() => router.push("/location")}
    className="bg-[#6d28d9] text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-semibold flex items-center gap-2 text-xs sm:text-sm hover:bg-[#5b21b6] transition-colors"
  >
    Select Location <ChevronRight size={14} />
  </button>

  {!isLocked ? (
    <button
      onClick={() => router.push("/workout/equipmentNeeded")}
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

  {/* <button
    onClick={() => router.push("/workout/athenaWorkout")}
    className="w-9 h-9 sm:w-11 sm:h-11 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition"
  >
    <Play size={16} fill="currentColor" />
  </button> */}
</div>
      {/* WORKOUT SECTIONS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10 sm:space-y-14">

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        ) : (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-1 w-6 bg-purple-500 rounded-full" />
              <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Exercises
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
              {exercises.slice(0, 3).map((ex, i) => (
                <ExerciseCard key={ex.id || i} ex={ex} />
              ))}
              {(isLocked ? exercises.slice(3, 6) : exercises.slice(3)).map((ex, i) => (
                <ExerciseCard key={ex.id || i} ex={ex} locked={isLocked} />
              ))}
            </div>

            {isLocked && exercises.length > 3 && (
              <div className="flex justify-center mt-6 relative z-20">
                <div className="bg-white shadow-2xl border border-purple-100 rounded-3xl px-5 sm:px-10 py-8 sm:py-10 text-center max-w-xl w-full">
                  <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-gradient-to-br from-purple-100 to-violet-200 flex items-center justify-center">
                    <Lock size={34} className="text-purple-700" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-purple-700 mb-3">
                    Unlock Full Program
                  </h2>
                  <p className="text-sm text-gray-500 leading-relaxed mb-6">
                    Get access to all exercises, detailed form videos,
                    progression systems, and advanced athlete coaching tools.
                  </p>
                  <button
                    onClick={() => setShowPurchaseModal(true)}
                    className="bg-gradient-to-r from-purple-600 to-violet-600 text-white font-black px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition flex items-center gap-3 mx-auto"
                  >
                    Buy Workout
                    <Lock size={18} />
                  </button>
                </div>
              </div>
            )}
          </section>
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
      </div>
    </div>
  );
}