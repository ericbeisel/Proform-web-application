"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Clock, Check, Plus, RefreshCw, AlertCircle, ListChecks } from "lucide-react";
import { getWeeklyActivities, MissedActivity } from "@/api/itinerary/route";
import AddActivityModal from "./addActivityModal";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const TYPE_COLORS: Record<string, string> = {
  workout: "#3B82F6",
  supplemental: "#10B981",
  conditioning: "#F59E0B",
  cardio: "#EF4444",
  recovery: "#8B5CF6",
  hydration: "#06B6D4",
  customactivity: "#1A1A2E",
};

// Only these types have a real completion action to link out to — everything
// else (workout/supplemental/conditioning/custom) is tracked from the
// itinerary or checklist directly and gets no button here.
const ACTION_ROUTES: Record<string, string> = {
  hydration: "/hydration/hydrationDashboard",
  recovery: "/recovery/recovery-dashboard",
  cardio: "/todays-focus-cardio/cardio-entry",
};

function formatTime12(time24: string): string {
  if (!time24) return time24;
  const parts = time24.split(":");
  if (parts.length < 2) return time24;
  let h = parseInt(parts[0], 10);
  const m = parts[1];
  const ampm = h >= 12 ? "pm" : "am";
  h = h % 12;
  h = h ? h : 12;
  return `${h}:${m} ${ampm}`;
}

