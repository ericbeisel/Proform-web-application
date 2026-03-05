"use client";

import { useState } from "react";
import { ArrowLeft, X } from "lucide-react";
import { useRouter } from "next/navigation";

// ── Activity Tab Data ──────────────────────────────────────────────────────────
const RECENT_ACTIVITY = [
  { id: 1, initial: "P", bg: "bg-blue-500",   name: "SILVER-BACK",    sub: "Back, Glutes",  tag: "PRIMARY",       tagColor: "text-blue-500 bg-blue-50",     day: "Monday, Dec 28",    duration: "60 min", cal: "450 cal" },
  { id: 2, initial: "C", bg: "bg-red-500",    name: "Morning Sprint", sub: "Cardiovascular",tag: "CARDIO",        tagColor: "text-red-400 bg-red-50",       day: "Tuesday, Dec 29",   duration: "30 min", cal: "320 cal" },
  { id: 3, initial: "R", bg: "bg-purple-500", name: "Recovery Flow",  sub: "Full Body",     tag: "RECOVERY",      tagColor: "text-purple-400 bg-purple-50", day: "Sunday, Dec 27",    duration: "20 min", cal: "80 cal" },
  { id: 4, initial: "S", bg: "bg-green-500",  name: "WOLF-PACK",      sub: "Full Body",     tag: "SUPPLEMENTAL",  tagColor: "text-green-600 bg-green-50",   day: "Wednesday, Dec 30", duration: "45 min", cal: "380 cal" },
  { id: 5, initial: "C", bg: "bg-yellow-500", name: "Speed Training", sub: "Agility",       tag: "CONDITIONING",  tagColor: "text-yellow-600 bg-yellow-50", day: "Thursday, Dec 31",  duration: "40 min", cal: "350 cal" },
  { id: 6, initial: "H", bg: "bg-cyan-500",   name: "Hydration Check",sub: "N/A",           tag: "HYDRATION",     tagColor: "text-cyan-600 bg-cyan-50",     day: "Friday, Jan 1",     duration: "5 min",  cal: "0 cal" },
];

// ── Details Tab Data ───────────────────────────────────────────────────────────
const WORKOUT_TYPES = [
  { label: "Primary",      color: "bg-blue-500",   pct: 65, count: 5 },
  { label: "Cardio",       color: "bg-red-500",    pct: 52, count: 4 },
  { label: "Recovery",     color: "bg-purple-500", pct: 35, count: 2 },
  { label: "Conditioning", color: "bg-yellow-400", pct: 22, count: 1 },
];

const ACHIEVEMENTS = [
  { emoji: "🔥", title: "5 Day Streak",        sub: "Keep it going!",              bg: "bg-yellow-50",  border: "border-yellow-100" },
  { emoji: "💪", title: "Strength Champion",   sub: "10 primary workouts completed", bg: "bg-blue-50",    border: "border-blue-100" },
  { emoji: "⚡", title: "Early Bird",           sub: "5 morning workouts",          bg: "bg-yellow-50",  border: "border-yellow-100" },
  { emoji: "🎯", title: "Goal Crusher",         sub: "Met weekly target",           bg: "bg-green-50",   border: "border-green-100" },
];

