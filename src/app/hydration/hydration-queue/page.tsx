// src/app/hydration/hydration-queue/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Settings, Plus, Check, Calendar, Trash2, Loader2, X } from "lucide-react";
import { getCustomActivities, deleteCustomActivity, CustomActivity } from "@/api/hydration/route";

// Helper to format time (08:30:00 → 8:30 AM)
const formatTime = (time: string | undefined): string => {
  if (!time) return "";
  const [hour, minute] = time.split(":").map(Number);
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minute.toString().padStart(2, "0")} ${period}`;
};

// Helper to format date and time from ISO string
const formatCompletionDate = (dateString: string | boolean): string => {
  if (!dateString || typeof dateString === 'boolean') return "";
  const date = new Date(dateString);
  const day = date.toLocaleDateString('en-US', { weekday: 'long' });
  const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  return `Completed ${time} on ${day}`;
};

export default function HydrationQueuePage() {
  const router = useRouter();
  const [customActivities, setCustomActivities] = useState<CustomActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Modal states
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<CustomActivity | null>(null);

  // Fetch custom activities
  useEffect(() => {
    const fetchCustomActivities = async () => {
      try {
        setLoading(true);
        const activities = await getCustomActivities();
        console.log("Custom activities response:", activities);
        setCustomActivities(Array.isArray(activities) ? activities : []);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching custom activities:", err);
        setError(err.message || "Failed to load hydration activities");
        setCustomActivities([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCustomActivities();
  }, []);

  const handleDelete = async (activityId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingId(activityId);
    try {
      await deleteCustomActivity(activityId);
      setCustomActivities(prev => prev.filter(activity => activity.id !== activityId));
    } catch (err: any) {
      console.error("Error deleting activity:", err);
      setError(err.message || "Failed to delete hydration activity");
    } finally {
      setDeletingId(null);
    }
  };

  // Handle card click - open completion modal
  const handleActivityClick = (activity: CustomActivity) => {
    setSelectedActivity(activity);
    setShowCompleteModal(true);
  };

  // Handle complete - redirect to submit hydration page with activity data
  const handleCompleteActivity = () => {
    if (!selectedActivity) return;
    
    // Close modal and redirect to submit hydration page with activity data
    setShowCompleteModal(false);
    router.push(`/hydration/submitHydration?id=${selectedActivity.id}&day=${selectedActivity.day}&time=${selectedActivity.time}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f4f8] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-3" />
          <p className="text-gray-500">Loading hydration activities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f4f8] font-['DM_Sans',_sans-serif] text-[#1a1a2e]">
      
      {/* Top Bar */}
      <div className="bg-white px-4 sm:px-6 lg:px-7 py-3.5 sm:py-4 flex items-center justify-between border-b border-[#e8e8f0] sticky top-0 z-10">
        <div className="flex items-center gap-2 sm:gap-3.5">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={20} className="text-[#7c3aed]" />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-[#7c3aed] m-0">Hydration Queue</h1>
            <p className="text-[10px] sm:text-xs text-[#999] m-0">
              {customActivities.filter(a => a.completed_activity).length}/{customActivities.length} completed • Track your hydration
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="relative flex flex-col items-center group">
            <div 
              onClick={() => router.push("/itinerary/itinerary-page")} 
              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            >
              <Calendar size={18} className="text-[#7c3aed]" />
            </div>
          </div>

          <button 
            onClick={() => router.push("/hydration/fieldWorkoutTimes")}
            className="bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] border-none rounded-lg text-white p-1.5 sm:p-2 cursor-pointer flex items-center justify-center shadow-sm hover:opacity-90 transition-all"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-6xl mx-auto px-4 mt-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* No Activities Message */}
      {!error && customActivities.length === 0 && (
        <div className="max-w-6xl mx-auto px-4 mt-12">
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
            <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">💧</span>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">No hydration activities</h3>
            <p className="text-sm text-gray-500 mb-6">Add your first hydration activity to track your intake</p>
            <button
              onClick={() => router.push("/hydration/fieldWorkoutTimes")}
              className="bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] hover:opacity-90 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 mx-auto shadow-sm"
            >
              <Plus size={16} />
              Add Hydration
            </button>
          </div>
        </div>
      )}

      {/* Hydration Cards Grid */}
      {customActivities.length > 0 && (
        <div className="p-4 sm:p-5 lg:p-7">
          <div className="flex items-center justify-between mb-4 px-1">
            <div>
              <h2 className="font-bold text-base text-[#1a1a2e]">Hydration Activities</h2>
              <p className="text-sm text-gray-500 mt-1">
                <span className="font-semibold text-[#7c3aed]">{customActivities.length}</span> total hydration(s) scheduled
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customActivities.map((activity, index) => (
              <div
                key={activity.id}
                onClick={() => handleActivityClick(activity)}
                className={`relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
                  activity.completed_activity ? "opacity-85" : ""
                }`}
                style={{
                  background: "linear-gradient(135deg, #1e3a5f, #0f2b45)",
                  minHeight: "200px",
                }}
              >
                <div className="relative p-5 sm:p-6 flex flex-col h-full min-h-[200px]">
                  {/* Top Row */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className="px-2 py-1 rounded-lg bg-purple-600/80 backdrop-blur-sm text-white text-xs font-medium">
                        {index + 1}/{customActivities.length}
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDelete(activity.id, e)}
                      disabled={deletingId === activity.id}
                      className="p-1.5 rounded-lg bg-red-500/80 backdrop-blur-sm text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                      {deletingId === activity.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  </div>
                  
                  {/* Middle Content */}
                  <div className="flex-1 mt-3">
                    <p className="font-bold text-lg sm:text-xl text-white m-0">
                      Hydration
                    </p>
                    
                    <p className="text-sm text-blue-400 mt-1 flex items-center gap-1">
                      <span>By {activity.day} @ {formatTime(activity.time)}</span>
                    </p>
                  </div>
                  
                  {/* Bottom Row - Completion Status */}
                  <div className="mt-3">
                    {activity.completed_activity ? (
                      <div className="bg-green-500/20 backdrop-blur-sm rounded-lg p-2 border border-green-400/30">
                        <p className="text-green-400 text-xs font-medium flex items-center gap-1">
                          <Check size={12} />
                          {typeof activity.completed_activity === 'string' 
                            ? formatCompletionDate(activity.completed_activity)
                            : "Completed"}
                        </p>
                      </div>
                    ) : (
                      <div className="px-3 py-1.5 rounded-lg bg-yellow-500/80 backdrop-blur-sm text-white text-xs font-medium inline-block">
                        Tap to complete
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Complete Activity Modal */}
      {showCompleteModal && selectedActivity && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000] p-4 animate-fadeIn"
          onClick={(e) => e.target === e.currentTarget && setShowCompleteModal(false)}
        >
          <div className="w-full max-w-md bg-white rounded-3xl relative shadow-2xl animate-slideUp overflow-hidden">
            <button
              onClick={() => setShowCompleteModal(false)}
              className="absolute right-5 top-5 p-1.5 hover:bg-gray-100 rounded-full transition-all z-20"
            >
              <X size={20} className="text-gray-500" />
            </button>

            <div className="p-6 pt-10 pb-8">
              {/* Icon */}
              <div className="text-center mb-4">
                <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                  <span className="text-4xl">💧</span>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
                Hydration
              </h2>

              {/* Completed by - comes from activity.day */}
              <p className="text-center text-gray-500 text-sm mb-6">
                Completed by {selectedActivity.day}
              </p>

              {/* Hydration details - comes from backend */}
              <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Hydration #1</p>
                    <p className="text-lg font-semibold text-gray-800">
                      Time: {formatTime(selectedActivity.time)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
                    <span className="text-xl">💧</span>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleCompleteActivity}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3.5 rounded-xl font-semibold transition-all shadow-md"
                >
                  <Check size={20} className="inline mr-2" />
                  Complete Activity
                </button>
                
                <button
                  onClick={() => {
                    setShowCompleteModal(false);
                    router.push("/hydration/hydration-queue");
                  }}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3.5 rounded-xl font-semibold transition-all shadow-md"
                >
                  Hydration Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}