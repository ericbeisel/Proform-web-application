"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, Clock, Bell } from "lucide-react";

const MISSED = [
  { id: 1, name: "Cardio / Cardio #1", date: "Monday, Dec 28 at 7:00 AM" },
  { id: 2, name: "Cardio / Cardio #2", date: "Tuesday, Dec 29 at 7:00 AM" },
  { id: 3, name: "Cardio / Cardio #3", date: "Wednesday, Dec 30 at 7:00 AM" },
  { id: 4, name: "Cardio / Cardio #4", date: "Thursday, Dec 31 at 7:00 AM" },
  { id: 5, name: "Cardio / Cardio #5", date: "Friday, Jan 1 at 7:00 AM" },
  { id: 6, name: "Primary / SILVER-BACK", date: "Saturday, Jan 2 at 9:00 AM" },
];

export default function MissedActivity() {
  const router = useRouter();

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
        {/* Summary banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-red-50 border border-red-100 rounded-2xl px-5 py-4 mb-8">
          <div className="w-12 h-12 bg-red-400 rounded-full flex items-center justify-center flex-shrink-0">
            <Bell size={20} className="text-white" />
          </div>
          <div>
            <p className="text-base sm:text-[15px] font-bold text-gray-900">
              {MISSED.length} Missed Workouts
            </p>
            <p className="text-xs sm:text-[12px] text-gray-600 mt-1">
              Complete these workouts to stay on track with your fitness goals
            </p>
          </div>
        </div>

        {/* Grid of missed items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {MISSED.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              {/* Title row */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <span className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0 mt-1" />
                  <p className="text-base sm:text-[14px] font-bold text-gray-900 truncate">
                    {item.name}
                  </p>
                </div>
                <span className="bg-red-500 text-white text-[10px] sm:text-xs font-extrabold px-3 py-1 rounded-full tracking-wide flex-shrink-0 ml-2">
                  MISSED
                </span>
              </div>

              {/* Date */}
              <div className="flex items-center gap-2 mb-5 ml-5">
                <Clock size={14} className="text-gray-500 flex-shrink-0" />
                <span className="text-xs sm:text-[12px] text-gray-600 truncate">
                  {item.date}
                </span>
              </div>

              {/* CTA */}
              <button className="w-full bg-purple-700 hover:bg-purple-800 active:bg-purple-900 text-white text-sm sm:text-[13px] font-bold py-3 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
                Reschedule Workout
              </button>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p className="text-center text-xs sm:text-[12px] text-gray-500 mt-10">
          Missed workouts can be rescheduled or marked as complete from your itinerary
        </p>
      </main>
    </div>
  );
}