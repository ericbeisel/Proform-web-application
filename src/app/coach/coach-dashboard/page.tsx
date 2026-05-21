"use client";

import {
  Bell,
  Award,
  FileText,
  Trophy,
  Target,
  SlidersHorizontal,
  Users,
  MessageSquare,
} from "lucide-react";

const quickActions = [
  {
    title: "Reminders",
    icon: Bell,
    color: "bg-[#7C4DFF]",
  },
  {
    title: "Standards",
    icon: Award,
    color: "bg-[#EF4444]",
  },
  {
    title: "Reports",
    icon: FileText,
    color: "bg-[#10B981]",
  },
  {
    title: "Challenges",
    icon: Trophy,
    color: "bg-[#F59E0B]",
  },
  {
    title: "Accountability",
    icon: Target,
    color: "bg-[#FB923C]",
  },
];

const teams = [
  {
    name: "Alpha Coaches",
    subtitle: "Principal School Athletes",
    week: "Week 2, Day 3",
    members: 12,
    progress: 75,
    queue: 3,
    emoji: "🏫",
  },
  {
    name: "Varsity Team",
    subtitle: "Principal Football Coaches",
    week: "Week 1, Day 5",
    members: 28,
    progress: 92,
    queue: 7,
    emoji: "🏈",
  },
  {
    name: "Community Group",
    subtitle: "Principal Fans",
    week: "Current Queue: Alpha Coach Workout",
    members: 156,
    progress: 45,
    queue: 24,
    emoji: "⭐",
  },
  {
    name: "Track 1",
    subtitle: "BWHS",
    week: "Week 2, Day 2",
    members: 18,
    progress: 88,
    queue: 5,
    emoji: "🏃",
  },
  {
    name: "Strength & Conditioning",
    subtitle: "Sun Hour HS",
    week: "Week 1, Day 4",
    members: 22,
    progress: 67,
    queue: 2,
    emoji: "💪",
  },
  {
    name: "Morning Athletes",
    subtitle: "2nd Hour HS",
    week: "Week 2, Day 1",
    members: 15,
    progress: 54,
    queue: 1,
    emoji: "🎯",
  },
];

export default function CoachDashboardPage() {
  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* Header */}
      <header className="h-16 bg-white border-b border-gray-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <h1 className="text-xl sm:text-2xl font-black text-[#1f1f1f]">
            Coach Dashboard
          </h1>

          <button className="hidden sm:flex h-9 px-4 rounded-xl bg-[#8B5CF6] text-white text-sm font-semibold items-center justify-center hover:bg-[#7C3AED] transition">
            Switch to Player
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button className="relative w-10 h-10 rounded-full bg-[#f5f5f7] flex items-center justify-center hover:bg-gray-200 transition">
            <Bell size={18} className="text-gray-700" />

            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          <div className="w-10 h-10 rounded-full bg-[#8B5CF6] flex items-center justify-center text-white font-bold">
            A
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Title */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#222]">My Team</h2>

          <p className="text-sm text-gray-500 mt-1">
            Manage your teams and track their progress
          </p>
        </div>

        {/* Quick Actions */}
     <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
  {quickActions.map((item) => {
    const Icon = item.icon;

    return (
      <div
        key={item.title}
        className="flex flex-col items-center group"
      >
        {/* 3D Bubble Button */}
        <button
          className={`
            relative w-16 h-16 rounded-[22px]
            ${item.color}
            flex items-center justify-center
            shadow-[0_10px_20px_rgba(0,0,0,0.18)]
            border border-white/30
            transition-all duration-300
            group-hover:-translate-y-1.5
            group-hover:shadow-[0_18px_28px_rgba(0,0,0,0.22)]
            active:translate-y-[2px]
            active:shadow-[0_6px_12px_rgba(0,0,0,0.18)]
            overflow-hidden
          `}
        >
          {/* Top glossy highlight */}

          {/* Inner glow */}
          <div className="absolute inset-[2px] rounded-[20px] bg-white/5" />

          {/* Floating bubble */}

          {/* Icon */}
          <Icon
            size={26}
            className="text-white relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]"
          />
        </button>

        {/* Label */}
        <span className="mt-3 text-xs font-semibold text-gray-700 tracking-tight">
          {item.title}
        </span>
      </div>
    );
  })}
</div>

        {/* Filter Bar */}
        <div className="mt-5 bg-white border border-gray-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 shadow-sm">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Filter Teams"
              className="w-full h-11 rounded-xl bg-[#f5f5f7] px-4 text-sm outline-none border border-transparent focus:border-[#8B5CF6]"
            />
          </div>

          <div className="flex items-center gap-4">
         <button className="w-10 h-10 rounded-full bg-[#f5f5ff] flex items-center justify-center text-[#8B5CF6] border border-white/70 shadow-[0_8px_18px_rgba(139,92,246,0.18),inset_0_1px_1px_rgba(255,255,255,0.9)] hover:scale-105 active:scale-95 transition-all duration-200">
  <SlidersHorizontal size={18} />
</button>
            <label className="flex items-center gap-2 text-sm text-gray-500 whitespace-nowrap">
              <input type="checkbox" className="accent-[#8B5CF6]" />
              Show only teams I am admin for
            </label>
          </div>
        </div>

        {/* Team Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
          {teams.map((team) => (
            <div
              key={team.name}
              className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition"
            >
              <div className="flex justify-between gap-4">
                {/* Left */}
                <div className="flex gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#f5f5f7] flex items-center justify-center text-2xl">
                    {team.emoji}
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold text-orange-500 uppercase">
                      {team.subtitle}
                    </p>

                    <h3 className="text-lg font-bold text-[#222]">
                      {team.name}
                    </h3>

                    <span className="inline-flex mt-2 px-3 py-1 rounded-full bg-[#F3E8FF] text-[#8B5CF6] text-[11px] font-semibold">
                      {team.week}
                    </span>
                  </div>
                </div>

                {/* Right */}
                <div className="text-right">
                  <h2 className="text-3xl font-black text-[#EF4444]">
                    {team.progress}%
                  </h2>

                  <p className="text-xs text-gray-400">Complete</p>
                </div>
              </div>

              {/* Bottom */}
              <div className="flex items-center justify-between mt-6">
                <div className="flex items-center gap-2 text-gray-500">
                  <div className="w-8 h-8 rounded-full bg-[#f5f5f7] flex items-center justify-center">
                    <Users size={15} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[#222]">
                      {team.members}
                    </p>
                    <p className="text-[11px]">members</p>
                  </div>
                </div>

                <div className="relative flex items-center gap-2 text-[#8B5CF6]">
                  <div className="w-8 h-8 rounded-full bg-[#f5f0ff] flex items-center justify-center">
                    <MessageSquare size={15} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold">
                      {team.queue}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      new
                    </p>
                  </div>

                  <span className="absolute -top-1 left-5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
                    {team.queue}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}