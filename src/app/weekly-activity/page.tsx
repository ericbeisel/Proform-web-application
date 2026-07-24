"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Activity, Loader2, Filter, ChevronDown } from "lucide-react";
import { getItinerary, ItineraryWorkout } from "@/api/itinerary/route";
import { dashboardApi } from "@/api/dashboard/route";

// ── Type → badge styling ────────────────────────────────────────────────────

const TYPE_CONFIG: Record<string, { label: string; chip: string; avatar: string; initial: string }> = {
  workout:       { label: "PRIMARY",      chip: "text-blue-600 bg-blue-50",     avatar: "bg-blue-500",   initial: "P" },
  supplemental:  { label: "SUPPLEMENTAL", chip: "text-green-600 bg-green-50",   avatar: "bg-green-500",  initial: "S" },
  conditioning:  { label: "CONDITIONING", chip: "text-yellow-600 bg-yellow-50",avatar: "bg-yellow-500", initial: "C" },
  cardio:        { label: "CARDIO",       chip: "text-red-500 bg-red-50",       avatar: "bg-red-500",    initial: "C" },
  recovery:      { label: "RECOVERY",     chip: "text-purple-600 bg-purple-50", avatar: "bg-purple-500", initial: "R" },
  hydration:     { label: "HYDRATION",    chip: "text-cyan-600 bg-cyan-50",     avatar: "bg-cyan-500",   initial: "H" },
};

function configFor(type: string) {
  return TYPE_CONFIG[type?.toLowerCase()] ?? TYPE_CONFIG.workout;
}

const FILTERS = [
  { value: "all", label: "All Data" },
  { value: "cardio", label: "Cardio" },
  { value: "workout", label: "Workout" },
  { value: "recovery", label: "Recovery" },
];

// ── Date grouping — weekday name for the past week, "N Weeks Ago" beyond that ──

function dateLabel(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "Earlier";
  const now = new Date();
  const daysAgo = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (daysAgo < 7) return d.toLocaleDateString("en-US", { weekday: "long" });
  const weeksAgo = Math.floor(daysAgo / 7);
  return weeksAgo === 1 ? "1 Week Ago" : `${weeksAgo} Weeks Ago`;
}

function groupByDate(items: ItineraryWorkout[]): { label: string; items: ItineraryWorkout[] }[] {
  const map: Record<string, ItineraryWorkout[]> = {};
  const order: string[] = [];
  items.forEach((w) => {
    const label = dateLabel(w.created_date || w.day);
    if (!map[label]) { map[label] = []; order.push(label); }
    map[label].push(w);
  });
  return order.map((label) => ({ label, items: map[label] }));
}

function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  const date = d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }).toLowerCase();
  return `${date} ${time}`;
}

export default function WeeklyActivityPage() {
  const router = useRouter();
  const [items, setItems] = useState<ItineraryWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [weeklyStats, setWeeklyStats] = useState<{ load: number; cal: number; pwr: number } | null>(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    getItinerary().then(setItems).catch(() => {}).finally(() => setLoading(false));
    dashboardApi.getDashboardSummary()
      .then((summary) => setWeeklyStats(summary.weeklyStats ?? null))
      .catch(() => {});
  }, []);

  const filteredItems =
    filter === "all" ? items : items.filter((w) => w.type?.toLowerCase() === filter);

  const grouped = groupByDate(filteredItems);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="flex items-center gap-2 sm:gap-3 px-3 sm:px-6 py-2.5 sm:py-3 border-b border-gray-100 bg-white sticky top-0 z-30">
        <button
          onClick={() => router.back()}
          className="p-1.5 sm:p-2 -ml-1 sm:-ml-2 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
          aria-label="Go back"
        >
          <ArrowLeft size={20} strokeWidth={2} className="text-gray-700" />
        </button>
        <h1 className="text-base sm:text-2xl font-bold text-gray-900 flex-1 truncate">All Activity</h1>

        <div className="relative flex-shrink-0">
          <Filter size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            aria-label="Filter"
            className="appearance-none pl-7 pr-6 sm:pr-7 py-1.5 sm:py-2 rounded-lg border border-gray-200 bg-gray-50 text-[11px] sm:text-sm font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-400 cursor-pointer max-w-[110px] sm:max-w-none"
          >
            {FILTERS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
          <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </header>

      <div className="px-4 sm:px-6 lg:px-10 py-6 w-full">
        {/* This Week hero */}
        <div className="relative rounded-2xl overflow-hidden mb-6 sm:mb-8" style={{ minHeight: "140px" }}>
          <img
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80"
            alt=""
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/65" />
          <div className="relative z-10 p-4 sm:p-5 lg:p-6">
            <div className="flex items-center gap-2.5 mb-4 sm:mb-5">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Activity size={14} className="text-white" />
              </div>
              <span className="text-white text-sm sm:text-base font-bold">This Week</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Load", value: weeklyStats?.load ?? 0 },
                { label: "Calories", value: weeklyStats?.cal ?? 0 },
                { label: "Power", value: weeklyStats?.pwr ?? 0 },
              ].map((s) => (
                <div key={s.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-3.5">
                  <p className="text-white/70 text-[10px] sm:text-xs font-medium mb-1">{s.label}</p>
                  <p className="text-white text-xl sm:text-2xl font-bold leading-none">{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Grouped activity list */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={28} className="animate-spin text-[#8B5CF6]" />
          </div>
        ) : grouped.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
            <Activity size={44} className="mx-auto mb-3 text-gray-200" />
            <p className="text-gray-400 text-sm">No activity yet this week.</p>
          </div>
        ) : (
          grouped.map((group) => (
            <div key={group.label} className="mb-8">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4">{group.label}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {group.items.map((w) => {
                  const cfg = configFor(w.type);
                  const isCompleted = w.completed || w.completed_activity;
                  return (
                    <div
                      key={w.id}
                      className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full ${cfg.avatar} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                            {cfg.initial}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {w.workout_title || w.title}
                            </p>
                            <p className="text-xs text-gray-500">{w.program_name || w.muscles_used || "—"}</p>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${cfg.chip}`}>
                          {cfg.label}
                        </span>
                      </div>

                      <p className="text-xs text-gray-400 mb-3">{formatDateTime(w.created_date)}</p>

                      {/* TODO(backend): per-item Load/Calories/Power aren't
                          exposed by /itinerary-setup/get-itinerary yet —
                          placeholder values until that's available. */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-gray-600">Load:</span>
                          <span className="text-xs font-semibold text-purple-600">450</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-gray-600">Calories:</span>
                          <span className="text-xs font-semibold text-purple-600">450</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-gray-600">Power:</span>
                          <span className="text-xs font-semibold text-purple-600">20</span>
                        </div>
                        {isCompleted && (
                          <span className="text-[10px] font-bold text-green-500">✓</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
