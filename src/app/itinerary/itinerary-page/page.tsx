"use client";

import { useState, useEffect } from "react";
import { Plus, Calendar, X, Loader2 } from "lucide-react";
import { getItinerary, ItineraryWorkout } from "@/api/itinerary/route";
import { getProgramTags } from "@/api/programs/route";

type FilterTab =
  | "PRIMARY"
  | "SUPPLEMENTAL"
  | "CONDITIONING"
  | "RECOVERY"
  | "HYDRATION"
  | "CARDIO"
  | "CUSTOM";

const DAYS_FULL = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const DAYS_SHORT = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

// Map workout types to filter categories
// Map workout types to filter categories
const getFilterFromType = (type: string): FilterTab => {
  switch (type.toLowerCase()) {
    case "workout":
    case "field workout":
      return "PRIMARY";
    case "supplemental":
      return "SUPPLEMENTAL";
    case "conditioning":
      return "CONDITIONING";
    case "cardio":
      return "CARDIO";
    case "hydration":
      return "HYDRATION";
    case "recovery":
      return "RECOVERY";
    case "custom":
      return "CUSTOM";
    default:
      return "PRIMARY";
  }
};

// Get dot color based on type
// Get dot color based on type
const getDotColor = (type: string): string => {
  switch (type.toLowerCase()) {
    case "workout":
      return "bg-blue-500";
    case "field workout":
      return "bg-blue-500";
    case "supplemental":
      return "bg-green-500";
    case "conditioning":
      return "bg-yellow-400";
    case "cardio":
      return "bg-red-400";
    case "hydration":
      return "bg-cyan-400";
    case "recovery":
      return "bg-purple-500";
    case "custom":
      return "bg-gray-500";
    default:
      return "bg-purple-500";
  }
};

// Get today's day name and index
const getTodayInfo = () => {
  const today = new Date();
  const todayName = DAYS_FULL[today.getDay()];
  const todayIndex = today.getDay();
  return { todayName, todayIndex };
};

const FILTER_TABS: {
  key: FilterTab;
  label: string;
  count?: number;
  color: string;
  activeText: string;
  activeBg: string;
  dot: string;
}[] = [
  {
    key: "PRIMARY",
    label: "PRIMARY",
    color: "border-blue-500 text-blue-600 bg-blue-50",
    activeText: "text-white",
    activeBg: "bg-blue-500 border-blue-500",
    dot: "bg-blue-500",
  },
  {
    key: "SUPPLEMENTAL",
    label: "SUPPLEMENTAL",
    color: "border-green-500 text-green-600 bg-green-50",
    activeText: "text-white",
    activeBg: "bg-green-500 border-green-500",
    dot: "bg-green-500",
  },
  {
    key: "CONDITIONING",
    label: "CONDITIONING",
    color: "border-yellow-500 text-yellow-600 bg-yellow-50",
    activeText: "text-white",
    activeBg: "bg-yellow-400 border-yellow-400",
    dot: "bg-yellow-400",
  },
  {
    key: "RECOVERY",
    label: "RECOVERY",
    color: "border-purple-500 text-purple-600 bg-purple-50",
    activeText: "text-white",
    activeBg: "bg-purple-500 border-purple-500",
    dot: "bg-purple-500",
  },
  {
    key: "HYDRATION",
    label: "HYDRATION",
    color: "border-cyan-500 text-cyan-600 bg-cyan-50",
    activeText: "text-white",
    activeBg: "bg-cyan-400 border-cyan-400",
    dot: "bg-cyan-400",
  },
  {
    key: "CARDIO",
    label: "CARDIO",
    color: "border-red-400 text-red-500 bg-red-50",
    activeText: "text-white",
    activeBg: "bg-red-400 border-red-400",
    dot: "bg-red-400",
  },
  {
    key: "CUSTOM",
    label: "CUSTOM",
    color: "border-gray-700 text-gray-800 bg-gray-100",
    activeText: "text-white",
    activeBg: "bg-gray-700 border-gray-700",
    dot: "bg-gray-500",
  },
];

