"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, ChevronDown, X } from "lucide-react";

// ── All selectable metrics ────────────────────────────────────────────────────

const ALL_METRICS = [
  "Back Squat (CMP)",
  "Band HK-Run (:12)",
  "Band HK-Run (:15)",
  "Battle Rope (:15 / HR-Test)",
  "Battle Rope (:30 / HR-Test)",
  "Battle Rope (:45 / HR-Test)",
  "Bench Press (CMP)",
  "Box Jump Challenge",
  "Broad Jump (in)",
  "C2 Rower (:15) - Meters",
  "Cardio (kCal) - This Week",
  "Deadlift (CMP)",
  "Forceplate Squat Hop",
  "Grip Strength Test",
  "Max 10-yd Split (Timed)",
  "Max 100m Dash (Timed)",
  "Max 20-yd Split (Timed)",
  "Max 200m Dash (Timed)",
  "Max 3 Cone Test",
  "Max 300m Dash (Timed)",
  "Max 40-yd Dash",
  "Max Arc-Sprint (:09)",
  "Max Arc-Sprint (:12)",
  "Max Arc-Sprint (:15)",
  "Max Broad Jump",
  "Max Curve-Treadmill (:09)",
  "Max Curve-Treadmill (:15)",
  "Max L Cone Test",
  "Max Ski Erg (150m)",
  "Max Ski Erg (80m)",
  "Max Ski-Erg - Timed (:20)",
  "Max Ski Erg - Timed (:60)",
  "Max Wattbike (:09)",
  "Max Wattbike (:15)",
  "Max Wattbike (Tempo)",
  "Max Wattbike (W)",
  "Ov. Strength",
  "PRESS (UES)",
  "PULL (HHP)",
  "PUSH (HHO)",
  "Power Clean (CMP)",
  "Pull Up (Reps)",
  "RAISE (OVS)",
  "Recovery (Minutes) - Last 4 Weeks",
  "Recovery (Minutes) - This Week",
  "SQUAT (LES)",
  "Side Raise Test (S)",
  "Ski-Erg (100i) - Seconds",
  "Ski-Erg (150m) - Seconds",
  "Ski-Erg (:20) - Meters",
  "THRUST (CCP)",
  "Vertical (in)",
];

const MAX_SELECTIONS = 12;

const TIME_OPTIONS = ["1 Day", "1 Week", "30 Days", "3 Months", "1 Year", "All Time"];

// ── Content ───────────────────────────────────────────────────────────────────

function LeaderboardOptionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const teamName = searchParams.get("team_name") ?? "Alpha Coaches";

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [timeFilter, setTimeFilter] = useState("1 Day");
  const [justCleared, setJustCleared] = useState(false);

  const remaining = MAX_SELECTIONS - selected.size;

  const toggle = (metric: string) => {
    setJustCleared(false);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(metric)) {
        next.delete(metric);
      } else if (next.size < MAX_SELECTIONS) {
        next.add(metric);
      }
      return next;
    });
  };

  const clearAll = () => {
    setSelected(new Set());
    setJustCleared(true);
  };

  // Split into two visual sections (first 27, rest)
  const section1 = ALL_METRICS.slice(0, 27);
  const section2 = ALL_METRICS.slice(27);

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left arrow nav */}
      <div className="flex items-start pt-6 pl-2 shrink-0">
        <button
          onClick={() => router.back()}
          className="text-gray-400 hover:text-gray-600 transition mt-1"
        >
          <ChevronRight size={20} className="rotate-180" />
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 px-4 sm:px-6 py-5 max-w-4xl mx-auto w-full">

        {/* Team header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {teamName[0]?.toUpperCase()}
            </div>
            <span className="text-sm text-gray-600 italic">{teamName}</span>
          </div>
          <button
            onClick={() => router.back()}
            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Title */}
        <h1 className="text-xl font-bold text-gray-900 text-center mb-5">
          Leaderboard Options
        </h1>

        {/* Filter row */}
        <div className="flex items-center justify-between mb-2">
          <div className="relative">
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="h-9 pl-3 pr-8 rounded-lg border border-gray-300 text-sm text-gray-700 bg-white appearance-none outline-none focus:border-blue-400 transition"
            >
              {TIME_OPTIONS.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
          </div>
          <button
            onClick={clearAll}
            className="text-sm font-bold text-red-500 hover:text-red-700 transition uppercase tracking-wide"
          >
            Clear All
          </button>
        </div>

        {/* Remaining count */}
        <p className="text-center text-[#e53e3e] font-bold text-sm mb-4">
          {justCleared
            ? "You have only 12 Left. Select at least one to save the options"
            : `You have only ${remaining} Left`}
        </p>

        {/* Section 1 */}
        <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x-0">
            {section1.map((metric, i) => {
              const col = i % 3;
              const isChecked = selected.has(metric);
              const disabled = !isChecked && remaining === 0;
              return (
                <label
                  key={metric}
                  className={`flex items-center gap-2.5 px-3 py-2.5 cursor-pointer transition
                    ${disabled ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-50"}
                    ${i >= 3 ? "border-t border-gray-200" : ""}
                    ${col > 0 ? "sm:border-l sm:border-gray-200" : ""}
                  `}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    disabled={disabled}
                    onChange={() => toggle(metric)}
                    className="accent-[#3B82F6] w-3.5 h-3.5 shrink-0"
                  />
                  <span className="text-xs text-gray-700 leading-tight">{metric}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Section 2 */}
        <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x-0">
            {section2.map((metric, i) => {
              const col = i % 3;
              const isChecked = selected.has(metric);
              const disabled = !isChecked && remaining === 0;
              return (
                <label
                  key={metric}
                  className={`flex items-center gap-2.5 px-3 py-2.5 cursor-pointer transition
                    ${disabled ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-50"}
                    ${i >= 3 ? "border-t border-gray-200" : ""}
                    ${col > 0 ? "sm:border-l sm:border-gray-200" : ""}
                  `}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    disabled={disabled}
                    onChange={() => toggle(metric)}
                    className="accent-[#3B82F6] w-3.5 h-3.5 shrink-0"
                  />
                  <span className="text-xs text-gray-700 leading-tight">{metric}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col items-center gap-3 pb-8">
          <button className="text-xs font-bold text-gray-500 uppercase tracking-wider hover:text-gray-700 transition">
            Save Changes For Multiple Teams
          </button>
          <button className="h-10 px-8 rounded-full bg-[#3B82F6] text-white text-sm font-bold hover:bg-[#2563EB] transition shadow">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Export ────────────────────────────────────────────────────────────────────

export default function LeaderboardOptionsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LeaderboardOptionsContent />
    </Suspense>
  );
}
