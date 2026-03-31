"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Play, ChevronRight, Users } from "lucide-react";
import { useEffect, useState } from "react";

export default function ViewWorkoutPage() {
  const router = useRouter();

  const [location, setLocation] = useState<string | null>(null);

  useEffect(() => {
    const savedLocation = localStorage.getItem("selectedLocation");
    if (savedLocation) setLocation(savedLocation);
  }, []);

  const warmup = [
    { name: "Band-Resisted Row-to-Squat", reps: "12-15" },
    { name: "Floor Groin Flow", reps: "8/e" },
    { name: "Band-Resisted Crossover Step Up", reps: "8/e" },
  ];

  const round1 = [
    { name: "Box SL Depth Squat", reps: "15/e" },
    { name: "Barbell Back Squat", reps: "8-12", notes: ["@12 EL", "@12 EL", "@10 EL"] },
    { name: "Dumbbell RDL", reps: "20" },
  ];

  const round2 = [
    { name: "Balance-Pad Adduction", reps: "15-20" },
    { name: "Band-Resisted \"X\" Lateral Walk", reps: "20/e" },
    { name: "Dumbbell Goblet Squat", reps: "12-15" },
  ];

  const ExerciseCard = ({ ex }: any) => (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center hover:shadow-md transition">
      
      <div className="w-14 h-14 bg-[#222] rounded-full mb-4 flex items-center justify-center shadow-inner">
        <div className="w-8 h-8 bg-[#333] rounded-full" />
      </div>

      <h3 className="text-[14px] font-bold text-gray-800 mb-3 h-10 flex items-center">
        {ex.name}
      </h3>

      <p className="text-2xl font-black text-gray-900 tracking-tight">
        {ex.reps}
      </p>

      {ex.notes && (
        <div className="flex gap-2 mt-3 flex-wrap justify-center">
          {ex.notes.map((note: string, i: number) => (
            <span
              key={i}
              className="text-[9px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded uppercase"
            >
              {note}
            </span>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 pb-20">
      
      {/* HEADER */}
      <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button onClick={() => router.back()} className="text-gray-900">
            <ArrowLeft size={22} strokeWidth={2.5} />
          </button>

          <div>
            <h1 className="text-xl font-black text-[#3b82f6] tracking-tight leading-none uppercase">
              Formula-1
            </h1>
            <p className="text-[10px] font-black text-gray-900 mt-1 uppercase tracking-tight">
              Lower Body
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
      <div className="max-w-7xl mx-auto px-6 mb-10 flex justify-end gap-3">
        
        {/* Location */}
        <button
          onClick={() => router.push("/location")}
          className="bg-[#6d28d9] text-white px-6 py-2.5 rounded-lg font-semibold flex items-center gap-2 text-sm hover:bg-[#5b21b6] transition-colors"
        >
          Select Location <ChevronRight size={16} />
        </button>

        {/* Start Session (ALWAYS ENABLED) */}
        <button
          onClick={() => {
            // optional: you can pass location later if needed
            router.push("/workout/equipmentNeeded");
          }}
          className="bg-[#3b82f6] text-white px-6 py-2.5 rounded-lg font-semibold flex items-center gap-2 text-sm hover:bg-[#2563eb] transition-colors"
        >
          <Play size={16} fill="currentColor" /> Start Session
        </button>
      </div>

      {/* WORKOUT SECTIONS */}
      <div className="max-w-7xl mx-auto px-6 space-y-14">
        
        {/* WARMUP */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-1 w-6 bg-orange-400 rounded-full" />
            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Warm-up (1x)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {warmup.map((ex, i) => (
              <ExerciseCard key={i} ex={ex} />
            ))}
          </div>
        </section>

        {/* ROUND 1 */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-1 w-6 bg-purple-500 rounded-full" />
            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Round 1 (3x)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {round1.map((ex, i) => (
              <ExerciseCard key={i} ex={ex} />
            ))}
          </div>
        </section>

        {/* ROUND 2 */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-1 w-6 bg-emerald-500 rounded-full" />
            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Round 3 (3x)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {round2.map((ex, i) => (
              <ExerciseCard key={i} ex={ex} />
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}