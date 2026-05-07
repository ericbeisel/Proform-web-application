"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, X, Circle, CheckCircle2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { getCustomActivities, completeCustomActivity, CustomActivity } from "@/api/hydration/route";

export default function HydrationCompletion() {
  const router = useRouter();
  
const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [customActivities, setCustomActivities] = useState<CustomActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch custom hydration activities
  useEffect(() => {
    const fetchCustomActivities = async () => {
      try {
        setLoading(true);
        const activities = await getCustomActivities();
        setCustomActivities(activities);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching custom activities:", err);
        setError(err.message || "Failed to load hydration activities");
      } finally {
        setLoading(false);
      }
    };
    
    fetchCustomActivities();
  }, []);

const handleCompleteActivity = async (activityId: number) => {
      setSubmitting(true);
    try {
      await completeCustomActivity(activityId);
      localStorage.setItem('showItineraryMessage', 'true');
      router.push('/hydration/hydrationDashboard');
    } catch (err: any) {
      console.error("Error completing activity:", err);
      setError(err.message || "Failed to complete hydration activity");
      setSubmitting(false);
    }
  };

  const handleSaveRecovery = () => {
if (selectedOption !== null) {
        handleCompleteActivity(selectedOption);
    }
  };

  const handleCreateNew = () => {
    localStorage.setItem('showItineraryMessage', 'true');
    router.push('/hydration/hydrationDashboard');
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#f0f4f8] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#f0f4f8] flex flex-col">
      
      {/* HEADER */}
      <div className="w-full bg-purple-600 px-6 sm:px-8 py-4 sm:py-5 flex-shrink-0">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 border-none rounded-lg flex items-center justify-center cursor-pointer hover:bg-white/30 transition-all"
            >
              <ArrowLeft size={18} color="white" />
            </button>
            <div>
              <div className="text-white font-extrabold text-lg sm:text-xl leading-tight">Hydration Completion</div>
              <div className="text-white/80 text-xs sm:text-sm mt-0.5">Save your completed session</div>
            </div>
          </div>
          <button
            onClick={() => router.back()}
            className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 border-none rounded-lg flex items-center justify-center cursor-pointer hover:bg-white/30 transition-all"
          >
            <X size={18} color="white" />
          </button>
        </div>
      </div>

      {/* ERROR BANNER */}
      {error && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-slideDown">
          <div className="bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3">
            <X size={20} />
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* BODY */}
      <div className="flex-1 flex items-start justify-center p-4 sm:p-8">
        <div className="w-full max-w-xl bg-white rounded-[2.5rem] shadow-sm p-8 sm:p-12 flex flex-col items-center">
          
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-700 text-center mb-4">
            Hydration Completion
          </h2>
          
          <p className="text-gray-500 text-center text-sm sm:text-base leading-relaxed mb-10 max-w-md">
            Choose how you want to save your completed Hydration Session on your itinerary page
          </p>

          {/* TOP CHOICE BOX */}
          <div className="w-full bg-[#f8fafc] rounded-3xl p-6 sm:p-8 border border-gray-50 flex flex-col items-center mb-8">
            <p className="text-gray-500 text-xs sm:text-sm text-center mb-6">
              Get credit towards one of your scheduled hydration sessions<br/>(Choose One):
            </p>

            <div className="w-full max-w-xs space-y-4 mb-8">
              {customActivities.length === 0 ? (
                <p className="text-center text-gray-400 text-sm">No scheduled hydration sessions found</p>
              ) : (
                customActivities.map((activity) => (
                  <div 
                    key={activity.id}
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => setSelectedOption(activity.id)}
                  >
                    {selectedOption === activity.id ? (
                      <CheckCircle2 className="text-[#00b4d8] fill-[#00b4d8] bg-white rounded-full" size={24} />
                    ) : (
                      <Circle className="text-gray-300" size={24} />
                    )}
                    <span className={`font-bold text-sm sm:text-base ${selectedOption === activity.id ? "text-gray-800" : "text-gray-500"}`}>
                      {activity.name} - {activity.time}
                    </span>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={handleSaveRecovery}
              disabled={!selectedOption || submitting}
              className={`w-full max-w-sm py-4 rounded-2xl font-bold text-white transition-all shadow-lg ${
                !selectedOption || submitting ? "bg-gray-300 cursor-not-allowed" : "bg-[#4a5568] hover:bg-[#3d4654] active:scale-[0.98]"
              }`}
            >
              {submitting ? <Loader2 size={20} className="animate-spin mx-auto" /> : "Save Recovery"}
            </button>
          </div>

          {/* OR DIVIDER */}
          <div className="w-full flex items-center justify-center gap-4 mb-8">
            <div className="h-[1px] flex-1 bg-gray-100"></div>
            <span className="font-black text-gray-800 text-sm italic uppercase tracking-widest">or</span>
            <div className="h-[1px] flex-1 bg-gray-100"></div>
          </div>

          {/* BOTTOM CHOICE */}
          <div className="w-full flex flex-col items-center">
            <p className="text-gray-500 text-xs sm:text-sm text-center mb-6 max-w-xs">
              Save as a new hydration session, which will not affect your Hydration Completion this week:
            </p>

            <button
              onClick={handleCreateNew}
              className="w-full max-w-xs bg-gradient-to-r from-[#6e22e5] to-[#9d50ff] text-white py-4 rounded-2xl font-bold shadow-xl hover:shadow-purple-200 transition-all active:scale-[0.98]"
            >
              Create a New One
            </button>
          </div>

        </div>
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px) translateX(-50%);
          }
          to {
            opacity: 1;
            transform: translateY(0) translateX(-50%);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}