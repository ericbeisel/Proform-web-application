"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import {
  ArrowLeft,
  Plus,
  ChevronRight,
  FileText,
  Zap,
  Users,
  Trophy,
  ClipboardList,
  Megaphone,
  BellRing,
  Wrench,
  Dumbbell,
  Flame,
  Heart,
  Activity,
  Search,
} from "lucide-react";
import { coachApi, type TeamPlayer } from "@/api/coach/route";

const sessions = [
  { started: "10/18/2025", workout: "Day 1: Incline Bench", joined: 0, completed: 0, pct: 0 },
  { started: "10/27/2025", workout: "Day 1", joined: 1, completed: 0, pct: 0 },
];

const goals = [
  { label: "Workout", sub: "Strength training", current: 0, total: 3, color: "bg-[#8B5CF6]", icon: Dumbbell },
  { label: "Supplemental", sub: "Additional work", current: 0, total: 2, color: "bg-[#10B981]", icon: Activity },
  { label: "Conditioning", sub: "High intensity", current: 0, total: 3, color: "bg-[#F59E0B]", icon: Flame },
  { label: "Cardio", sub: "High intensity", current: 0, total: 3, color: "bg-[#EF4444]", icon: Heart },
];

const quickActions = [
  { label: "Reports", icon: FileText, iconColor: "text-[#0EA5E9]", bgColor: "bg-[#E0F2FE]" },
  { label: "Creator", icon: Zap, iconColor: "text-[#F59E0B]", bgColor: "bg-[#FEF3C7]" },
  { label: "Roster", icon: Users, iconColor: "text-[#8B5CF6]", bgColor: "bg-[#EDE9FE]" },
  { label: "Leaderboard", icon: Trophy, iconColor: "text-[#10B981]", bgColor: "bg-[#D1FAE5]" },
];

const toolbox = [
  { label: "Track Attendance", icon: ClipboardList, color: "bg-[#FEF3C7]", iconColor: "text-[#F59E0B]" },
  { label: "Create Announcement", icon: Megaphone, color: "bg-[#EDE9FE]", iconColor: "text-[#8B5CF6]" },
  { label: "Send Group Reminders", icon: BellRing, color: "bg-[#E0F2FE]", iconColor: "text-[#0EA5E9]" },
];

