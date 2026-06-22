"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Users,
  ChevronDown,
  ChevronRight,
  Droplets,
  Wind,
  Heart,
  ImageIcon,
  MoreHorizontal,
  X,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ReportType =
  | "Progress Photo"
  | "Blood Pressure"
  | "Breathing Test"
  | "Hydration Test"
  | "Other";

type Status = "Active" | "Reject" | "Pending";

interface Submission {
  id: number;
  player: string;
  username: string;
  team: string;
  type: ReportType;
  status: Status;
  date: string;
  note?: string;
  imageUrl: string | null;
}

// ─── Dummy data ───────────────────────────────────────────────────────────────

const DUMMY: Submission[] = [
  { id: 1,  player: "Sneha Gharge",  username: "sneha09",  team: "SP",    type: "Blood Pressure",  status: "Active",  date: "Jun 22, 2026", note: "120/80 mmHg — Normal", imageUrl: null },
  { id: 2,  player: "Komal Rajpure", username: "komal123", team: "SP",    type: "Progress Photo",  status: "Active",  date: "Jun 22, 2026", imageUrl: null },
  { id: 3,  player: "Rohan Desai",   username: "rohan_d",  team: "SP",    type: "Breathing Test",  status: "Reject",  date: "Jun 21, 2026", note: "Incomplete data", imageUrl: null },
  { id: 4,  player: "Anita Sharma",  username: "anita_s",  team: "Alpha", type: "Hydration Test",  status: "Active",  date: "Jun 21, 2026", note: "Urine SG: 1.015", imageUrl: null },
  { id: 5,  player: "Vijay Patil",   username: "vijay_p",  team: "Alpha", type: "Progress Photo",  status: "Pending", date: "Jun 20, 2026", imageUrl: null },
  { id: 6,  player: "Sneha Gharge",  username: "sneha09",  team: "SP",    type: "Breathing Test",  status: "Active",  date: "Jun 20, 2026", imageUrl: null },
  { id: 7,  player: "Komal Rajpure", username: "komal123", team: "SP",    type: "Other",           status: "Pending", date: "Jun 19, 2026", note: "Sleep journal", imageUrl: null },
  { id: 8,  player: "Vijay Patil",   username: "vijay_p",  team: "Alpha", type: "Blood Pressure",  status: "Reject",  date: "Jun 19, 2026", note: "Reading out of range", imageUrl: null },
  { id: 9,  player: "Rohan Desai",   username: "rohan_d",  team: "SP",    type: "Hydration Test",  status: "Active",  date: "Jun 18, 2026", imageUrl: null },
  { id: 10, player: "Anita Sharma",  username: "anita_s",  team: "Alpha", type: "Progress Photo",  status: "Active",  date: "Jun 18, 2026", imageUrl: null },
];

const REPORT_TYPES: ReportType[] = [
  "Progress Photo",
  "Blood Pressure",
  "Breathing Test",
  "Hydration Test",
  "Other",
];

