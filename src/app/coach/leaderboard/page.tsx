"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Settings, X, Trophy, Shield, ChevronRight, ChevronUp, ChevronDown, User, Link2, Atom, Home, Plus, Trash2, Pencil, Check } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface LeaderEntry {
  username: string;
  score: number;
}

interface Category {
  id: string;
  name: string;
  topScore: number | null;
  unit: string;
  leader: string | null;
  others: LeaderEntry[];
  gradient: string;
  headerGradient: string;
  avatarBg: string;
  iconColor: string;
  Icon: React.ElementType;
}

// ── Dummy teams ───────────────────────────────────────────────────────────────

const DUMMY_TEAMS = [
  "Test condon 241220",
  "265154,972606",
  "Alpha Test 571735",
  "XANVAS",
];

const CHOOSE_TEAMS = [
  { id: 1,  name: "Alphas 1 - Bigs",             color: "#1a1a2e" },
  { id: 2,  name: "Alphas 2 - Skills",            color: "#1a1a2e" },
  { id: 3,  name: "VIP",                          color: "#111111" },
  { id: 4,  name: "Alphas 3 - Elite Skill",       color: "#1a1a2e" },
  { id: 5,  name: "With-Ads Plan",                color: "#2d2d2d" },
  { id: 6,  name: "Alphas - Jr.",                 color: "#1a1a2e" },
  { id: 7,  name: "XFLReadiness",                 color: "#000000" },
  { id: 8,  name: "Ad-Free Plan",                 color: "#2d2d2d" },
  { id: 9,  name: "Bombshell Babes",              color: "#c0392b" },
  { id: 10, name: "1st Hour Strength Training",   color: "#8b0000" },
  { id: 11, name: "Elite Speed - 14U 7v7",        color: "#1a1a1a" },
  { id: 12, name: "Elite Speed - 18U 7v7",        color: "#1a1a1a" },
  { id: 13, name: "Elite Speed - 15U 7v7",        color: "#1a1a1a" },
  { id: 14, name: "De Smet Football - Bigs",      color: "#003366" },
  { id: 15, name: "De Smet Football - Skills",    color: "#003366" },
  { id: 16, name: "Ignatius",                     color: "#002fa7" },
  { id: 17, name: "Xavier",                       color: "#1a1a1a" },
  { id: 18, name: "Chaminade - Bigs",             color: "#cc0000" },
  { id: 19, name: "AHS Weights Sem. 2",           color: "#333333" },
  { id: 20, name: "Alphas 4 - U19",               color: "#1a1a2e" },
];

// ── Choose Team Modal ─────────────────────────────────────────────────────────

