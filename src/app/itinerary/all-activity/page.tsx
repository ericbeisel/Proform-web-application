"use client";

import { useState } from "react";
import { ArrowLeft, X } from "lucide-react";
import { useRouter } from "next/navigation";

// ── Activity Tab Data ──────────────────────────────────────────────────────────
const RECENT_ACTIVITY = [
  {
    id: 1,
    initial: "P",
    bg: "bg-blue-500",
    name: "SILVER-BACK",
    sub: "Back, Glutes",
    tag: "PRIMARY",
    tagColor: "text-blue-500 bg-blue-50",
    day: "Monday, Dec 28",
    duration: "60 min",
    cal: "450 cal",
  },
  {
    id: 2,
    initial: "C",
    bg: "bg-red-500",
    name: "Morning Sprint",
    sub: "Cardiovascular",
    tag: "CARDIO",
    tagColor: "text-red-400 bg-red-50",
    day: "Tuesday, Dec 29",
    duration: "30 min",
    cal: "320 cal",
  },
  {
    id: 3,
    initial: "R",
    bg: "bg-purple-500",
    name: "Recovery Flow",
    sub: "Full Body",
    tag: "RECOVERY",
    tagColor: "text-purple-400 bg-purple-50",
    day: "Sunday, Dec 27",
    duration: "20 min",
    cal: "80 cal",
  },
  {
    id: 4,
    initial: "S",
    bg: "bg-green-500",
    name: "WOLF-PACK",
    sub: "Full Body",
    tag: "SUPPLEMENTAL",
    tagColor: "text-green-600 bg-green-50",
    day: "Wednesday, Dec 30",
    duration: "45 min",
    cal: "380 cal",
  },
  {
    id: 5,
    initial: "C",
    bg: "bg-yellow-500",
    name: "Speed Training",
    sub: "Agility",
    tag: "CONDITIONING",
    tagColor: "text-yellow-600 bg-yellow-50",
    day: "Thursday, Dec 31",
    duration: "40 min",
    cal: "350 cal",
  },
  {
    id: 6,
    initial: "H",
    bg: "bg-cyan-500",
    name: "Hydration Check",
    sub: "N/A",
    tag: "HYDRATION",
    tagColor: "text-cyan-600 bg-cyan-50",
    day: "Friday, Jan 1",
    duration: "5 min",
    cal: "0 cal",
  },
];

// ── Details Tab Data ───────────────────────────────────────────────────────────
const WORKOUT_TYPES = [
  { label: "Primary", color: "bg-blue-500", pct: 65, count: 5 },
  { label: "Cardio", color: "bg-red-500", pct: 52, count: 4 },
  { label: "Recovery", color: "bg-purple-500", pct: 35, count: 2 },
  { label: "Conditioning", color: "bg-yellow-400", pct: 22, count: 1 },
];

const ACHIEVEMENTS = [
  {
    emoji: "🔥",
    title: "5 Day Streak",
    sub: "Keep it going!",
    bg: "bg-yellow-50",
    border: "border-yellow-100",
  },
  {
    emoji: "💪",
    title: "Strength Champion",
    sub: "10 primary workouts completed",
    bg: "bg-blue-50",
    border: "border-blue-100",
  },
  {
    emoji: "⚡",
    title: "Early Bird",
    sub: "5 morning workouts",
    bg: "bg-yellow-50",
    border: "border-yellow-100",
  },
  {
    emoji: "🎯",
    title: "Goal Crusher",
    sub: "Met weekly target",
    bg: "bg-green-50",
    border: "border-green-100",
  },
];