const DAY_ORDER = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function ItineraryPage() {
  const [showAddWorkout, setShowAddWorkout] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterTab | null>(null);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [repeatType, setRepeatType] = useState<"week" | "repeat">("repeat");
  const [selectedWorkout, setSelectedWorkout] = useState<ItineraryWorkout | null>(null);
  const [selectedWorkoutTags, setSelectedWorkoutTags] = useState<string[]>([]);
  const [itineraryData, setItineraryData] = useState<ItineraryWorkout[]>([]);
  const [tagsMap, setTagsMap] = useState<Record<string, string[]>>({});
  const [scheduleType, setScheduleType] = useState<string>("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const itinerary = await getItinerary();
        setItineraryData(itinerary);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError(err.message || "Failed to fetch itinerary");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Group workouts by day from API data
  const workoutsByDay: Record<string, ItineraryWorkout[]> = {};
  for (const day of DAY_ORDER) workoutsByDay[day] = [];
  
  for (const workout of itineraryData) {
    const day = workout.activity_day;
    if (workoutsByDay[day]) {
      workoutsByDay[day].push(workout);
    }
  }

  // Create dots for calendar view from itinerary data
  const dotsByDay: Record<number, ItineraryWorkout[]> = {};
  for (let i = 0; i < 7; i++) dotsByDay[i] = [];

  for (const workout of itineraryData) {
    const dayNum = workout.day_number;
    if (dayNum >= 0 && dayNum < 7) {
      dotsByDay[dayNum].push(workout);
    }
  }

  const maxRows = Math.max(...Object.values(dotsByDay).map((a) => a.length), 1);

  // Filter workouts based on active filter
  const filteredWorkoutsByDay = activeFilter
    ? Object.fromEntries(
        Object.entries(workoutsByDay).map(([day, workouts]) => [
          day,
          workouts.filter((w) => getFilterFromType(w.type) === activeFilter),
        ]),
      )
    : workoutsByDay;

const totalWorkouts = (() => {
  const allWorkouts = Object.values(filteredWorkoutsByDay).flat();
  if (scheduleType === "All") {
    return allWorkouts.length;
  }
  return allWorkouts.filter(w => w.type === scheduleType).length;
})();

// Add this function with your other functions
const handleToggleComplete = async (workoutId: string, isCompleted: boolean) => {
  // Update local state
  setItineraryData(prev => prev.map(w => 
    w.id === workoutId 
      ? { ...w, completed: isCompleted, completed_activity: isCompleted }
      : w
  ));
  

};

  useEffect(() => {
    if (!itineraryData.length) return;
    const uniqueCodes = [...new Set(itineraryData.map((w) => w.title).filter(Boolean))];
    uniqueCodes.forEach((code) => {
      getProgramTags(code.toLowerCase())
        .then((tags) => setTagsMap((prev) => ({ ...prev, [code]: tags })))
        .catch(() => {});
    });
  }, [itineraryData]);

  useEffect(() => {
    if (!selectedWorkout?.title) { setSelectedWorkoutTags([]); return; }
    getProgramTags(selectedWorkout.title.toLowerCase())
      .then((tags) => {
        console.log("[itinerary] tags for", selectedWorkout.title, ":", tags);
        setSelectedWorkoutTags(tags);
      })
      .catch(() => setSelectedWorkoutTags([]));
  }, [selectedWorkout]);

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const formatTime = (time: string): string => {
    if (!time) return "";
    const [hour, minute] = time.split(":");
    const hourNum = parseInt(hour);
    const period = hourNum >= 12 ? "PM" : "AM";
    const displayHour = hourNum % 12 || 12;
    return `${displayHour}:${minute} ${period}`;
  };

  const handleDotClick = (workout: ItineraryWorkout) => {
    setSelectedWorkout(workout);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-3" />
          <p className="text-gray-500">Loading itinerary...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center bg-red-50 p-6 rounded-2xl max-w-md">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-purple-600 text-white px-6 py-2 rounded-xl"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col min-h-screen bg-white"
      style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}
    >

      {/* ── Filter Pills ── */}
      <div className="flex items-center gap-2 px-4 sm:px-6 py-4 overflow-x-auto scrollbar-hide flex-shrink-0">
        {FILTER_TABS.map((tab) => {
          const count = itineraryData.filter(
            (w) => getFilterFromType(w.type) === tab.key
          ).length;
          
          return (
            <button
              key={tab.key}
              onClick={() =>
                setActiveFilter(activeFilter === tab.key ? null : tab.key)
              }
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-[12px] sm:text-[13px] font-bold whitespace-nowrap border transition-all ${
                activeFilter === tab.key
                  ? `${tab.activeBg} ${tab.activeText} border-transparent shadow-md`
                  : tab.color
              }`}
            >
              <span className={`w-2 h-2 rounded-full inline-block ${tab.dot}`} />
              {tab.label}
              {count > 0 && (
                <span className="opacity-70 ml-0.5">({count})</span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Weekly Agenda toggle ── */}
      <div className="flex items-center gap-2 px-5 sm:px-6 py-1 flex-shrink-0">
        <Calendar size={15} className="text-purple-600" />
        <span className="text-[13px] sm:text-[14px] text-purple-600 font-bold">
          Weekly Agenda
        </span>
      </div>

      {/* ── Dot Grid Calendar ── */}
      <div className="mx-4 sm:mx-6 my-3 rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="grid grid-cols-7 bg-white border-b border-gray-100">
         {DAYS_SHORT.map((d, i) => {
      const { todayIndex } = getTodayInfo();
      const isToday = i === todayIndex;
      
      return (
        <div
          key={`day-header-${i}`}
          className={`text-center text-[12px] sm:text-[13px] font-bold py-3 transition-all ${
            isToday 
              ? "text-purple-600 bg-purple-50 relative" 
              : "text-gray-500"
          }`}
        >
          {d}
          {isToday && (
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-purple-600"></div>
          )}
        </div>
      );
    })}
        </div>

        <div className="bg-white py-4 px-2">
          {Array.from({ length: maxRows }).map((_, rowIdx) => (
            <div key={`row-${rowIdx}`} className="grid grid-cols-7 gap-2 mb-3">
              {Array.from({ length: 7 }).map((_, colIdx) => {
                const activitiesInThisDay = dotsByDay[colIdx] || [];
                const filteredActivities = activeFilter
                  ? activitiesInThisDay.filter((a) => getFilterFromType(a.type) === activeFilter)
                  : activitiesInThisDay;

                const activity = filteredActivities[rowIdx];

                if (!activity) {
                  return (
                    <div
                      key={`empty-${colIdx}-${rowIdx}`}
                      className="flex justify-center h-3 w-3 mx-auto"
                    />
                  );
                }

                return (
                  <div
                    key={`dot-${activity.id}-${colIdx}-${rowIdx}`}
                    onClick={() => handleDotClick(activity)}
                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full ${getDotColor(activity.type)} cursor-pointer hover:scale-125 transition-all duration-300 mx-auto shadow-sm`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* ── Add Workout CTA ── */}
      <button
        onClick={() => setShowAddWorkout(true)}
        className="mx-4 sm:mx-6 bg-purple-700 hover:bg-purple-800 text-white text-[14px] sm:text-[15px] font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg"
      >
        <Plus size={18} strokeWidth={3} />
        Add Workout
      </button>

      {/* ── Weekly Schedule ── */}
<div className="px-4 sm:px-6 pt-6 pb-10 flex-1">
  <div className="mb-4 flex items-center justify-between flex-wrap gap-3">
    <div>
      <h3 className="text-[16px] sm:text-[18px] font-extrabold text-gray-900">
        Weekly Schedule
      </h3>
      <p className="text-[12px] sm:text-[14px] text-gray-500 mt-0.5">
        {totalWorkouts} total Workout(s) scheduled this week
      </p>
    </div>
    
    {/* Schedule Type Dropdown */}
    <div className="relative">
      <select
        value={scheduleType}
        onChange={(e) => setScheduleType(e.target.value)}
        className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2 pr-8 text-[13px] sm:text-[14px] font-semibold text-gray-700 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 cursor-pointer min-w-[140px]"
      >
        <option value="All">All Workouts</option>
        <option value="Workout">Workout</option>
        <option value="Field Workout">Field Workout</option>
        <option value="Supplemental">Supplemental</option>
        <option value="Cardio">Cardio</option>
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  </div>

  <div className="space-y-6">
    {DAY_ORDER.map((day) => {
      let workouts = filteredWorkoutsByDay[day];
      
      // Filter by schedule type if not "All"
      if (scheduleType !== "All") {
        workouts = workouts?.filter(w => w.type === scheduleType);
      }
      
      if (!workouts || workouts.length === 0) return null;

      return (
        <div key={day}>
          <p className="text-[12px] sm:text-[13px] font-extrabold text-gray-400 uppercase tracking-widest mb-3">
            By {day}
          </p>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
            {workouts.map((w) => (
              <div
                key={w.id}
                onClick={() => setSelectedWorkout(w)}
                className="relative flex-shrink-0 w-[220px] sm:w-[260px] h-[200px] sm:h-[230px] rounded-2xl overflow-hidden shadow-md cursor-pointer group active:scale-95 transition-transform"
              >
                {w.cover_photo ? (
                  <img 
                    src={w.cover_photo} 
                    alt={w.workout_title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className={`absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900`} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                {/* Colored Dot */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${getDotColor(w.type)}`} />
                  <span className="text-white text-[11px] sm:text-[12px] font-bold">
                    By {w.activity_day} @ {formatTime(w.activity_time)}
                  </span>
                </div>

                {/* Checkbox - Top Right */}
                <div className="absolute top-3 right-3 z-10">
                  <label 
                    className="relative flex items-center cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={w.completed || w.completed_activity || false}
                      onChange={(e) => {
                        e.stopPropagation();
                        // Handle completion toggle
                        handleToggleComplete(w.id, !(w.completed || w.completed_activity));
                      }}
                      className="peer sr-only"
                    />
                    <div className="w-5 h-5 rounded-md border-2 border-white/70 bg-white/10 backdrop-blur-sm flex items-center justify-center transition-all peer-checked:bg-green-500 peer-checked:border-green-500 peer-hover:border-white">
                      {(w.completed || w.completed_activity) && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </label>
                </div>

                <div className="absolute bottom-3 left-3 right-3">
                  {w.program_name && (
                    <p className="text-purple-300 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wide mb-0.5 truncate">
                      {w.program_name}
                    </p>
                  )}
                  <p className="text-white text-[15px] sm:text-[17px] font-black leading-tight uppercase tracking-tight line-clamp-2 pr-6">
                    {w.workout_title}
                  </p>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-white/80 text-[11px] sm:text-[12px] font-medium">
                      {w.week}
                    </span>
                    <span
                      className={`${getBadgeColor(w.type)} text-white text-[10px] sm:text-[11px] font-black px-2 py-0.5 rounded-full`}
                    >
                      {w.type.toUpperCase()}
                    </span>
                  </div>

                  {w.muscles_used && (
                    <p className="text-white text-[10px] sm:text-[11px] mt-1 line-clamp-1">
                      {w.muscles_used}
                    </p>
                  )}

                  {(() => {
                    const BADGE_MAP: Record<string, string> = { UES: "Bench", LES: "Squat", CCS: "Clean", HHP: "Deadlift" };
                    const badges = (tagsMap[w.title] || [])
                      .map((tag) => BADGE_MAP[tag.replace("$", "").toUpperCase()])
                      .filter(Boolean) as string[];
                    if (!badges.length) return null;
                    return (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {badges.map((name) => (
                          <span
                            key={name}
                            className="px-1.5 py-0.5 rounded-full bg-yellow-400/20 border border-yellow-400/40 text-yellow-300 text-[9px] font-semibold"
                          >
                            ${name}
                          </span>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    })}
  </div>
</div>

      {/* ── Add Workout Modal ── (keep same as before) ── */}
      {showAddWorkout && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-white w-full sm:w-[600px] rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl relative animate-in slide-in-from-bottom duration-300">
            <button
              onClick={() => setShowAddWorkout(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black p-2"
            >
              <X size={24} />
            </button>

            <h2 className="text-[20px] sm:text-[24px] font-black mb-6">
              Add Workout
            </h2>

            <div className="space-y-5">
              <div>
                <p className="text-[13px] sm:text-[14px] font-bold mb-2 text-gray-700">Workout Details</p>
                <input
                  className="w-full border-2 border-gray-100 rounded-2xl p-4 bg-gray-50 text-[15px] focus:border-purple-500 outline-none transition-colors"
                  placeholder="Select or search workout"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setRepeatType("week")}
                  className={`flex-1 py-3.5 rounded-2xl text-[14px] font-bold transition-all ${
                    repeatType === "week"
                      ? "bg-gray-900 text-white shadow-lg"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  This Week
                </button>
                <button
                  onClick={() => setRepeatType("repeat")}
                  className={`flex-1 py-3.5 rounded-2xl text-[14px] font-bold transition-all ${
                    repeatType === "repeat"
                      ? "bg-purple-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  Repeat Weekly
                </button>
              </div>

              <div>
                <p className="text-[13px] sm:text-[14px] font-bold mb-2 text-gray-700">Set Time</p>
                <input
                  type="time"
                  className="w-full border-2 border-gray-100 rounded-2xl p-4 bg-gray-50 text-[16px] font-medium outline-none"
                />
              </div>

              <div>
                <p className="text-[13px] sm:text-[14px] font-bold mb-2 text-gray-700">Select Days</p>
                <div className="grid grid-cols-4 gap-2">
                  {DAYS_SHORT.map((day, i) => {
                    const fullDay = DAYS_FULL[i];
                    const selected = selectedDays.includes(fullDay);
                    return (
                      <button
                        key={day}
                        onClick={() => toggleDay(fullDay)}
                        className={`rounded-xl py-3 text-[14px] font-bold border-2 transition-all ${
                          selected
                            ? "bg-purple-600 text-white border-purple-600 shadow-md"
                            : "bg-white text-gray-400 border-gray-100 hover:border-purple-200"
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black py-4 rounded-2xl text-[16px] shadow-xl active:scale-[0.98] transition-transform mt-4">
                Update Itinerary
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Workout Detail Modal ── (keep same as before) ── */}
      {selectedWorkout && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedWorkout(null)}
        >
          <div
            className="bg-white w-full sm:w-[500px] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden relative animate-in slide-in-from-bottom sm:zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 pt-8 pb-8 space-y-6">
              <div className="relative h-[220px] rounded-3xl overflow-hidden shadow-lg">
                {selectedWorkout.cover_photo ? (
                  <img 
                    src={selectedWorkout.cover_photo} 
                    alt={selectedWorkout.workout_title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className={`absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900`} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6">
                  <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase mb-2">
                    {selectedWorkout.type}
                  </span>
                  <h3 className="text-[28px] font-black text-center leading-tight">
                    {selectedWorkout.workout_title}
                  </h3>
                  <p className="text-[14px] font-medium opacity-80 mt-1">
                    {selectedWorkout.week} • {selectedWorkout.muscles_used}
                  </p>
                  {selectedWorkoutTags.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-1.5 mt-2">
                      {selectedWorkoutTags.map((tag) => (
                        <span key={tag} className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-[10px] font-black rounded-full uppercase">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setSelectedWorkout(null)}
                  className="absolute top-4 right-4 w-10 h-10 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="bg-gray-50 rounded-2xl p-5 flex items-center justify-between border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-[14px] font-black text-gray-900">{selectedWorkout.activity_day}</p>
                    <p className="text-[12px] text-gray-500 font-bold">
                      @ {formatTime(selectedWorkout.activity_time)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button className="w-full bg-purple-700 text-white py-4 rounded-2xl font-black text-[16px] shadow-lg active:scale-95 transition-transform">
                  Start Workout
                </button>
                <button className="w-full border-2 border-gray-100 text-gray-500 py-4 rounded-2xl font-black text-[15px] active:scale-95 transition-transform">
                  View Full Queue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Add this helper function if not already present
function getBadgeColor(type: string): string {
  switch (type.toLowerCase()) {
    case "workout":
      return "bg-blue-500";
    case "supplemental":
      return "bg-green-500";
    case "conditioning":
      return "bg-yellow-400";
    case "cardio":
      return "bg-red-400";
    case "hydration":  // Add this
      return "bg-cyan-500";
    case "field workout":  // Add this
      return "bg-orange-500";
    default:
      return "bg-purple-500";
  }
}