// app/todays-focus-cardio/scheduled-cardio/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Flame,
  ArrowLeft,
  Calendar,
  Loader2,
  Plus,
  Trash2,
  Settings,
  List,
  Target,
  Clock,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getCardioActivities, deleteCardioActivity, CardioActivity } from "@/api/cardio/route";
import { useToast } from "@/components/ui/toast-provider";

export default function ScheduledCardioPage() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<CardioActivity[]>([]);
  const [deletingId, setDeletingId] = useState<number | null>(null);
const [selectedActivity, setSelectedActivity] = useState<CardioActivity | null>(null);
const [showPopup, setShowPopup] = useState(false);
  

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await getCardioActivities();
      console.log("Cardio activities response:", response);
      
      // Ensure we're setting the data correctly
      if (response && response.data && Array.isArray(response.data)) {
        setActivities(response.data);
      } else if (Array.isArray(response)) {
        setActivities(response);
      } else {
        setActivities([]);
      }
    } catch (error) {
      console.error("Error fetching cardio activities:", error);
      toast.error("Failed to load cardio schedule");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this activity?")) return;
    
    setDeletingId(id);
    try {
      await deleteCardioActivity(String(id));
      toast.success("Activity deleted successfully");
      fetchActivities();
    } catch (error) {
      console.error("Error deleting activity:", error);
      toast.error("Failed to delete activity");
    } finally {
      setDeletingId(null);
    }
  };

  const formatTime = (time: string) => {
    if (!time) return "";
    const [hour, minute] = time.split(":");
    const hourNum = parseInt(hour);
    const period = hourNum >= 12 ? "PM" : "AM";
    const displayHour = hourNum % 12 || 12;
    return `${displayHour}:${minute} ${period}`;
  };

  const handleCardClick = (activity: CardioActivity) => {
  setSelectedActivity(activity);
  setShowPopup(true);
};
  // Group activities by day
  const groupedActivities = activities.reduce((groups, activity) => {
    const day = activity.day;
    if (!groups[day]) {
      groups[day] = [];
    }
    groups[day].push(activity);
    return groups;
  }, {} as Record<string, CardioActivity[]>);

  // Order of days
  const dayOrder = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const sortedDays = Object.keys(groupedActivities).sort((a, b) => {
    const aIndex = dayOrder.indexOf(a);
    const bIndex = dayOrder.indexOf(b);
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    return a.localeCompare(b);
  });

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
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
            <Flame size={16} className="text-white" />
          </div>
          <h1 className="text-white font-bold text-lg">Scheduled Cardio</h1>
        </div>
        
        {/* Completion Badge */}
        <div className="px-2 py-0.5 bg-white/20 rounded-full">
          <span className="text-white text-xs font-medium">
            {activities.filter(a => a.completed_activity === true).length}/{activities.length} Cardio
          </span>
        </div>

        <div onClick={() => router.push("/todays-focus-cardio/manifest-cardio")} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center cursor-pointer">
          <List size={18} className="text-white" />
        </div>
        <div onClick={() => router.push("/itinerary")} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
          <Calendar size={18} className="text-white" />
        </div>
      </div>
    </div>

    {/* Right Side Buttons */}
    <div className="flex items-center gap-2">
      <button
        onClick={() => router.push("/todays-focus-cardio/cardio-edit-times")} 
        className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition"
      >
        <Settings size={18} className="text-white" />
      </button>

      <button
        onClick={() => router.push("/todays-focus-cardio/cardio-entry")}
        className="px-3 py-1.5 bg-white/20 rounded-lg text-white text-sm font-medium hover:bg-white/30 transition flex items-center gap-1"
      >
        <Plus size={14} />
        Add Activity
      </button>
    </div>
  </div>
</div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {/* Summary Card */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-5 shadow-sm border border-purple-100 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-semibold">Weekly Cardio Plan</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{activities.length} Activities</p>
              <p className="text-xs text-gray-500 mt-1">
                {activities.filter(a => a.completed_activity === true).length} completed • {activities.filter(a => !a.completed_activity).length} pending
              </p>
            </div>
            <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center">
              <Calendar size={24} className="text-purple-600" />
            </div>
          </div>
        </div>

        {/* Schedule List */}
        {sortedDays.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
            <Calendar size={48} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400">No scheduled cardio activities</p>
            <button
              onClick={() => router.push("/todays-focus-cardio/cardio-entry")}
              className="mt-4 text-purple-600 text-sm font-medium hover:underline"
            >
              Add your first activity →
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedDays.map((day) => (
              <div key={day} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Day Header */}
                <div className="bg-gray-50 px-5 py-3 border-b border-gray-100">
                  <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Calendar size={16} className="text-purple-500" />
                    {day}
                    <span className="text-xs text-gray-400 ml-2">
                      {groupedActivities[day].length} activity
                    </span>
                  </h2>
                </div>

                {/* Activities List */}
                <div className="divide-y divide-gray-100">
                  {groupedActivities[day].map((activity) => (
                   <div
  key={activity.id}
  onClick={() => handleCardClick(activity)}
  className={`p-4 hover:bg-gray-50 transition cursor-pointer ${
    activity.completed_activity === true ? "bg-green-50/30" : ""
  }`}
>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          {/* Name */}
                          <h3 className="font-medium text-gray-800">
                            {activity.name}
                          </h3>
                          
                          {/* By Day @ Time */}
                          <p className="text-sm text-gray-500 mt-1">
                            By {activity.day} @ {formatTime(activity.time)}
                          </p>
                        </div>

                        {/* Delete Button */}
                       
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
   {showPopup && selectedActivity && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
    onClick={(e) => e.target === e.currentTarget && setShowPopup(false)}
  >
    <div className="bg-white rounded-3xl max-w-sm w-full shadow-xl p-6 relative">
      
      {/* Delete Icon (top right like screenshot) */}
      <button className="absolute top-4 right-4 text-red-500">
        <Trash2 size={18} />
      </button>

      {/* Title */}
      <div className="text-center">
        <p className="text-green-500 font-semibold text-sm mb-1">
          Cardio Activity
        </p>

        <h2 className="text-xl font-bold text-gray-900">
          Complete by {selectedActivity.day}
        </h2>

        {/* small divider */}
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto my-3" />

        <p className="text-gray-700 font-medium text-base">
          {selectedActivity.type || "Cardio"}
        </p>

        <p className="text-gray-500 text-sm mt-1">
          Scheduled Time: {formatTime(selectedActivity.time)}
        </p>
      </div>

      {/* Buttons */}
      <div className="mt-6 space-y-3">
        {/* Log Results */}
       <button
  onClick={() => {
    setShowPopup(false);
    router.push(`/todays-focus-cardio/cardio-entry?id=${selectedActivity.id}`);
  }}
  className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-2xl font-semibold transition"
>
  Complete Activity
</button>

        {/* Cardio Schedule */}
        <button
          onClick={() => {
            setShowPopup(false);
            router.push("/todays-focus-cardio/cardio-schedule");
          }}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-2xl font-semibold transition"
        >
          Cardio Schedule
        </button>

        {/* Close */}
        <button
          onClick={() => setShowPopup(false)}
          className="w-full text-gray-400 py-2 font-medium"
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