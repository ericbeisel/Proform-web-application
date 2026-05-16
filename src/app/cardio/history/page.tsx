"use client";

import { useState, useEffect } from "react";
import {
  Flame,
  ArrowLeft,
  Clock,
  Activity,
  Image as ImageIcon,
  Calendar,
  ChevronDown,
  X,
  Pencil,
  Trash,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  getCardioHistory,
  CardioHistoryItem,
} from "@/api/cardio/route";

type FilterType = "today" | "last2days" | "thisweek" | "thismonth" | "alltime";

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "last2days", label: "Last 2 Days" },
  { value: "thisweek", label: "This Week" },
  { value: "thismonth", label: "This Month" },
  { value: "alltime", label: "All Time" },
];

export default function CardioHistoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<CardioHistoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState<FilterType>("alltime");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedSession, setSelectedSession] = useState<CardioHistoryItem | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const data = await getCardioHistory(filter, 1, 20);
        setSessions(data.data || []);
        setTotal(data.total || 0);
      } catch (error) {
        console.error("Error fetching cardio history:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [filter]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getFilterLabel = () =>
    FILTER_OPTIONS.find((o) => o.value === filter)?.label ?? "All Time";

  return (
    <div className="min-h-screen bg-[#f4f4f8] overflow-x-hidden pb-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 sm:px-6 py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition"
            >
              <ArrowLeft size={18} className="text-white" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <Flame size={16} className="text-white" />
              </div>
              <h1 className="text-white font-bold text-lg">Last 20 Sessions</h1>
            </div>
          </div>

          {/* Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 px-3 py-2 bg-white/20 border border-white/30 rounded-xl text-sm font-medium text-white hover:bg-white/30 transition"
            >
              {getFilterLabel()}
              <ChevronDown
                size={15}
                className={`transition-transform duration-200 ${showDropdown ? "rotate-180" : ""}`}
              />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
                {FILTER_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setFilter(option.value);
                      setShowDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition ${
                      filter === option.value
                        ? "text-purple-600 bg-purple-50 font-medium"
                        : "text-gray-700"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary bar */}
      {!loading && (
        <div className="px-4 sm:px-6 pt-4">
          <p className="text-xs text-gray-500">
            Showing{" "}
            <span className="font-semibold text-purple-600">
              {sessions.length}
            </span>{" "}
            of {total} sessions · {getFilterLabel()}
          </p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      )}

      {/* Empty state */}
      {!loading && sessions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
          <Activity size={48} className="text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">No sessions found</p>
          <p className="text-gray-400 text-sm mt-1 mb-6">
            Try a different filter or log your first cardio session.
          </p>
          <button
            onClick={() => router.push("/todays-focus-cardio/cardio-entry")}
            className="px-5 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 transition"
          >
            Log a Session
          </button>
        </div>
      )}

      {/* Session Cards */}
      {!loading && sessions.length > 0 && (
        <div className="px-4 sm:px-6 pt-4 space-y-3">
          {sessions.map((session, index) => (
            <button
              key={session.id}
              onClick={() => setSelectedSession(session)}
              className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4 hover:shadow-md hover:border-purple-200 transition text-left"
            >
              {/* Index badge */}
              <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-purple-600">
                  {index + 1}
                </span>
              </div>

              {/* Image */}
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
                {session.menu_demo_url ? (
                  <img
                    src={session.menu_demo_url}
                    alt={session.menu_name || session.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon size={20} className="text-gray-400" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 text-sm truncate">
                  {session.menu_name || session.title}
                </p>
                <p className="text-xs text-gray-400 mt-0.5 truncate">
                  {session.menu_category || "General"} · {formatDate(session.created_at)}
                </p>
              </div>

              {/* Stats */}
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <div className="flex items-center gap-1">
                  <Flame size={12} className="text-red-400" />
                  <span className="text-sm font-bold text-gray-800">
                    {session.calories_burned}
                  </span>
                  <span className="text-[10px] text-gray-400">cal</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={12} className="text-purple-400" />
                  <span className="text-xs text-gray-500">
                    {session.minutes} min
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Session Detail Popup */}
      {selectedSession && (
        <div
          className="fixed inset-0 z-[70] bg-black/45 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setSelectedSession(null)}
        >
          <div
            className="relative w-full sm:max-w-[380px] rounded-t-[28px] sm:rounded-[22px] bg-[#f8f8f8] shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top bar */}
            <div className="px-4 pt-4 pb-3">
              <div className="flex items-center justify-between">
                <button className="w-8 h-8 rounded-full bg-[#dbe8ff] flex items-center justify-center">
                  <Pencil size={14} className="text-[#3b82f6]" />
                </button>
                <div className="w-10 h-1 rounded-full bg-gray-300 sm:hidden" />
                <button className="w-8 h-8 rounded-full bg-[#ffe3e3] flex items-center justify-center">
                  <Trash size={14} className="text-[#ff4d4f]" />
                </button>
              </div>

              <div className="text-center mt-3">
                <h2 className="text-xl font-black text-[#1a1a1a] leading-tight">
                  {selectedSession.menu_name || selectedSession.title || "Cardio"}
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  {formatDate(selectedSession.created_at)}
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200" />

            <div className="p-4">
              {/* Image */}
              <div className="rounded-2xl overflow-hidden border-2 border-purple-400 shadow-sm">
                {selectedSession.menu_demo_url ? (
                  <img
                    src={selectedSession.menu_demo_url}
                    alt=""
                    className="w-full h-[140px] object-cover"
                  />
                ) : (
                  <div className="w-full h-[140px] bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                    <Activity size={40} className="text-purple-300" />
                  </div>
                )}
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="rounded-2xl bg-[#ff7b45] p-4 text-white">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mb-2">
                    <Flame size={16} />
                  </div>
                  <p className="text-[10px] font-medium opacity-90">Calories</p>
                  <p className="text-3xl font-black leading-none mt-1">
                    {selectedSession.calories_burned || 0}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#e8def5] p-4">
                  <div className="w-8 h-8 rounded-full bg-[#d4b8ff] flex items-center justify-center mb-2">
                    <Clock size={16} className="text-[#6202AC]" />
                  </div>
                  <p className="text-[10px] font-semibold text-[#7b61a8]">Time</p>
                  <p className="text-2xl font-black text-[#6202AC] mt-1 leading-tight">
                    {selectedSession.minutes || 0}{" "}
                    <span className="text-base font-semibold">min</span>
                  </p>
                </div>
              </div>

              {/* Category pill */}
              {selectedSession.menu_category && (
                <div className="mt-3 flex justify-center">
                  <span className="px-4 py-1.5 bg-purple-50 border border-purple-200 text-purple-600 text-xs font-semibold rounded-full capitalize">
                    {selectedSession.menu_category}
                  </span>
                </div>
              )}

              {/* Actions */}
              <button
                onClick={() => router.push("/todays-focus-cardio/cardio-dashboard")}
                className="mt-4 w-full h-11 rounded-2xl border-2 border-[#7b2cff] text-[#6202AC] text-sm font-bold flex items-center justify-center gap-2 hover:bg-purple-50 transition"
              >
                <Calendar size={15} />
                Cardio Dashboard
              </button>

              <button
                onClick={() => setSelectedSession(null)}
                className="w-full text-center mt-3 mb-1 text-xs text-gray-400 font-semibold hover:text-gray-600 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
