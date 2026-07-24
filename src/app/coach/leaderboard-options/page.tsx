"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ChevronDown, CheckCircle2, Trophy, X } from "lucide-react";
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
  const [loading, setLoading] = useState(true);
  // Requires an explicit opt-in checkbox before this bulk action (applies to
  // every one of the coach's teams) can be triggered.
  const [confirmMultiple, setConfirmMultiple] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load configured options and available metrics
  useEffect(() => {
    if (!teamId) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const categories = await coachApi.getLeaderboardCategories();
        setAllMetrics(categories);

        const settings = await coachApi.getTeamLeaderboardSettings(teamId);
        // hasSelections: false means these are just the backend's 3-item
        // default, not a real saved choice — still worth pre-checking them
        // (matches what /coach/leaderboard would show), so no branch needed
        // on hasSelections here.
        if (settings?.leaderboardOption) {
          setSelected(new Set(settings.leaderboardOption));
        }
        if (settings?.leaderboardFilter) {
          setTimeFilter(settings.leaderboardFilter);
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
  const atLimit = remaining === 0;

  const toggle = (metricTitle: string) => {
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

  const clearAll = () => setSelected(new Set());

  const handleSave = async () => {
    if (selected.size === 0) {
      alert("Please select at least one metric category to save.");
      return;
    }
    setSaving(true);
    try {
      const res = await coachApi.saveLeaderboardSettings({
        teamIds: [Number(teamId)],
        leaderboardOption: Array.from(selected),
        leaderboardFilter: timeFilter,
      });
      if (res.failed.length > 0) {
        alert(res.failed.map((f) => f.error).join("\n"));
        return;
      }
      router.push(`/coach/leaderboard?team_id=${teamId}&team_name=${encodeURIComponent(teamName)}`);
    } catch (err) {
      console.error(err);
      alert("Failed to save leaderboard options.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveMultiple = async () => {
    if (!confirmMultiple) {
      alert("Please check the confirmation box before applying to multiple teams.");
      return;
    }
    if (selected.size === 0) {
      alert("Please select at least one metric category to save.");
      return;
    }
    setSaving(true);
    try {
      const coachTeams = await coachApi.getCoachTeams();
      const res = await coachApi.saveLeaderboardSettings({
        teamIds: coachTeams.map((t) => Number(t.id)),
        leaderboardOption: Array.from(selected),
        leaderboardFilter: timeFilter,
      });
      if (res.failed.length > 0) {
        alert(
          `Saved for ${res.updated.length} team(s), but failed for ${res.failed.length}:\n` +
            res.failed.map((f) => `Team ${f.teamId}: ${f.error}`).join("\n"),
        );
        return;
      }
      router.push(`/coach/leaderboard?team_id=${teamId}&team_name=${encodeURIComponent(teamName)}`);
    } catch (err) {
      console.error(err);
      alert("Failed to save leaderboard options for multiple teams.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm font-semibold">Loading options configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* Header — same purple gradient + decorative bubbles as /metrics's top section */}
      <div
        className="relative overflow-hidden sticky top-0 z-40 px-4 sm:px-6 lg:px-10 pt-4 pb-4 rounded-b-3xl"
        style={{ background: "linear-gradient(135deg, #9B59D4 0%, #7C3AED 100%)" }}
      >
        {/* Decorative circles */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{ width: 260, height: 260, backgroundColor: "rgba(255,255,255,0.08)", top: -80, left: -60 }}
        />
        <div
          className="absolute rounded-full pointer-events-none"
          style={{ width: 180, height: 180, backgroundColor: "rgba(255,255,255,0.07)", bottom: -80, right: 40 }}
        />

        <div className="relative flex items-center justify-between gap-3">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:opacity-80 transition shrink-0"
            style={{ backgroundColor: "rgba(255,255,255,0.18)" }}
          >
            <ArrowLeft size={16} className="text-white" />
          </button>

          <div className="min-w-0 flex-1 text-center">
            <h1 className="text-lg sm:text-2xl font-bold text-white leading-tight truncate">
              Leaderboard Options
            </h1>
            <div className="flex items-center justify-center gap-2 mt-1">
              <div className="w-5 h-5 rounded flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: "rgba(255,255,255,0.25)" }}>
                {teamName[0]?.toUpperCase()}
              </div>
              <span className="text-base sm:text-lg font-semibold truncate max-w-[160px] sm:max-w-none" style={{ color: "rgba(255,255,255,0.85)" }}>
                {teamName}
              </span>
            </div>
          </div>

          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:opacity-80 transition shrink-0"
            style={{ backgroundColor: "rgba(255,255,255,0.18)" }}
          >
            <X size={16} className="text-white" />
          </button>
        </div>
      </div>

      {/* Body — full page width, no narrow centered card. Bottom padding
          clears the fixed save bar below so the last grid row is never
          hidden behind it. */}
      <div className="px-4 sm:px-6 lg:px-10 pt-5 sm:pt-8 pb-28">
        {/* Filter + count + clear row */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="relative">
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="h-10 pl-4 pr-9 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 bg-white appearance-none outline-none focus:border-[#8B5CF6] transition"
            >
              {TIME_OPTIONS.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${
                atLimit
                  ? "bg-red-50 text-red-600 border border-red-200"
                  : "bg-[#f5f0ff] text-[#7C3AED] border border-[#ede9fe]"
              }`}
            >
              <Trophy size={12} />
              {selected.size} / {MAX_SELECTIONS} selected
            </span>

            <button
              onClick={clearAll}
              disabled={selected.size === 0}
              className="text-xs font-bold text-red-500 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed transition uppercase tracking-wide"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Category grid — spans the full width, more columns as the
            viewport widens instead of staying boxed into a narrow card */}
        <div className="mb-8">
          {allMetrics.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10">No categories available.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {allMetrics.map((metric) => {
                const isChecked = selected.has(metric.title);
                const disabled = !isChecked && atLimit;
                return (
                  <label
                    key={metric.id}
                    className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl border transition ${
                      disabled
                        ? "opacity-40 cursor-not-allowed border-gray-100 bg-gray-50"
                        : isChecked
                          ? "border-[#8B5CF6] bg-[#f5f0ff] cursor-pointer"
                          : "border-gray-200 bg-white hover:border-[#8B5CF6]/40 hover:bg-gray-50 cursor-pointer"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      disabled={disabled}
                      onChange={() => toggle(metric.title)}
                      className="sr-only"
                    />
                    <div
                      className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 border transition ${
                        isChecked ? "bg-[#8B5CF6] border-[#8B5CF6]" : "border-gray-300 bg-white"
                      }`}
                    >
                      {isChecked && <CheckCircle2 size={11} className="text-white" fill="currentColor" />}
                    </div>
                    <span className={`text-xs leading-tight ${isChecked ? "font-bold text-[#5b21b6]" : "font-medium text-gray-700"}`}>
                      {metric.title}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Save actions — fixed to the bottom of the viewport instead of
          scrolling away with the category grid */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] px-4 sm:px-6 lg:px-10 py-3 flex flex-col items-center gap-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={confirmMultiple}
            onChange={(e) => setConfirmMultiple(e.target.checked)}
            className="accent-[#8B5CF6] w-3.5 h-3.5 cursor-pointer"
          />
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); handleSaveMultiple(); }}
            disabled={saving}
            className="text-xs font-bold text-gray-500 uppercase tracking-wider hover:text-gray-700 transition disabled:opacity-50"
          >
            Save Changes For Multiple Teams
          </button>
        </label>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full max-w-xs h-11 rounded-full bg-[#8B5CF6] text-white text-sm font-bold hover:bg-[#7C3AED] transition shadow-[0_6px_16px_rgba(139,92,246,0.3)] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

// ── Export ────────────────────────────────────────────────────────────────────

export default function LeaderboardOptionsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LeaderboardOptionsContent />
    </Suspense>
  );
}