// ── Sub-components ─────────────────────────────────────────────────────────────
function ActivityTab() {
  return (
    <div className="px-12 py-6">
      {/* This Week hero banner */}
      <div
        className="relative rounded-2xl overflow-hidden mb-8"
        style={{ minHeight: 180 }}
      >
        <img
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80"
          alt="gym"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 p-5">
          {/* Header */}
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
              </svg>
            </div>
            <span className="text-white text-[15px] font-bold">This Week</span>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Workouts", value: "12",   suffix: "" },
              { label: "Minutes",  value: "680",  suffix: "" },
              { label: "Calories", value: "4250", suffix: "" },
              { label: "Streak",   value: "5",    suffix: "🔥" },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-3.5">
                <p className="text-white/60 text-[10px] font-medium mb-1.5">{s.label}</p>
                <p className="text-white text-[26px] font-bold leading-none">
                  {s.value}{s.suffix}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <h2 className="text-[15px] font-bold text-gray-900 mb-4">Recent Activity</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {RECENT_ACTIVITY.map((a) => (
          <div key={a.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow" style={{ border: "1px solid #ebebeb" }}>
            {/* Top row */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-full ${a.bg} flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0`}>
                  {a.initial}
                </div>
                <div>
                  <p className="text-[13px] font-bold text-gray-900 leading-tight">{a.name}</p>
                  <p className="text-[11px] text-gray-400">{a.sub}</p>
                </div>
              </div>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${a.tagColor}`}>
                {a.tag}
              </span>
            </div>
            {/* Bottom row */}
            <div className="flex items-center justify-between pt-2.5 border-t border-gray-50">
              <div>
                <p className="text-[10px] text-gray-400">{a.day}</p>
                <p className="text-[12px] font-bold text-gray-800 mt-0.5">{a.duration}</p>
              </div>
              <p className="text-[12px] font-bold text-blue-500">{a.cal}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DetailsTab() {
  return (
    <div className="px-12 py-6">
      {/* Performance */}
      <h2 className="text-[15px] font-bold text-gray-900 mb-4">Performance</h2>
      <div className="grid grid-cols-3 gap-3 mb-8">
        {/* Avg Duration */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm" style={{ border: "1px solid #ebebeb" }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 text-gray-500">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23,6 13.5,15.5 8.5,10.5 1,18" /><polyline points="17,6 23,6 23,12" />
              </svg>
              <span className="text-[11px] font-medium">Avg. Duration</span>
            </div>
            <span className="text-[18px] font-bold text-blue-500">56 min</span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: "70%" }} />
          </div>
        </div>

        {/* Avg Calories */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm" style={{ border: "1px solid #ebebeb" }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 text-gray-500">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="13,2 3,14 12,14 11,22 21,10 12,10 13,2" />
              </svg>
              <span className="text-[11px] font-medium">Avg. Calories</span>
            </div>
            <span className="text-[18px] font-bold text-orange-500">354 cal</span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-orange-500 rounded-full" style={{ width: "60%" }} />
          </div>
        </div>

        {/* Consistency */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm" style={{ border: "1px solid #ebebeb" }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 text-gray-500">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span className="text-[11px] font-medium">Consistency</span>
            </div>
            <span className="text-[18px] font-bold text-green-500">89%</span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full" style={{ width: "89%" }} />
          </div>
        </div>
      </div>

      {/* Workout Types */}
      <h2 className="text-[15px] font-bold text-gray-900 mb-4">Workout Types</h2>
      <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-8 shadow-sm" style={{ border: "1px solid #ebebeb" }}>
        {WORKOUT_TYPES.map((wt) => (
          <div key={wt.label} className="mb-4 last:mb-0">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${wt.color}`} />
                <span className="text-[12px] font-medium text-gray-700">{wt.label}</span>
              </div>
              <span className="text-[11px] text-gray-400">{wt.count} workouts</span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full ${wt.color} rounded-full transition-all`} style={{ width: `${wt.pct}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Recent Achievements */}
      <h2 className="text-[15px] font-bold text-gray-900 mb-4">Recent Achievements</h2>
      <div className="grid grid-cols-2 gap-3">
        {ACHIEVEMENTS.map((a) => (
          <div key={a.title} className={`${a.bg} border ${a.border} rounded-2xl p-4 flex items-center gap-3`}>
            <div className="w-10 h-10 rounded-full bg-white/70 flex items-center justify-center text-xl flex-shrink-0">
              {a.emoji}
            </div>
            <div>
              <p className="text-[13px] font-bold text-gray-900">{a.title}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">{a.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function AllActivityPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"activity" | "details">("activity");

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="text-gray-700 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} strokeWidth={2} />
          </button>
          <h1 className="text-[22px] font-bold text-gray-900">All Activity</h1>
        </div>
        <button
          onClick={() => router.back()}
          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
        >
          <X size={15} />
        </button>
      </div>

      {/* Activity / Details toggle */}
      <div className="px-6 pt-4 pb-0">
        <div className="inline-flex bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setActiveTab("activity")}
            className={`px-8 py-2 rounded-lg text-[13px] font-semibold transition-all ${
              activeTab === "activity"
                ? "bg-white text-purple-600 shadow-sm"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Activity
          </button>
          <button
            onClick={() => setActiveTab("details")}
            className={`px-8 py-2 rounded-lg text-[13px] font-semibold transition-all ${
              activeTab === "details"
                ? "bg-white text-purple-600 shadow-sm"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Details
          </button>
        </div>
      </div>

      <div className="border-b border-gray-100 mt-4" />

      {/* Tab content */}
      {activeTab === "activity" ? <ActivityTab /> : <DetailsTab />}
    </div>
  );
}