const TEAMS = ["All Teams", "SP", "Alpha"];
const STATUSES: ("All" | Status)[] = ["All", "Active", "Reject", "Pending"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_ICON: Record<ReportType, React.ReactNode> = {
  "Progress Photo": <ImageIcon size={16} />,
  "Blood Pressure": <Heart size={16} />,
  "Breathing Test": <Wind size={16} />,
  "Hydration Test": <Droplets size={16} />,
  "Other":          <MoreHorizontal size={16} />,
};

function getStatusClass(status: Status) {
  if (status === "Active")  return "bg-[#e6f9f6] text-[#00daba]";
  if (status === "Reject")  return "bg-[#fff1f0] text-[#ef4444]";
  return "bg-yellow-50 text-yellow-600";
}

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PlayerAccountabilityPage() {
  const router = useRouter();

  const [activeType, setActiveType]   = useState<ReportType>("Progress Photo");
  const [teamFilter, setTeamFilter]   = useState("All Teams");
  const [statusFilter, setStatusFilter] = useState<"All" | Status>("All");
  const [selected, setSelected]       = useState<Submission | null>(null);

  const filtered = DUMMY.filter((s) => {
    const matchesType   = s.type === activeType;
    const matchesTeam   = teamFilter === "All Teams" || s.team === teamFilter;
    const matchesStatus = statusFilter === "All" || s.status === statusFilter;
    return matchesType && matchesTeam && matchesStatus;
  });

  return (
    <main className="min-h-screen bg-[#f8f9fb] px-5 py-6 md:p-10 font-sans">

      {/* ── Header ── */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="p-2.5 rounded-full bg-white shadow-sm hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={18} className="text-gray-700" strokeWidth={2.5} />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#6d28d9] text-white flex items-center justify-center shadow-md shadow-purple-500/20">
            <Users size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1a1c1e] tracking-tight">
              Player Accountability
            </h1>
            <p className="text-gray-400 text-xs font-medium">
              Review player submissions
            </p>
          </div>
        </div>
      </div>

      {/* ── Filters + tabs ── */}
      <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm px-4 py-3 mb-4">

        {/* Label + dropdowns */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
          <h2 className="text-sm font-bold text-[#1a1c1e] tracking-tight">Reports</h2>

          <div className="flex items-center gap-2 flex-wrap sm:ml-auto">
            {/* Team filter */}
            <div className="relative">
              <select
                value={teamFilter}
                onChange={(e) => setTeamFilter(e.target.value)}
                className="h-7 pl-2.5 pr-7 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-700 appearance-none outline-none focus:border-[#6d28d9] min-w-[120px]"
              >
                {TEAMS.map((t) => <option key={t}>{t}</option>)}
              </select>
              <ChevronDown size={11} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

            {/* Status filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "All" | Status)}
                className="h-7 pl-2.5 pr-7 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-700 appearance-none outline-none focus:border-[#6d28d9] min-w-[120px]"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s === "All" ? "Filter By Status" : s}
                  </option>
                ))}
              </select>
              <ChevronDown size={11} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Type tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
          {REPORT_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={`shrink-0 h-7 px-3 rounded-full text-xs font-semibold border transition-all ${
                activeType === type
                  ? "bg-[#6d28d9] text-white border-[#6d28d9] shadow-sm shadow-purple-400/30"
                  : "bg-white text-gray-500 border-gray-200 hover:border-[#6d28d9] hover:text-[#6d28d9]"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* ── List ── */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-6 md:p-8">
        <h2 className="text-base font-bold text-[#1a1c1e] mb-5 tracking-tight">
          {activeType} Submissions
          <span className="ml-2 text-sm font-normal text-gray-400">
            ({filtered.length})
          </span>
        </h2>

        {filtered.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-sm">
            No submissions found.
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((sub) => (
              <div
                key={sub.id}
                className="group border border-gray-100 bg-white rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between hover:shadow-md hover:border-purple-200 transition-all duration-200 cursor-pointer"
                onClick={() => setSelected(sub)}
              >
                {/* Left */}
                <div className="flex items-center gap-4 flex-1 mb-3 md:mb-0">
                  {/* Avatar */}
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#6d28d9] to-[#7c3aed] flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm">
                    {initials(sub.player)}
                  </div>

                  {/* Thumbnail */}
                  <div className="w-12 h-12 bg-gray-50 rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center flex-shrink-0">
                    {sub.imageUrl ? (
                      <img
                        src={sub.imageUrl}
                        alt={sub.type}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-400">
                        {TYPE_ICON[sub.type]}
                      </span>
                    )}
                  </div>

                  {/* Name + note */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#1a1c1e] truncate">
                      {sub.player}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      @{sub.username} · {sub.team}
                    </p>
                    {sub.note && (
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {sub.note}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right */}
                <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-3 md:pt-0">
                  <div className="flex flex-col md:items-end gap-0.5">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${getStatusClass(sub.status)}`}>
                      {sub.status}
                    </span>
                    <span className="text-xs text-gray-400">{sub.date}</span>
                  </div>
                  <div className="p-2 rounded-xl text-gray-300 group-hover:bg-purple-50 group-hover:text-[#6d28d9] transition-all">
                    <ChevronRight size={18} strokeWidth={2.5} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Detail popup ── */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative bg-white w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top bar */}
            <div className="bg-[#6d28d9] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                {TYPE_ICON[selected.type]}
                <span className="text-sm font-bold uppercase tracking-wide">
                  {selected.type}
                </span>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition"
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4">
              {/* Player info */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6d28d9] to-[#7c3aed] flex items-center justify-center text-white font-bold shadow shrink-0">
                  {initials(selected.player)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#1a1c1e] text-sm">{selected.player}</p>
                  <p className="text-xs text-purple-500">@{selected.username}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${getStatusClass(selected.status)}`}>
                    {selected.status}
                  </span>
                  <span className="text-[11px] text-gray-400">{selected.team}</span>
                </div>
              </div>

              <p className="text-xs text-gray-400">{selected.date}</p>

              {/* Image area */}
              <div className="rounded-2xl bg-gray-50 border border-gray-100 h-40 flex items-center justify-center overflow-hidden">
                {selected.imageUrl ? (
                  <img
                    src={selected.imageUrl}
                    alt={selected.type}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-gray-300">
                    <div className="scale-[2]">{TYPE_ICON[selected.type]}</div>
                    <p className="text-xs mt-2">No image attached</p>
                  </div>
                )}
              </div>

              {/* Note */}
              {selected.note && (
                <div className="bg-[#f0f0ff] border border-purple-100 rounded-xl px-4 py-3">
                  <p className="text-xs text-purple-700 font-medium leading-relaxed">
                    {selected.note}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3">
                <button className="h-11 rounded-2xl bg-[#e6f9f6] text-[#00daba] text-sm font-bold border border-[#b7e9d7] hover:bg-[#d0f5ef] transition">
                  Approve
                </button>
                <button className="h-11 rounded-2xl bg-[#fff1f0] text-[#ef4444] text-sm font-bold border border-[#f1c8c1] hover:bg-[#ffe4e3] transition">
                  Reject
                </button>
              </div>
              <button className="w-full h-11 rounded-2xl bg-[#f5f0ff] text-[#6d28d9] text-sm font-bold border border-[#ddd6fe] hover:bg-[#ede9fe] transition">
                Request for Resubmission
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
