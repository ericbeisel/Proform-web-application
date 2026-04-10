"use client";

import { useState, useEffect } from "react";
import { Plus, Calendar, X, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

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
    count: 8,
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

const ALL_DOTS: {
  id: number;
  day: number;
  color: string;
  filter: FilterTab;
}[] = [
  { id: 1, day: 0, color: "bg-blue-500", filter: "PRIMARY" },
  { id: 2, day: 1, color: "bg-blue-500", filter: "PRIMARY" },
  { id: 3, day: 2, color: "bg-yellow-400", filter: "CONDITIONING" },
  { id: 4, day: 3, color: "bg-blue-500", filter: "PRIMARY" },
  { id: 5, day: 4, color: "bg-red-400", filter: "CARDIO" },
  { id: 6, day: 5, color: "bg-yellow-400", filter: "CONDITIONING" },
  { id: 7, day: 6, color: "bg-green-500", filter: "SUPPLEMENTAL" },
  { id: 8, day: 0, color: "bg-yellow-400", filter: "CONDITIONING" },
  { id: 9, day: 1, color: "bg-red-400", filter: "CARDIO" },
  { id: 10, day: 2, color: "bg-red-400", filter: "CARDIO" },
  { id: 11, day: 3, color: "bg-yellow-400", filter: "CONDITIONING" },
  { id: 12, day: 4, color: "bg-red-400", filter: "CARDIO" },
  { id: 13, day: 5, color: "bg-blue-500", filter: "PRIMARY" },
  { id: 14, day: 6, color: "bg-red-400", filter: "CARDIO" },
  { id: 15, day: 1, color: "bg-yellow-400", filter: "CONDITIONING" },
  { id: 16, day: 2, color: "bg-yellow-400", filter: "CONDITIONING" },
  { id: 17, day: 3, color: "bg-gray-300", filter: "CUSTOM" },
  { id: 18, day: 4, color: "bg-green-500", filter: "SUPPLEMENTAL" },
  { id: 19, day: 5, color: "bg-red-400", filter: "CARDIO" },
  { id: 20, day: 6, color: "bg-blue-500", filter: "PRIMARY" },
  { id: 21, day: 0, color: "bg-red-400", filter: "CARDIO" },
  { id: 22, day: 1, color: "bg-red-400", filter: "CARDIO" },
  { id: 23, day: 3, color: "bg-blue-500", filter: "PRIMARY" },
  { id: 24, day: 4, color: "bg-blue-500", filter: "PRIMARY" },
  { id: 25, day: 5, color: "bg-red-400", filter: "CARDIO" },
  { id: 26, day: 6, color: "bg-green-500", filter: "SUPPLEMENTAL" },
  { id: 27, day: 0, color: "bg-green-500", filter: "SUPPLEMENTAL" },
  { id: 28, day: 1, color: "bg-green-500", filter: "SUPPLEMENTAL" },
  { id: 29, day: 6, color: "bg-blue-500", filter: "PRIMARY" },
];

const WEEKLY_WORKOUTS = [
  {
    id: 1,
    name: "RECOVERY FLOW",
    sub: "Full Body",
    day: "Sunday",
    dayIdx: 0,
    time: "By Sunday @ 08:00",
    filter: "RECOVERY" as FilterTab,
    badge: "RECOVERY",
    badgeBg: "bg-purple-500",
    duration: "30 min",
    started: false,
    image: "",
    imageBg: "bg-teal-200",
  },
  {
    id: 2,
    name: "HYDRATION CHECK",
    sub: "N/A",
    day: "Monday",
    dayIdx: 1,
    time: "By Monday",
    filter: "HYDRATION" as FilterTab,
    badge: "HYDRATION",
    badgeBg: "bg-cyan-400",
    duration: "5 min",
    started: false,
    image: "",
    imageBg: "bg-green-200",
  },
  {
    id: 3,
    name: "SILVER-BACK",
    sub: "Back, Glutes",
    day: "Monday",
    dayIdx: 1,
    time: "By Monday @ 09:00",
    filter: "PRIMARY" as FilterTab,
    badge: "PRIMARY",
    badgeBg: "bg-blue-500",
    duration: "60 min",
    started: false,
    image: "",
    imageBg: "bg-blue-900",
  },
  {
    id: 4,
    name: "HYDRATION CHECK",
    sub: "N/A",
    day: "Tuesday",
    dayIdx: 2,
    time: "By Tuesday @ 10:00",
    filter: "HYDRATION" as FilterTab,
    badge: "HYDRATION",
    badgeBg: "bg-cyan-400",
    duration: "5 min",
    started: false,
    image: "",
    imageBg: "bg-gray-400",
  },
  {
    id: 5,
    name: "MORNING SPRINT",
    sub: "Cardio",
    day: "Wednesday",
    dayIdx: 3,
    time: "By Wednesday",
    filter: "CONDITIONING" as FilterTab,
    badge: "CONDITIONING",
    badgeBg: "bg-yellow-400",
    duration: "45 min",
    started: false,
    image: "",
    imageBg: "bg-orange-200",
  },
  {
    id: 6,
    name: "WOLF-PACK",
    sub: "Full Body",
    day: "Wednesday",
    dayIdx: 3,
    time: "By Wednesday @ 12:00",
    filter: "PRIMARY" as FilterTab,
    badge: "PRIMARY",
    badgeBg: "bg-blue-500",
    duration: "100 min",
    started: false,
    image: "",
    imageBg: "bg-yellow-700",
  },
  {
    id: 7,
    name: "HYDRATION CHECK",
    sub: "N/A",
    day: "Thursday",
    dayIdx: 4,
    time: "By Thursday @ 09:00",
    filter: "HYDRATION" as FilterTab,
    badge: "HYDRATION",
    badgeBg: "bg-cyan-400",
    duration: "5 min",
    started: false,
    image: "",
    imageBg: "bg-gray-400",
  },
  {
    id: 8,
    name: "LEG DESTROYER",
    sub: "Legs",
    day: "Thursday",
    dayIdx: 4,
    time: "By Thursday @ 09:00",
    filter: "PRIMARY" as FilterTab,
    badge: "PRIMARY",
    badgeBg: "bg-blue-500",
    duration: "70 min",
    started: false,
    image: "",
    imageBg: "bg-yellow-600",
  },
  {
    id: 9,
    name: "CUSTOM ROUTINE",
    sub: "Core",
    day: "Thursday",
    dayIdx: 4,
    time: "By Thursday @ 19:00",
    filter: "CUSTOM" as FilterTab,
    badge: "CUSTOM",
    badgeBg: "bg-gray-700",
    duration: "30 min",
    started: false,
    image: "",
    imageBg: "bg-yellow-500",
  },
  {
    id: 10,
    name: "SILVER-BACK",
    sub: "Back, Glutes",
    day: "Friday",
    dayIdx: 5,
    time: "By Friday @ 08:00",
    filter: "PRIMARY" as FilterTab,
    badge: "PRIMARY",
    badgeBg: "bg-blue-500",
    duration: "60 min",
    started: false,
    image: "",
    imageBg: "bg-slate-700",
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
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [repeatType, setRepeatType] = useState<"week" | "repeat">("repeat");
  const [selectedWorkout, setSelectedWorkout] = useState<
    (typeof WEEKLY_WORKOUTS)[0] | null
  >(null);

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const workoutsByDay: Record<string, typeof WEEKLY_WORKOUTS> = {};
  for (const day of DAY_ORDER) workoutsByDay[day] = [];
  for (const w of WEEKLY_WORKOUTS) {
    workoutsByDay[w.day].push(w);
  }

  const dotsByDay: Record<number, typeof ALL_DOTS> = {};
  for (let i = 0; i < 7; i++) dotsByDay[i] = [];
  for (const d of ALL_DOTS) dotsByDay[d.day].push(d);

  const maxRows = Math.max(...Object.values(dotsByDay).map((a) => a.length));

  const filteredWorkoutsByDay = activeFilter
    ? Object.fromEntries(
        Object.entries(workoutsByDay).map(([day, workouts]) => [
          day,
          workouts.filter((w) => w.filter === activeFilter),
        ]),
      )
    : workoutsByDay;

  return (
    <div
      className="flex flex-col min-h-screen bg-white"
      style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}
    >
      {/* ── Header ── */}
      <div className="flex justify-end px-4 sm:px-6 py-4 border-b border-gray-100">
        <button
          onClick={() => router.push("/itinerary/queue")}
          className="bg-purple-700 hover:bg-purple-800 text-white text-[13px] sm:text-[14px] font-bold px-5 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          Go to Queue <ChevronRight size={14} className="inline ml-1" />
        </button>
      </div>

      {/* ── Filter Pills - Improved Text Size ── */}
      <div className="flex items-center gap-2 px-4 sm:px-6 py-4 overflow-x-auto scrollbar-hide flex-shrink-0">
        {FILTER_TABS.map((tab) => (
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
            <span
              className={`w-2 h-2 rounded-full inline-block ${tab.dot}`}
            />
            {tab.label}
            {tab.count !== undefined && (
              <span className="opacity-70 ml-0.5">({tab.count})</span>
            )}
          </button>
        ))}
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
          {DAYS_SHORT.map((d, i) => (
            <div
              key={`day-header-${i}`}
              className="text-center text-[12px] sm:text-[13px] font-bold text-gray-500 py-3"
            >
              {d}
            </div>
          ))}
        </div>

        <div className="bg-white py-4 px-2">
          {Array.from({ length: maxRows }).map((_, rowIdx) => (
            <div key={`row-${rowIdx}`} className="grid grid-cols-7 gap-2 mb-3">
              {Array.from({ length: 7 }).map((_, colIdx) => {
                const dotsInThisDay = dotsByDay[colIdx] || [];
                const filteredDotsInDay = activeFilter
                  ? dotsInThisDay.filter((d) => d.filter === activeFilter)
                  : dotsInThisDay;

                const dot = filteredDotsInDay[rowIdx];

                if (!dot) {
                  return (
                    <div
                      key={`empty-${colIdx}-${rowIdx}`}
                      className="flex justify-center h-3 w-3 mx-auto"
                    />
                  );
                }

                return (
                  <div
                    key={`dot-${dot.id}-${colIdx}-${rowIdx}`}
                    onClick={() => {
                      const workout = WEEKLY_WORKOUTS.find(
                        (w) => w.dayIdx === dot.day && w.filter === dot.filter,
                      );
                      if (workout) setSelectedWorkout(workout);
                    }}
                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full ${dot.color} cursor-pointer hover:scale-125 transition-all duration-300 mx-auto shadow-sm`}
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
        <div className="mb-4">
          <h3 className="text-[16px] sm:text-[18px] font-extrabold text-gray-900">
            Weekly Schedule
          </h3>
          <p className="text-[12px] sm:text-[14px] text-gray-500 mt-0.5">
            {Object.values(filteredWorkoutsByDay).flat().length} total
            Workout(s) scheduled this week
          </p>
        </div>

        <div className="space-y-6">
          {DAY_ORDER.map((day) => {
            const workouts = filteredWorkoutsByDay[day];
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
                      className="relative flex-shrink-0 w-[190px] sm:w-[220px] h-[130px] sm:h-[150px] rounded-2xl overflow-hidden shadow-md cursor-pointer group active:scale-95 transition-transform"
                    >
                      <div className={`absolute inset-0 ${w.imageBg}`} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-white text-[11px] font-bold">
                          {w.time}
                        </span>
                      </div>

                      <div className="absolute bottom-3 left-3 right-3">
                        <p className="text-white text-[14px] sm:text-[16px] font-black leading-tight uppercase tracking-tight">
                          {w.name}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-white/80 text-[10px] sm:text-[12px] font-medium">
                            {w.duration}
                          </span>
                          <span
                            className={`${w.badgeBg} text-white text-[9px] font-black px-2 py-0.5 rounded-full`}
                          >
                            {w.badge}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Add Workout Modal ── */}
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

      {/* ── Workout Detail Modal ── */}
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
                <div className={`absolute inset-0 ${selectedWorkout.imageBg}`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6">
                  <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase mb-2">
                    {selectedWorkout.badge}
                  </span>
                  <h3 className="text-[28px] font-black text-center leading-tight">
                    {selectedWorkout.name}
                  </h3>
                  <p className="text-[14px] font-medium opacity-80 mt-1">
                    {selectedWorkout.duration} • {selectedWorkout.sub}
                  </p>
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
                      <p className="text-[14px] font-black text-gray-900">{selectedWorkout.day}</p>
                      <p className="text-[12px] text-gray-500 font-bold">{selectedWorkout.time.replace("By ", "")}</p>
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