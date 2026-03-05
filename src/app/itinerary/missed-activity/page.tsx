"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";

const MISSED_WORKOUTS = [
  { id: 1, category: "Cardio", name: "Cardio #1", day: "Monday, Dec 28 at 7:00 AM" },
  { id: 2, category: "Cardio", name: "Cardio #2", day: "Tuesday, Dec 29 at 7:00 AM" },
  { id: 3, category: "Cardio", name: "Cardio #3", day: "Wednesday, Dec 30 at 7:00 AM" },
  { id: 4, category: "Cardio", name: "Cardio #4", day: "Thursday, Dec 31 at 7:00 AM" },
  { id: 5, category: "Cardio", name: "Cardio #5", day: "Friday, Jan 1 at 7:00 AM" },
  { id: 6, category: "Primary", name: "SILVER-BACK", day: "Saturday, Jan 2 at 9:00 AM" },
];

export default function MissedActivityPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
        <button
          onClick={() => router.back()}
          className="text-gray-700 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} strokeWidth={2} />
        </button>
        <h1 className="text-[22px] font-bold text-gray-900">Missed Activity</h1>
      </div>

      <div className="px-12 py-6 max-w-full mx-auto">
        {/* ── Alert Banner ── */}
        <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-4 flex items-center gap-4 mb-8">
          <div className="w-11 h-11 rounded-full bg-red-400 flex items-center justify-center flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          <div>
            <p className="text-[15px] font-bold text-gray-900">6 Missed Workouts</p>
            <p className="text-[12px] text-gray-500 mt-0.5">
              Complete these workouts to stay on track with your fitness goals
            </p>
          </div>
        </div>

        {/* ── Missed Workout Cards Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {MISSED_WORKOUTS.map((workout) => (
            <div
              key={workout.id}
              className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm"
              style={{ border: "1px solid #ebebeb" }}
            >
              {/* Card header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-[15px] font-bold text-gray-900">
                    {workout.category} / {workout.name}
                  </p>
                </div>
                <span className="bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full flex-shrink-0 ml-2">
                  MISSED
                </span>
              </div>

              {/* Date/time */}
              <div className="flex items-center gap-1.5 mb-4 pl-5">
                <Clock size={13} className="text-gray-400 flex-shrink-0" />
                <p className="text-[12px] text-gray-400">{workout.day}</p>
              </div>

              {/* CTA */}
              <button className="w-full bg-purple-700 hover:bg-purple-800 text-white text-[13px] font-bold py-3 rounded-xl transition-colors">
                Reschedule Workout
              </button>
            </div>
          ))}
        </div>

        {/* ── Footer note ── */}
        <p className="text-center text-[12px] text-gray-400">
          Missed workouts can be rescheduled or marked as complete from your itinerary
        </p>
      </div>
    </div>
  );
}