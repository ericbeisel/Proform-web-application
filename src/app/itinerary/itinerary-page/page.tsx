"use client";

import { useState, useEffect } from "react";
import { Plus, Calendar, X } from "lucide-react";
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

// Dot grid: each entry is [dayIndex (0=Sun..6=Sat), color]
const ALL_DOTS: {
  id: number;
  day: number;
  color: string;
  filter: FilterTab;
}[] = [
  // Row 1
  { id: 1, day: 0, color: "bg-blue-500", filter: "PRIMARY" },
  { id: 2, day: 1, color: "bg-blue-500", filter: "PRIMARY" },
  { id: 3, day: 2, color: "bg-yellow-400", filter: "CONDITIONING" },
  { id: 4, day: 3, color: "bg-blue-500", filter: "PRIMARY" },
  { id: 5, day: 4, color: "bg-red-400", filter: "CARDIO" },
  { id: 6, day: 5, color: "bg-yellow-400", filter: "CONDITIONING" },
  { id: 7, day: 6, color: "bg-green-500", filter: "SUPPLEMENTAL" },
  // Row 2
  { id: 8, day: 0, color: "bg-yellow-400", filter: "CONDITIONING" },
  { id: 9, day: 1, color: "bg-red-400", filter: "CARDIO" },
  { id: 10, day: 2, color: "bg-red-400", filter: "CARDIO" },
  { id: 11, day: 3, color: "bg-yellow-400", filter: "CONDITIONING" },
  { id: 12, day: 4, color: "bg-red-400", filter: "CARDIO" },
  { id: 13, day: 5, color: "bg-blue-500", filter: "PRIMARY" },
  { id: 14, day: 6, color: "bg-red-400", filter: "CARDIO" },
  // Row 3
  { id: 15, day: 1, color: "bg-yellow-400", filter: "CONDITIONING" },
  { id: 16, day: 2, color: "bg-yellow-400", filter: "CONDITIONING" },
  { id: 17, day: 3, color: "bg-gray-300", filter: "CUSTOM" },
  { id: 18, day: 4, color: "bg-green-500", filter: "SUPPLEMENTAL" },
  { id: 19, day: 5, color: "bg-red-400", filter: "CARDIO" },
  { id: 20, day: 6, color: "bg-blue-500", filter: "PRIMARY" },
  // Row 4
  { id: 21, day: 0, color: "bg-red-400", filter: "CARDIO" },
  { id: 22, day: 1, color: "bg-red-400", filter: "CARDIO" },
  { id: 23, day: 3, color: "bg-blue-500", filter: "PRIMARY" },
  { id: 24, day: 4, color: "bg-blue-500", filter: "PRIMARY" },
  { id: 25, day: 5, color: "bg-red-400", filter: "CARDIO" },
  { id: 26, day: 6, color: "bg-green-500", filter: "SUPPLEMENTAL" },
  // Row 5
  { id: 27, day: 0, color: "bg-green-500", filter: "SUPPLEMENTAL" },
  { id: 28, day: 1, color: "bg-green-500", filter: "SUPPLEMENTAL" },
  { id: 29, day: 6, color: "bg-blue-500", filter: "PRIMARY" },
];

// Grouped by day for the weekly schedule list
const WEEKLY_WORKOUTS: {
  id: number;
  name: string;
  sub: string;
  day: string;
  dayIdx: number;
  time: string;
  filter: FilterTab;
  badge: string;
  badgeBg: string;
  duration: string;
  started: boolean;
  image: string;
  imageBg: string;
}[] = [
  {
    id: 1,
    name: "RECOVERY FLOW",
    sub: "Full Body",
    day: "Sunday",
    dayIdx: 0,
    time: "By Sunday @ 08:00",
    filter: "RECOVERY",
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
    filter: "HYDRATION",
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
    filter: "PRIMARY",
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
    filter: "HYDRATION",
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
    filter: "CONDITIONING",
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
    filter: "PRIMARY",
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
    filter: "HYDRATION",
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
    filter: "PRIMARY",
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
    filter: "CUSTOM",
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
    filter: "PRIMARY",
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

// Mobile breakpoint hook
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    window.addEventListener("resize", listener);
    return () => window.removeEventListener("resize", listener);
  }, [matches, query]);

  return matches;
}

