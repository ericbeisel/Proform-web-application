"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Plus, Check, Calendar, Loader2, 
  RefreshCw, Settings, Edit, Heart, 
  Activity, Battery, Moon, Droplet, Apple, Coffee, Clock,
  Brain, Zap,
  X,
  Trash2,
  CheckCircle
} from "lucide-react";
import { completeRecoveryCustomActivity, deleteRecoveryCustomActivity, getRecoveryCustomActivities, RecoveryCustomActivity } from "@/api/recovery/route";
import { useToast } from "@/components/ui/toast-provider";
interface RecoverySession {
  id: string | number;
  custom_activity_id?: number;
  name: string;           // From API: name
  title?: string;         // Fallback
  type: string;
  day: string;            // From API: day (e.g., "Monday")
  time: string;           // From API: time (e.g., "16:30:00")
  duration: number;
  intensity: string;
  completed: boolean;
  activityTime?: string;  // Fallback
  activityDay?: string;   // Fallback
  notes?: string;
  recoveryScore?: number;
  coverImage?: string;
  recurring?: string;     // From API: recurring (e.g., "Every Week")
  day_number?: number;    // From API: day_number
}

interface SelectedActivity {
  id: string | number;
  name: string;
  type: string;
  day: string;
  time: string;
  duration: number;
  intensity: string;
  completed: boolean;
  notes?: string;
  recoveryScore?: number;
}

export default function RecoveryDashboard() {
  const router = useRouter();
const toast = useToast();
  const [recoveryScore, setRecoveryScore] = useState(75);
  const [recoveryActivities, setRecoveryActivities] = useState<RecoveryCustomActivity[]>([]);
  const [sessions, setSessions] = useState<RecoverySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recoveryType, setRecoveryType] = useState("All");
  const [selectedActivity, setSelectedActivity] = useState<SelectedActivity | null>(null);
const [showModal, setShowModal] = useState(false);

  // Fetch recovery activities using getRecoveryCustomActivities API
  useEffect(() => {
    const fetchRecoveryActivities = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getRecoveryCustomActivities();
        const activitiesArray = Array.isArray(response) ? response : [];
        setRecoveryActivities(activitiesArray);
      } catch (err: any) {
        console.error("Error fetching recovery activities:", err);
        setError(err.message || "Failed to fetch recovery activities");
        setRecoveryActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecoveryActivities();
  }, []);

  // Filter and map activities based on selected type
// Filter and map activities based on selected type
useEffect(() => {
  let filtered = recoveryActivities;
  
  if (recoveryType !== "All") {
    filtered = recoveryActivities.filter(
      (activity) => activity.type === recoveryType
    );
  }
  
  const mappedSessions: RecoverySession[] = filtered.map((activity) => ({
    id: activity.id,
     custom_activity_id: activity.custom_activity_id || Number(activity.id),
    name: activity.name,                         // The actual name from API
    title: activity.title || activity.name,      // Fallback to name
    type: activity.type || "Recovery",
    day: activity.day,                           // "Monday", "Tuesday", etc.
    time: activity.time,                         // "16:30:00"
    duration: activity.duration || 0,
    intensity: activity.intensity || "Medium",
    completed: activity.completed || activity.completed_activity || false,
    activityTime: activity.activity_time || activity.time,
    activityDay: activity.activity_day || activity.day,
    notes: activity.notes,
    recoveryScore: activity.recovery_score,
    coverImage: activity.cover_image,
    recurring: activity.recurring,
    day_number: activity.day_number,
  }));

  setSessions(mappedSessions);
  
  // Calculate overall recovery score from completed activities
  const completedActivities = mappedSessions.filter(s => s.completed);
  if (completedActivities.length > 0) {
    const avgScore = completedActivities.reduce((sum, act) => sum + (act.recoveryScore || 0), 0) / completedActivities.length;
    setRecoveryScore(Math.round(avgScore));
  }
}, [recoveryActivities, recoveryType]);

  const completedSessions = sessions.filter((s) => s.completed).length;

const handleSessionClick = (session: RecoverySession) => {
  setSelectedActivity({
    id: session.id,
    name: session.name,
    type: session.type,
    day: session.day,
    time: session.time,
    duration: session.duration,
    intensity: session.intensity,
    completed: session.completed,
    notes: session.notes,
    recoveryScore: session.recoveryScore,
  });
  setShowModal(true);
};

const markCompleteFromModal = () => {
  if (selectedActivity) {
    // Close modal and redirect with activity data
    setShowModal(false);
    router.push(
      `/recovery/suggestedRecovery?id=${selectedActivity.id}&name=${encodeURIComponent(selectedActivity.name)}&type=${selectedActivity.type}&day=${selectedActivity.day}&time=${selectedActivity.time}`
    );
  }
};

