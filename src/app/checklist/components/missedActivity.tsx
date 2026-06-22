"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Clock, Bell, RefreshCw } from "lucide-react";
import { getMissedActivities, MissedActivity as MissedActivityItem } from "@/api/itinerary/route";

export default function MissedActivity() {
  const router = useRouter();
  const [missed, setMissed] = useState<MissedActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = () => {
    setLoading(true);
    setError(null);
    getMissedActivities()
      .then(setMissed)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const getName = (item: MissedActivityItem) => item.name || "Untitled";

  const getDate = (item: MissedActivityItem) => {
    const dayLabel = DAY_NAMES[item.day] ?? `Day ${item.day}`;
    const time = item.time && item.time !== "00:00" ? ` at ${item.time}` : "";
    return `${dayLabel}${time}`;
  };

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <header className="flex items-center gap-3 px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 bg-white sticky top-0 z-10">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Go back"
        >
          <ChevronLeft size={24} className="text-gray-600" />
        </button>
        <h1 className="text-xl sm:text-[22px] font-extrabold text-gray-900">
          Missed Activity
        </h1>
      </header>

      <main className="px-4 sm:px-6 py-6 max-w-[1100px] mx-auto">

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <RefreshCw size={28} className="text-purple-400 animate-spin" />
            <p className="text-sm text-gray-500">Loading missed activities...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <p className="text-sm font-semibold text-gray-700">Failed to load</p>
            <p className="text-xs text-gray-500 text-center">{error}</p>
            <button
              onClick={fetchData}
              className="mt-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && missed.length === 0 && (
          <p className="text-center text-sm text-gray-500 py-20">
            No missed activities. Keep it up!
          </p>
        )}

        {/* Content */}
        {!loading && !error && missed.length > 0 && (
          <>
            {/* Summary banner */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-red-50 border border-red-100 rounded-2xl px-5 py-4 mb-8">
              <div className="w-12 h-12 bg-red-400 rounded-full flex items-center justify-center flex-shrink-0">
                <Bell size={20} className="text-white" />
              </div>
              <div>
                <p className="text-base sm:text-[15px] font-bold text-gray-900">
                  {missed.length} Missed {missed.length === 1 ? "Workout" : "Workouts"}
                </p>
                <p className="text-xs sm:text-[12px] text-gray-600 mt-1">
                  Complete these workouts to stay on track with your fitness goals
                </p>
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {missed.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0 mt-1"
                        style={{ backgroundColor: item.colour || "#FF0000" }}
                      />
                      <p className="text-base sm:text-[14px] font-bold text-gray-900 truncate">
                        {getName(item)}
                      </p>
                    </div>
                    <span className="bg-purple-600 text-white text-[10px] sm:text-xs font-extrabold px-3 py-1 rounded-full tracking-wide flex-shrink-0 ml-2 capitalize">
                      {item.type || "MISSED"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-5 ml-5">
                    <Clock size={14} className="text-gray-500 flex-shrink-0" />
                    <span className="text-xs sm:text-[12px] text-gray-600 truncate">
                      {getDate(item)}
                    </span>
                  </div>

                  <button className="w-full bg-purple-700 hover:bg-purple-800 active:bg-purple-900 text-white text-sm sm:text-[13px] font-bold py-3 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 capitalize">
                    Reschedule {item.type || "Workout"}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        <p className="text-center text-xs sm:text-[12px] text-gray-500 mt-10">
          Missed workouts can be rescheduled or marked as complete from your itinerary
        </p>
      </main>
    </div>
  );
}
