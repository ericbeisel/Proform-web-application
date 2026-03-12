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
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700 transition-colors">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-[22px] font-extrabold text-gray-900">Missed Activity</h1>
      </div>

      <div className="px-6 py-6 max-w-[1100px] mx-auto">

        {/* Summary banner */}
        <div className="flex items-center gap-4 bg-red-50 border border-red-100 rounded-2xl px-5 py-4 mb-8">
          <div className="w-11 h-11 bg-red-400 rounded-full flex items-center justify-center flex-shrink-0">
            <Bell size={18} className="text-white" />
          </div>
          <div>
            <p className="text-[15px] font-bold text-gray-900">{MISSED.length} Missed Workouts</p>
            <p className="text-[12px] text-gray-500 mt-0.5">Complete these workouts to stay on track with your fitness goals</p>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-4">
          {MISSED.map((item) => (
            <div key={item.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              {/* Title row */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-[14px] font-bold text-gray-900">{item.name}</p>
                </div>
                <span className="bg-red-500 text-white text-[10px] font-extrabold px-3 py-1 rounded-full tracking-wide flex-shrink-0">
                  MISSED
                </span>
              </div>

              {/* Date */}
              <div className="flex items-center gap-1.5 mb-4 ml-4">
                <Clock size={12} className="text-gray-400" />
                <span className="text-[12px] text-gray-500">{item.date}</span>
              </div>

              {/* CTA */}
              <button className="w-full bg-purple-700 hover:bg-purple-800 text-white text-[13px] font-bold py-2.5 rounded-xl transition-colors">
                Reschedule Workout
              </button>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p className="text-center text-[12px] text-gray-400 mt-8">
          Missed workouts can be rescheduled or marked as complete from your itinerary
        </p>
      </div>
    </div>
  );
}