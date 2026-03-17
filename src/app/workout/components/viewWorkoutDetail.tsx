"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Play } from "lucide-react";

export default function ViewWorkoutPage() {
  const router = useRouter();

  const warmup = [
    { name: "Band-Resisted Row-to-Squat", reps: "12-15" },
    { name: "Floor Groin Flow", reps: "8/e" },
    { name: "Band-Resisted Crossover Step Up", reps: "8/e" },
  ];

  const round1 = [
    { name: "Box SL Depth Squat", reps: "15/e" },
    { name: "Barbell Back Squat", reps: "8-12" },
    { name: "Dumbbell RDL", reps: "20" },
  ];

  const round2 = [
    { name: "Balance Pad Adduction", reps: "15-20" },
    { name: "Band-Resisted Lateral Walk", reps: "20/e" },
    { name: "Dumbbell Goblet Squat", reps: "12-15" },
  ];

  const ExerciseCard = ({ ex, index }: any) => (
    <div className="flex items-center gap-4 bg-[#1e1e2e] rounded-xl p-4 shadow-lg border border-white/5 hover:bg-[#252538] transition-all group">
      <div className="w-10 h-10 bg-[#7c3aed]/20 rounded-lg flex items-center justify-center font-bold text-[#7c3aed] text-sm border border-[#7c3aed]/30 group-hover:bg-[#7c3aed] group-hover:text-white transition-colors">
        {index + 1}
      </div>

      <div className="flex-1">
        <p className="font-bold text-white text-sm sm:text-base">{ex.name}</p>
        <p className="text-xs text-gray-400 mt-0.5 uppercase tracking-wider font-semibold">{ex.reps}</p>
      </div>
      
      <div className="w-1.5 h-8 bg-[#2a2a3e] rounded-full group-hover:bg-[#7c3aed] transition-colors" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f4f4f8] font-['DM_Sans',_sans-serif] text-[#1a1a2e] pb-20">

      {/* MATCHED HEADER */}
      <div className="bg-white border-b border-[#e8e8f0] px-4 py-3.5 sm:py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          
          <div className="flex items-center gap-2 sm:gap-3.5">
            <button
              onClick={() => router.back()}
              className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] rounded-full flex items-center justify-center text-white flex-shrink-0 shadow-sm"
            >
              <ArrowLeft size={18} />
            </button>

            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-[#7c3aed] m-0">FORMULA A.1</h1>
              <p className="text-[10px] sm:text-xs text-[#999] font-bold uppercase tracking-widest m-0">LOWER BODY</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <p 
              onClick={() => router.push("/location")} 
              className="hidden md:block text-[11px] font-bold text-gray-400 uppercase tracking-tighter cursor-pointer hover:text-[#7c3aed] transition-colors"
            >
              location filter: <span className="text-gray-600">none</span>
            </p>

            <button
              onClick={() => router.push("/workout/equipmentNeeded")}
              className="bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] border-none rounded-lg text-white px-4 py-2 sm:py-2.5 font-bold flex items-center gap-2 text-xs sm:text-sm shadow-md hover:opacity-90 transition-opacity"
            >
              <Play size={16} fill="currentColor" /> Start Session
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-12">

        {/* WARMUP */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#7c3aed]" />
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">
              Warm-up <span className="text-[#7c3aed] ml-1">(1 Set)</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {warmup.map((ex, i) => (
              <ExerciseCard key={i} ex={ex} index={i} />
            ))}
          </div>
        </section>

        {/* ROUND 1 */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#7c3aed]" />
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">
              Round 1 <span className="text-[#7c3aed] ml-1">(3 Sets)</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {round1.map((ex, i) => (
              <ExerciseCard key={i} ex={ex} index={i} />
            ))}
          </div>
        </section>

        {/* ROUND 2 */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#7c3aed]" />
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">
              Round 2 <span className="text-[#7c3aed] ml-1">(3 Sets)</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {round2.map((ex, i) => (
              <ExerciseCard key={i} ex={ex} index={i} />
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}