"use client";

import { useState } from "react";
import { ArrowLeft, ChevronRight, Zap, Plus, BarChart2, X, Clock, Dumbbell, Activity, Target } from "lucide-react";
import { useRouter } from "next/navigation";

interface WorkoutDetailProps {
  workoutId?: number | string;
  onClose?: () => void;
}

interface PowerSet {
  set: number;
  reps: number;
  weight: number;
  unit: string;
}

export default function WorkoutDetail({ workoutId, onClose }: WorkoutDetailProps) {
  const router = useRouter();
const [powerSets, setPowerSets] = useState<PowerSet[]>([
  { set: 1, reps: 6, weight: 10, unit: "kg" },
  { set: 2, reps: 6, weight: 10, unit: "kg" },
  { set: 3, reps: 7, weight: 10, unit: "kg" },
]);

  return (
    <div className="min-h-screen bg-[#f4f4f8] font-['DM_Sans',_sans-serif] text-[#1a1a2e] pb-32 relative">
      
      {/* HEADER */}
      <div className="bg-white border-b border-[#e8e8f0] px-4 py-3.5 sm:py-4 sticky top-0 z-30">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => onClose ? onClose() : router.back()}
              className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] rounded-full flex items-center justify-center text-white flex-shrink-0 shadow-sm transition-transform active:scale-95"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-[#7c3aed] m-0 leading-tight">FORMULA A.1</h1>
              <p className="text-[10px] sm:text-xs text-[#999] font-bold uppercase tracking-[0.15em] m-0">LOWER BODY</p>
            </div>
          </div>
          
          <button
            onClick={() => router.push("/workout/viewWorkout")}
            className="bg-indigo-50 text-[#7c3aed] hover:bg-[#7c3aed] hover:text-white px-4 py-2 rounded-full font-bold flex items-center gap-2 text-xs sm:text-sm transition-all border border-indigo-100 shadow-sm"
          >
            View Workout <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        
        {/* STATS ROW */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
          {[
            { label: "Load", value: "85", icon: <Dumbbell size={14} /> },
            { label: "Duration", value: "27:30", icon: <Clock size={14} /> },
            { label: "Movements", value: "20", icon: <Activity size={14} /> }
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center flex flex-col items-center">
              <div className="w-7 h-7 bg-[#7c3aed]/10 rounded-full flex items-center justify-center text-[#7c3aed] mb-2">
                {stat.icon}
              </div>
              <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-tighter mb-0.5">{stat.label}</p>
              <p className="text-xl sm:text-2xl font-black text-[#1a1a2e]">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* CHARTS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* LOAD CHART - Now colorful purple-to-pink gradients */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-extrabold text-[#1a1a2e] flex items-center gap-2">
                <BarChart2 size={18} className="text-[#7c3aed]" /> Load per Exercise
              </h3>
            </div>
            <div className="h-48 flex items-end justify-between px-2 gap-4">
              {[
                {h: 40, from: "#a855f7", to: "#ec4899"}, // purple to pink
                {h: 70, from: "#ec4899", to: "#ec4899"}, // pink
                {h: 25, from: "#a855f7", to: "#a855f7"}, // purple
                {h: 55, from: "#7c3aed", to: "#a855f7"}, // indigo to purple
                {h: 30, from: "#ec4899", to: "#f472b6"}, // pink to light pink
              ].map((bar, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <div 
                    className="w-full rounded-t-lg transition-all group-hover:opacity-80" 
                    style={{ height: `${bar.h}%`, background: `linear-gradient(to top, ${bar.from}, ${bar.to})` }} 
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4 px-1 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
              <span>Squat</span>
              <span>Deadlift</span>
              <span>Lunge</span>
              <span>Press</span>
              <span>Curl</span>
            </div>
          </div>

          {/* MUSCLE GROUP FOCUS - Colorful Gradient Chart */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-extrabold text-[#1a1a2e] flex items-center gap-2 mb-6">
                <Target size={18} className="text-[#ec4899]" /> Muscle Focus
            </h3>
            <div className="flex items-center justify-center py-4">
               <div className="relative w-40 h-40">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="16" fill="none" className="stroke-gray-100" strokeWidth="4" />
                    <circle cx="18" cy="18" r="16" fill="none" stroke="#ec4899" strokeWidth="4" strokeDasharray="60, 100" />
                    <circle cx="18" cy="18" r="16" fill="none" stroke="#7c3aed" strokeWidth="4" strokeDasharray="30, 100" strokeDashoffset="-60" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black">60%</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Quads</span>
                  </div>
               </div>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-2">
               <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-gray-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ec4899]" /> Quads
               </div>
               <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-gray-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#7c3aed]" /> Glutes
               </div>
            </div>
          </div>
        </div>

        {/* POWER SETS - MATCHED INPUT STYLE */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-extrabold text-lg sm:text-xl flex items-center gap-2">
              <Zap size={20} className="text-[#7c3aed] fill-[#7c3aed]" /> Power Sets
            </h3>
            <div className="text-right">
              <p className="text-2xl font-black text-[#7c3aed] leading-none">315</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">Total Load (kg)</p>
            </div>
          </div>

          <div className="space-y-4">
        {powerSets.map((set, index) => (
  <div key={index} className="bg-gray-50 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4 border border-gray-100">
    <div className="bg-[#7c3aed] text-white w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
      <span className="text-[8px] font-bold uppercase opacity-80">Set</span>
      <span className="text-lg font-black leading-none">{set.set}</span>
    </div>
    
    <div className="grid grid-cols-3 gap-3 flex-1 w-full">
      {/* Explicitly cast the keys to satisfy TypeScript */}
      {(['reps', 'weight'] as const).map((key) => (
          <div key={key}>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">{key}</label>
            <input
              type="number"
              value={set[key]}
              onChange={(e) => {
                const newSets = [...powerSets];
                // We use the key from the map and cast the value
                newSets[index][key] = Number(e.target.value);
                setPowerSets(newSets);
              }}
              className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-2 text-center font-bold text-base focus:border-[#7c3aed] outline-none transition-all"
            />
          </div>
      ))}
      
      <div>
        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Unit</label>
        <select
          value={set.unit}
          onChange={(e) => {
            const newSets = [...powerSets];
            newSets[index].unit = e.target.value;
            setPowerSets(newSets);
          }}
          className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-2 text-center font-bold text-base focus:border-[#7c3aed] outline-none transition-all appearance-none cursor-pointer"
        >
          <option value="kg">kg</option>
          <option value="lbs">lbs</option>
        </select>
      </div>
    </div>
  </div>
))}
          </div>
        </div>

        {/* RECENTLY COMPLETED */}
        <div className="bg-[#1e1e2e] rounded-3xl p-6 shadow-xl mb-8 border border-white/5">
          <h3 className="font-bold text-white text-sm uppercase tracking-widest mb-4">Recently Completed</h3>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-3">
              {["Aarya", "John", "Mike", "Sara", "Emma"].map((name, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#ec4899] flex items-center justify-center text-white text-xs font-black border-2 border-[#1e1e2e] shadow-lg"
                >
                  {name[0]}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 font-medium">and 12 others this week</p>
          </div>
        </div>

        {/* REDUCED SIZE ACTION BUTTON */}
        <div className="fixed bottom-6 left-4 right-4 z-40 max-w-5xl mx-auto flex justify-center">
          <button className="w-full max-w-xs bg-gradient-to-r from-[#7c3aed] to-[#ec4899] hover:opacity-95 text-white py-4 rounded-full font-black text-base shadow-2xl flex items-center justify-center gap-2 uppercase tracking-widest transition-all active:scale-[0.98]">
            <Plus size={18} strokeWidth={4} /> Add to Queue
          </button>
        </div>
      </div>
    </div>
  );
}