export default function WeeklyAgenda() {
  const router = useRouter();
  const [allActivity, setAllActivity] = useState<Record<number, MissedActivity[]>>({});
  const [missedCount, setMissedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const fetchData = () => {
    setLoading(true);
    setError(null);
    getWeeklyActivities()
      .then(({ AllActivity, missedActivity }) => {
        setAllActivity(AllActivity);
        setMissedCount(missedActivity.length);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  let totalCount = 0;
  let completedCount = 0;
  Object.values(allActivity).forEach((dayList) => {
    dayList.forEach((item) => {
      totalCount++;
      if (item.colour === "#808080" || item.completed === true) completedCount++;
    });
  });
  const completionPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const todayName = DAYS[new Date().getDay()];

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm">
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Go back"
            >
              <ChevronLeft size={24} className="text-gray-600" />
            </button>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900">
              Weekly Agenda
            </h1>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => router.push("/itinerary/itinerary-page")}
              className="flex items-center gap-1.5 border border-purple-200 bg-purple-50 text-purple-700 text-[11px] font-semibold px-3 py-1.5 rounded-full hover:bg-purple-100 transition-colors"
            >
              <ListChecks size={13} />
              Itinerary
            </button>
            {missedCount > 0 && (
              <button
                onClick={() => router.push("/checklist/missed-activity")}
                className="flex items-center gap-1 border border-red-200 bg-red-50 text-red-500 text-[11px] font-semibold px-2.5 py-1.5 rounded-full"
              >
                <AlertCircle size={12} />
                {missedCount} Missed
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-8 mx-auto w-full max-w-4xl md:max-w-5xl lg:max-w-6xl xl:max-w-7xl space-y-5 sm:space-y-6 pb-28">

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <RefreshCw size={28} className="text-purple-400 animate-spin" />
            <p className="text-sm text-gray-500">Loading weekly agenda...</p>
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

        {!loading && !error && (
          <>
            {/* Weekly Completion card */}
            <div className="bg-white border border-gray-200 rounded-2xl px-5 sm:px-6 py-5 sm:py-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-base sm:text-lg font-semibold text-gray-800">
                  Weekly Completion
                </span>
                <span className="text-2xl font-extrabold text-gray-900">{completionPct}%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-600 rounded-full transition-all duration-500"
                  style={{ width: `${completionPct}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {completedCount} of {totalCount} completed
              </p>
            </div>

            {/* Empty state */}
            {totalCount === 0 && (
              <div className="py-16 text-center text-gray-400 text-sm">
                No activities scheduled for this week.
              </div>
            )}

            {/* Day sections */}
            {DAYS.map((day, dayIdx) => {
              const dayActivities = allActivity[dayIdx] || [];
              if (dayActivities.length === 0) return null;

              const sorted = [...dayActivities].sort((a, b) =>
                (a.time || "").localeCompare(b.time || "")
              );

              return (
                <div
                  key={day}
                  className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm"
                >
                  <div className="flex items-center gap-3 px-5 sm:px-6 py-4 bg-gray-50/80">
                    <p className="text-lg sm:text-xl font-bold text-gray-900">{day}</p>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>

                  <div className="divide-y divide-gray-100">
                    {sorted.map((activity) => {
                      const isCompleted = activity.colour === "#808080" || activity.completed === true;
                      const typeKey = (activity.type || "").toLowerCase();
                      const displayTitle = typeKey === "customactivity"
                        ? activity.name
                        : `${activity.type.charAt(0).toUpperCase()}${activity.type.slice(1)}: ${activity.name}`;
                      const displayTime = activity.time
                        ? `Before ${day} @ ${formatTime12(activity.time)}`
                        : `Before ${day}`;
                      const activityColor = isCompleted
                        ? "#9CA3AF"
                        : TYPE_COLORS[typeKey] || activity.colour || "#6B7280";
                      const actionRoute = ACTION_ROUTES[typeKey];

                      return (
                        <div
                          key={activity.id}
                          className="flex items-center justify-between gap-4 px-5 sm:px-6 py-4"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2.5">
                              {isCompleted ? (
                                <span className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                  <Check size={10} className="text-gray-400" strokeWidth={3} />
                                </span>
                              ) : (
                                <span
                                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: activityColor }}
                                />
                              )}
                              <p className={`text-[14px] font-bold truncate ${isCompleted ? "text-gray-400 line-through" : "text-gray-900"}`}>
                                {displayTitle}
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5 mt-1.5 ml-5">
                              <Clock size={12} className="text-gray-400 flex-shrink-0" />
                              <span className={`text-xs ${isCompleted ? "text-gray-400" : "text-gray-500"}`}>
                                {displayTime}
                              </span>
                            </div>
                            {activity.teamId && (
                              <p className="text-[11px] text-purple-500 font-medium mt-1 ml-5">
                                Synced with Team
                              </p>
                            )}
                            {isCompleted && activity.completed_activity && (
                              <p className="text-[11px] text-gray-400 mt-1 ml-5">
                                Completed: {new Date(activity.completed_activity).toLocaleString([], {
                                  month: "numeric",
                                  day: "numeric",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                })}
                              </p>
                            )}
                          </div>

                          {actionRoute && (
                            <button
                              disabled={isCompleted}
                              onClick={() => router.push(actionRoute)}
                              className="flex-shrink-0 text-white text-xs font-bold px-4 py-2 rounded-xl transition-opacity disabled:opacity-40 disabled:text-gray-400"
                              style={{ backgroundColor: isCompleted ? "#F3F4F6" : activityColor, color: isCompleted ? "#9CA3AF" : "white" }}
                            >
                              {isCompleted ? "Done" : "Complete"}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* Footer actions */}
        {!loading && !error && (
          <div className="space-y-3 pt-2">
            <button
              onClick={() => setShowAdd(true)}
              className="w-full flex items-center justify-center gap-2 bg-purple-700 hover:bg-purple-800 text-white font-bold py-4 rounded-2xl transition-colors text-sm"
            >
              <Plus size={18} />
              Add Custom Activity
            </button>
            <button
              onClick={() => router.push("/checklist")}
              className="w-full py-3 text-center text-sm text-gray-600 hover:text-gray-800 font-semibold transition-colors"
            >
              View Today Only
            </button>
          </div>
        )}
      </main>

      {showAdd && (
        <AddActivityModal
          onClose={() => setShowAdd(false)}
          onAdded={() => { setShowAdd(false); fetchData(); }}
          day={todayName}
        />
      )}
    </div>
  );
}
