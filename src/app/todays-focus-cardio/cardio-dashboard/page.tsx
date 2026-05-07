// app/cardio/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Flame,
  ArrowLeft,
  Calendar,
  Loader2,
  Activity,
  Clock,
  Plus,
  Image as ImageIcon,
  ChevronDown,
  Target,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getCardioHistory, CardioHistoryResponse } from "@/api/cardio/route";

type FilterType = "today" | "last2days" | "thisweek" | "thismonth" | "alltime";

export default function CardioDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [historyData, setHistoryData] = useState<CardioHistoryResponse | null>(null);
  const [filter, setFilter] = useState<FilterType>("thisweek");
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentPage] = useState(1);
  const [limit] = useState(10);

  // Weekly target - this can come from user preferences or API
  const weeklyTarget = 12; // Example: 12 sessions per week target

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const data = await getCardioHistory(filter, currentPage, limit);
        console.log("History data:", data);
        setHistoryData(data);
      } catch (error) {
        console.error("Error fetching cardio history:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [filter, currentPage, limit]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: '2-digit',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getFilterText = () => {
    switch (filter) {
      case "today": return "Today";
      case "last2days": return "Last 2 Days";
      case "thisweek": return "This Week";
      case "thismonth": return "This Month";
      case "alltime": return "All Time";
      default: return "This Week";
    }
  };

  const getFilterValue = () => {
    switch (filter) {
      case "today": return "today";
      case "last2days": return "last2days";
      case "thisweek": return "thisweek";
      case "thismonth": return "thismonth";
      case "alltime": return "all";
      default: return "thisweek";
    }
  };

  // Calculate cardio left this week
  const sessionsCompleted = historyData?.total || 0;
  const cardioLeft = Math.max(0, weeklyTarget - sessionsCompleted);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f4f8] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f4f8] pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 sm:px-6 py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
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
              <h1 className="text-white font-bold text-lg">Cardio Dashboard</h1>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => router.push("/itinerary/itinerary-page")}
              className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition"
            >
              <Calendar size={18} className="text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards - Single Card for Cardio Left */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 gap-4 mb-6">
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 shadow-sm border border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Target size={20} className="text-purple-600" />
                  <p className="text-sm text-purple-600 font-semibold uppercase tracking-wide">Cardio Left This Week</p>
                </div>
                <p className="text-4xl font-bold text-gray-800">{cardioLeft}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Target: {weeklyTarget} sessions • Completed: {sessionsCompleted}
                </p>
              </div>
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                <Flame size={28} className="text-purple-600" />
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-gradient-to-r from-purple-500 to-indigo-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (sessionsCompleted / weeklyTarget) * 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-2 text-right">
                {Math.round((sessionsCompleted / weeklyTarget) * 100)}% complete
              </p>
            </div>
          </div>
        </div>

        {/* Log a Cardio Session Button */}
            <button
          onClick={() => router.push("/todays-focus-cardio/scheduled-cardio")}
          className="w-full bg-gradient-to-r from-green-600 to-indigo-600 text-white py-4 rounded-2xl font-semibold text-lg shadow-md hover:from-purple-700 hover:to-indigo-700 transition flex items-center justify-center gap-2 mb-8"
        >
          Cardio Schedule
        </button>
        <button
          onClick={() => router.push("/todays-focus-cardio/cardio-entry")}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-2xl font-semibold text-lg shadow-md hover:from-purple-700 hover:to-indigo-700 transition flex items-center justify-center gap-2 mb-8"
        >
          <Plus size={20} />
          Log a Cardio Session
        </button>

        {/* Cardio Activities Section with Dropdown */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Calendar size={18} className="text-purple-600" />
              Cardio Activities
            </h2>
            <p className="text-xs text-gray-400 mt-1">Your filtered cardio activities</p>
          </div>
          
          {/* Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition shadow-sm"
            >
              {getFilterText()}
              <ChevronDown size={16} className={`transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
                {[
                  { value: "today", label: "Today" },
                  { value: "last2days", label: "Last 2 Days" },
                  { value: "thisweek", label: "This Week" },
                  { value: "thismonth", label: "This Month" },
                  { value: "alltime", label: "All Time" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setFilter(option.value as FilterType);
                      setShowDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition ${
                      filter === option.value ? 'text-purple-600 bg-purple-50 font-medium' : 'text-gray-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sessions Table */}
    {/* Sessions Table */}
<div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead className="bg-gray-50 border-b border-gray-100">
        <tr>
          <th className="text-left py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Image</th>
          <th className="text-left py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
          <th className="text-left py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
          <th className="text-left py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Time (min)</th>
          <th className="text-left py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cal.</th>
          <th className="text-left py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {historyData?.data?.map((session) => (
          <tr key={session.id} className="hover:bg-gray-50 transition">
            <td className="py-3 px-4">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                {session.menu_demo_url ? (
                  <img src={session.menu_demo_url} alt={session.title} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <ImageIcon size={18} className="text-gray-400" />
                )}
              </div>
            </td>
            <td className="py-3 px-4">
              <p className="font-medium text-gray-800 text-sm">{session.menu_name || session.title}</p>
            </td>
            <td className="py-3 px-4">
              <span className="text-xs text-gray-500 capitalize">{session.menu_category || "General"}</span>
            </td>
            <td className="py-3 px-4">
              <div className="flex items-center gap-1">
                <Clock size={12} className="text-gray-400" />
                <span className="text-sm text-gray-600">{session.minutes}</span>
              </div>
            </td>
            <td className="py-3 px-4">
              <div className="flex items-center gap-1">
                <Flame size={12} className="text-red-400" />
                <span className="text-sm font-medium text-gray-800">{session.calories_burned}</span>
              </div>
            </td>
            <td className="py-3 px-4">
              <p className="text-xs text-gray-400">{formatDate(session.created_at)}</p>
            </td>
          </tr>
        ))}
        {(!historyData?.data || historyData.data.length === 0) && (
          <tr>
            <td colSpan={6} className="py-8 text-center text-gray-400">
              <Activity size={32} className="mx-auto mb-2 text-gray-300" />
              <p>No cardio sessions found for {getFilterText().toLowerCase()}</p>
              <button
                onClick={() => router.push("/todays-focus-cardio/cardio-entry")}
                className="mt-3 text-purple-600 text-sm font-medium hover:underline"
              >
                Log your first session →
              </button>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</div>

        {/* See Last 20 Button */}
        <div className="mt-6 text-center">
          <button
            onClick={() => router.push("/cardio/history")}
            className="text-purple-600 text-sm font-medium hover:underline flex items-center justify-center gap-1"
          >
            See Last 20
            <ArrowLeft size={14} className="rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
}