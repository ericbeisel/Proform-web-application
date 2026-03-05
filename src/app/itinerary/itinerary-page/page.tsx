"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

type FilterTab =
  | "PRIMARY"
  | "SUPPLEMENTAL"
  | "CONDITIONING"
  | "RECOVERY"
  | "HYDRATION"
  | "CARDIO"
  | "CUSTOM";

const HOURS = [
  "12 AM","1 AM","2 AM","3 AM","4 AM","5 AM","6 AM","7 AM","8 AM","9 AM",
  "10 AM","11 AM","12 PM","1 PM","2 PM","3 PM","4 PM","5 PM","6 PM",
  "7 PM","8 PM","9 PM","10 PM","11 PM",
];

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const FILTER_TABS: FilterTab[] = [
  "PRIMARY","SUPPLEMENTAL","CONDITIONING","RECOVERY","HYDRATION","CARDIO","CUSTOM",
];

const ALL_EVENTS = [
  { id: 1,  col: 1, row: 6,  color: "bg-cyan-400",    filter: "HYDRATION",    label: "" },
  { id: 2,  col: 2, row: 6,  color: "bg-cyan-400",    filter: "HYDRATION",    label: "" },
  { id: 3,  col: 3, row: 6,  color: "bg-yellow-400",  filter: "CONDITIONING", label: "" },
  { id: 4,  col: 4, row: 6,  color: "bg-cyan-400",    filter: "HYDRATION",    label: "" },
  { id: 5,  col: 6, row: 6,  color: "bg-cyan-400",    filter: "HYDRATION",    label: "" },
  { id: 6,  col: 1, row: 8,  color: "bg-cyan-400",    filter: "HYDRATION",    label: "" },
  { id: 7,  col: 1, row: 9,  color: "bg-blue-500",    filter: "PRIMARY",      label: "SILVER-BACK" },
  { id: 8,  col: 4, row: 10, color: "bg-blue-500",    filter: "PRIMARY",      label: "" },
  { id: 9,  col: 5, row: 8,  color: "bg-blue-500",    filter: "PRIMARY",      label: "" },
  { id: 10, col: 6, row: 11, color: "bg-red-400",     filter: "CARDIO",       label: "" },
  { id: 11, col: 3, row: 12, color: "bg-blue-500",    filter: "PRIMARY",      label: "" },
  { id: 12, col: 3, row: 12, color: "bg-green-500",   filter: "SUPPLEMENTAL", label: "" },
  { id: 13, col: 2, row: 17, color: "bg-red-400",     filter: "CARDIO",       label: "" },
  { id: 14, col: 5, row: 14, color: "bg-cyan-400",    filter: "HYDRATION",    label: "" },
  { id: 15, col: 0, row: 16, color: "bg-purple-500",  filter: "RECOVERY",     label: "" },
  { id: 16, col: 6, row: 16, color: "bg-purple-500",  filter: "RECOVERY",     label: "" },
  { id: 17, col: 4, row: 19, color: "bg-gray-400",    filter: "CUSTOM",       label: "" },
];

const WORKOUTS = [
  { id: 1, initial: "P", bg: "bg-blue-500",   name: "SILVER-BACK",     sub: "Back, Glutes",     day: "Mon, Dec 23", time: "8:00 – 10:00 AM", filter: "PRIMARY" },
  { id: 2, initial: "S", bg: "bg-green-500",  name: "WOLF-PACK",       sub: "Full Body",        day: "Wed, Dec 25", time: "12:30 – 1:00 PM", filter: "SUPPLEMENTAL" },
  { id: 3, initial: "M", bg: "bg-yellow-400", name: "Morning Sprint",  sub: "Cardio",           day: "Wed, Dec 25", time: "9:00 – 9:30 AM",  filter: "CONDITIONING" },
  { id: 4, initial: "R", bg: "bg-purple-500", name: "Recovery Flow",   sub: "",                 day: "Sun, Dec 29", time: "8:00 – 8:30 PM",  filter: "RECOVERY" },
  { id: 5, initial: "H", bg: "bg-cyan-500",   name: "Hydration Check", sub: "N/A",              day: "Mon, Oct 27", time: "6:00 – 6:30 AM",  filter: "HYDRATION" },
  { id: 6, initial: "E", bg: "bg-red-500",    name: "Evening Sprint",  sub: "Run/Treadmill",    day: "Tue, Oct 28", time: "6:00 – 6:30 PM",  filter: "CARDIO" },
  { id: 7, initial: "B", bg: "bg-blue-500",   name: "Break Squad",     sub: "4 Workouts",       day: "Wed, Oct 29", time: "8:00 – 9:00 AM",  filter: "PRIMARY" },
  { id: 8, initial: "G", bg: "bg-gray-500",   name: "Strange Routine", sub: "",                 day: "Thu, Oct 30", time: "7:00 – 7:30 PM",  filter: "CUSTOM" },
];

