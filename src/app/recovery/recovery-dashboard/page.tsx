"use client";

import { useState, useEffect } from "react";
import {
  RefreshCw,
  Calendar,
  X,
  ChevronUp,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getRecoveryDashboard, getAllRecoveryZones, updateRecoveryGoal, RecoveryDashboardData, RecoveryZone } from "@/api/recovery/route";

// Helper function to get image URL
const getImageUrl = (imageUrl: string | null | undefined): string => {
  if (!imageUrl) return "/images/placeholder.jpg";
  if (imageUrl.startsWith("wix:image://v1/")) {
    const match = imageUrl.match(/wix:image:\/\/v1\/([^/]+)/);
    if (match?.[1]) return `/api/image-proxy/media/${match[1]}`;
  }
  if (imageUrl.match(/^[a-f0-9_]+~mv2/i)) return `/api/image-proxy/media/${imageUrl}`;
  if (imageUrl.includes("static.wixstatic.com/media/")) {
    const path = imageUrl.replace("https://static.wixstatic.com/", "");
    return `/api/image-proxy/${path}`;
  }
  return imageUrl;
};

// Get icon emoji based on form name (fallback)
const getIconEmoji = (form: string): string => {
  const formLower = form.toLowerCase();
  if (formLower.includes("compression")) return "🦵";
  if (formLower.includes("contrast")) return "🛁";
  if (formLower.includes("cryo")) return "❄️";
  if (formLower.includes("sauna")) return "🌡️";
  if (formLower.includes("massage gun")) return "🔫";
  if (formLower.includes("dry-needling")) return "💉";
  if (formLower.includes("e-stim")) return "⚡";
  if (formLower.includes("foam rolling")) return "🧘";
  if (formLower.includes("laser")) return "💡";
  if (formLower.includes("nap")) return "😴";
  if (formLower.includes("hbot")) return "🫁";
  if (formLower.includes("hot tub") || formLower.includes("hottub")) return "♨️";
  if (formLower.includes("ice bath")) return "🧊";
  if (formLower.includes("massage") && !formLower.includes("gun")) return "🐯";
  if (formLower.includes("red-light mask")) return "😷";
  if (formLower.includes("red-light therapy")) return "🔴";
  if (formLower.includes("salt bath")) return "🧂";
  return "💪";
};

// Helper to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function RecoveryDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [updatingGoal, setUpdatingGoal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<RecoveryDashboardData | null>(null);
  const [recoveryZones, setRecoveryZones] = useState<RecoveryZone[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [goal, setGoal] = useState<number | string>(70);

  // Fetch dashboard data and recovery zones
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [dashboard, zones] = await Promise.all([
          getRecoveryDashboard(),
          getAllRecoveryZones()
        ]);
        setDashboardData(dashboard);
        setRecoveryZones(zones);
        
        // Set initial goal from API
        if (dashboard.progress.recoveryGoal > 0) {
          setGoal(dashboard.progress.recoveryGoal);
        } else if (dashboard.aiSuggestion.suggestedMin > 0) {
          setGoal(dashboard.aiSuggestion.suggestedMin);
        }
        setError(null);
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError(err.message || "Failed to load recovery dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const increase = () => {
    setGoal((prev) => Number(prev || 0) + 5);
  };

  const decrease = () => {
    setGoal((prev) => Math.max(Number(prev || 0) - 5, 0));
  };

  const handleSubmitGoal = async () => {
    const newGoal = Number(goal);
    if (isNaN(newGoal) || newGoal < 0) {
      setError("Please enter a valid goal amount");
      return;
    }

    setUpdatingGoal(true);
    setError(null);

    try {
      const response = await updateRecoveryGoal(newGoal);
      
      // Update local dashboard data with new goal
      if (dashboardData) {
        setDashboardData({
          ...dashboardData,
          progress: {
            ...dashboardData.progress,
            recoveryGoal: newGoal,
            recoveryRemaining: newGoal - (dashboardData.progress.recoveryTotal || 0),
          },
        });
      }
      
      setShowModal(false);
    } catch (err: any) {
      console.error("Error updating goal:", err);
      setError(err.message || "Failed to update recovery goal");
    } finally {
      setUpdatingGoal(false);
    }
  };

  // Get first 4 recovery zones for display
  const displayZones = recoveryZones.slice(0, 4);
  // Get first 3 recent records
  const recentRecordsToShow = dashboardData?.recentRecords?.slice(0, 3) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center bg-white p-6 rounded-2xl shadow max-w-md">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-purple-600 text-white px-6 py-2 rounded-xl"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const progress = dashboardData?.progress;
  const aiSuggestion = dashboardData?.aiSuggestion;

  // Calculate display values
  const completedPercentage = progress?.recoveryPercentage || 0;
  const remainingMinutes = progress?.recoveryRemaining || (typeof goal === 'number' ? goal : 0);
  const totalGoal = progress?.recoveryGoal || (typeof goal === 'number' ? goal : 70);
  
  // Calculate circle circumference for SVG
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completedPercentage / 100) * circumference;

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      {/* Header */}
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
  <div>
    <h1 className="text-xl font-semibold text-gray-800">
      Recovery Dashboard
    </h1>
    <p className="text-sm text-gray-500">
      Track your recovery progress and options
    </p>
  </div>

  <div className="flex items-center gap-3">
    <button
      onClick={() => window.location.reload()}
      className="p-2 rounded-full bg-white shadow hover:bg-gray-50 transition"
      title="Refresh"
    >
      <RefreshCw size={18} />
    </button>
    
    <button
      onClick={() => {router.push("/recovery/recovery-queue")}}
      className="p-2 rounded-full bg-blue-600 text-white shadow hover:bg-blue-700 transition"
      title="Edit"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="18" 
        height="18" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M17 3l4 4-7 7H10v-4l7-7z" />
        <path d="M4 20h16" />
      </svg>
    </button>
    
    <button
      onClick={() => {/* Add your calendar logic here */}}
      className="p-2 rounded-full bg-purple-600 text-white shadow hover:bg-purple-700 transition"
      title="Calendar"
    >
      <Calendar size={18} />
    </button>
  </div>
