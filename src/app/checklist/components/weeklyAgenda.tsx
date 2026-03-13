"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, Calendar } from "lucide-react";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const ACTIVITIES: Record<string, { name: string; type: string; typeCls: string }[]> = {
  Sunday:    [],
  Monday:    [{ name: "Cardio #1", type: "CARDIO",  typeCls: "bg-red-100 text-red-500" }],
  Tuesday:   [{ name: "Cardio #2", type: "CARDIO",  typeCls: "bg-red-100 text-red-500" }],
  Wednesday: [{ name: "Cardio #3", type: "CARDIO",  typeCls: "bg-red-100 text-red-500" }],
  Thursday:  [],
  Friday:    [{ name: "Cardio #5", type: "CARDIO",  typeCls: "bg-red-100 text-red-500" }],
  Saturday:  [{ name: "Cardio #6", type: "CARDIO",  typeCls: "bg-red-100 text-red-500" }],
};

const totalActivities = Object.values(ACTIVITIES).flat().length;
const completed = 0;
const progressPct = totalActivities > 0 ? Math.round((completed / totalActivities) * 100) : 0;

export default function WeeklyAgenda() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header – sticky for better scrolling experience */}
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

      <main className="
        px-4 sm:px-6 lg:px-8 xl:px-10
        py-6 sm:py-8 lg:py-10
        mx-auto w-full
        max-w-4xl md:max-w-5xl lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[90rem]
        space-y-5 sm:space-y-6 lg:space-y-8
      ">
        {/* Weekly Progress banner */}
        <div className="bg-white border border-gray-200 rounded-2xl px-5 sm:px-6 py-5 sm:py-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 mb-4">
            <div className="flex items-center gap-3 sm:gap-4">
             <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-700 rounded-xl flex items-center justify-center flex-shrink-0">
  <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
</div>
              <span className="text-base sm:text-lg font-semibold text-gray-800">
                Weekly Progress
              </span>
            </div>
            <span className="text-2xl sm:text-3xl font-bold text-purple-700">
              {progressPct}%
            </span>
          </div>

          <div className="w-full h-2 sm:h-2.5 bg-gray-100 rounded-full overflow-hidden mb-2 sm:mb-3">
            <div
              className="h-full bg-purple-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <p className="text-sm sm:text-base text-gray-600">
            {completed} of {totalActivities} activities completed this week
          </p>
        </div>

        {/* Day cards */}
        {DAYS.map((day) => {
          const acts = ACTIVITIES[day] || [];
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
                  <span className="text-sm sm:text-base font-medium text-green-600">
                    {acts.length} {acts.length === 1 ? "activity" : "activities"}
                  </span>
                ) : (
                  <span className="text-sm text-gray-500">No activities</span>
                )}
              </div>

              {/* Activities list or empty state */}
              {acts.length === 0 ? (
                <div className="px-5 sm:px-6 py-6 sm:py-8 text-center border-t border-gray-100">
                  <p className="text-base sm:text-lg text-gray-500 italic">
                    No activities scheduled for this day
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {acts.map((a, i) => (
                    <div
                      key={i}
                      className="flex flex-col sm:flex-row sm:items-center justify-between px-5 sm:px-6 py-4 sm:py-5 gap-3 sm:gap-4"
                    >
                      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                        <span className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-red-400 flex-shrink-0" />
                        <span className="text-base sm:text-lg font-medium text-gray-900 truncate">
                          {a.name}
                        </span>
                      </div>
                      <span
                        className={`text-xs sm:text-sm font-bold px-3 sm:px-4 py-1.5 rounded-full ${a.typeCls} whitespace-nowrap`}
                      >
                        {a.type}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Back to today */}
        <div className="pt-4 sm:pt-6">
          <button
            onClick={() => router.back()}
            className="w-full py-4 sm:py-5 text-center text-base sm:text-lg text-purple-600 hover:text-purple-700 font-semibold transition-colors hover:underline"
          >
            ← View Today Only
          </button>
        </div>
      </main>
    </div>
  );
}