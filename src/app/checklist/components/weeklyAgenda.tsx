"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Calendar, Clock, RefreshCw } from "lucide-react";
import { getCustomActivities, CustomActivity } from "@/api/itinerary/route";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const TYPE_STYLES: Record<string, string> = {
  workout:      "bg-blue-100 text-blue-600",
  cardio:       "bg-red-100 text-red-500",
  hydration:    "bg-sky-100 text-sky-600",
  recovery:     "bg-purple-100 text-purple-600",
  conditioning: "bg-orange-100 text-orange-600",
  supplemental: "bg-green-100 text-green-700",
  custom:       "bg-gray-100 text-gray-600",
};

const TYPE_DOT: Record<string, string> = {
  workout:      "bg-blue-500",
  cardio:       "bg-red-500",
  hydration:    "bg-sky-400",
  recovery:     "bg-purple-500",
  conditioning: "bg-orange-500",
  supplemental: "bg-green-500",
  custom:       "bg-gray-400",
};

function typeCls(type: string) {
  return TYPE_STYLES[type.toLowerCase()] ?? "bg-gray-100 text-gray-600";
}

function dotCls(type: string) {
  return TYPE_DOT[type.toLowerCase()] ?? "bg-gray-400";
}

export default function WeeklyAgenda() {
  const router = useRouter();
  const [activities, setActivities] = useState<CustomActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = () => {
    setLoading(true);
    setError(null);
    getCustomActivities()
      .then(setActivities)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Group by day_number (0=Sunday … 6=Saturday)
  const byDay: Record<number, CustomActivity[]> = {};
  for (const a of activities) {
    const d = a.day_number ?? 0;
    if (!byDay[d]) byDay[d] = [];
    byDay[d].push(a);
  }

  const totalActivities = activities.length;

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 px-4 sm:px-6 lg:px-8 py-4 max-w-7xl mx-auto">
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
      </header>

      <main className="px-4 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-8 mx-auto w-full max-w-4xl md:max-w-5xl lg:max-w-6xl xl:max-w-7xl space-y-5 sm:space-y-6">

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
            {/* Weekly Progress banner */}
            <div className="bg-white border border-gray-200 rounded-2xl px-5 sm:px-6 py-5 sm:py-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-700 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <span className="text-base sm:text-lg font-semibold text-gray-800">
                    Weekly Progress
                  </span>
                </div>
              </div>
              <p className="text-sm sm:text-base text-gray-600">
                {totalActivities} {totalActivities === 1 ? "activity" : "activities"} scheduled this week
              </p>
            </div>

            {/* Day cards */}
            {DAYS.map((day, dayIndex) => {
              const acts = byDay[dayIndex] || [];
              const hasActivities = acts.length > 0;

              return (
                <div
                  key={day}
                  className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Day header */}
                  <div className="flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 bg-gray-50/80">
                    <p className="text-lg sm:text-xl font-bold text-gray-900">{day}</p>
                    {hasActivities ? (
                      <span className="text-sm font-medium text-green-600">
                        {acts.length} {acts.length === 1 ? "activity" : "activities"}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">No activities</span>
                    )}
                  </div>

                  {acts.length === 0 ? (
                    <div className="px-5 sm:px-6 py-6 text-center border-t border-gray-100">
                      <p className="text-sm text-gray-400 italic">No activities scheduled</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {acts.map((a) => (
                        <div
                          key={a.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between px-5 sm:px-6 py-4 gap-2 sm:gap-4"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span className={`w-3 h-3 rounded-full flex-shrink-0 ${dotCls(a.type)}`} />
                            <span className="text-base font-medium text-gray-900 truncate">
                              {a.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 ml-6 sm:ml-0">
                            {a.time && (
                              <span className="flex items-center gap-1 text-xs text-gray-400">
                                <Clock size={11} />
                                {a.time}
                              </span>
                            )}
                            <span className={`text-xs font-bold px-3 py-1 rounded-full capitalize ${typeCls(a.type)}`}>
                              {a.type}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Back to today */}
            <div className="pt-4">
              <button
                onClick={() => router.back()}
                className="w-full py-4 text-center text-base text-purple-600 hover:text-purple-700 font-semibold transition-colors hover:underline"
              >
                ← View Today Only
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