// ── Activity Tab ───────────────────────────────────────────────────────────────
function ActivityTab() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      {/* This Week hero banner */}
      <div
        className="relative rounded-2xl overflow-hidden mb-6 sm:mb-8"
        style={{ minHeight: "160px" }}
      >
        <img
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80"
          alt="Athlete training in gym"
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/65 sm:bg-black/60" />
        <div className="relative z-10 p-4 sm:p-5 lg:p-6">
          <div className="flex items-center gap-2.5 mb-4 sm:mb-5">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 flex items-center justify-center">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
              </svg>
            </div>
            <span className="text-white text-sm sm:text-base font-bold">
              This Week
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Workouts", value: "12", suffix: "" },
              { label: "Minutes", value: "680", suffix: "" },
              { label: "Calories", value: "4250", suffix: "" },
              { label: "Streak", value: "5", suffix: "🔥" },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-3.5"
              >
                <p className="text-white/70 text-[10px] sm:text-xs font-medium mb-1">
                  {s.label}
                </p>
                <p className="text-white text-xl sm:text-2xl font-bold leading-none">
                  {s.value}
                  {s.suffix}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4">
        Recent Activity
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {RECENT_ACTIVITY.map((a) => (
          <div
            key={a.id}
            className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full ${a.bg} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}
                >
                  {a.initial}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {a.name}
                  </p>
                  <p className="text-xs text-gray-500">{a.sub}</p>
                </div>
              </div>
              <span
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${a.tagColor}`}
              >
                {a.tag}
              </span>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div>
                <p className="text-xs text-gray-500">{a.day}</p>
                <p className="text-sm font-semibold text-gray-800 mt-0.5">
                  {a.duration}
                </p>
              </div>
              <p className="text-sm font-semibold text-blue-600">{a.cal}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Details Tab ────────────────────────────────────────────────────────────────
function DetailsTab() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4">
        Performance
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {/* Avg Duration */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-gray-600">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="23,6 13.5,15.5 8.5,10.5 1,18" />
                <polyline points="17,6 23,6 23,12" />
              </svg>
              <span className="text-xs sm:text-sm font-medium">
                Avg. Duration
              </span>
            </div>
            <span className="text-lg sm:text-xl font-bold text-blue-600">
              56 min
            </span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full"
              style={{ width: "70%" }}
            />
          </div>
        </div>

        {/* Avg Calories */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-gray-600">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#f97316"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="13,2 3,14 12,14 11,22 21,10 12,10 13,2" />
              </svg>
              <span className="text-xs sm:text-sm font-medium">
                Avg. Calories
              </span>
            </div>
            <span className="text-lg sm:text-xl font-bold text-orange-500">
              354 cal
            </span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 rounded-full"
              style={{ width: "60%" }}
            />
          </div>
        </div>

        {/* Consistency */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-gray-600">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#22c55e"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span className="text-xs sm:text-sm font-medium">
                Consistency
              </span>
            </div>
            <span className="text-lg sm:text-xl font-bold text-green-600">
              89%
            </span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full"
              style={{ width: "89%" }}
            />
          </div>
        </div>
      </div>

      <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4">
        Workout Types
      </h2>
      <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-8 shadow-sm">
        {WORKOUT_TYPES.map((wt) => (
          <div key={wt.label} className="mb-4 last:mb-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <span className={`w-3 h-3 rounded-full ${wt.color}`} />
                <span className="text-sm font-medium text-gray-700">
                  {wt.label}
                </span>
              </div>
              <span className="text-xs text-gray-500">{wt.count} workouts</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${wt.color} rounded-full`}
                style={{ width: `${wt.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4">
        Recent Achievements
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {ACHIEVEMENTS.map((a) => (
          <div
            key={a.title}
            className={`${a.bg} border ${a.border} rounded-2xl p-4 flex items-center gap-3 shadow-sm`}
          >
            <div className="w-12 h-12 rounded-full bg-white/70 flex items-center justify-center text-2xl flex-shrink-0">
              {a.emoji}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{a.title}</p>
              <p className="text-xs text-gray-600 mt-0.5">{a.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function AllActivityPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"activity" | "details">(
    "activity",
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={24} strokeWidth={2} className="text-gray-700" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            All Activity
          </h1>
        </div>
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <X size={22} className="text-gray-600" />
        </button>
      </header>

      {/* Tabs */}
      <div className="px-4 sm:px-6 pt-5 pb-3 bg-white">
        <div className="inline-flex bg-gray-100 rounded-full p-1 mx-auto">
          <button
            onClick={() => setActiveTab("activity")}
            className={`px-6 sm:px-10 py-2.5 rounded-full text-sm sm:text-base font-medium transition-all ${
              activeTab === "activity"
                ? "bg-white shadow-sm text-purple-700 font-semibold"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Activity
          </button>
          <button
            onClick={() => setActiveTab("details")}
            className={`px-6 sm:px-10 py-2.5 rounded-full text-sm sm:text-base font-medium transition-all ${
              activeTab === "details"
                ? "bg-white shadow-sm text-purple-700 font-semibold"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Details
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <main className="transition-opacity duration-300">
        {activeTab === "activity" ? <ActivityTab /> : <DetailsTab />}
      </main>
    </div>
  );
}
