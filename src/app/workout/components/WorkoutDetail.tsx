"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Share2, Bookmark, X, 
  Dumbbell, Zap, Plus, ChevronRight 
} from "lucide-react";

// Added the interface to handle the onClose prop
interface WorkoutDetailProps {
  workoutId?: number | string;
  onClose?: () => void;
}

export default function ResponsiveWorkoutUI({ workoutId, onClose }: WorkoutDetailProps) {
  const router = useRouter();

  const equipment = [
    "Dumbbells", "Barbell", "Cables", "Bench", "Pull Up Bar",
    "Kettlebell", "Foam Roller", "Medicine Ball", "Bosu Ball"
  ];

  const exercises = [
    { name: "Cable MG Dead Bug", area: "Core", active: true },
    { name: "Kettlebell SA Standing OH Press", area: "Shoulders", active: true },
    { name: "Foam Roll T-Spine", area: "Mobility", active: false },
    { name: "Foam Roll Lats", area: "Mobility", active: false },
    { name: "Foam Roll Triceps", area: "Mobility", active: false },
    { name: "Barbell Bench Press", area: "Chest", active: true },
    { name: "Cable Fly", area: "Chest", active: true },
    { name: "Tricep Pushdown", area: "Arms", active: true },
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 pb-32 overflow-x-hidden">
      
      <div className="max-w-[1200px] mx-auto p-4 md:p-8">
        
        {/* Navigation Row */}
        <div className="flex justify-between items-center mb-6">
          <button 
            // REDIRECTION LOGIC: Handles closing a modal OR navigating back
            onClick={() => onClose ? onClose() : router.back()} 
            className="p-2 bg-slate-50 rounded-full hover:bg-slate-200 transition-all active:scale-90"
          >
            <ArrowLeft className="w-[18px] h-[18px] text-slate-600" />
          </button>
          
          <div className="flex gap-2">
            <button className="p-2.5 bg-slate-50 rounded-xl text-slate-500 hover:bg-slate-100"><Bookmark className="w-[18px] h-[18px]" /></button>
            <button className="p-2.5 bg-slate-50 rounded-xl text-slate-500 hover:bg-slate-100"><Share2 className="w-[18px] h-[18px]" /></button>
            {/* REDIRECTION LOGIC: Also applies to the X (close) button */}
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
            <h1 className="text-2xl md:text-3xl font-black text-[#6D28D9] leading-none">RECONDITIONING</h1>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 leading-none mb-4 uppercase">Upper Body</h2>
            <div className="flex flex-wrap gap-1.5">
              {['Long', 'Hard', 'Hard'].map((tag, i) => (
                <span key={i} className="px-4 md:px-5 py-1.5 bg-[#00B4D8] text-white text-[9px] font-black rounded-full uppercase">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <button 
            // REDIRECTION LOGIC: Push to the view workout page
            onClick={() => router.push("/workout/viewWorkout")}
            className="w-full md:w-auto bg-[#6D28D9] text-white px-8 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-purple-100 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            View Workout <ChevronRight size={14} />
          </button>
        </div>

        {/* MAIN RESPONSIVE GRID */}
        <div className="grid grid-cols-12 gap-6 md:gap-8">
          
          <div className="col-span-12 lg:col-span-7 space-y-8">
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

            <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 border border-slate-100 shadow-sm flex flex-wrap md:flex-nowrap justify-around gap-4">
              {[ {l: 'Load', v: '97'}, {l: 'Duration', v: '31:30'}, {l: 'Movements', v: '24'} ].map((stat, i) => (
                <div key={i} className="text-center min-w-[80px]">
                  <p className="text-3xl md:text-5xl font-black text-slate-900 leading-none">{stat.v}</p>
                  <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase mt-2 tracking-widest">{stat.l}</p>
                </div>
              ))}
            </div>

            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-900 mb-4">Recently Completed:</h3>
              <div className="flex flex-wrap gap-2 md:gap-2.5">
                {['JD', 'SK', 'AM', 'LW', 'RG', 'TP', 'MK', 'BC'].map((name, i) => (
                  <div key={i} className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center text-[9px] md:text-[10px] font-black text-white shadow-md
                    ${i % 3 === 0 ? 'bg-indigo-400' : i % 3 === 1 ? 'bg-blue-500' : 'bg-orange-400'}`}>
                    {name}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <div className="flex justify-between items-center mb-6 px-1">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-900">Exercises:</h3>
                <button className="text-[#6D28D9] text-[10px] font-black uppercase tracking-widest">View All</button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
                {exercises.map((ex, i) => (
                  <div key={i} className="bg-white rounded-[1.5rem] md:rounded-[1.8rem] p-4 md:p-5 shadow-sm border border-slate-50 flex flex-col items-center text-center">
                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full mb-3 md:mb-4 flex items-center justify-center ${ex.active ? 'bg-green-500 shadow-sm' : 'bg-slate-100 border border-slate-50'}`}>
                       {ex.active && <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-white/40 rounded-full blur-[1px]"></div>}
                    </div>
                    <p className="text-[8px] md:text-[9px] font-black leading-tight mb-1 h-6 md:h-7 flex items-center justify-center uppercase">{ex.name}</p>
                    <p className="text-[8px] font-bold text-slate-300 uppercase">{ex.area}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-5 space-y-8">
            <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 border border-slate-100 shadow-sm">
              <h3 className="text-[11px] font-black mb-6 md:mb-8 uppercase tracking-widest">Eq. Needed:</h3>
              <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-5 gap-y-6 md:gap-y-8">
                {equipment.map((item, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-50 rounded-xl md:rounded-2xl flex items-center justify-center text-slate-400 border border-slate-100/50">
                      <Dumbbell className="w-4 h-4 md:w-[18px] md:h-[18px]" />
                    </div>
                    <span className="text-[7px] md:text-[8px] font-bold text-slate-400 text-center uppercase tracking-tighter leading-tight">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-7 bg-white rounded-[2.5rem] p-6 md:p-8 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-500"><Zap className="w-3 h-3" fill="currentColor" /></div>
                  <span className="text-[9px] font-black uppercase text-indigo-500 tracking-widest">Power Sets</span>
                </div>
                <div className="bg-slate-50 w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center text-slate-300 mb-3 border border-slate-100">
                  <Dumbbell className="w-[18px] h-[18px] md:w-5 md:h-5" />
                </div>
                <p className="text-[10px] font-black uppercase leading-tight text-slate-900 mb-6">Barbell Decline<br className="hidden md:block"/> Bench Press</p>
                <div className="space-y-3">
                  {['14 lbs', '17 lbs', '19 lbs'].map((wt, i) => (
                    <div key={i} className="bg-slate-50/50 rounded-2xl md:rounded-3xl p-3 md:p-3.5 text-center border border-slate-50">
                      <p className="text-base md:text-lg font-black text-slate-900 leading-none mb-1">{wt}</p>
                      <p className="text-[8px] md:text-[9px] font-bold text-slate-400">{i === 0 ? '15' : '5-8'}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:col-span-5 grid grid-cols-2 md:grid-cols-1 gap-4 md:gap-6">
                <div className="bg-[#FF8A48] rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 text-white flex flex-col justify-center min-h-[120px]">
                   <div className="flex items-center gap-1.5 mb-2 opacity-80">
                    <Zap className="w-3.5 h-3.5" /> <span className="text-[9px] font-black uppercase tracking-widest">Calories</span>
                   </div>
                   <p className="text-3xl md:text-5xl font-black leading-none">277</p>
                </div>
                <div className="bg-gradient-to-br from-[#7C3AED] to-[#6366F1] rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 text-white flex flex-col justify-center min-h-[120px]">
                   <div className="flex items-center gap-1.5 mb-2 opacity-80">
                    <Zap className="w-3.5 h-3.5" /> <span className="text-[9px] font-black uppercase tracking-widest">Power</span>
                   </div>
                   <p className="text-3xl md:text-5xl font-black leading-none">26</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50 pointer-events-none px-6">
        <button className="pointer-events-auto w-full max-w-[280px] md:max-w-xs bg-[#6D28D9] text-white py-4 rounded-full font-black text-[10px] uppercase tracking-[0.25em] shadow-2xl shadow-purple-400/50 flex items-center justify-center gap-2.5 transition-all active:scale-90 border border-white/10 hover:bg-[#5B21B6]">
          <Plus className="w-4 h-4" strokeWidth={4} /> Add to Queue
        </button>
      </div>
    </div>
  );
}