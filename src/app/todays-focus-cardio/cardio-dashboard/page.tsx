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
  Pencil,
  X,
  ArrowRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {   getCardioHistory,
  getCardioDashboard,
  CardioHistoryResponse,
  CardioDashboardResponse, setCardioGoal } from "@/api/cardio/route";
  import { useToast } from "@/components/ui/toast-provider";

type FilterType = "today" | "last2days" | "thisweek" | "thismonth" | "alltime";

export default function CardioDashboardPage() {
  const toast = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [historyData, setHistoryData] = useState<CardioHistoryResponse | null>(null);
  const [filter, setFilter] = useState<FilterType>("thisweek");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showEditGoalModal, setShowEditGoalModal] = useState(false);
const [editGoalValue, setEditGoalValue] = useState("");
  const [dashboardData, setDashboardData] =
  useState<CardioDashboardResponse | null>(null);
  const [currentPage] = useState(1);
  const [limit] = useState(10);
const [memberId, setMemberId] = useState<string>("");
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

  useEffect(() => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const id = user.id || user.member_id || user.user_id || "";
  setMemberId(String(id));
}, []);

  useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);

      // FETCH BOTH APIs
      const [history, dashboard] = await Promise.all([
        getCardioHistory(filter, currentPage, limit),
        getCardioDashboard(),
      ]);

      console.log("History data:", history);
      console.log("Dashboard data:", dashboard);

      setHistoryData(history);
      setDashboardData(dashboard);

    } catch (error) {
      console.error("Error fetching cardio data:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
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
  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
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
    
    <div className="flex items-center gap-3">
      {/* Cardio Schedule Button */}
      <button
        onClick={() => router.push("/todays-focus-cardio/scheduled-cardio")}
        className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl text-sm font-semibold hover:from-green-600 hover:to-emerald-700 transition shadow-md flex items-center gap-2"
      >
        Cardio Schedule
      </button>
      
      {/* Log a Cardio Session Button */}
      <button
        onClick={() => router.push("/todays-focus-cardio/cardio-entry")}
        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl text-sm font-semibold hover:from-purple-600 hover:to-indigo-600 transition shadow-md flex items-center gap-2"
      >
        <Plus size={16} />
        Log Session
      </button>
      
      {/* Calendar Button */}
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
      {/* STATS CARD */}
{/* STATS CARD */}
<div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 shadow-sm border border-purple-100">
  <div className="flex items-start justify-between">
    {/* Left content */}
    <div className="flex-1 pr-4">
      <div className="flex items-center gap-2 mb-2">
        <Target size={20} className="text-purple-600" />
        <p className="text-sm text-purple-600 font-semibold uppercase tracking-wide">
          Weekly Cardio Calories
        </p>
      </div>

      <div className="flex items-end gap-3 flex-wrap">
        <div>
          <p className="text-4xl font-bold text-gray-800">
            {historyData?.weeklyCaloriesSum || 0}
          </p>
          <p className="text-xs text-gray-500 font-medium mt-1">Completed</p>
        </div>

        <span className="text-2xl text-gray-300 font-light mb-5">/</span>

        <div>
          <p className="text-3xl font-semibold text-gray-500">
            {dashboardData?.userDetail?.cardio_goal || 0}
          </p>
          <p className="text-xs text-gray-400 font-medium mt-1">Goal</p>
        </div>
      </div>
      
      <p className="text-xs text-gray-500 mt-2">
        Remaining:{" "}
        {Math.max(
          0,
          (dashboardData?.userDetail?.cardio_goal || 0) -
            (historyData?.weeklyCaloriesSum || 0)
        )}{" "}
        calories
      </p>
    </div>

    {/* Right side - Edit button and Icon */}
    <div className="flex flex-col items-end gap-2">
      {/* Edit Button */}
      <button
        onClick={() => {
          setEditGoalValue(String(dashboardData?.userDetail?.cardio_goal || 0));
          setShowEditGoalModal(true);
        }}
        className="p-2 hover:bg-purple-100 rounded-full transition"
        title="Edit Goal"
      >
        <Pencil size={18} className="text-purple-600" />
      </button>

      {/* Icon */}
      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
        <Flame size={28} className="text-purple-600" />
      </div>
    </div>
  </div>

  {/* PROGRESS BAR */}
  <div className="mt-4">
    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
      <div
        className="bg-gradient-to-r from-purple-500 to-indigo-600 h-2.5 rounded-full transition-all duration-500"
        style={{
          width: `${Math.min(
            100,
            ((historyData?.weeklyCaloriesSum || 0) /
              (dashboardData?.userDetail?.cardio_goal || 1)) *
              100
          )}%`,
        }}
      />
    </div>
    <p className="text-xs text-gray-400 mt-2 text-right">
      {Math.round(
        ((historyData?.weeklyCaloriesSum || 0) /
          (dashboardData?.userDetail?.cardio_goal || 1)) *
          100
      )}
      % complete
    </p>
  </div>
</div>

    

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
      {/* Edit Goal Modal */}
{/* Edit Goal Modal - Same style as Cardio Goal Modal */}
{showEditGoalModal && (
  <div
    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-3 sm:p-4"
    onClick={() => setShowEditGoalModal(false)}
  >
    <div
      className="relative w-full max-w-[520px] max-h-[92vh] overflow-y-auto rounded-[22px] bg-white px-5 sm:px-8 pb-8 pt-12 shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={() => setShowEditGoalModal(false)}
        className="absolute right-4 top-4 z-20 rounded-full bg-gray-100 p-2 text-[#1a1a1a]"
      >
        <X size={20} />
      </button>

      <p className="text-center text-sm font-semibold text-[#6b7384] uppercase tracking-widest">
        Adjusting
      </p>
      <h3 className="mt-1 text-center text-2xl sm:text-3xl font-bold text-[#1a1a1a]">
        Cardio Goal
      </h3>
      <div className="mx-auto mt-3 h-[4px] w-20 bg-gradient-to-r from-[#12a9db] to-[#6202AC] rounded-full" />

      <div className="mt-8 grid items-center gap-3 grid-cols-1 md:grid-cols-[1fr_auto_1fr]">
        <div className="rounded-[18px] border bg-gray-50/50 px-3 py-5 sm:py-7 text-center">
          <p className="text-2xl sm:text-3xl font-bold text-[#697286]">
            {dashboardData?.userDetail?.cardio_goal || 0}
          </p>
          <p className="mt-1 text-sm font-semibold text-gray-500">
            Current
          </p>
          <p className="text-[10px] text-[#a3acb9]">kcal / week</p>
        </div>

        <div className="flex justify-center rotate-90 md:rotate-0 text-[#11a9d5]">
          <ArrowRight size={24} strokeWidth={3} />
        </div>

        <div className="rounded-[18px] border-[3px] border-[#10aad3] bg-white px-3 py-5 sm:py-7 text-center shadow-sm">
          <input
            type="number"
            value={editGoalValue}
            onChange={(e) => setEditGoalValue(e.target.value.replace(/\D/g, ""))}
            placeholder="0"
            className="w-full bg-transparent text-center text-2xl sm:text-3xl font-bold text-[#6202AC] outline-none"
          />
          <p className="mt-1 text-sm font-semibold text-[#10aad3]">
            New Goal
          </p>
          <p className="text-[10px] text-[#a3acb9]">kcal / week</p>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        <button
          onClick={async () => {
            const newGoal = parseInt(editGoalValue, 10);
            if (isNaN(newGoal) || newGoal <= 0) {
              alert("Please enter a valid calorie goal");
              return;
            }
            
            try {
              await setCardioGoal({
                cardio_goal: newGoal,
                member_id: memberId,
              });
              toast.success("Cardio goal updated successfully!");
              setShowEditGoalModal(false);
              // Refresh data
              window.location.reload();
            } catch (error) {
              console.error("Error updating goal:", error);
              toast.error("Failed to update cardio goal");
            }
          }}
          className="h-[52px] w-full rounded-full bg-[#6202AC] text-lg font-semibold text-white shadow-lg shadow-purple-100 hover:bg-[#500ba6]"
        >
          Save Cardio Goal
        </button>

        <div className="pt-2">
          <p className="text-center text-xs font-medium text-[#a3acb9] mb-3">
            Quick suggestions:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {["3000", "4000", "5000", "6000"].map((val) => (
              <button
                key={val}
                onClick={() => setEditGoalValue(val)}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-[#6202AC] hover:bg-purple-50 hover:border-purple-200 transition-all"
              >
                {val}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
}