export default function ItineraryPage() {
  const router = useRouter();
  const [showAddWorkout, setShowAddWorkout] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterTab | null>(null);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [repeatType, setRepeatType] = useState<"week" | "repeat">("repeat");
  const [selectedWorkout, setSelectedWorkout] = useState<
    (typeof WEEKLY_WORKOUTS)[0] | null
  >(null);

  const isMobile = useMediaQuery("(max-width: 640px)");
  const isTablet = useMediaQuery("(min-width: 641px) and (max-width: 1024px)");

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  // Group workouts by day
  const workoutsByDay: Record<string, typeof WEEKLY_WORKOUTS> = {};
  for (const day of DAY_ORDER) workoutsByDay[day] = [];
  for (const w of WEEKLY_WORKOUTS) {
    workoutsByDay[w.day].push(w);
  }

  // Dots per day for the grid
  const dotsByDay: Record<number, typeof ALL_DOTS> = {};
  for (let i = 0; i < 7; i++) dotsByDay[i] = [];
  for (const d of ALL_DOTS) dotsByDay[d.day].push(d);

  // Max rows needed
  const maxRows = Math.max(...Object.values(dotsByDay).map((a) => a.length));

  // Filter workouts based on active filter
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
      <div className="flex justify-end px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
        <button
          onClick={() => router.push("/itinerary/queue")}
          className="bg-purple-700 hover:bg-purple-800 text-white text-[11px] sm:text-[12px] font-bold px-4 sm:px-5 py-2 rounded-xl transition-colors shadow-sm"
        >
          Go to Queue →
        </button>
      </div>

      {/* ── Filter Pills ── */}
      <div className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-3 overflow-x-auto scrollbar-hide flex-shrink-0">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() =>
              setActiveFilter(activeFilter === tab.key ? null : tab.key)
            }
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-[11px] font-bold whitespace-nowrap border ${
              activeFilter === tab.key
                ? `${tab.activeBg} ${tab.activeText} border-transparent`
                : tab.color
            }`}
          >
            <span
              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full inline-block ${tab.dot}`}
            />
            {isMobile && tab.label.length > 5
              ? tab.label.slice(0, 4) + "..."
              : tab.label}
            {tab.count !== undefined && (
              <span className="ml-0.5">({tab.count})</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Weekly Agenda toggle ── */}
      <div className="flex items-center gap-2 px-4 sm:px-6 py-1 flex-shrink-0">
        <Calendar size={isMobile ? 12 : 13} className="text-purple-600" />
        <span className="text-[11px] sm:text-[12px] text-purple-600 font-semibold">
          Weekly Agenda
        </span>
      </div>

      {/* ── Dot Grid Calendar ── */}
      <div className="mx-4 sm:mx-6 my-2 sm:my-3 rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 bg-white border-b border-gray-100">
          {(isMobile ? DAYS_SHORT : DAYS_FULL).map((d, i) => (
            <div
              key={i}
              className="text-center text-[10px] sm:text-[11px] font-semibold text-gray-500 py-2 sm:py-3"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Dot rows */}
        <div className="bg-white py-2 sm:py-4 px-1 sm:px-2">
          {Array.from({ length: maxRows }).map((_, rowIdx) => (
            <div
              key={rowIdx}
              className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 sm:mb-3"
            >
              {Array.from({ length: 7 }).map((_, colIdx) => {
                const dot = dotsByDay[colIdx][rowIdx];
                if (!dot)
                  return <div key={colIdx} className="flex justify-center" />;

                const isActive =
                  activeFilter === null || dot.filter === activeFilter;
                const opacity =
                  activeFilter && dot.filter !== activeFilter
                    ? "opacity-20"
                    : "opacity-100";

                return (
                  <div
                    key={dot.id}
                    onClick={() => {
                      const workout =
                        WEEKLY_WORKOUTS.find(
                          (w) =>
                            w.dayIdx === dot.day && w.filter === dot.filter,
                        ) ||
                        WEEKLY_WORKOUTS.find((w) => w.dayIdx === dot.day) ||
                        WEEKLY_WORKOUTS.find((w) => w.filter === dot.filter);
                      if (workout) setSelectedWorkout(workout);
                    }}
                    className={`w-2 h-2 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 rounded-full ${dot.color} ${opacity} cursor-pointer hover:scale-110 transition mx-auto`}
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
        className="mx-4 sm:mx-6 bg-purple-700 hover:bg-purple-800 text-white text-[12px] sm:text-[13px] font-bold py-3 sm:py-4 rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-md"
      >
        <Plus size={isMobile ? 14 : 16} strokeWidth={2.5} />
        Add Workout
      </button>

      {/* ── Weekly Schedule ── */}
      <div className="px-4 sm:px-6 pt-4 pb-8 flex-1">
        <div className="mb-1">
          <h3 className="text-[14px] sm:text-[16px] font-bold text-gray-900">
            Weekly Schedule
          </h3>
          <p className="text-[10px] sm:text-[12px] text-gray-400 mt-0.5">
            {Object.values(filteredWorkoutsByDay).flat().length} total
            Workout(s) on your schedule this week
          </p>
        </div>

        <div className="mt-4 space-y-4 sm:space-y-5">
          {DAY_ORDER.map((day) => {
            const workouts = filteredWorkoutsByDay[day];
            if (!workouts || workouts.length === 0) return null;

            return (
              <div key={day}>
                <p className="text-[10px] sm:text-[12px] font-bold text-gray-500 mb-1 sm:mb-2">
                  By {isMobile ? day.slice(0, 3) : day}
                </p>
                <div className="flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide pb-1 sm:pb-2">
                  {workouts.map((w) => (
                    <div
                      key={w.id}
                      onClick={() => setSelectedWorkout(w)}
                      className="relative flex-shrink-0 w-[160px] sm:w-[180px] md:w-[200px] h-[110px] sm:h-[120px] md:h-[130px] rounded-xl sm:rounded-2xl overflow-hidden shadow-sm cursor-pointer group"
                    >
                      {/* Background */}
                      <div className={`absolute inset-0 ${w.imageBg}`} />
                      {/* Dark overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                      {/* Top badge - hide on mobile to save space */}
                      {!isMobile && (
                        <div className="absolute top-2 right-2">
                          <span
                            className={`${w.badgeBg} text-white text-[8px] sm:text-[9px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full`}
                          >
                            {w.badge}
                          </span>
                        </div>
                      )}

                      {/* Time top left */}
                      <div className="absolute top-2 left-2 flex items-center gap-1">
                        <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-green-400 inline-block" />
                        <span className="text-white text-[8px] sm:text-[9px] opacity-80">
                          {isMobile ? w.time.split(" ")[0] : w.time}
                        </span>
                      </div>

                      {/* Content bottom */}
                      <div className="absolute bottom-0 left-0 right-0 px-2 sm:px-3 pb-1.5 sm:pb-2">
                        <p className="text-white text-[10px] sm:text-[12px] md:text-[13px] font-extrabold leading-tight tracking-wide uppercase">
                          {isMobile && w.name.length > 12
                            ? w.name.slice(0, 10) + "..."
                            : w.name}
                        </p>
                        {w.sub && w.sub !== "N/A" && !isMobile && (
                          <p className="text-white/70 text-[8px] sm:text-[10px] mt-0.5">
                            {w.sub}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-white/60 text-[7px] sm:text-[9px]">
                            {w.duration}
                          </span>
                          {/* Show badge on mobile only if needed */}
                          {isMobile && (
                            <span
                              className={`${w.badgeBg} text-white text-[7px] font-bold px-1.5 py-0.5 rounded-full`}
                            >
                              {w.badge.slice(0, 3)}
                            </span>
                          )}
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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full sm:w-[900px] sm:max-w-[95%] rounded-t-3xl sm:rounded-3xl p-5 sm:p-8 shadow-xl relative max-h-[90vh] overflow-y-auto">
            {/* Close button */}
            <button
              onClick={() => setShowAddWorkout(false)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-500 hover:text-black p-2"
            >
              <X size={isMobile ? 18 : 20} />
            </button>

            <h2 className="text-[18px] sm:text-[20px] font-bold mb-4 sm:mb-6 pr-8">
              Add Workout
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* LEFT SIDE */}
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <p className="text-xs sm:text-sm font-medium mb-1">
                    Details:
                  </p>
                  <input
                    className="w-full border rounded-xl p-2.5 sm:p-3 bg-gray-100 text-sm"
                    placeholder="Select workout"
                  />
                </div>

                <div>
                  <p className="text-[10px] sm:text-xs text-gray-500 mb-1">
                    Or type a custom activity *
                  </p>
                  <input
                    className="w-full border rounded-xl p-2.5 sm:p-3 bg-gray-100 text-sm"
                    placeholder="Add Custom Activity"
                  />
                </div>

                <div className="flex gap-2 sm:gap-3">
                  <button
                    onClick={() => setRepeatType("week")}
                    className={`flex-1 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition ${
                      repeatType === "week"
                        ? "bg-gray-800 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    This Week
                  </button>
                  <button
                    onClick={() => setRepeatType("repeat")}
                    className={`flex-1 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition ${
                      repeatType === "repeat"
                        ? "bg-purple-600 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    Repeat Weekly
                  </button>
                </div>

                <div>
                  <p className="text-xs sm:text-sm font-medium mb-1">
                    Set Time:
                  </p>
                  <input
                    type="time"
                    className="w-full border rounded-xl p-2.5 sm:p-3 bg-gray-100 text-sm"
                  />
                </div>
              </div>

              {/* RIGHT SIDE */}
              <div>
                <div className="flex justify-between mb-2">
                  <p className="text-xs sm:text-sm font-medium">Select Days</p>
                  <p className="text-[10px] sm:text-xs text-gray-400">
                    Select Multiple days
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  {DAYS_FULL.map((day) => {
                    const selected = selectedDays.includes(day);
                    return (
                      <button
                        key={day}
                        onClick={() => toggleDay(day)}
                        className={`rounded-xl py-2.5 sm:py-4 text-xs sm:text-sm font-medium border transition ${
                          selected
                            ? "bg-purple-600 text-white border-purple-600"
                            : "bg-gray-100 hover:bg-gray-200 border-gray-200"
                        }`}
                      >
                        {isMobile ? day.slice(0, 3) : day}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom button */}
            <button className="mt-5 sm:mt-8 w-full bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white font-bold py-3 sm:py-4 rounded-xl sm:rounded-2xl text-sm sm:text-base">
              Add and Update Itinerary
            </button>
          </div>
        </div>
      )}

      {/* ── Workout Detail Modal ── */}
      {/* ── Workout Detail Modal ── */}
      {selectedWorkout && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setSelectedWorkout(null)}
        >
          <div
            className="bg-white w-full sm:w-[520px] sm:max-w-[95%] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-center relative px-6 py-4">
              <h2 className="text-[15px] font-semibold text-gray-900">
                Workout
              </h2>
              <button
                onClick={() => setSelectedWorkout(null)}
                className="absolute right-4 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-500 transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            <div className="px-5 pb-6 space-y-4">
              {/* Complete label */}
              <p className="text-[12px] text-gray-500 font-medium">Complete:</p>

              {/* Image card */}
              <div className="relative h-[200px] sm:h-[230px] rounded-2xl overflow-hidden">
                <div
                  className={`absolute inset-0 ${selectedWorkout.imageBg}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4">
                  <p className="text-[11px] font-medium opacity-80 mb-1">
                    {selectedWorkout.badge}
                  </p>
                  <h3 className="text-[22px] sm:text-[26px] font-extrabold text-center text-purple-300 leading-tight">
                    {selectedWorkout.name.charAt(0).toUpperCase() +
                      selectedWorkout.name.slice(1).toLowerCase()}
                  </h3>
                  {selectedWorkout.sub && selectedWorkout.sub !== "N/A" && (
                    <p className="text-[12px] opacity-80 mt-1">
                      {selectedWorkout.sub}
                    </p>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap justify-center gap-2">
                {selectedWorkout.sub && selectedWorkout.sub !== "N/A" && (
                  <span className="px-4 py-1.5 rounded-full text-[11px] font-semibold bg-purple-100 text-purple-600 uppercase tracking-wide">
                    {selectedWorkout.sub}
                  </span>
                )}
                <span className="px-4 py-1.5 rounded-full text-[11px] font-semibold bg-purple-100 text-purple-600 uppercase tracking-wide">
                  {selectedWorkout.badge}
                </span>
              </div>

              {/* Schedule row */}
              <div className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2 text-[13px] text-gray-700">
                  <Calendar size={14} className="text-gray-400" />
                  <span>
                    {selectedWorkout.day} @{" "}
                    {selectedWorkout.time.replace("By ", "")}
                  </span>
                </div>
                <button className="w-8 h-8 bg-blue-100 hover:bg-blue-200 rounded-full flex items-center justify-center transition-colors">
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-1">
                <button className="flex-1 bg-purple-700 hover:bg-purple-800 text-white py-3.5 rounded-2xl font-bold text-[14px] transition-colors">
                  View Workout
                </button>
                <button className="flex-1 border-2 border-purple-700 text-purple-700 hover:bg-purple-50 py-3.5 rounded-2xl font-bold text-[14px] transition-colors">
                  View Queue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
