"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Calendar, X, Loader2, Check, Trash2, Pencil } from "lucide-react";
import { getItinerary, ItineraryWorkout } from "@/api/itinerary/route";
import { getProgramTags } from "@/api/programs/route";
import AddActivityModal from "@/app/checklist/components/addActivityModal";

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

// The actual program code lives in `code`/`program_code` — mirrors mobile's
// PowerTagsRow usage `(workout as any).code || (workout as any).program_code`.
// `title` is a display name only; it happens to equal the code for some
// "Workout" records but not for Supplemental ones, which is why power-set
// tags previously only ever showed up for the Workout popup.
const getWorkoutProgramCode = (w: ItineraryWorkout): string =>
  (w as unknown as { code?: string; program_code?: string }).code ||
  (w as unknown as { code?: string; program_code?: string }).program_code ||
  w.title ||
  "";

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
  const router = useRouter();
  const [showAddWorkout, setShowAddWorkout] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterTab | null>(null);
  const [selectedWorkout, setSelectedWorkout] = useState<ItineraryWorkout | null>(null);
  const [schedulePopup, setSchedulePopup] = useState<{ workout: ItineraryWorkout; kind: "cardio" | "hydration" | "recovery" } | null>(null);
  const [selectedWorkoutTags, setSelectedWorkoutTags] = useState<string[]>([]);
  const [itineraryData, setItineraryData] = useState<ItineraryWorkout[]>([]);
  const [tagsMap, setTagsMap] = useState<Record<string, string[]>>({});
  const [scheduleType, setScheduleType] = useState<string>("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    fetchData();
  }, []);

  // Weekly Schedule cards only cover primary/supplemental/conditioning workouts —
  // cardio, recovery, custom, and hydration only ever show as calendar dots.
  const SCHEDULE_EXCLUDED_TYPES = new Set(["cardio", "recovery", "custom", "hydration", "nutrition"]);

  // Group workouts by day from API data
  const workoutsByDay: Record<string, ItineraryWorkout[]> = {};
  for (const day of DAY_ORDER) workoutsByDay[day] = [];

  for (const workout of itineraryData) {
    if (SCHEDULE_EXCLUDED_TYPES.has(workout.type.toLowerCase())) continue;
    const day = workout.activity_day;
    if (workoutsByDay[day]) {
      workoutsByDay[day].push(workout);
    }
  }

  // Create dots for calendar view from itinerary data
  const dotsByDayRaw: Record<number, ItineraryWorkout[]> = {};
  for (let i = 0; i < 7; i++) dotsByDayRaw[i] = [];

  for (const workout of itineraryData) {
    const dayNum = workout.day_number;
    if (dayNum >= 0 && dayNum < 7) {
      dotsByDayRaw[dayNum].push(workout);
    }
  }

  // With no category filter active, collapse to one dot per unique type per
  // day; with a filter active, show every matching activity stacked instead.
  const dotsByDay: Record<number, ItineraryWorkout[]> = {};
  for (let i = 0; i < 7; i++) {
    const dayActivities = dotsByDayRaw[i];
    if (activeFilter) {
      dotsByDay[i] = dayActivities.filter((a) => getFilterFromType(a.type) === activeFilter);
    } else {
      const seenTypes = new Set<string>();
      dotsByDay[i] = dayActivities.filter((a) => {
        if (seenTypes.has(a.type)) return false;
        seenTypes.add(a.type);
        return true;
      });
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

  useEffect(() => {
    if (!itineraryData.length) return;
    const uniqueCodes = [...new Set(itineraryData.map(getWorkoutProgramCode).filter(Boolean))];
    uniqueCodes.forEach((code) => {
      const cleanCode = code.trim().split(" ")[0];
      if (!cleanCode) return;
      getProgramTags(cleanCode.toLowerCase())
        .then((tags) => {
          setTagsMap((prev) => ({ ...prev, [code]: tags }));
        })
        .catch(() => {});
    });
  }, [itineraryData]);

  useEffect(() => {
    if (!selectedWorkout) { setSelectedWorkoutTags([]); return; }
    const code = getWorkoutProgramCode(selectedWorkout);
    const cleanCode = code.trim().split(" ")[0];
    if (!cleanCode) { setSelectedWorkoutTags([]); return; }
    getProgramTags(cleanCode.toLowerCase())
      .then((tags) => {
        setSelectedWorkoutTags(tags);
      })
      .catch(() => setSelectedWorkoutTags([]));
  }, [selectedWorkout]);

  const formatTime = (time: string): string => {
    if (!time) return "";
    const [hour, minute] = time.split(":");
    const hourNum = parseInt(hour);
    const period = hourNum >= 12 ? "PM" : "AM";
    const displayHour = hourNum % 12 || 12;
    return `${displayHour}:${minute} ${period}`;
  };

  const handleDotClick = (workout: ItineraryWorkout) => {
    const type = workout.type.toLowerCase();
    if (type === "cardio") {
      setSchedulePopup({ workout, kind: "cardio" });
      return;
    }
    if (type === "hydration") {
      setSchedulePopup({ workout, kind: "hydration" });
      return;
    }
    if (type === "recovery") {
      setSchedulePopup({ workout, kind: "recovery" });
      return;
    }
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

      {/* ── Weekly Agenda link ── */}
      <button
        onClick={() => router.push("/checklist/weekly-agenda")}
        className="flex items-center gap-1.5 px-4 sm:px-6 pt-4 pb-1 flex-shrink-0 text-purple-600 hover:text-purple-700 transition-colors self-start"
      >
        <Calendar size={14} />
        <span className="text-[13px] sm:text-[14px] font-bold">Weekly Agenda</span>
      </button>

      {/* ── Filter Pills ── */}
      <div className="flex items-center gap-2 px-4 sm:px-6 py-4 overflow-x-auto scrollbar-hide flex-shrink-0">
        {FILTER_TABS.map((tab) => {
          const count = itineraryData.filter(
            (w) => getFilterFromType(w.type) === tab.key
          ).length;
          const isActive = activeFilter === tab.key;
          const isAnyActive = activeFilter !== null;

          return (
            <button
              key={tab.key}
              onClick={() =>
                setActiveFilter(activeFilter === tab.key ? null : tab.key)
              }
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-[12px] sm:text-[13px] font-bold whitespace-nowrap border transition-all ${
                isActive
                  ? `${tab.activeBg} ${tab.activeText} border-transparent shadow-md`
                  : tab.color
              } ${isAnyActive && !isActive ? "opacity-30" : ""}`}
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
                const activity = (dotsByDay[colIdx] || [])[rowIdx];

                if (!activity) {
                  return (
                    <div
                      key={`empty-${colIdx}-${rowIdx}`}
                      className="flex justify-center h-3 w-3 mx-auto"
                    />
                  );
                }

                const isCompleted = !!(activity.completed || activity.completed_activity);

                return (
                  <div
                    key={`dot-${activity.id}-${colIdx}-${rowIdx}`}
                    onClick={() => handleDotClick(activity)}
                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full ${getDotColor(activity.type)} cursor-pointer hover:scale-125 transition-all duration-300 mx-auto shadow-sm flex items-center justify-center ${isCompleted ? "ring-2 ring-offset-1 ring-gray-300" : ""}`}
                  >
                    {isCompleted && <Check size={8} className="text-white" strokeWidth={3} />}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* ── Add Activity CTA ── */}
      <button
        onClick={() => setShowAddWorkout(true)}
        className="mx-4 sm:mx-6 bg-purple-700 hover:bg-purple-800 text-white text-[14px] sm:text-[15px] font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg"
      >
        <Plus size={18} strokeWidth={3} />
        Add Activity
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
                <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${getDotColor(w.type)}`} />
                    <span className="text-white text-[11px] sm:text-[12px] font-bold">
                      By {w.activity_day} @ {formatTime(w.activity_time)}
                    </span>
                  </div>
                  {w.franchiseCode && (
                    <span className="bg-[#724693] text-white text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide">
                      {w.franchiseCode}
                    </span>
                  )}
                </div>

                {/* Completed indicator - Top Right (read-only, reflects real backend state) */}
                {(w.completed || w.completed_activity) && (
                  <div className="absolute top-3 right-3 z-10 w-5 h-5 rounded-md bg-green-500 flex items-center justify-center shadow-sm">
                    <Check size={12} className="text-white" strokeWidth={3} />
                  </div>
                )}

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

                  {(() => {
                    const tagLabel = (tag: string): string | null => {
                      const t = tag.toUpperCase();
                      if (t.includes("UES")) return "Bench";
                      if (t.includes("LES")) return "Squat";
                      if (t.includes("CCS")) return "Clean";
                      if (t.includes("HHP")) return "Deadlift";
                      return null;
                    };
                    const badges = Array.from(
                      new Set((tagsMap[getWorkoutProgramCode(w)] || []).map(tagLabel).filter(Boolean) as string[]),
                    ).slice(0, 1);
                    if (!badges.length) return null;
                    return (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {badges.map((name, idx) => (
                          <span
                            key={`${name}-${idx}`}
                            className="px-1.5 py-0.5 rounded-full bg-yellow-400/20 border border-yellow-400/40 text-yellow-300 text-[9px] font-semibold"
                          >
                            ${name}
                          </span>
                        ))}
                      </div>
                    );
                  })()}

                  {w.muscles_used && (
                    <p className="text-white text-[10px] sm:text-[11px] mt-1 line-clamp-1">
                      {w.muscles_used}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    })}
  </div>
</div>

      {/* ── Add Activity Modal ── */}
      {showAddWorkout && (
        <AddActivityModal
          onClose={() => setShowAddWorkout(false)}
          onAdded={() => {
            setShowAddWorkout(false);
            fetchData();
          }}
          day={getTodayInfo().todayName}
        />
      )}

      {/* ── Workout Detail Popup ── */}
      {selectedWorkout && (() => {
        const tagLabel = (tag: string): string | null => {
          const t = tag.toUpperCase();
          if (t.includes("UES")) return "Bench";
          if (t.includes("LES")) return "Squat";
          if (t.includes("CCS")) return "Clean";
          if (t.includes("HHP")) return "Deadlift";
          return null;
        };
        const powerTags = Array.from(
          new Set(selectedWorkoutTags.map(tagLabel).filter(Boolean) as string[]),
        ).slice(0, 1);

        const EDIT_TIME_SECTIONS: Record<string, string> = {
          workout: "workout",
          "field workout": "workout",
          supplemental: "supplemental",
          conditioning: "conditioning",
        };
        const editTimeSection = EDIT_TIME_SECTIONS[selectedWorkout.type.toLowerCase()];

        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setSelectedWorkout(null)}
          >
            <div
              className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedWorkout(null)}
                className="absolute right-5 top-5 p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>

              <h2 className="text-xl font-extrabold text-gray-900 text-center">{selectedWorkout.type}</h2>
              <p className="text-center text-xs text-gray-400 font-semibold mt-1 mb-4">Upcoming:</p>

              {/* Image card */}
              <div className="relative w-full h-40 rounded-2xl overflow-hidden mb-4 bg-gradient-to-br from-gray-700 to-gray-900">
                {selectedWorkout.cover_photo && (
                  <img
                    src={selectedWorkout.cover_photo}
                    alt={selectedWorkout.workout_title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                {selectedWorkout.franchiseCode && (
                  <span className="absolute top-3 left-3 bg-[#724693] text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide">
                    {selectedWorkout.franchiseCode}
                  </span>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white/80 text-[11px] font-bold uppercase tracking-wide">{selectedWorkout.type}</p>
                  <p className="text-violet-400 font-extrabold text-lg leading-snug mb-1.5">{selectedWorkout.workout_title}</p>
                  {powerTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-1.5">
                      {powerTags.map((label, idx) => (
                        <span key={idx} className="bg-cyan-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                          ${label}
                        </span>
                      ))}
                    </div>
                  )}
                  {selectedWorkout.muscles_used && (
                    <p className="text-white text-sm font-semibold">{selectedWorkout.muscles_used}</p>
                  )}
                </div>
              </div>

              {/* Date row */}
              <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 mb-4 border border-gray-100">
                <div className="flex items-center gap-2 text-gray-800 font-semibold text-sm">
                  <Calendar size={16} className="text-gray-400" />
                  {selectedWorkout.activity_day} @ {formatTime(selectedWorkout.activity_time)}
                </div>
                <button
                  onClick={() => {
                    setSelectedWorkout(null);
                    router.push(editTimeSection ? `/preferences?section=${editTimeSection}` : "/preferences");
                  }}
                  className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                  title="Edit time"
                >
                  <Pencil size={16} className="text-purple-500" />
                </button>
              </div>

              <button
                onClick={() => {
                  setSelectedWorkout(null);
                  router.push(`/workout/detail?code=${encodeURIComponent(selectedWorkout.title)}&workoutKey=${encodeURIComponent(selectedWorkout.workout_title)}`);
                }}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 rounded-xl mb-3 transition-colors shadow-md"
              >
                View Workout
              </button>

              <button
                onClick={() => {
                  setSelectedWorkout(null);
                  router.push("/workout");
                }}
                className="w-full border border-purple-200 text-purple-600 font-bold py-3.5 rounded-xl mb-3 hover:bg-purple-50 transition-colors"
              >
                View Queue
              </button>

              <button
                onClick={() => alert("Removing workouts from the itinerary isn't supported yet — manage this from the Queue.")}
                className="w-full flex items-center justify-center gap-1.5 text-red-500 font-semibold text-sm py-1.5 mb-1 hover:text-red-600 transition-colors"
              >
                <Trash2 size={14} />
                Remove from Itinerary
              </button>

              <button
                onClick={() => setSelectedWorkout(null)}
                className="w-full text-center text-gray-400 text-sm py-1 hover:text-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        );
      })()}

      {/* ── Cardio / Hydration / Recovery Dot Popup ── */}
      {schedulePopup && (() => {
        const { workout, kind } = schedulePopup;
        const label = kind === "cardio" ? "Cardio" : kind === "hydration" ? "Hydration" : "Recovery";
        const manageRoute =
          kind === "cardio" ? "/todays-focus-cardio/scheduled-cardio"
          : kind === "hydration" ? "/hydration/hydration-queue"
          : "/recovery/recovery-dashboard?openGoal=1";
        const completeRoute =
          kind === "cardio" ? "/todays-focus-cardio/cardio-entry"
          : kind === "hydration" ? "/hydration/submitHydration"
          : "/recovery/suggestedRecovery";

        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setSchedulePopup(null)}
          >
            <div
              className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-extrabold text-purple-600">{label}</span>
                <button
                  onClick={() => {
                    setSchedulePopup(null);
                    router.push(manageRoute);
                  }}
                  className="p-2 -m-2 rounded-full text-red-500 hover:bg-red-50 transition-colors"
                  title={`Manage in ${label} Schedule`}
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <h2 className="text-xl font-extrabold text-gray-900 text-center mb-4">
                Completed by {workout.activity_day}
              </h2>

              <div className="border-t border-gray-100 mb-4" />

              <p className="text-center text-sm text-gray-500 mb-1">{label} #1</p>
              <p className="text-center text-sm text-gray-400 mb-6">
                Time: {formatTime(workout.activity_time)}
              </p>

              <button
                onClick={() => {
                  setSchedulePopup(null);
                  router.push(completeRoute);
                }}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3.5 rounded-xl mb-3 transition-all shadow-md"
              >
                Complete Activity
              </button>

              <button
                onClick={() => {
                  setSchedulePopup(null);
                  router.push(manageRoute);
                }}
                className="w-full border border-gray-200 text-gray-700 font-bold py-3.5 rounded-xl mb-3 hover:bg-gray-50 transition-colors"
              >
                {label} Schedule Settings
              </button>

              <button
                onClick={() => setSchedulePopup(null)}
                className="w-full text-center text-gray-400 text-sm py-1 hover:text-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        );
      })()}
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