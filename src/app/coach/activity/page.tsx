"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, ChevronDown, Search, X, User } from "lucide-react";

const TIME_FILTERS = ["All Time", "Today", "This Week", "Last 30 Days"];

const LOG_TYPES = [
  "Other Logs",
  "Cardio",
  "Workout",
  "Courses",
  "Session",
  "Recovery",
  "Custom Activity",
  "Macro",
  "Hydration",
  "Field Workout",
  "Supplemental",
];

// Dummy data — replace with API when available
const DUMMY_LOGS = [
  {
    id: 1,
    date: "May/28/2026 12:56 pm",
    player: "Sneha Gharge 96",
    username: "sneha09",
    workout: "LOWER BODY",
    thumbnail: null,
    team: "SP",
    type: "Workout Start",
  },
  {
    id: 2,
    date: "May/28/2026 12:08 pm",
    player: "Sneha Gharge 96",
    username: "sneha09",
    workout: "ALPHA ARMS",
    thumbnail: null,
    team: "SP",
    type: "Workout Start",
  },
  {
    id: 3,
    date: "May/15/2026 6:10 pm",
    player: "komal rajpure",
    username: "komal123",
    workout: "LOWER BODY",
    thumbnail: null,
    team: "SP",
    type: "Workout Start",
  },
];

function ActivityContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const teamId = searchParams.get("team_id") ?? "";

  const [logType, setLogType] = useState("Other Logs");
  const [timeFilter, setTimeFilter] = useState("All Time");
  const [search, setSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState("All Team");

  const filtered = DUMMY_LOGS.filter((log) => {
    const q = search.toLowerCase();
    return (
      log.player.toLowerCase().includes(q) ||
      log.username.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#f0f0f0]">

      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between sticky top-0 z-40">
        <div className="relative">
          <select
            value={logType}
            onChange={(e) => setLogType(e.target.value)}
            className="h-9 pl-3 pr-8 rounded-lg border border-gray-200 text-sm font-semibold text-[#222] bg-white appearance-none outline-none"
          >
            {LOG_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-500" />
        </div>

        <button
          onClick={() => router.back()}
          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-800 transition"
        >
          <X size={20} />
        </button>
      </div>

      {/* Title nav */}
      <div className="flex items-center justify-center gap-6 py-4 bg-white border-b border-gray-100">
        <button className="text-gray-400 hover:text-gray-600 transition">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-[#8B5CF6]">{logType}</h1>
        <button className="text-gray-400 hover:text-gray-600 transition">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Filters */}
      <div className="px-4 py-3 flex flex-col sm:flex-row gap-2">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search By Name & Username"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 rounded-lg border border-gray-200 bg-white pl-8 pr-3 text-sm outline-none focus:border-[#8B5CF6] transition"
          />
        </div>

        {/* Team filter */}
        <div className="relative">
          <select
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            className="h-9 pl-3 pr-8 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-[#222] appearance-none outline-none min-w-[140px]"
          >
            <option>All Team</option>
            <option>SP</option>
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-500" />
        </div>

        {/* Time filter */}
        <div className="relative">
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="h-9 pl-3 pr-8 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-[#222] appearance-none outline-none min-w-[130px]"
          >
            {TIME_FILTERS.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-500" />
        </div>
      </div>

      {/* Log list */}
      <div className="px-4 pb-8 flex flex-col gap-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-gray-400 text-sm">
            No activity found.
          </div>
        ) : (
          filtered.map((log) => (
            <div key={log.id} className="bg-white rounded-2xl p-4 shadow-sm">
              {/* Top row */}
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs text-gray-400">{log.date}</p>
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-semibold text-gray-600">
                    {log.player}({log.username})
                  </p>
                  <div className="w-7 h-7 rounded-full bg-[#8B5CF6] flex items-center justify-center">
                    <User size={14} className="text-white" />
                  </div>
                </div>
              </div>

              {/* Workout */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-14 h-14 rounded-xl bg-gray-200 shrink-0 overflow-hidden">
                  {log.thumbnail ? (
                    <img src={log.thumbnail} alt={log.workout} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400" />
                  )}
                </div>
                <p className="text-sm font-bold text-[#222] uppercase">{log.workout}</p>
              </div>

              {/* Bottom row */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500">{log.team}</span>
                <span className="text-xs font-semibold text-[#8B5CF6]">{log.type}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function ActivityPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f0f0f0] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ActivityContent />
    </Suspense>
  );
}
