"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, ChevronDown, X } from "lucide-react";
import { coachApi, LeaderboardCategoryReference } from "@/api/coach/route";

const MAX_SELECTIONS = 12;
const TIME_OPTIONS = ["1 Day", "1 Week", "30 Days", "3 Months", "1 Year", "All Time"];

// ── Content ───────────────────────────────────────────────────────────────────

function LeaderboardOptionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const teamId = searchParams.get("team_id") ?? "";
  const teamName = searchParams.get("team_name") ?? "My Team";

  const [allMetrics, setAllMetrics] = useState<LeaderboardCategoryReference[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [timeFilter, setTimeFilter] = useState("All Time");
  const [justCleared, setJustCleared] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load configured options and available metrics
  useEffect(() => {
    if (!teamId) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const categories = await coachApi.getLeaderboardCategories();
        setAllMetrics(categories);

        const teamConfig = await coachApi.getTeamConfig(teamId);
        if (teamConfig?.leaderboardOption) {
          setSelected(new Set(teamConfig.leaderboardOption));
        }
        if (teamConfig?.leaderboardFilter) {
          setTimeFilter(teamConfig.leaderboardFilter);
        }
      } catch (err) {
        console.error("Failed to load options data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [teamId]);

  const remaining = MAX_SELECTIONS - selected.size;

  const toggle = (metricTitle: string) => {
    setJustCleared(false);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(metricTitle)) {
        next.delete(metricTitle);
      } else if (next.size < MAX_SELECTIONS) {
        next.add(metricTitle);
      }
      return next;
    });
  };

  const clearAll = () => {
    setSelected(new Set());
    setJustCleared(true);
  };

  const handleSave = async () => {
    if (selected.size === 0) {
      alert("Please select at least one metric category to save.");
      return;
    }
    try {
      await coachApi.saveLeaderboardOptions(teamId, {
        options: Array.from(selected),
        filter: timeFilter,
      });
      router.push(`/coach/leaderboard?team_id=${teamId}&team_name=${encodeURIComponent(teamName)}`);
    } catch (err) {
      console.error(err);
      alert("Failed to save leaderboard options.");
    }
  };

  const handleSaveMultiple = async () => {
    if (selected.size === 0) {
      alert("Please select at least one metric category to save.");
      return;
    }
    try {
      const coachTeams = await coachApi.getCoachTeams();
      await Promise.all(
        coachTeams.map((t) =>
          coachApi.saveLeaderboardOptions(t.id, {
            options: Array.from(selected),
            filter: timeFilter,
          })
        )
      );
      router.push(`/coach/leaderboard?team_id=${teamId}&team_name=${encodeURIComponent(teamName)}`);
    } catch (err) {
      console.error(err);
      alert("Failed to save leaderboard options for multiple teams.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm font-semibold">Loading options configuration...</p>
        </div>
      </div>
    );
  }

  // Split dynamic categories into two visual columns
  const mid = Math.ceil(allMetrics.length / 2);
  const section1 = allMetrics.slice(0, mid);
  const section2 = allMetrics.slice(mid);

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
        <div className="border border-gray-200 rounded-lg overflow-hidden mb-4 bg-white">
          {section1.length === 0 ? (
            <p className="text-sm text-gray-400 p-4 text-center">No categories available.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3">
              {section1.map((metric, i) => {
                const col = i % 3;
                const isChecked = selected.has(metric.title);
                const disabled = !isChecked && remaining === 0;
                return (
                  <label
                    key={metric.id}
                    className={`flex items-center gap-2.5 px-3 py-2.5 cursor-pointer transition border-b border-gray-100
                      ${disabled ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-50"}
                      ${col > 0 ? "sm:border-l sm:border-gray-200" : ""}
                    `}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      disabled={disabled}
                      onChange={() => toggle(metric.title)}
                      className="accent-[#3B82F6] w-3.5 h-3.5 shrink-0"
                    />
                    <span className="text-xs text-gray-700 leading-tight">{metric.title}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Section 2 */}
        <div className="border border-gray-200 rounded-lg overflow-hidden mb-6 bg-white">
          {section2.length === 0 ? (
            <p className="text-sm text-gray-400 p-4 text-center">No additional categories available.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3">
              {section2.map((metric, i) => {
                const col = i % 3;
                const isChecked = selected.has(metric.title);
                const disabled = !isChecked && remaining === 0;
                return (
                  <label
                    key={metric.id}
                    className={`flex items-center gap-2.5 px-3 py-2.5 cursor-pointer transition border-b border-gray-100
                      ${disabled ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-50"}
                      ${col > 0 ? "sm:border-l sm:border-gray-200" : ""}
                    `}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      disabled={disabled}
                      onChange={() => toggle(metric.title)}
                      className="accent-[#3B82F6] w-3.5 h-3.5 shrink-0"
                    />
                    <span className="text-xs text-gray-700 leading-tight">{metric.title}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col items-center gap-3 pb-8">
          <button
            onClick={handleSaveMultiple}
            className="text-xs font-bold text-gray-500 uppercase tracking-wider hover:text-gray-700 transition"
          >
            Save Changes For Multiple Teams
          </button>
          <button
            onClick={handleSave}
            className="h-10 px-8 rounded-full bg-[#3B82F6] text-white text-sm font-bold hover:bg-[#2563EB] transition shadow"
          >
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