function TeamDetailContent() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();

  const teamName = searchParams.get("team_name") ?? "Team";
  const orgName = searchParams.get("org_name") ?? "";
  const ownerName = searchParams.get("owner_name") ?? "";
  const teamLogo = searchParams.get("logo") ?? "";

  const [players, setPlayers] = useState<TeamPlayer[]>([]);
  const [playersLoading, setPlayersLoading] = useState(true);
  const [playerSearch, setPlayerSearch] = useState("");

  useEffect(() => {
    if (!id) return;
    setPlayersLoading(true);
    coachApi.getTeamPlayers({ team_id: id, limit: 20 })
      .then(({ players }) => setPlayers(players))
      .catch(console.error)
      .finally(() => setPlayersLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const timeout = setTimeout(() => {
      coachApi.getTeamPlayers({ team_id: id, search: playerSearch, limit: 20 })
        .then(({ players }) => setPlayers(players))
        .catch(console.error);
    }, 400);
    return () => clearTimeout(timeout);
  }, [playerSearch, id]);

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col">

      {/* ── Header ── */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 rounded-full bg-[#f5f5f7] flex items-center justify-center hover:bg-gray-200 transition shrink-0"
          >
            <ArrowLeft size={16} className="text-gray-700" />
          </button>

          <div className="flex items-center gap-2 min-w-0">
            {teamLogo ? (
              <img src={teamLogo} alt={teamName} className="w-8 h-8 rounded-lg object-cover shrink-0" />
            ) : null}
            <div className="min-w-0">
              {orgName && (
                <p className="text-[10px] sm:text-xs font-semibold text-orange-500 uppercase leading-none truncate">
                  {orgName}
                </p>
              )}
              <h1 className="text-base sm:text-xl font-black text-[#1f1f1f] truncate leading-tight">
                {teamName}
              </h1>
              {ownerName && (
                <p className="text-[10px] text-gray-400 truncate leading-none">{ownerName}</p>
              )}
            </div>
          </div>

          <button
            onClick={() => router.replace("/team/teams")}
            className="hidden sm:flex h-8 px-3 rounded-xl bg-[#8B5CF6] text-white text-xs font-semibold items-center hover:bg-[#7C3AED] transition shrink-0"
          >
            Switch to Player
          </button>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={() => router.push(`/coach/activity?team_id=${id}`)}
            className="hidden sm:flex h-8 px-3 rounded-full border border-gray-200 text-xs font-semibold text-gray-700 items-center gap-1.5 hover:bg-gray-50 transition"
          >
            All Activity
          </button>
          <button className="w-8 h-8 rounded-full bg-[#10B981] flex items-center justify-center shadow-md">
            <Zap size={15} className="text-white fill-white" />
          </button>
          <button className="w-8 h-8 rounded-full bg-[#f5f5f7] flex items-center justify-center hover:bg-gray-200 transition">
            <Wrench size={15} className="text-gray-600" />
          </button>
          <div className="w-8 h-8 rounded-full bg-[#8B5CF6] flex items-center justify-center text-white text-xs font-bold">
            JD
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-4 sm:py-6 flex flex-col gap-4 sm:gap-5">

        {/* Row 1: Completion + Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4 sm:gap-5">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5 sm:p-6 flex flex-col items-center justify-center text-center min-h-[140px]">
            <span className="text-5xl sm:text-6xl font-black text-[#EF4444]">
              0<span className="text-3xl sm:text-4xl">%</span>
            </span>
            <p className="text-sm font-semibold text-[#222] mt-1">Team Completion</p>
            <p className="text-xs text-[#8B5CF6] mt-0.5">0 workouts completed this week</p>
          </div>
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-4 sm:p-5">
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((a) => {
                const Icon = a.icon;
                return (
                  <button key={a.label} className="flex flex-col items-center justify-center gap-2 p-3 sm:p-4 rounded-2xl bg-[#f5f5f7] hover:bg-[#ede9fe] transition group">
                    <div className={`w-9 h-9 rounded-xl ${a.bgColor} flex items-center justify-center`}>
                      <Icon size={18} className={a.iconColor} />
                    </div>
                    <span className="text-xs font-semibold text-gray-600 group-hover:text-[#8B5CF6] transition">{a.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sessions — full width */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-4 sm:p-5">
          <h2 className="text-base font-bold text-[#222] mb-3">Sessions:</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm min-w-[500px] border border-gray-200 rounded-2xl overflow-hidden">
              <thead>
                <tr className="text-left bg-[#f5f5f7]">
                  <th className="py-2.5 px-4 font-semibold text-[#8B5CF6] whitespace-nowrap border-b border-gray-200">Started</th>
                  <th className="py-2.5 px-4 font-semibold text-[#8B5CF6] whitespace-nowrap border-b border-gray-200">Workout</th>
                  <th className="py-2.5 px-4 font-semibold text-[#8B5CF6] whitespace-nowrap text-right border-b border-gray-200">Joined</th>
                  <th className="py-2.5 px-4 font-semibold text-[#8B5CF6] whitespace-nowrap text-right border-b border-gray-200">Completed</th>
                  <th className="py-2.5 px-4 font-semibold text-[#8B5CF6] text-right whitespace-nowrap border-b border-gray-200">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sessions.map((s, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition">
                    <td className="py-3 px-4 text-gray-500 whitespace-nowrap">{s.started}</td>
                    <td className="py-3 px-4 text-[#222] font-medium whitespace-nowrap">{s.workout}</td>
                    <td className="py-3 px-4 text-gray-500 text-right">{s.joined}</td>
                    <td className="py-3 px-4 text-gray-500 text-right">{s.completed}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex items-center gap-1 text-gray-500">
                        {s.pct}%
                        <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Row 2: left + right */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_460px] gap-4 sm:gap-5">
          <div className="flex flex-col gap-4 sm:gap-5">

            {/* Daily To-Do List */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-4 sm:p-5 min-h-[160px]">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-[#222]">Daily To-Do List:</h2>
                <button className="h-7 px-3 rounded-full bg-[#3B82F6] text-white text-xs font-semibold hover:bg-[#2563EB] transition">
                  View All
                </button>
              </div>

              <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl p-3 sm:p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-[#222]">Monday 5/18/2026</p>
                  <ChevronRight size={16} className="text-gray-400" />
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#8B5CF6] mt-1.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-[#222]">Workout: Day 1: Incline Bench</p>
                    <p className="text-xs text-gray-400 mt-0.5">Before 8:30 am</p>
                  </div>
                  <span className="ml-auto w-4 h-4 rounded-full bg-red-500 shrink-0 mt-0.5" />
                </div>
              </div>
            </div>

            {/* Team Goals */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-4 sm:p-5 min-h-[340px]">
              <h2 className="text-base font-bold text-[#222] mb-3">Team Goals:</h2>
              <div className="grid grid-cols-2 gap-3">
                {goals.map((g) => (
                  <div
                    key={g.label}
                    className={`${g.color} rounded-2xl p-5 sm:p-6 text-white min-h-[130px] flex flex-col justify-between`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-bold">{g.label}</p>
                        <p className="text-[11px] opacity-70 mt-0.5">{g.sub}</p>
                      </div>
                      <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                        <g.icon size={18} className="text-white" />
                      </div>
                    </div>

                    <span className="text-3xl sm:text-4xl font-black">
                      {g.current}/{g.total}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Team Highlights */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-4 sm:p-5 flex flex-col items-center gap-3 min-h-[140px]">
              <div className="flex items-center justify-between w-full">
                <h2 className="text-base font-bold text-[#222]">Team Highlights</h2>
                <button className="text-xs font-semibold text-[#3B82F6] hover:underline">View All</button>
              </div>
              <button className="w-full h-10 rounded-2xl bg-[#8B5CF6] text-white text-sm font-semibold hover:bg-[#7C3AED] transition">
                Team Challenges
              </button>
            </div>
          </div>

          {/* ══ RIGHT COLUMN ══ */}
          <div className="flex flex-col gap-4 sm:gap-5">

            {/* Players */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-[#222]">
                  Players:
                  <span className="ml-1.5 text-sm font-normal text-gray-400">({players.length})</span>
                </h2>
                <div className="flex items-center gap-2">
                  <button className="h-7 px-3 rounded-full border border-gray-200 text-[10px] font-semibold text-gray-500 hover:bg-gray-50 transition">
                    FILTER GROUP
                  </button>
                  <button className="w-7 h-7 rounded-full bg-[#8B5CF6] flex items-center justify-center hover:bg-[#7C3AED] transition">
                    <Plus size={14} className="text-white" />
                  </button>
                </div>
              </div>

              {/* Search */}
              <div className="relative mb-3">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search players..."
                  value={playerSearch}
                  onChange={(e) => setPlayerSearch(e.target.value)}
                  className="w-full h-8 rounded-xl bg-[#f5f5f7] pl-8 pr-3 text-xs outline-none border border-transparent focus:border-[#8B5CF6] transition"
                />
              </div>

              {playersLoading ? (
                <div className="grid grid-cols-4 gap-2 sm:gap-3">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gray-100 animate-pulse" />
                      <div className="h-2 w-12 bg-gray-100 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : players.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">No players found.</p>
              ) : (
                <div className="grid grid-cols-4 gap-2 sm:gap-3">
                  {players.slice(0, 8).map((p) => {
                    const displayName = p.name ?? p.username ?? "Player";
                    const pct = p.completion_pct != null ? `${p.completion_pct}%` : "0%";
                    return (
                      <div key={p.id} className="flex flex-col items-center gap-1">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#8B5CF6] flex items-center justify-center text-white text-xs font-bold relative overflow-hidden">
                          {p.profile_picture ? (
                            <img src={p.profile_picture} alt={displayName} className="w-full h-full object-cover" />
                          ) : (
                            displayName.charAt(0).toUpperCase()
                          )}
                          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-red-500 border border-white" />
                        </div>
                        <p className="text-[11px] text-[#222] text-center leading-tight line-clamp-2">{displayName}</p>
                        <p className="text-[9px] font-semibold text-[#222]">{p.score ?? "0/4"}</p>
                        <p className="text-[9px] text-gray-400">{pct}</p>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex items-center justify-between mt-4">
                <button className="h-8 px-5 rounded-full bg-[#3B82F6] text-white text-xs font-semibold hover:bg-[#2563EB] transition">
                  View All
                </button>
                <button className="flex items-center gap-1 text-xs font-semibold text-[#8B5CF6] hover:underline">
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Standards */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-[#222]">No Standard Added</h2>
                <button className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition">
                  <Plus size={14} className="text-gray-500" />
                </button>
              </div>
              <div className="flex justify-center">
                <button className="h-8 px-5 rounded-full bg-[#3B82F6] text-white text-xs font-semibold hover:bg-[#2563EB] transition">
                  View All
                </button>
              </div>
              <div className="flex justify-end mt-2">
                <button className="flex items-center gap-1 text-xs font-semibold text-[#8B5CF6] hover:underline">
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Coach's Toolbox */}
            <div className="bg-[#EDE9FE] rounded-3xl border border-[#DDD6FE] shadow-sm p-4 sm:p-6 flex-1">
              <h2 className="text-base font-bold text-[#7C3AED] mb-3">Coach&apos;s Toolbox</h2>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {toolbox.map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.label}
                      className="bg-white rounded-2xl p-3 flex flex-col items-center gap-2 hover:shadow-md transition border border-gray-100"
                    >
                      <div className={`w-9 h-9 rounded-xl ${t.color} flex items-center justify-center`}>
                        <Icon size={18} className={t.iconColor} />
                      </div>
                      <span className="text-[10px] font-semibold text-gray-700 text-center leading-tight">
                        {t.label}
                      </span>
                    </button>
                  );
                })}
              </div>
              <button className="mt-3 text-xs font-semibold text-[#7C3AED] hover:underline w-full text-right">
                More Tools
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Cards ── */}

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-4 sm:py-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { title: "Add Player", sub: "Invite players to join your team" },
            { title: "Add Coach", sub: "Add coaches to monitor your team" },
            { title: "Edit Team", sub: "View and edit your team" },
          ].map((item) => (
            <div
              key={item.title}
              className="bg-gradient-to-t from-[#5a5a5a] to-[#1f1f1f] rounded-3xl border border-gray-600 p-5 sm:p-6 flex flex-col items-center text-center gap-2 shadow-sm"
            >
              <p className="text-white text-sm sm:text-base font-bold">{item.title}</p>
              <p className="text-gray-400 text-xs leading-relaxed">{item.sub}</p>
              <button className="mt-2 h-8 px-6 rounded-full bg-white text-[#1f1f1f] text-xs font-bold hover:bg-gray-100 transition">
                Get Code
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TeamDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <TeamDetailContent />
    </Suspense>
  );
}
