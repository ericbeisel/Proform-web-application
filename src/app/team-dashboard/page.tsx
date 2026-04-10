"use client";

import { useState } from "react";
import {
  Bell,
  Calendar,
  FileText,
  MessageSquare,
  Users,
  Trophy,
  Plus,
  Settings,
  Pencil,
  UserPlus,
  UserCheck,
  Zap,
  Activity,
  TrendingUp,
  ChevronRight,
} from "lucide-react";

export default function TeamDashboard() {
  const [activeTab, setActiveTab] = useState(null);

  return (
    <div className="min-h-screen w-full bg-gray-50 font-sans">
      
      {/* Top Nav */}
      <header className="w-full bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Team Dashboard</h1>
          <p className="text-xs text-gray-500">
            Track your team's progress and performance
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors">
            <Calendar size={16} />
            <span>Itinerary</span>
          </button>

          <button className="relative p-1.5 text-gray-600 hover:text-gray-900">
            <Bell size={18} />
            <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-bold">
            JD
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="w-full py-6 px-4 sm:px-6 md:px-8 lg:px-12">

        {/* Top Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">

          {/* Team Completion */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4 mb-5">
              <div className="flex items-center gap-1">
                <span className="text-5xl font-extrabold text-orange-500">0</span>
                <span className="text-2xl font-bold text-orange-500 mt-2">%</span>
              </div>
              <div>
                <p className="text-base font-semibold text-gray-800">
                  Team Completion
                </p>
                <p className="text-xs text-orange-500 font-medium">
                  0 Workouts Completed This Week
                </p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {[
                { icon: <FileText size={20} />, label: "Reports" },
                { icon: <MessageSquare size={20} />, label: "Forum" },
                { icon: <Users size={20} />, label: "Roster" },
                { icon: <Trophy size={20} />, label: "Leaderboard" },
              ].map((item) => (
                <button
                  key={item.label}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-purple-50 transition-colors group"
                >
                  <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500 group-hover:bg-purple-100 transition-colors">
                    {item.icon}
                  </div>
                  <span className="text-xs text-gray-600 font-medium">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Sessions */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-800">
                Sessions
              </h2>
              <button className="text-gray-400 hover:text-gray-600">
                <Pencil size={15} />
              </button>
            </div>

            <div className="bg-amber-50 rounded-xl p-4 min-h-[110px] flex flex-col">
              <p className="text-xs font-semibold text-amber-600 mb-3">
                Daily To-Do List
              </p>

              <div className="flex-1 flex flex-col items-center justify-center gap-1.5">
                <div className="w-8 h-8 text-amber-400">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <p className="text-xs text-gray-400">No Activity Added</p>
              </div>
            </div>
          </div>
        </div>

        {/* Team Goals */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-800">
              Team Goals
            </h2>
            <button className="flex items-center gap-1 text-sm text-purple-600 font-medium hover:text-purple-800">
              View All <ChevronRight size={15} />
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Workout", icon: <Trophy size={16} />, bar: "bg-purple-500", bg: "bg-purple-50", iconColor: "text-purple-500" },
              { label: "Supplemental", icon: <TrendingUp size={16} />, bar: "bg-cyan-400", bg: "bg-cyan-50", iconColor: "text-cyan-500" },
              { label: "Cardio", icon: <Activity size={16} />, bar: "bg-orange-400", bg: "bg-orange-50", iconColor: "text-orange-500" },
              { label: "Conditioning", icon: <Zap size={16} />, bar: "bg-green-500", bg: "bg-green-50", iconColor: "text-green-500" },
            ].map((goal) => (
              <div key={goal.label} className={`${goal.bg} rounded-2xl p-4`}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={goal.iconColor}>{goal.icon}</div>
                  <span className="text-sm font-medium text-gray-700">
                    {goal.label}
                  </span>
                </div>

                <div className="flex items-baseline gap-0.5 mb-3">
                  <span className="text-3xl font-bold text-gray-800">0</span>
                  <span className="text-sm text-gray-400">/0</span>
                </div>

                <div className="w-full h-1.5 bg-white rounded-full overflow-hidden">
                  <div className={`h-full w-0 ${goal.bar} rounded-full`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Players */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-800">Players</h2>
              <button className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white">
                <Plus size={16} />
              </button>
            </div>

            <div className="bg-gray-50 rounded-xl py-4 px-3 mb-4 text-center">
              <p className="text-xs text-gray-400">No Datapoint Added</p>
            </div>

            <button className="w-full bg-purple-600 text-white text-sm font-semibold py-3 rounded-xl flex items-center justify-center gap-2 mb-3">
              <UserPlus size={16} />
              Add Players
            </button>

            <p className="text-center text-xs text-gray-400">
              Invite players to join your team
            </p>
          </div>

          {/* Coach's Toolbox (UNCHANGED with images) */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-800">
                Coach's Toolbox
              </h2>
              <button className="text-gray-400 hover:text-gray-600">
                <Settings size={16} />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {/* KEEPING YOUR ORIGINAL IMAGE CARDS */}
              
              {/* Team Challenge */}
              <div className="relative rounded-xl overflow-hidden h-16 cursor-pointer group">
                <div className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: "url('https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&q=80')" }}
                />
                <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40" />
                <div className="relative z-10 flex items-center gap-3 h-full px-4 text-white">
                  <Trophy size={20} />
                  <div>
                    <p className="text-sm font-semibold">Team Challenge</p>
                    <p className="text-xs text-white/70">Create competitions</p>
                  </div>
                </div>
              </div>

              {/* Add Player */}
              <div className="relative rounded-xl overflow-hidden h-16 cursor-pointer group">
                <div className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: "url('https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=600&q=80')" }}
                />
                <div className="absolute inset-0 bg-black/55 group-hover:bg-black/45" />
                <div className="relative z-10 flex items-center gap-3 h-full px-4 text-white">
                  <UserPlus size={20} />
                  <div>
                    <p className="text-sm font-semibold">Add Player</p>
                    <p className="text-xs text-white/70">Invite players</p>
                  </div>
                </div>
              </div>

              {/* Add Coach */}
              <div className="relative rounded-xl overflow-hidden h-16 cursor-pointer group">
                <div className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: "url('https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80')" }}
                />
                <div className="absolute inset-0 bg-black/60 group-hover:bg-black/50" />
                <div className="relative z-10 flex items-center gap-3 h-full px-4 text-white">
                  <UserCheck size={20} />
                  <div>
                    <p className="text-sm font-semibold">Add Coach</p>
                    <p className="text-xs text-white/70">Add coaches</p>
                  </div>
                </div>
              </div>

              {/* Edit Team */}
              <div className="relative rounded-xl overflow-hidden h-16 cursor-pointer group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-violet-500" />
                <div className="relative z-10 flex items-center gap-3 h-full px-4 text-white">
                  <Pencil size={20} />
                  <div>
                    <p className="text-sm font-semibold">Edit Team</p>
                    <p className="text-xs text-white/70">Manage details</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}