</div>

      {/* Error Banner */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT SIDE */}
        <div className="space-y-6">
          {/* AI Suggestion Card */}
          {aiSuggestion && (
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl p-5 shadow">
              <p className="text-sm opacity-90 mb-1">AI SUGGESTION</p>
              <p className="text-2xl font-bold">{aiSuggestion.suggestedMin} minutes</p>
              <p className="text-xs opacity-80 mt-2">
                Based on {aiSuggestion.workoutMin} workout minutes • Body: {aiSuggestion.bodyMultiplier}x • Strength: {aiSuggestion.strengthMultiplier}x
              </p>
            </div>
          )}

          {/* Progress Card */}
          <div className="bg-white rounded-2xl p-6 shadow">
            <div className="flex flex-col items-center">
              {/* Circular Progress using SVG */}
              <div className="relative w-36 h-36">
                <svg className="w-full h-full transform -rotate-90">
                  {/* Background circle */}
                  <circle
                    cx="72"
                    cy="72"
                    r={radius}
                    stroke="#e5e7eb"
                    strokeWidth="10"
                    fill="none"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="72"
                    cy="72"
                    r={radius}
                    stroke="#7c3aed"
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-500 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{Math.round(completedPercentage)}%</p>
                    <p className="text-xs text-gray-500">COMPLETED</p>
                  </div>
                </div>
              </div>

              {/* Display minutes left */}
              <p className="text-purple-600 text-2xl font-bold mt-4">
                {remainingMinutes}m Left
              </p>
              <p className="text-gray-500 text-sm">Total Recovery</p>

              <p className="text-xs text-green-600 text-center mt-3 max-w-xs">
                {aiSuggestion?.suggestedMin ? `AI suggests at least ${aiSuggestion.suggestedMin} minutes of recovery each week` : "*All programs need at least 30 minutes of recovery based on your Activity, Condition and Body Score"}
              </p>

              <button
                onClick={() => setShowModal(true)}
                className="text-blue-600 text-sm mt-3 hover:underline"
              >
                Change Recovery Goal →
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-6">
          {/* Recently Completed - Only show 3 */}
          <div className="bg-white rounded-2xl p-5 shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-gray-800">
                Recently Completed
              </h2>
              <button
                onClick={() => router.push("/recovery/recovery-session")}
                className="text-blue-600 text-sm hover:underline"
              >
                View All →
              </button>
            </div>

            {recentRecordsToShow.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                <div className="text-3xl">✦</div>
                <p className="text-sm mt-2">No recent recovery sessions</p>
                <button
                  onClick={() => router.push("/recovery/recovery-session")}
                  className="text-blue-600 text-sm mt-1 hover:underline"
                >
                  View All Activity →
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentRecordsToShow.map((record, idx) => {
                  const imageUrl = (record as any).images;
                  const recoveryTitle = (record as any).recovery_title || record.title;
                  const timeSpent = (record as any).time_spent || 0;
                  const recordDate = (record as any).date || (record as any).created_date;
                  
                  return (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      {/* Image */}
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
                        {imageUrl ? (
                          <img
                            src={getImageUrl(imageUrl)}
                            alt={recoveryTitle}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-xl">{getIconEmoji(recoveryTitle)}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Text */}
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">
                          {recoveryTitle}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(recordDate)}
                        </p>
                      </div>
                      
                      {/* Minutes */}
                      <div className="text-right">
                        <p className="text-sm font-semibold text-purple-600">{timeSpent} min</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recovery Options */}
          <div className="bg-white rounded-2xl p-5 shadow">
            <h2 className="font-semibold text-gray-800 mb-4">
              Recovery Options
            </h2>

            <div className="grid grid-cols-4 gap-3">
              {displayZones.map((zone) => {
                const icon = getIconEmoji(zone.form);
                return (
                  <button
                    key={zone.id}
                    onClick={() => router.push(`/recovery/selectedRecovery/${zone.form.toLowerCase().replace(/\s+/g, "-")}?id=${zone.id}`)}
                    className="group"
                  >
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-3 flex flex-col items-center gap-2 border border-gray-100 group-hover:border-purple-300 group-hover:shadow-md transition-all">
                      <div className="w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden">
                        {zone.image ? (
                          <img
                            src={getImageUrl(zone.image)}
                            alt={zone.form}
                            className="w-full h-full object-cover rounded-xl"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                              const parent = (e.target as HTMLImageElement).parentElement;
                              if (parent) {
                                const span = document.createElement("span");
                                span.className = "text-2xl";
                                span.textContent = icon;
                                parent.appendChild(span);
                              }
                            }}
                          />
                        ) : (
                          <span className="text-2xl">{icon}</span>
                        )}
                      </div>
                      <p className="text-[11px] font-semibold text-gray-700 text-center line-clamp-2">
                        {zone.form}
                      </p>
                      <p className="text-[9px] text-gray-400">{zone.time}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 text-center">
              <button
                onClick={() => router.push("/recovery/all-recovery-options")}
                className="text-blue-600 text-sm hover:underline"
              >
                View All Recovery Options →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ MODAL */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div className="bg-white w-full max-w-2xl rounded-2xl p-6 relative shadow-xl">
            {/* Close */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-black"
            >
              <X size={20} />
            </button>

            <p className="text-center text-xs text-gray-400 mb-1">
              You're adjusting:
            </p>
            <h2 className="text-center text-xl font-semibold mb-4">
              Recovery Goal
            </h2>

            <div className="bg-green-100 text-green-700 text-sm p-3 rounded-xl mb-6 text-center">
              {aiSuggestion?.suggestedMin
                ? `*AI suggests at least ${aiSuggestion.suggestedMin} minutes of recovery each week`
                : "*AI suggests at least 82 minutes of recovery each week"}
            </div>

            <div className="flex items-center justify-center gap-8 mb-6 flex-wrap">
              <div className="bg-gray-100 rounded-xl px-8 py-6 text-center">
                <p className="text-3xl font-bold text-gray-500">{totalGoal}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Current Goal (minutes)
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Stepper */}
                <div className="flex flex-col">
                  <button
                    onClick={increase}
                    className="p-1 bg-gray-200 rounded-t hover:bg-gray-300"
                  >
                    <ChevronUp size={16} />
                  </button>
                  <button
                    onClick={decrease}
                    className="p-1 bg-gray-200 rounded-b hover:bg-gray-300"
                  >
                    <ChevronDown size={16} />
                  </button>
                </div>

                {/* Input Box */}
                <div className="bg-gray-100 rounded-xl px-6 py-4 text-center">
                  <input
                    type="number"
                    value={goal}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "") {
                        setGoal("");
                        return;
                      }
                      const val = Number(value);
                      if (!isNaN(val) && val >= 0 && val <= 500) {
                        setGoal(val);
                      }
                    }}
                    className="w-20 text-center text-3xl font-bold bg-transparent outline-none"
                  />
                  <p className="text-xs text-purple-600 mt-2">
                    New Goal (minutes)
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleSubmitGoal}
              disabled={updatingGoal}
              className="w-full bg-gradient-to-r from-purple-700 to-purple-500 text-white py-3 rounded-xl shadow hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {updatingGoal ? <Loader2 size={20} className="animate-spin" /> : null}
              {updatingGoal ? "Updating..." : "Submit"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}