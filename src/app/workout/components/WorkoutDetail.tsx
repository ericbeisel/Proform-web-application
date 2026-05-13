"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  ArrowLeft, Share2, Bookmark, X, 
  Dumbbell, Zap, Plus, ChevronRight, Loader2 
} from "lucide-react";
import { getProgramExercises, getProgramEquipment, Exercise, Equipment } from "@/api/programs/route";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workoutTitle, setWorkoutTitle] = useState<string>("");
  const [programCode, setProgramCode] = useState<string>("");
  


  // Dummy data for static UI elements
  const dummyStats = [
    { label: 'Load', value: '97' },
    { label: 'Duration', value: '31:30' },
    { label: 'Movements', value: '24' }
  ];

  const dummyRecentlyCompleted = ['JD', 'SK', 'AM', 'LW', 'RG', 'TP', 'MK', 'BC'];
  const dummyPowerSets = ['14 lbs', '17 lbs', '19 lbs'];

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
      const lowerCode = code.toLowerCase(); // rc1, rc2, rc3
      console.log("🔍 Fetching exercises & equipment for code:", lowerCode);
      
      const [exercisesData, equipmentData] = await Promise.all([
        getProgramExercises(lowerCode, 1, 100),
        getProgramEquipment(lowerCode, false)
      ]);
      
      console.log("📋 Exercises:", exercisesData);
      console.log("📋 Equipment:", equipmentData);
      
      setExercises(exercisesData.data || []);
      setEquipment(equipmentData || []);
      setProgramCode(lowerCode);
      
      // workoutKey is now the readable title e.g. "LOWER BODY"
      if (workoutKey) {
        setWorkoutTitle(workoutKey);
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

  // Filter exercises for specific workout if workoutKey is provided
// Filter exercises for specific workout if workoutKey is provided
const filteredExercises = exercises;

  console.log("🔍 Filtered exercises count:", filteredExercises.length);
  console.log("🔍 Total exercises from API:", exercises.length);

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
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 leading-none mb-4 uppercase">
              {filteredExercises.length} Exercises
            </h2>
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
                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-900">Exercises:</h3>
                <button className="text-[#6D28D9] text-[10px] font-black uppercase tracking-widest">View All</button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
              {filteredExercises.slice(0, 8).map((ex, i) => (
  <div key={ex.id || i} className="bg-white rounded-[1.5rem] md:rounded-[1.8rem] p-4 md:p-5 shadow-sm border border-slate-50 flex flex-col items-center text-center">
    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl mb-3 overflow-hidden bg-slate-100 border border-slate-100 shrink-0">
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
    <p className="text-[8px] md:text-[9px] font-black leading-tight mb-1 uppercase">
      {ex.name}
    </p>
    <p className="text-[8px] font-bold text-slate-300 uppercase">
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

            {/* Dummy Power Sets Section */}
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
                  {dummyPowerSets.map((wt, i) => (
                    <div key={i} className="bg-slate-50/50 rounded-2xl md:rounded-3xl p-3 md:p-3.5 text-center border border-slate-50">
                      <p className="text-base md:text-lg font-black text-slate-900 leading-none mb-1">{wt}</p>
                      <p className="text-[8px] md:text-[9px] font-bold text-slate-400">{i === 0 ? '15' : '5-8'}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dummy Stats Cards */}
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

      {/* Fixed Bottom Button - Keep as is */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50 pointer-events-none px-6">
        <button className="pointer-events-auto w-full max-w-[280px] md:max-w-xs bg-[#6D28D9] text-white py-4 rounded-full font-black text-[10px] uppercase tracking-[0.25em] shadow-2xl shadow-purple-400/50 flex items-center justify-center gap-2.5 transition-all active:scale-90 border border-white/10 hover:bg-[#5B21B6]">
          <Plus className="w-4 h-4" strokeWidth={4} /> Add to Queue
        </button>
      </div>
    </div>
  );
}