const deleteActivity = async () => {
  if (selectedActivity) {
    try {
      // Call the delete API
      await deleteRecoveryCustomActivity(selectedActivity.id);
      
      // Update local state
      setSessions((prev) => prev.filter((s) => s.id !== selectedActivity.id));
      setRecoveryActivities((prev) => prev.filter((w) => w.id !== selectedActivity.id));
      
      toast.success("Activity deleted successfully!");
      setShowModal(false);
      setSelectedActivity(null);
    } catch (error) {
      console.error("Failed to delete activity:", error);
      toast.error("Failed to delete activity. Please try again.");
    }
  }
};


const completeActivity = (sessionId: string | number) => {
  setSessions((prev) =>
    prev.map((s) => (s.id === sessionId ? { ...s, completed: true } : s))
  );
  setRecoveryActivities((prev) =>
    prev.map((w) => (w.id === sessionId ? { ...w, completed: true, completed_activity: true } : w))
  );
};

  // Helper to format time (08:30:00 → 8:30 AM)
 // Helper to format time (16:30:00 → 4:30 PM)
const formatTime = (time: string | undefined): string => {
  if (!time) return "";
  const [hour, minute] = time.split(":").map(Number);
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minute.toString().padStart(2, "0")} ${period}`;
};

  // Helper to format date
  const formatDate = (date: string | undefined): string => {
    if (!date) return "";
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Helper to get icon based on recovery type
  const getRecoveryIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case "sleep":
        return <Moon size={16} />;
      case "nutrition":
        return <Apple size={16} />;
      case "hydration":
        return <Droplet size={16} />;
      case "meditation":
        return <Brain size={16} />;
      case "stretching":
        return <Heart size={16} />;
      case "massage":
        return <Coffee size={16} />;
      case "ice bath":
      case "cold plunge":
        return <Zap size={16} />;
      default:
        return <Activity size={16} />;
    }
  };

  // Helper to get gradient based on recovery type
  const getTypeGradient = (type: string) => {
    switch (type?.toLowerCase()) {
      case "sleep":
        return "from-indigo-500 to-purple-600";
      case "nutrition":
        return "from-orange-500 to-red-600";
      case "hydration":
        return "from-blue-500 to-cyan-600";
      case "meditation":
        return "from-purple-500 to-pink-600";
      case "stretching":
        return "from-green-500 to-emerald-600";
      case "massage":
        return "from-amber-500 to-yellow-600";
      case "ice bath":
      case "cold plunge":
        return "from-cyan-500 to-blue-600";
      default:
        return "from-teal-500 to-green-600";
    }
  };

  // Helper to get color based on recovery score
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-50 border-green-200 text-green-700";
    if (score >= 60) return "bg-yellow-50 border-yellow-200 text-yellow-700";
    return "bg-red-50 border-red-200 text-red-700";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f4f8] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-3" />
          <p className="text-gray-500">Loading recovery activities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f4f8] font-['DM_Sans',_sans-serif] text-[#1a1a2e]">
      {/* Top Bar */}
      <div className="bg-white px-4 sm:px-6 lg:px-7 py-3.5 sm:py-4 border-b border-[#e8e8f0] sticky top-0 z-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center font-extrabold text-base sm:text-lg text-white flex-shrink-0">
              R
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-green-600 m-0">
                Recovery Dashboard
              </h1>
              <p className="text-[10px] sm:text-xs text-[#999] m-0">
                {completedSessions}/{sessions.length} activities completed • Track your recovery progress
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-end">
         

            {/* Type Filter Dropdown */}
       

            {/* Settings Icon */}
            <div className="relative flex flex-col items-center group">
              <div 
                onClick={() => router.push("/recovery/field-workout-times-recovery")}
                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <Settings size={18} className="text-green-600" />
              </div>
            </div>

            {/* Refresh Icon */}
            <div className="relative flex flex-col items-center group">
              <div 
                onClick={() => window.location.reload()}
                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <RefreshCw size={18} className="text-green-600" />
              </div>
            </div>

            {/* Calendar Icon */}
            <div className="relative flex flex-col items-center group">
              <div 
                onClick={() => router.push("/itinerary/itinerary-page")} 
                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <Calendar size={18} className="text-green-600" />
              </div>
            </div>

      

            {/* Add Activity Button */}
            <button 
              onClick={() => router.push("/recovery/all-recovery-options")}
              className="bg-gradient-to-r from-green-500 to-emerald-600 border-none rounded-lg text-white p-1.5 sm:p-2 cursor-pointer flex items-center justify-center shadow-sm hover:opacity-90 transition-all"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="max-w-6xl mx-auto px-4 mt-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* No Activities Message */}
      {!error && sessions.length === 0 && (
        <div className="max-w-6xl mx-auto px-4 mt-12">
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
                <Heart size={32} className="text-green-600" />
              </div>
            </div>
            
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              No recovery activities scheduled
            </h3>
            
            <p className="text-sm text-gray-500 mb-6">
              Add recovery activities to help your body recover and perform better
            </p>
            
            <button
              onClick={() => router.push("/recovery/all-recovery-options")}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 mx-auto shadow-sm"
            >
              <Plus size={16} />
              Add Recovery Activity
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      {sessions.length > 0 && (
        <div className="p-4 sm:p-5 lg:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 px-1">
            <div>
              <p className="text-sm text-gray-500 mt-1">
                <span className="font-semibold text-green-600">{sessions.length}</span> total recovery activities on your schedule
              </p>
            </div>
    
          </div>

          {/* Responsive Grid */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {sessions.map((session) => (
    <div
      key={session.id}
      onClick={() => !session.completed && handleSessionClick(session)}
      className={`relative rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
        session.completed ? "opacity-75 cursor-default" : "cursor-pointer"
      } bg-gradient-to-br ${getTypeGradient(session.type)}`}
      style={{ minHeight: "160px" }}
    >
      {/* Completed Overlay Badge */}
      {session.completed && (
        <div className="absolute top-2 right-2 z-10">
          <div className="bg-green-500 text-white px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-lg">
            <CheckCircle size={12} />
            Completed
          </div>
        </div>
      )}
      
      <div className="relative p-3 sm:p-4 flex flex-col h-full min-h-[160px]">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/20 backdrop-blur-sm text-white text-xs font-medium">
            {getRecoveryIcon(session.type)}
            <span>{session.type || "Recovery"}</span>
          </div>
          {session.recoveryScore && !session.completed && (
            <div className={`px-2 py-0.5 rounded-lg ${getScoreBgColor(session.recoveryScore)} border text-xs font-semibold`}>
              Score: {session.recoveryScore}
            </div>
          )}
        </div>
        
        <div className="flex-1 mt-2">
          <p className="text-xs mb-0.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block"></span>
            <span className="text-white/80 text-xs">
              {session.day} {formatTime(session.time)}
            </span>
          </p>
          <p className={`font-bold text-sm sm:text-base m-0 mb-0.5 line-clamp-2 ${
            session.completed ? "text-white/70" : "text-white"
          }`}>
            {session.name}
          </p>
          {session.notes && !session.completed && (
            <p className="text-xs text-white/60 mt-0.5 line-clamp-1 italic">
              "{session.notes.substring(0, 40)}"
            </p>
          )}
          {session.duration > 0 && !session.completed && (
            <p className="text-xs text-white/70 flex items-center gap-1 mt-1">
              <Clock size={10} />
              {session.duration} min • {session.intensity}
            </p>
          )}
        </div>
      </div>
    </div>
  ))}
</div>

{showModal && selectedActivity && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
    <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
      {/* Header */}
      <div className="flex justify-between items-center p-5 border-b">
        <h2 className="text-xl font-bold text-gray-800">Recovery Activity</h2>
        <button 
          onClick={() => setShowModal(false)}
          className="p-1 hover:bg-gray-100 rounded-full transition"
        >
          <X size={20} className="text-gray-500" />
        </button>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title */}
        <div className="text-center mb-4">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Activity</p>
          <p className="text-xl font-bold text-gray-800">{selectedActivity.name}</p>
        </div>

        {/* Type Badge */}
        <div className="flex justify-center mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 text-purple-600 text-xs font-medium">
            {getRecoveryIcon(selectedActivity.type)}
            <span className="capitalize">{selectedActivity.type}</span>
          </div>
        </div>

        {/* Day & Time */}
        <div className="bg-gray-50 rounded-xl p-3 text-center mb-4">
          <p className="text-xs text-gray-400 mb-1">Complete by</p>
          <p className="text-base font-semibold text-gray-800">
            {selectedActivity.day} Time: {formatTime(selectedActivity.time)}
          </p>
        </div>
      
        {/* Recovery Score */}
        {selectedActivity.recoveryScore && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-3 text-center border border-green-200 mb-4">
            <p className="text-xs text-gray-400 mb-1">Recovery Score</p>
            <p className={`text-2xl font-bold ${getScoreColor(selectedActivity.recoveryScore)}`}>
              {selectedActivity.recoveryScore}
            </p>
          </div>
        )}

        {/* Notes */}
        {selectedActivity.notes && (
          <div className="bg-gray-50 rounded-xl p-3 text-center mb-4">
            <p className="text-xs text-gray-400 mb-1">Notes</p>
            <p className="text-sm text-gray-600 italic">
              "{selectedActivity.notes}"
            </p>
          </div>
        )}

        {/* Action Buttons - Stacked vertically */}
        <div className="flex flex-col gap-3 pt-2">
        <button
  onClick={markCompleteFromModal}
  className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2"
>
  <Check size={18} />
  Complete Activity
</button>
          
          <button
            onClick={() => router.push(`/recovery/field-workout-times-recovery?edit=${selectedActivity.id}`)}
            className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2"
          >
            <Calendar size={18} />
            Recovery Schedule
          </button>
          
          <button
            onClick={deleteActivity}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2"
          >
            <Trash2 size={18} />
            Delete Activity
          </button>
        </div>
      </div>
    </div>
  </div>
)}
        </div>
      )}
    </div>
  );
}