export default function ItineraryPage() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("PRIMARY");

  const visibleEvents = ALL_EVENTS.filter((e) => e.filter === activeFilter);
  const visibleWorkouts = WORKOUTS.filter((w) => w.filter === activeFilter);

  return (
    <div className="flex flex-col min-h-full px-12">

      {/* ── Filter Pills Row ── */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 overflow-x-auto scrollbar-hide flex-shrink-0 bg-white">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-4 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap border transition-all duration-150 ${
              activeFilter === tab
                ? "bg-purple-700 text-white border-purple-700 shadow-sm"
                : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Weekly Agenda toggle ── */}
      <div className="flex items-center gap-2 px-5 py-2 bg-white flex-shrink-0">
        <input type="checkbox" defaultChecked className="accent-purple-600 w-3.5 h-3.5" id="weeklyAgenda" />
        <label htmlFor="weeklyAgenda" className="text-[12px] text-purple-600 font-semibold cursor-pointer select-none">
          Weekly Agenda
        </label>
      </div>

      {/* ── Calendar Grid ── */}
      <div className="flex-1 overflow-x-auto">
        <div className="min-w-[640px]">
          {/* Day headers — sticky */}
          <div className="sticky top-0 z-20 bg-white border-b border-gray-100 shadow-sm">
            <div className="grid grid-cols-[60px_repeat(7,1fr)]">
              <div className="py-2.5" />
              {DAYS.map((d) => (
                <div
                  key={d}
                  className="text-center text-[12px] font-bold text-gray-500 py-2.5 border-l border-gray-100"
                >
                  {d}
                </div>
              ))}
            </div>
          </div>

          {/* Hour rows */}
          {HOURS.map((hour, hi) => (
            <div
              key={hour}
              className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-gray-50"
              style={{ height: 52 }}
            >
              {/* Time label */}
              <div className="text-[10px] text-gray-300 pr-3 pt-1.5 text-right select-none font-medium">
                {hour}
              </div>
              {/* Day cells */}
              {DAYS.map((_, di) => {
                const cellEvents = visibleEvents.filter(
                  (e) => e.col === di && e.row === hi
                );
                return (
                  <div key={di} className="border-l border-gray-100 relative">
                    {cellEvents.map((ev, ei) => (
                      <div
                        key={ev.id}
                        className={`absolute rounded-md flex items-center px-1.5 cursor-pointer hover:opacity-80 transition-opacity ${ev.color}`}
                        style={{
                          top: 4,
                          bottom: 4,
                          left:
                            cellEvents.length > 1
                              ? ei === 0
                                ? 2
                                : "50%"
                              : 2,
                          right:
                            cellEvents.length > 1
                              ? ei === 0
                                ? "50%"
                                : 2
                              : 2,
                        }}
                      >
                        {ev.label && (
                          <span className="text-white text-[9px] font-bold truncate">
                            {ev.label}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* ── Add Workout CTA ── */}
      <div className="px-5 py-3 bg-white border-t border-gray-100 flex-shrink-0">
        <button className="w-full bg-purple-700 hover:bg-purple-800 text-white text-[13px] font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm">
          <Plus size={16} strokeWidth={2.5} />
          Add Workout
        </button>
      </div>

      {/* ── This Week's Workouts ── */}
      <div className="px-5 pb-6 bg-white flex-shrink-0">
        <h3 className="text-[14px] font-bold text-gray-900 mb-3">This Week's Workouts</h3>
        {visibleWorkouts.length === 0 ? (
          <p className="text-[12px] text-gray-300 py-3">No workouts for this filter.</p>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {visibleWorkouts.map((w) => (
              <div
                key={w.id}
                className="bg-white rounded-2xl border border-gray-150 p-4 flex flex-col gap-0 shadow-sm hover:shadow-md transition-shadow"
                style={{ border: "1px solid #e8e8ee" }}
              >
                {/* Top: avatar + name/sub */}
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`w-10 h-10 rounded-full ${w.bg} flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0`}
                  >
                    {w.initial}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[13px] font-bold text-gray-900 truncate leading-tight">{w.name}</p>
                    {w.sub && <p className="text-[11px] text-gray-400 truncate mt-0.5">{w.sub}</p>}
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100 mb-3" />

                {/* Bottom: date + time */}
                <div>
                  <p className="text-[11px] text-gray-400 mb-0.5">{w.day}</p>
                  <p className="text-[12px] font-bold text-gray-800">{w.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}