function ChooseTeamModal({ onClose, onSelect }: { onClose: () => void; onSelect: (name: string) => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-2xl border-2 border-[#3B82F6] shadow-2xl overflow-hidden flex"
        style={{ maxHeight: "88vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left arrow */}
        <div className="flex items-center px-2 shrink-0">
          <button className="text-gray-400 hover:text-gray-600 transition">
            <ChevronRight size={22} className="rotate-180" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-3 shrink-0">
            <div className="flex-1" />
            <h2 className="text-lg font-bold text-gray-900">Choose Team:</h2>
            <div className="flex-1 flex justify-end">
              <button
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-gray-800 transition"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Team grid */}
          <div className="overflow-y-auto px-4 pb-4">
            <div className="grid grid-cols-3 gap-x-5 gap-y-4">
              {CHOOSE_TEAMS.map((team) => {
                const initials = team.name
                  .split(" ")
                  .slice(0, 2)
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase();
                return (
                  <button
                    key={team.id}
                    onClick={() => { onSelect(team.name); onClose(); }}
                    className="flex items-center gap-3 hover:bg-gray-50 rounded-xl p-2 transition text-left"
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                      style={{ background: team.color }}
                    >
                      {initials}
                    </div>
                    <span className="text-sm text-gray-800 font-medium leading-tight line-clamp-2">
                      {team.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Dummy data ────────────────────────────────────────────────────────────────

const DUMMY_CATEGORIES: Category[] = [
  {
    id: "push",
    name: "PUSH (HHD)",
    topScore: 358,
    unit: "lbs/kg",
    leader: "ebeisel",
    others: [{ username: "ebeisel", score: 358 }],
    gradient: "from-[#4158D0] via-[#7B5CF6] to-[#8B4CF6]",
    headerGradient: "from-[#4158D0] to-[#8B4CF6]",
    avatarBg: "bg-[#9333ea]",
    iconColor: "text-orange-300",
    Icon: Trophy,
  },
  {
    id: "raise",
    name: "RAISE (DVS)",
    topScore: 347,
    unit: "lbs/kg",
    leader: "ebeisel",
    others: [{ username: "ebeisel", score: 347 }],
    gradient: "from-[#0093E9] to-[#38bdf8]",
    headerGradient: "from-[#0093E9] to-[#38bdf8]",
    avatarBg: "bg-[#2563eb]",
    iconColor: "text-blue-200",
    Icon: Shield,
  },
  {
    id: "pull",
    name: "PULL (HHP)",
    topScore: 313,
    unit: "lbs/kg",
    leader: "RobT",
    others: [
      { username: "RobT", score: 313 },
      { username: "ebeisel", score: 86 },
    ],
    gradient: "from-[#11998e] to-[#38ef7d]",
    headerGradient: "from-[#11998e] to-[#38ef7d]",
    avatarBg: "bg-[#f59e0b]",
    iconColor: "text-green-200",
    Icon: Shield,
  },
  {
    id: "thrust",
    name: "THRUST (CCP)",
    topScore: null,
    unit: "lbs/kg",
    leader: null,
    others: [],
    gradient: "from-[#f7971e] to-[#ffd200]",
    headerGradient: "from-[#f7971e] to-[#ffd200]",
    avatarBg: "bg-[#d97706]/40",
    iconColor: "text-yellow-200",
    Icon: Trophy,
  },
  {
    id: "squat",
    name: "SQUAT (RES)",
    topScore: 55,
    unit: "lbs/kg",
    leader: "RobT",
    others: [
      { username: "RobT", score: 55 },
      { username: "yashvi11", score: 11 },
      { username: "sneha09", score: 11 },
    ],
    gradient: "from-[#FF416C] to-[#FF4B2B]",
    headerGradient: "from-[#FF416C] to-[#FF4B2B]",
    avatarBg: "bg-[#f97316]",
    iconColor: "text-red-200",
    Icon: Trophy,
  },
  {
    id: "press",
    name: "PRESS (UES)",
    topScore: 130,
    unit: "lbs/kg",
    leader: "RobT",
    others: [
      { username: "RobT", score: 130 },
      { username: "BigDaddyGatti", score: 33 },
      { username: "sneha09", score: 24 },
    ],
    gradient: "from-[#7B2FBE] to-[#4A00E0]",
    headerGradient: "from-[#7B2FBE] to-[#4A00E0]",
    avatarBg: "bg-[#f97316]",
    iconColor: "text-purple-200",
    Icon: Trophy,
  },
];

// ── Xanvas Hub Modal ──────────────────────────────────────────────────────────

const XANVAS_DEVICES = [
  {
    id: 1,
    name: "Test condon #241220",
    programName: null,
    vip: false,
    workout: null,
    assignee: null,
    series: null,
  },
  {
    id: 2,
    name: "Home test #980110",
    programName: "Hypertrophy",
    vip: true,
    workout: "HAM-HAVEN , Week 1 , Day 1",
    assignee: "ELIAS",
    series: "CORE SERIES",
  },
];

function XanvasHubModal({ onClose }: { onClose: () => void }) {

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#f5f5f7] rounded-3xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-white px-5 pt-5 pb-4 border-b border-gray-100">
          <button
            onClick={onClose}
            className="text-[#3B82F6] text-sm font-medium mb-3 block hover:underline"
          >
            Back ...
          </button>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Atom size={28} className="text-gray-700" />
            <p className="text-2xl font-bold text-gray-900" style={{ fontFamily: "Georgia, serif" }}>
              <span className="italic" style={{ fontFamily: "cursive" }}>Xanvas</span>{" "}
              <span className="font-black not-italic" style={{ fontFamily: "sans-serif" }}>Hub</span>
            </p>
          </div>

          {/* Filter + action row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Left arrow */}
              <button className="text-gray-400 hover:text-gray-600">
                <ChevronRight size={18} className="rotate-180" />
              </button>
              {/* Filter dropdown */}
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
              >
                FILTER TEAMS
                <ChevronDown size={13} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button className="w-9 h-9 rounded-full bg-[#3B82F6] flex items-center justify-center hover:bg-[#2563EB] transition">
                <Plus size={18} className="text-white" />
              </button>
              <button className="w-9 h-9 rounded-full bg-[#3B82F6] flex items-center justify-center hover:bg-[#2563EB] transition">
                <Home size={17} className="text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-4 flex flex-col gap-3 max-h-[420px] overflow-y-auto">
          <p className="text-sm font-semibold text-gray-500 mb-1">Connected Devices:</p>

          {XANVAS_DEVICES.map((device) => (
            <div key={device.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              {/* Top row */}
              <div className="flex items-start gap-3">
                <input type="checkbox" className="mt-1 accent-[#3B82F6] shrink-0 w-4 h-4" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm">{device.name}</p>
                  {device.programName && (
                    <p className="text-xs text-gray-500 mt-0.5">Program Name : {device.programName}</p>
                  )}
                </div>
                {device.vip && (
                  <div className="shrink-0 text-right">
                    <p className="font-bold text-gray-900 text-sm">VIP</p>
                    {device.workout && (
                      <p className="text-xs text-gray-500 mt-0.5">Workout : {device.workout}</p>
                    )}
                  </div>
                )}
                {device.vip && (
                  <button className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center shrink-0 hover:bg-gray-50">
                    <Link2 size={13} className="text-gray-500" />
                  </button>
                )}
              </div>

              {/* Dropdowns row (only for detailed cards) */}
              {device.assignee && (
                <div className="flex items-center gap-2 mt-3 ml-7">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-[11px] font-bold text-gray-700 hover:bg-gray-50">
                    {device.assignee} <ChevronDown size={11} />
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-[11px] font-bold text-gray-700 hover:bg-gray-50">
                    {device.series} <ChevronDown size={11} />
                  </button>
                </div>
              )}
              {device.assignee && (
                <button className="ml-7 mt-2 text-[11px] font-bold text-gray-600 tracking-wide uppercase hover:text-gray-900">
                  Move To Next Workout
                </button>
              )}

              {/* Action buttons */}
              <div className="flex justify-end gap-1.5 mt-3">
                <button className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-red-50 hover:border-red-200 transition">
                  <Trash2 size={13} className="text-gray-500 hover:text-red-500" />
                </button>
                <button className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-blue-50 hover:border-blue-200 transition">
                  <Pencil size={13} className="text-gray-500" />
                </button>
                {device.vip && (
                  <button className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-green-50 hover:border-green-200 transition">
                    <Check size={13} className="text-gray-500" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Category Modal ─────────────────────────────────────────────────────────────

function CategoryModal({ cat, onClose }: { cat: Category; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gradient header */}
        <div className={`bg-gradient-to-r ${cat.headerGradient} px-5 pt-5 pb-6 relative`}>
          <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest mb-1">
            Leaderboard Category
          </p>
          <p className="text-white font-black text-2xl leading-tight">
            {cat.name.split(" ")[0]}{" "}
            <span className="font-normal text-white/80 text-base">
              ({cat.name.match(/\(([^)]+)\)/)?.[1] ?? ""})
            </span>
          </p>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition"
          >
            <X size={14} className="text-white" />
          </button>
          {/* Decorative circle */}
          <div className="absolute -bottom-6 right-6 w-20 h-20 rounded-full bg-white/10" />
        </div>

        {/* Dark table body */}
        <div style={{ background: "#1a1535" }} className="px-0 py-0">
          {cat.others.length === 0 ? (
            <p className="text-white/40 text-sm text-center py-8">No entries yet</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr style={{ background: "#221b42" }}>
                  <th className="text-left py-3 px-5 text-white text-sm font-bold">UserName</th>
                  <th className="text-right py-3 px-5 text-white text-sm font-bold">Value</th>
                </tr>
              </thead>
              <tbody>
                {cat.others.map((entry, i) => (
                  <tr
                    key={entry.username}
                    style={{ borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <td className="py-3.5 px-5 text-white/70 text-sm italic">{entry.username}</td>
                    <td className="py-3.5 px-5 text-right text-[#a78bfa] font-semibold text-sm">
                      {entry.score.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────

function LeaderCard({ cat, onViewCategory }: { cat: Category; onViewCategory: () => void }) {
  const { Icon } = cat;
  const noRecord = cat.topScore === null;
  const initial = cat.leader ? cat.leader[0].toUpperCase() : null;

  return (
    <div className={`rounded-2xl overflow-hidden flex flex-col bg-gradient-to-br ${cat.gradient} shadow-lg`}>
      {/* Main section */}
      <div className="px-4 pt-4 pb-5 flex flex-col gap-3 flex-1">
        {/* Top row: rank + icon */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="bg-[#f59e0b] text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center leading-none">
              1
            </span>
            <span className="text-white/70 text-xs font-semibold">Team</span>
          </div>
          <Icon size={20} className={`${cat.iconColor} opacity-80`} />
        </div>

        {/* Avatar + score row */}
        <div className="flex items-center gap-3">
          <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full ${cat.avatarBg} flex items-center justify-center shrink-0 shadow-inner`}>
            {initial ? (
              <span className="text-white font-black text-2xl">{initial}</span>
            ) : (
              <User size={26} className="text-white/60" />
            )}
          </div>

          <div className="min-w-0">
            {noRecord ? (
              <p className="text-white font-black text-2xl sm:text-3xl leading-tight">No record</p>
            ) : (
              <div className="flex items-baseline gap-1">
                <span className="text-white font-black text-3xl sm:text-4xl leading-tight">
                  {cat.topScore}
                </span>
                <span className="text-white/60 text-xs">{cat.unit}</span>
              </div>
            )}
            <p className="text-white/80 text-xs font-bold uppercase tracking-wide truncate mt-0.5">
              {cat.name}
            </p>
            {cat.leader && (
              <p className="text-white/90 text-sm font-semibold truncate">@{cat.leader}</p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom dark strip */}
      <div className="bg-black/25 px-4 py-3 flex items-center justify-between gap-2 min-h-[44px]">
        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
          {noRecord ? (
            <p className="text-white/40 text-xs italic">No entries yet</p>
          ) : (
            cat.others.slice(1).map((o) => (
              <p key={o.username} className="text-white/60 text-xs truncate">
                @{o.username} <span className="text-white/40">({o.score})</span>
              </p>
            ))
          )}
        </div>
        {!noRecord && (
          <button
            onClick={onViewCategory}
            className="text-white/80 text-xs font-semibold flex items-center gap-0.5 hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            View Category <ChevronRight size={12} />
          </button>
        )}
      </div>
    </div>
  );
}

// ── Content ───────────────────────────────────────────────────────────────────

function LeaderboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const teamName = searchParams.get("team_name") ?? "My Team";
  const teamId = searchParams.get("team_id") ?? "";
  const initial = teamName[0]?.toUpperCase() ?? "T";

  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [teamSwitcherOpen, setTeamSwitcherOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(DUMMY_TEAMS[DUMMY_TEAMS.length - 1]);
  const [xanvasHubOpen, setXanvasHubOpen] = useState(false);
  const [chooseTeamOpen, setChooseTeamOpen] = useState(false);

  return (
    <div
      className="min-h-screen flex flex-col overflow-x-hidden"
      style={{ background: "linear-gradient(135deg, #0f0520 0%, #1a0a35 50%, #0a1020 100%)" }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-40 px-4 sm:px-6 py-5 border-b border-white/10"
        style={{ background: "rgba(15,5,32,0.85)", backdropFilter: "blur(12px)" }}
      >
        <div className="flex items-center justify-between gap-2">
          {/* Left */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setChooseTeamOpen(true)}
              className="flex items-center gap-1 text-[#60a5fa] text-xs sm:text-sm font-semibold hover:text-[#93c5fd] transition-colors shrink-0"
            >
              <ArrowLeft size={14} />
              <span>Change Teams</span>
            </button>
            <button
              onClick={() => router.push(`/coach/leaderboard-options?team_name=${encodeURIComponent(teamName)}`)}
              className="hover:opacity-70 transition shrink-0"
            >
              <Settings size={15} className="text-white/40" />
            </button>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#7C3AED] flex items-center justify-center text-white text-[10px] font-black shrink-0">
              {initial}
            </div>
            <span className="text-white font-semibold text-sm truncate max-w-[100px] sm:max-w-none">
              {teamName}
            </span>
          </div>

          {/* Center */}
          <button
            onClick={() => router.push(`/coach/team/${teamId}?team_name=${encodeURIComponent(teamName)}`)}
            className="flex flex-col items-center shrink-0 absolute left-1/2 -translate-x-1/2 hover:opacity-80 transition"
          >
            <div className="w-10 h-10 rounded-full bg-[#7C3AED] flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.6)]">
              <img
                src="/images/proform-logo.jpg"
                alt="Proform"
                className="w-6 h-6 object-contain rounded-sm"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                  (e.currentTarget.parentElement as HTMLElement).innerHTML =
                    '<span class="text-white font-black text-sm">P</span>';
                }}
              />
            </div>
            <span className="text-[#a78bfa] text-[11px] sm:text-xs font-bold italic mt-1 whitespace-nowrap">
              Team Leaderboard:
            </span>
          </button>

          {/* Right */}
          <button
            onClick={() => router.push("/coach/coach-dashboard")}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition shrink-0"
          >
            <X size={14} className="text-white/60" />
          </button>
        </div>
      </header>

      {/* Grid */}
      <div className="flex-1 px-4 sm:px-6 py-5 sm:py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {DUMMY_CATEGORIES.map((cat) => (
            <LeaderCard
              key={cat.id}
              cat={cat}
              onViewCategory={() => setActiveCategory(cat)}
            />
          ))}
        </div>
      </div>

      {/* Category modal */}
      {activeCategory && (
        <CategoryModal cat={activeCategory} onClose={() => setActiveCategory(null)} />
      )}

      {/* Xanvas Hub modal */}
      {xanvasHubOpen && (
        <XanvasHubModal onClose={() => setXanvasHubOpen(false)} />
      )}

      {/* Choose Team modal */}
      {chooseTeamOpen && (
        <ChooseTeamModal
          onClose={() => setChooseTeamOpen(false)}
          onSelect={(name) => setSelectedTeam(name)}
        />
      )}

      {/* Bottom-left team switcher */}
      <div className="fixed bottom-5 left-4 z-40 flex items-end gap-2">
        {/* Chain icon button */}
        <button onClick={() => setXanvasHubOpen(true)} className="w-11 h-11 rounded-2xl bg-[#2a2a3a] flex items-center justify-center shadow-lg shrink-0">
          <Link2 size={18} className="text-[#60a5fa]" />
        </button>

        {/* Dropdown */}
        <div className="relative flex flex-col">
          {/* Team list — shown above when open */}
          {teamSwitcherOpen && (
            <div className="absolute bottom-full mb-1 w-52 rounded-xl border-2 border-[#7C3AED] bg-white overflow-hidden shadow-xl">
              {DUMMY_TEAMS.filter((t) => t !== selectedTeam).map((team) => (
                <button
                  key={team}
                  onClick={() => { setSelectedTeam(team); setTeamSwitcherOpen(false); }}
                  className="w-full text-left px-4 py-3 text-[#7C3AED] font-semibold text-sm hover:bg-purple-50 transition-colors border-b border-purple-100 last:border-b-0"
                >
                  {team}
                </button>
              ))}
            </div>
          )}

          {/* Selected team bar */}
          <button
            onClick={() => setTeamSwitcherOpen((o) => !o)}
            className="w-52 flex items-center justify-between px-4 py-3 bg-white rounded-xl shadow-lg border border-gray-100"
          >
            <span className="text-[#1f1f1f] font-bold text-sm truncate">{selectedTeam}</span>
            {teamSwitcherOpen
              ? <ChevronUp size={16} className="text-gray-500 shrink-0" />
              : <ChevronDown size={16} className="text-gray-500 shrink-0" />
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Export ────────────────────────────────────────────────────────────────────

export default function CoachLeaderboardPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #0f0520 0%, #1a0a35 100%)" }}
        >
          <div className="w-10 h-10 border-4 border-[#a78bfa] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LeaderboardContent />
    </Suspense>
  );
}
